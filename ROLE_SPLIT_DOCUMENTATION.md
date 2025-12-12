# Admin Role Split Documentation

## Overview

The admin roles have been split into two distinct roles with different purposes and access levels:

1. **`GAdmin`** - Global Admin (Platform Admin)
2. **`EDUAdmin`** - EDU Admin (School Admin)

## Role Definitions

### GAdmin (Global Admin / Platform Admin)

- **Purpose**: Platform-wide administration
- **Created In**: Separate Global Admin App only
- **Access**: Global Admin App (separate application)
- **Permissions**:
  - Create new schools
  - Manage all schools
  - Grant/revoke `GAdmin` and `EDUAdmin` roles
  - Platform-wide settings
  - User management across entire platform
- **Cannot**: Access EDU Dashboard in main webapp (they use separate Admin App)

### EDUAdmin (EDU Admin / School Admin)

- **Purpose**: School-specific administration
- **Created In**: Main webapp (by Global Admins or existing EDU Admins)
- **Access**: EDU Dashboard in main webapp (`/edu`)
- **Permissions**:
  - Manage assigned school(s)
  - Create courses and learning paths
  - Manage student roster
  - Approve internship hours
  - Manage staff and roles
  - School-specific settings
- **Cannot**: 
  - Create new schools (only `GAdmin` can)
  - Access other schools (unless also `GAdmin`)

## Role Hierarchy

```
GAdmin (Global Admin)
  └── Platform-wide administration
      └── Can create schools
          └── Can grant EDUAdmin role

EDUAdmin (School Admin)
  └── School-specific administration
      └── Cannot create schools
          └── Manages assigned school(s)

EDUStaff (School Staff)
  └── Limited permissions (assigned by EDU Admin)
      └── Cannot create schools or manage all school settings
      └── Role assigned when listed in school staff collection
```

## Code Changes

### Constants (`src/config/constants.js`)

```javascript
// EDU Roles (for school management)
export const EDU_ROLES = ['EDUAdmin', 'EDUStaff', 'Student', 'Intern'];
export const EDU_ROLE_HIERARCHY = ['EDUAdmin', 'EDUStaff', 'Intern', 'Student'];

// Global Admin role (separate from EDU roles)
export const GLOBAL_ADMIN_ROLE = 'GAdmin';
```

### Permission Utilities (`src/utils/eduPermissions.js`)

```javascript
// Check if Global Admin
export function isGlobalAdmin(userData) {
    return userData?.accountTypes?.includes('GAdmin');
}

// Check if EDU Admin
export function isEduAdmin(userData) {
    return userData?.accountTypes?.includes('EDUAdmin');
}
```

### Firestore Rules (`firestore.rules`)

```javascript
// School creation: Only GAdmin
allow create: if ... accountTypes.hasAny(['GAdmin']);

// School modification: GAdmin OR EDUAdmin OR school admins
allow update, delete: if ... accountTypes.hasAny(['GAdmin', 'EDUAdmin']);

// EDU collections: GAdmin OR EDUAdmin OR EDUStaff
allow write: if ... accountTypes.hasAny(['GAdmin', 'EDUAdmin', 'EDUStaff']);
```

## Migration Notes

### For Existing Users

If you have existing users with `'Admin'` in their `accountTypes`:

1. **Determine their role**:
   - If they should manage the platform → Change to `'GAdmin'`
   - If they should manage schools → Change to `'EDUAdmin'`

2. **Update user profiles**:
   ```javascript
   // For Global Admin
   accountTypes: ['GAdmin']
   
   // For EDU Admin
   accountTypes: ['EDUAdmin']
   
   // Can have both (rare)
   accountTypes: ['GAdmin', 'EDUAdmin']
   ```

### For New Users

- **GAdmin**: Only created in Global Admin App
- **EDUAdmin**: Can be granted by Global Admins or existing EDU Admins

## Role Assignment Rules

### Dynamic Role Assignment

Roles are now assigned dynamically based on school data, not just accountTypes:

- **Student**: Only when enrolled in a school (check `schools/{schoolId}/enrollments` or `schools/{schoolId}/students/{userId}`)
- **Intern**: Only when listed in school roster with "Active Internship" status (`schools/{schoolId}/students/{userId}` where `status === "Active Internship"`)
- **EDUStaff**: Only when listed in school staff collection (`schools/{schoolId}/staff` where `uid === userId`)
- **EDUAdmin**: Only granted by GAdmin from Global Admin App (listed in `schools/{schoolId}.admins` array)
- **GAdmin**: Only created in Global Admin App

### Multiple School Support

- **EDUStaff** and **EDUAdmin** can be assigned to multiple schools
- Access is determined by checking school assignments (staff collection or admins array)
- Users can access all schools they're assigned to

## Important Distinctions

| Feature | GAdmin | EDUAdmin | EDUStaff |
|---------|--------|----------|----------|
| Create Schools | ✅ Yes | ❌ No | ❌ No |
| Manage All Schools | ✅ Yes | ❌ No (only assigned) | ❌ No (only assigned) |
| Manage Platform Settings | ✅ Yes | ❌ No | ❌ No |
| Create Courses | ✅ Yes | ✅ Yes | ✅ Yes (if permitted) |
| Manage Students | ✅ Yes | ✅ Yes | ✅ Yes (if permitted) |
| Grant EDUAdmin Role | ✅ Yes | ❌ No | ❌ No |
| Grant GAdmin Role | ✅ Yes | ❌ No | ❌ No |
| Access Admin App | ✅ Yes | ❌ No | ❌ No |
| Access EDU Dashboard | ❌ No | ✅ Yes | ✅ Yes |
| Multiple Schools | ✅ Yes | ✅ Yes | ✅ Yes |

## Testing Checklist

- [ ] GAdmin can create schools
- [ ] EDUAdmin cannot create schools
- [ ] EDUAdmin can access EDU Dashboard
- [ ] GAdmin cannot access EDU Dashboard (should use Admin App)
- [ ] Both GAdmin and EDUAdmin can manage courses
- [ ] Firestore rules enforce GAdmin-only school creation
- [ ] Permission checks use correct role names

## Related Files

- `src/config/constants.js` - Role definitions
- `src/utils/eduPermissions.js` - Permission utilities
- `firestore.rules` - Security rules
- `src/components/EDU/EduAdminDashboard.jsx` - EDU Admin Dashboard
- `ADMIN_APP_SETUP.md` - Global Admin App documentation
- `ADMIN_APP_REFERENCE.md` - Main webapp reference

---

**Last Updated**: Implementation date  
**Breaking Change**: Yes - existing `'Admin'` role references need migration

