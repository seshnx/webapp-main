/**
 * src/utils/permissions.js
 * Centralized Role-Based Access Control definitions.
 */

// Define granular capabilities
export const PERMISSIONS = {
    // Content / Social
    CAN_POST: 'can_post',
    CAN_COMMENT: 'can_comment',
    
    // Studio / Booking
    CAN_BOOK_STUDIO: 'can_book_studio',
    CAN_BOOK_CLASSROOM: 'can_book_classroom',
    CAN_APPROVE_BOOKINGS: 'can_approve_bookings',
    
    // Admin
    CAN_MANAGE_USERS: 'can_manage_users',
    CAN_EXPORT_DATA: 'can_export_data'
};

// Map Roles to Permissions
const ROLE_CONFIG = {
    'Admin': Object.values(PERMISSIONS), 
    'Studio': [
        PERMISSIONS.CAN_APPROVE_BOOKINGS,
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT
    ],
    // --- TALENT ROLE (covers Artists, Musicians, Singers, etc.) ---
    'Talent': [
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT,
        PERMISSIONS.CAN_APPROVE_BOOKINGS // Talent can accept bookings (features, gigs, sessions)
    ],
    'Engineer': [ PERMISSIONS.CAN_POST, PERMISSIONS.CAN_COMMENT, PERMISSIONS.CAN_APPROVE_BOOKINGS ],
    'Producer': [ PERMISSIONS.CAN_POST, PERMISSIONS.CAN_COMMENT, PERMISSIONS.CAN_APPROVE_BOOKINGS ],
    'Composer': [ PERMISSIONS.CAN_POST, PERMISSIONS.CAN_COMMENT, PERMISSIONS.CAN_APPROVE_BOOKINGS ],
    'Technician': [ PERMISSIONS.CAN_POST, PERMISSIONS.CAN_COMMENT ],
    'Fan': [
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT
        // Fans generally initiate bookings, not approve them.
    ]
};

/**
 * Checks if a user has a specific permission based on their roles.
 * @param {Object} userData - The user profile object from Firestore
 * @param {string} permission - One of the PERMISSIONS constants
 * @returns {boolean}
 */
export const checkPermission = (userData, permission) => {
    if (!userData || !userData.accountTypes) return false;

    // Check all roles the user possesses
    return userData.accountTypes.some(role => {
        const allowed = ROLE_CONFIG[role];
        return allowed && allowed.includes(permission);
    });
};
