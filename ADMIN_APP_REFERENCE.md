# Admin App Reference

## Overview

SeshNx uses a **separate Platform Admin App** for global platform administration. This document explains the relationship between the main webapp and the admin app.

## Architecture

The SeshNx platform consists of two separate applications:

1. **Main Webapp** (`webapp-main`)
   - User-facing application
   - EDU features for schools
   - Social feed, marketplace, bookings
   - Accessible to all users

2. **Platform Admin App** (separate application)
   - Global platform administration
   - School creation and management
   - User management
   - Platform-wide settings
   - Accessible only to Global Admins

Both applications connect to the **same Firebase database** but operate independently.

## Database Sharing

### Shared Resources

Both apps use the same:
- **Firebase Project**: `seshnx-db`
- **Firestore Database**: Shared database
- **Firebase Auth**: Shared user accounts
- **Firebase Storage**: Shared storage bucket

### Data Access

- **Main Webapp**: Reads/writes user data, posts, EDU content, marketplace items
- **Admin App**: Manages schools, user permissions, platform settings

## User Roles & Permissions

### Global Admin (Platform Admin)

- **Identification**: Users with `'GAdmin'` in `accountTypes` array
- **Access**: Can access the separate Admin App
- **Permissions**: Can create schools, manage all users, platform-wide settings
- **Location**: Separate admin application (not in this codebase)
- **Note**: `GAdmin` role is ONLY created/managed in the Global Admin App

### EDU Admin (School Admin)

- **Identification**: Users with `'EDUAdmin'` in `accountTypes` + linked to school
- **Access**: EDU Admin Dashboard in main webapp (`/edu`)
- **Permissions**: Can manage their assigned school (roster, courses, students, learning paths)
- **Location**: Part of main webapp (`src/components/EDU/EduAdminDashboard.jsx`)
- **Note**: `EDUAdmin` is different from `GAdmin` - EDU Admins manage schools, Global Admins manage the platform

### Key Distinction

```
Global Admin (Platform Admin) - GAdmin
  ├── Uses separate Admin App
  ├── Can create schools
  ├── Can manage all schools
  ├── Platform-wide administration
  └── accountTypes: ['GAdmin'] (ONLY created in Admin App)

EDU Admin (School Admin) - EDUAdmin
  ├── Uses EDU Dashboard in main webapp
  ├── Cannot create schools
  ├── Can manage assigned school(s)
  ├── School-specific administration
  └── accountTypes: ['EDUAdmin'] + school link

Instructor (School Staff)
  ├── Uses EDU Staff Dashboard in main webapp
  ├── Limited permissions (assigned by EDU Admin)
  └── accountTypes: ['Instructor'] + school link
```

## School Creation

### Who Can Create Schools?

**Only Global Admins** (Platform Administrators) can create new schools.

### Implementation

The main webapp includes UI for school creation, but it's **restricted to Global Admins only**:

```javascript
// src/components/EDU/EduAdminDashboard.jsx
const isGlobalAdmin = userData?.accountTypes?.includes('Admin');

// Only shows "New School" button if isGlobalAdmin === true
{isGlobalAdmin && (
  <button onClick={() => setShowCreateModal(true)}>
    New School
  </button>
)}
```

### Firestore Rules

The Firestore security rules enforce this restriction:

```javascript
// firestore.rules
match /schools/{schoolId} {
  // Only Global Admins can create schools
  allow create: if isAuthenticated() && 
    get(/databases/$(database)/documents/artifacts/$(appId)/users/$(request.auth.uid)/profiles/main)
      .data.accountTypes.hasAny(['Admin']);
}
```

### Why Two Apps?

The separate Admin App provides:
- **Dedicated interface** for platform administration
- **Isolation** of admin features from user-facing app
- **Security** through separate deployment
- **Scalability** for future admin features

## EDU Admin Dashboard vs Admin App

### EDU Admin Dashboard (in main webapp)

**Location**: `/edu` route in main webapp  
**Users**: EDU Admins (`EDUAdmin`) and Instructors  
**Features**:
- Manage student roster
- Create courses and learning paths
- Approve internship hours
- Manage staff and roles
- School-specific settings

**Cannot**:
- Create new schools (only `GAdmin` can)
- Access other schools (unless `GAdmin`)
- Manage platform-wide settings

### Platform Admin App (separate)

**Location**: Separate application  
**Users**: Global Admins (`GAdmin`) only  
**Features**:
- Create new schools
- Manage all schools
- User management (grant/revoke `GAdmin` and `EDUAdmin` roles)
- Platform-wide settings
- Analytics and monitoring

## Database Collections

### Schools Collection

```
schools/{schoolId}
  ├── name: string
  ├── address: string
  ├── primaryColor: string
  ├── requiredHours: number
  ├── admins: array<string> (school admin UIDs)
  └── createdAt: timestamp
```

**Access Rules**:
- **Read**: All authenticated users
- **Create**: Global Admins (`GAdmin`) only
- **Update/Delete**: Global Admins (`GAdmin`) OR EDU Admins (`EDUAdmin`) OR school admins (in `admins` array)

### User Profiles

```
artifacts/{appId}/users/{userId}/profiles/main
  ├── accountTypes: array<string>
  │   ├── 'GAdmin' = Global Admin (Platform Admin) - ONLY in Admin App
  │   ├── 'EDUAdmin' = EDU Admin (School Admin) - manages schools
  │   ├── 'Instructor' = Instructor (School Staff)
  │   ├── 'Student' = Student
  │   └── 'Intern' = Intern
  ├── schoolId: string (if linked to school)
  └── ...other profile fields
```

## Important Notes

### For Developers

1. **School Creation**: The main webapp includes school creation UI, but it's restricted to Global Admins (`GAdmin`). The separate Admin App should be the primary interface for this.

2. **Permission Checks**: 
   - Use `accountTypes.includes('GAdmin')` for Global Admin operations
   - Use `accountTypes.includes('EDUAdmin')` for EDU Admin operations
   - Use `isGlobalAdmin(userData)` utility from `src/utils/eduPermissions.js`

3. **Firestore Rules**: Rules are shared between both apps. Changes to rules affect both applications. Rules check for `'GAdmin'` for global operations.

4. **User Accounts**: User accounts are shared. A user logged into the main app can also log into the admin app (if they're a `GAdmin`).

5. **Role Management**: 
   - `GAdmin` role is ONLY created/managed in the Global Admin App
   - `EDUAdmin` role can be granted by Global Admins or existing EDU Admins

### For Administrators

1. **Access**: Global Admins should use the separate Admin App for platform administration.

2. **School Management**: School-specific administration is done via the EDU Dashboard in the main webapp.

3. **User Roles**: 
   - Grant `'GAdmin'` in `accountTypes` to make someone a Global Admin (Platform Admin)
   - Grant `'EDUAdmin'` in `accountTypes` to make someone an EDU Admin (School Admin)
   - Grant `'Instructor'` + school link to make someone a School Staff member

## Related Files

### Main Webapp Files

- `src/components/EDU/EduAdminDashboard.jsx` - EDU Admin Dashboard (School Admins)
- `src/utils/eduPermissions.js` - Permission utilities
- `src/config/constants.js` - EDU role constants
- `firestore.rules` - Security rules (shared with Admin App)

### Admin App

See `ADMIN_APP_SETUP.md` for Admin App documentation.

## Migration Notes

If you're setting up the Admin App:

1. Use the same Firebase project configuration
2. Implement Global Admin authentication check
3. Follow the database structure documented here
4. Respect Firestore security rules
5. See `ADMIN_APP_SETUP.md` for detailed setup instructions

## Support

For questions about:
- **Main webapp EDU features**: See EDU component documentation
- **Admin App setup**: See `ADMIN_APP_SETUP.md`
- **Database structure**: See this file and Firestore rules
- **Permissions**: See `src/utils/eduPermissions.js`

---

**Last Updated**: Implementation date  
**Maintained By**: Development Team

