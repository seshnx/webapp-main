# SeshNx Platform Admin App - Setup & Architecture Guide

## Overview

The SeshNx Platform Admin App is a **separate application** that provides administrative controls for the SeshNx platform. It connects to the same Firebase database as the main webapp but operates independently with its own authentication and UI.

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   Main Webapp       │         │   Admin App         │
│   (webapp-main)     │         │   (separate app)    │
│                     │         │                      │
│   - User-facing     │         │   - Platform Admin  │
│   - EDU features    │         │   - Global controls │
│   - Social Feed     │         │   - School creation │
│   - Marketplace     │         │   - User management │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           └───────────┬───────────────────┘
                       │
           ┌───────────▼───────────┐
           │   Firebase Database   │
           │   (Shared)            │
           │                       │
           │   - Firestore         │
           │   - Firebase Auth     │
           │   - Firebase Storage  │
           └───────────────────────┘
```

## Database Connection

### Firebase Configuration

Both apps connect to the **same Firebase project**:

- **Project ID**: `seshnx-db` (or your configured project ID)
- **Database**: Firestore
- **Authentication**: Firebase Auth (shared user accounts)

### Environment Variables

The Admin App should use the same Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=seshnx-db.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seshnx-db
VITE_FIREBASE_STORAGE_BUCKET=seshnx-db.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=718084970004
VITE_FIREBASE_APP_ID=your_app_id
```

## User Authentication & Permissions

### Global Admin Identification

Global Admins (Platform Administrators) are identified by having `'GAdmin'` in their `accountTypes` array:

```javascript
// User profile structure
{
  accountTypes: ['GAdmin'],  // Global Admin (Platform Admin)
  // OR
  accountTypes: ['EDUAdmin'],  // EDU Admin (School Admin) - NOT Global Admin
  // OR
  accountTypes: ['Instructor', 'Student'],  // Instructor/Student (NOT Global Admin)
}
```

### Permission Checks

**Critical**: Only users with `'GAdmin'` in `accountTypes` should have access to the Admin App.

```javascript
// Check if user is Global Admin
const isGlobalAdmin = userData?.accountTypes?.includes('GAdmin');

if (!isGlobalAdmin) {
  // Redirect to main app or show access denied
}
```

**Important**: 
- `GAdmin` = Global Admin (Platform Admin) - created/managed in Admin App only
- `EDUAdmin` = EDU Admin (School Admin) - manages schools in main webapp
- These are separate roles with different permissions

## Database Structure

### Key Collections

#### Schools Collection
```
schools/{schoolId}
  - name: string
  - address: string
  - primaryColor: string
  - requiredHours: number
  - admins: array<string> (UIDs of school admins)
  - createdAt: timestamp
```

**Important Rules**:
- **Create**: Only Global Admins can create new schools
- **Update/Delete**: Global Admins OR school-specific admins (in `admins` array)

#### User Profiles
```
artifacts/{appId}/users/{userId}/profiles/main
  - accountTypes: array<string>
  - firstName: string
  - lastName: string
  - schoolId: string (if linked to a school)
  - email: string
```

#### EDU Collections (under schools)
```
schools/{schoolId}/
  ├── courses/{courseId}
  ├── learning_paths/{pathId}
  ├── enrollments/{enrollmentId}
  ├── certificates/{certificateId}
  ├── badges/{badgeId}
  ├── student_progress/{studentId}
  ├── students/{studentId}
  ├── staff/{staffId}
  ├── roles/{roleId}
  └── audit_logs/{logId}
```

## Firestore Security Rules

### School Creation Rules

The Firestore rules enforce that only Global Admins can create schools:

```javascript
match /schools/{schoolId} {
  // Create: Only Global Admins
  allow create: if isAuthenticated() && 
    exists(/databases/$(database)/documents/artifacts/$(appId)/users/$(request.auth.uid)/profiles/main) &&
    get(/databases/$(database)/documents/artifacts/$(appId)/users/$(request.auth.uid)/profiles/main)
      .data.accountTypes.hasAny(['Admin']);
  
  // Update/Delete: Global Admins OR school admins
  allow update, delete: if isAuthenticated() && 
    (request.auth.uid in resource.data.admins || 
     (exists(/databases/$(database)/documents/artifacts/$(appId)/users/$(request.auth.uid)/profiles/main) &&
      get(/databases/$(database)/documents/artifacts/$(appId)/users/$(request.auth.uid)/profiles/main)
        .data.accountTypes.hasAny(['Admin'])));
}
```

## Admin App Features

### Core Functionality

1. **School Management**
   - Create new schools
   - Edit school information
   - Delete schools (with caution)
   - View all schools

2. **User Management**
   - View all users
   - Grant/revoke Global Admin status
   - Link users to schools
   - Manage user roles

3. **Platform-Wide Settings**
   - System configuration
   - Feature flags
   - Global announcements

4. **Analytics & Monitoring**
   - Platform usage statistics
   - School activity monitoring
   - User engagement metrics

### School Creation Workflow

When creating a new school:

1. **Validate Permissions**: Ensure user is Global Admin (`GAdmin`)
2. **Create School Document**:
   ```javascript
   await addDoc(collection(db, 'schools'), {
     name: schoolName,
     address: schoolAddress,
     primaryColor: '#4f46e5',
     requiredHours: 100,
     createdAt: serverTimestamp(),
     admins: [] // Initially empty (school-specific admins)
   });
   ```

3. **Create Default Admin Role**:
   ```javascript
   await addDoc(collection(db, `schools/${schoolId}/roles`), {
     name: 'Admin',
     color: '#dc2626',
     permissions: SCHOOL_PERMISSIONS.map(p => p.id)
   });
   ```

4. **Assign EDU Admin** (optional):
   - Grant `'EDUAdmin'` role in user's `accountTypes`
   - Add user UID to `schools/{schoolId}.admins` array
   - Or assign via staff management in EDU Dashboard

## Important Considerations

### Data Isolation

- **Global Admins** can access all schools
- **School Admins** can only access their assigned school
- Always check permissions before performing operations

### User Account Types

```javascript
// Global Admin (Platform Admin) - ONLY created in Admin App
accountTypes: ['GAdmin']

// EDU Admin (School Admin) - manages schools in main webapp
accountTypes: ['EDUAdmin'] // + linked to school via staff collection

// Instructor (School Staff)
accountTypes: ['Instructor'] // + linked to school via staff collection

// Student
accountTypes: ['Student'] // + linked to school via schoolId

// Intern
accountTypes: ['Intern'] // + linked to school via schoolId
```

### App ID

The main app uses `appId` from Firebase config (typically `seshnx-db`). All Firestore paths use:

```
artifacts/{appId}/...
```

Make sure your Admin App uses the same `appId` value.

## Integration Points

### Shared Data

Both apps read/write to:
- `schools/` collection
- `artifacts/{appId}/users/` collection
- Firebase Auth (shared user accounts)

### Admin App Specific

The Admin App should NOT modify:
- User posts/feed content
- Marketplace items
- Booking data
- Social interactions

These are managed by the main webapp.

## Security Best Practices

1. **Always verify Global Admin status** before allowing admin operations
2. **Use Firestore rules** as the primary security layer (client-side checks are secondary)
3. **Log all admin actions** for audit purposes
4. **Never expose admin controls** to non-admin users
5. **Validate school ownership** before modifying school data

## Error Handling

### Permission Denied Errors

If you receive "Missing or insufficient permissions":

1. Verify user has `'Admin'` in `accountTypes`
2. Check Firestore rules are deployed correctly
3. Ensure user profile document exists at correct path
4. Verify `appId` matches between apps

### Common Issues

**Issue**: Cannot create school
- **Solution**: Ensure user is Global Admin (`accountTypes.includes('GAdmin')`)

**Issue**: Cannot access school data
- **Solution**: Check if user is in school's `admins` array OR is Global Admin (`GAdmin`) OR is EDU Admin (`EDUAdmin`)

**Issue**: User profile not found
- **Solution**: Verify path: `artifacts/{appId}/users/{userId}/profiles/main`

**Issue**: Confusion between GAdmin and EDUAdmin
- **Solution**: 
  - `GAdmin` = Global Admin (Platform Admin) - only in Admin App
  - `EDUAdmin` = EDU Admin (School Admin) - in main webapp EDU Dashboard

## Testing

### Test Scenarios

1. **Global Admin** can create schools ✓
2. **School Admin** cannot create schools ✓
3. **Global Admin** can access all schools ✓
4. **School Admin** can only access assigned school ✓
5. **Regular users** cannot access admin features ✓

## Deployment

### Separate Deployment

The Admin App should be deployed separately from the main webapp:
- Different domain/subdomain (e.g., `admin.seshnx.com`)
- Separate build process
- Independent versioning

### Environment Setup

Ensure both apps use the same:
- Firebase project
- Firestore database
- Authentication configuration

## Support & Contact

For questions about:
- Database structure: See main webapp documentation
- Firestore rules: Check `firestore.rules` in main webapp
- User permissions: See `src/utils/eduPermissions.js` in main webapp

---

**Note**: This Admin App is separate from the main webapp's EDU Admin Dashboard. The EDU Admin Dashboard is for school-specific administration, while this Admin App is for platform-wide administration.

