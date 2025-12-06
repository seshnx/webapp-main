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
    
    // Education / Internship
    CAN_LOG_HOURS: 'can_log_hours',
    CAN_VIEW_OWN_GRADES: 'can_view_own_grades',
    CAN_GRADE_STUDENTS: 'can_grade_students',
    CAN_MANAGE_ENROLLMENT: 'can_manage_enrollment',
    CAN_VERIFY_HOURS: 'can_verify_hours',
    
    // Admin
    CAN_MANAGE_USERS: 'can_manage_users',
    CAN_EXPORT_DATA: 'can_export_data'
};

// Map Roles to Permissions
const ROLE_CONFIG = {
    'Student': [
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT,
        PERMISSIONS.CAN_BOOK_CLASSROOM, 
        PERMISSIONS.CAN_LOG_HOURS,
        PERMISSIONS.CAN_VIEW_OWN_GRADES
    ],
    'Intern': [
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT,
        PERMISSIONS.CAN_BOOK_STUDIO,    
        PERMISSIONS.CAN_LOG_HOURS,
        PERMISSIONS.CAN_VIEW_OWN_GRADES
    ],
    'Instructor': [
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT,
        PERMISSIONS.CAN_BOOK_STUDIO,
        PERMISSIONS.CAN_BOOK_CLASSROOM,
        PERMISSIONS.CAN_GRADE_STUDENTS,
        PERMISSIONS.CAN_VERIFY_HOURS,
        PERMISSIONS.CAN_EXPORT_DATA
    ],
    'Admin': Object.values(PERMISSIONS), 
    'Studio': [
        PERMISSIONS.CAN_APPROVE_BOOKINGS,
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT
    ],
    // --- NEW ROLES ---
    'Artist': [
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT,
        PERMISSIONS.CAN_APPROVE_BOOKINGS // Artists can accept bookings (features, gigs)
    ],
    'Musician': [
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT,
        PERMISSIONS.CAN_APPROVE_BOOKINGS // Session musicians accept gigs
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

export const isInternshipActive = (enrollmentData) => {
    if (!enrollmentData || enrollmentData.status !== 'Active') return false;
    return true;
};
