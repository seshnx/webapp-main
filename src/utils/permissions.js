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
    CAN_EXPORT_DATA: 'can_export_data',

    // Label / Business
    CAN_VIEW_DASHBOARD: 'can_view_dashboard',
    CAN_MANAGE_ROSTER: 'can_manage_roster',
    CAN_DISTRIBUTE_MUSIC: 'can_distribute_music',
    CAN_VIEW_ANALYTICS: 'can_view_analytics',
    CAN_MANAGE_CONTRACTS: 'can_manage_contracts',
    CAN_CREATE_CAMPAIGNS: 'can_create_campaigns',
    CAN_PROCESS_ROYALTIES: 'can_process_royalties'
};

// =====================================================
// STUDIO OPS PERMISSIONS (Studio Operations Module)
// =====================================================
// Granular permissions for Studio Ops features
export const STUDIO_PERMISSIONS = {
    // === BOOKING PERMISSIONS ===
    MANAGE_BOOKINGS: 'studio_manage_bookings',          // Full CRUD on bookings
    APPROVE_BOOKINGS: 'studio_approve_bookings',        // Approve/decline booking requests
    VIEW_ALL_BOOKINGS: 'studio_view_all_bookings',      // View all bookings (not just own)
    CHECK_IN_BOOKINGS: 'studio_check_in_bookings',      // Check-in/check-out clients
    BOOK_TEMPLATES: 'studio_book_templates',             // Create/use booking templates
    MANAGE_WAITLIST: 'studio_manage_waitlist',          // Manage waitlist system
    VIEW_BOOKING_ANALYTICS: 'studio_view_booking_analytics',

    // === CLIENT & CRM PERMISSIONS ===
    MANAGE_CLIENTS: 'studio_manage_clients',            // Full CRUD on client database
    VIEW_CLIENT_HISTORY: 'studio_view_client_history',  // View client booking history
    CLIENT_COMMUNICATIONS: 'studio_client_communications', // Send messages to clients
    EXPORT_CLIENTS: 'studio_export_clients',            // Export client data
    MANAGE_TALENT_NETWORK: 'studio_manage_talent_network', // Manage talent pipeline

    // === STAFF PERMISSIONS ===
    MANAGE_STAFF: 'studio_manage_staff',                // Full CRUD on staff roster
    VIEW_STAFF_SCHEDULE: 'studio_view_staff_schedule',  // View staff schedules
    MANAGE_SHIFTS: 'studio_manage_shifts',              // Create/edit staff shifts
    CLOCK_IN_OUT: 'studio_clock_in_out',                // Clock in/out for shifts
    VIEW_STAFF_PERFORMANCE: 'studio_view_staff_performance',
    MANAGE_TASKS: 'studio_manage_tasks',                // Create/assign tasks

    // === EQUIPMENT & INVENTORY PERMISSIONS ===
    MANAGE_EQUIPMENT: 'studio_manage_equipment',        // Full CRUD on equipment
    MANAGE_INVENTORY: 'studio_manage_inventory',        // Full CRUD on inventory
    VIEW_INVENTORY: 'studio_view_inventory',            // View inventory levels
    LOG_TRANSACTIONS: 'studio_log_transactions',        // Log inventory usage
    MANAGE_MAINTENANCE: 'studio_manage_maintenance',    // Schedule maintenance

    // === FACILITY PERMISSIONS ===
    MANAGE_FACILITY: 'studio_manage_facility',          // Facility maintenance
    MANAGE_ROOMS: 'studio_manage_rooms',                // Room management
    MANAGE_POLICIES: 'studio_manage_policies',          // Pricing and policies
    MANAGE_AVAILABILITY: 'studio_manage_availability',  // Operating hours, blocked dates

    // === FINANCIAL PERMISSIONS ===
    VIEW_REVENUE: 'studio_view_revenue',                // View revenue reports
    MANAGE_PAYMENTS: 'studio_manage_payments',          // Process payments, refunds
    SET_PRICING: 'studio_set_pricing',                  // Set rates and pricing
    VIEW_INVOICES: 'studio_view_invoices',              // View invoice history

    // === ANALYTICS & REPORTING ===
    VIEW_ANALYTICS: 'studio_view_analytics',            // Full analytics dashboard
    VIEW_UTILIZATION: 'studio_view_utilization',        // Room/equipment utilization
    EXPORT_REPORTS: 'studio_export_reports',            // Export custom reports
    VIEW_PERFORMANCE: 'studio_view_performance',        // Business performance metrics

    // === SETTINGS & ADMIN ===
    MANAGE_SETTINGS: 'studio_manage_settings',          // Studio settings
    IMPORT_DATA: 'studio_import_data',                  // Import clients, inventory
    MANAGE_TEMPLATES: 'studio_manage_templates'         // Booking/invoice templates
};

// Studio role configurations
// Maps studio roles to their allowed permissions
export const STUDIO_ROLE_CONFIG = {
    // Studio Owner - Full access to everything
    OWNER: Object.values(STUDIO_PERMISSIONS),

    // Studio Manager - Most permissions except critical owner-only functions
    MANAGER: [
        // Bookings
        STUDIO_PERMISSIONS.MANAGE_BOOKINGS,
        STUDIO_PERMISSIONS.APPROVE_BOOKINGS,
        STUDIO_PERMISSIONS.VIEW_ALL_BOOKINGS,
        STUDIO_PERMISSIONS.CHECK_IN_BOOKINGS,
        STUDIO_PERMISSIONS.BOOK_TEMPLATES,
        STUDIO_PERMISSIONS.MANAGE_WAITLIST,
        STUDIO_PERMISSIONS.VIEW_BOOKING_ANALYTICS,

        // Clients
        STUDIO_PERMISSIONS.MANAGE_CLIENTS,
        STUDIO_PERMISSIONS.VIEW_CLIENT_HISTORY,
        STUDIO_PERMISSIONS.CLIENT_COMMUNICATIONS,
        STUDIO_PERMISSIONS.EXPORT_CLIENTS,
        STUDIO_PERMISSIONS.MANAGE_TALENT_NETWORK,

        // Staff
        STUDIO_PERMISSIONS.MANAGE_STAFF,
        STUDIO_PERMISSIONS.VIEW_STAFF_SCHEDULE,
        STUDIO_PERMISSIONS.MANAGE_SHIFTS,
        STUDIO_PERMISSIONS.CLOCK_IN_OUT,
        STUDIO_PERMISSIONS.VIEW_STAFF_PERFORMANCE,
        STUDIO_PERMISSIONS.MANAGE_TASKS,

        // Equipment & Inventory
        STUDIO_PERMISSIONS.MANAGE_EQUIPMENT,
        STUDIO_PERMISSIONS.MANAGE_INVENTORY,
        STUDIO_PERMISSIONS.VIEW_INVENTORY,
        STUDIO_PERMISSIONS.LOG_TRANSACTIONS,
        STUDIO_PERMISSIONS.MANAGE_MAINTENANCE,

        // Facility
        STUDIO_PERMISSIONS.MANAGE_FACILITY,
        STUDIO_PERMISSIONS.MANAGE_ROOMS,
        STUDIO_PERMISSIONS.MANAGE_POLICIES,
        STUDIO_PERMISSIONS.MANAGE_AVAILABILITY,

        // Financial
        STUDIO_PERMISSIONS.VIEW_REVENUE,
        STUDIO_PERMISSIONS.MANAGE_PAYMENTS,
        STUDIO_PERMISSIONS.VIEW_INVOICES,

        // Analytics
        STUDIO_PERMISSIONS.VIEW_ANALYTICS,
        STUDIO_PERMISSIONS.VIEW_UTILIZATION,
        STUDIO_PERMISSIONS.EXPORT_REPORTS,
        STUDIO_PERMISSIONS.VIEW_PERFORMANCE,

        // Settings
        STUDIO_PERMISSIONS.MANAGE_SETTINGS,
        STUDIO_PERMISSIONS.IMPORT_DATA,
        STUDIO_PERMISSIONS.MANAGE_TEMPLATES
    ],

    // Staff Member - Limited access to assigned work
    STAFF: [
        // Can view and check into assigned bookings
        STUDIO_PERMISSIONS.VIEW_ALL_BOOKINGS,
        STUDIO_PERMISSIONS.CHECK_IN_BOOKINGS,

        // Can view basic client info
        STUDIO_PERMISSIONS.VIEW_CLIENT_HISTORY,

        // Can manage own shifts and view tasks
        STUDIO_PERMISSIONS.VIEW_STAFF_SCHEDULE,
        STUDIO_PERMISSIONS.CLOCK_IN_OUT,
        STUDIO_PERMISSIONS.MANAGE_TASKS,

        // Can view and log inventory
        STUDIO_PERMISSIONS.VIEW_INVENTORY,
        STUDIO_PERMISSIONS.LOG_TRANSACTIONS
    ],

    // Intern - Learning/training role
    INTERN: [
        STUDIO_PERMISSIONS.VIEW_ALL_BOOKINGS,
        STUDIO_PERMISSIONS.CHECK_IN_BOOKINGS,
        STUDIO_PERMISSIONS.VIEW_STAFF_SCHEDULE,
        STUDIO_PERMISSIONS.VIEW_INVENTORY,
        STUDIO_PERMISSIONS.LOG_TRANSACTIONS
    ],

    // Client - Portal access (external)
    CLIENT: [
        STUDIO_PERMISSIONS.VIEW_ALL_BOOKINGS,     // Limited to own bookings
        STUDIO_PERMISSIONS.VIEW_INVOICES,         // View own invoices
        STUDIO_PERMISSIONS.CLIENT_COMMUNICATIONS // Send messages to studio
    ]
};

// =====================================================
// STUDIO CONTEXT TYPES
// =====================================================
// Determines which context to check permissions in
export const STUDIO_CONTEXT = {
    BOOKING: 'booking',       // Booking-related operations
    CLIENT: 'client',         // Client/CRM operations
    STAFF: 'staff',           // Staff management
    EQUIPMENT: 'equipment',   // Equipment & inventory
    FACILITY: 'facility',     // Facility & rooms
    FINANCIAL: 'financial',   // Revenue, payments, invoicing
    ANALYTICS: 'analytics',   // Reports and metrics
    SETTINGS: 'settings'      // Configuration and templates
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
    'EDUStaff': [
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
    ],
    // --- LABEL ROLE ---
    'Label': [
        PERMISSIONS.CAN_POST,
        PERMISSIONS.CAN_COMMENT,
        PERMISSIONS.CAN_VIEW_DASHBOARD,
        PERMISSIONS.CAN_MANAGE_ROSTER,
        PERMISSIONS.CAN_DISTRIBUTE_MUSIC,
        PERMISSIONS.CAN_VIEW_ANALYTICS,
        PERMISSIONS.CAN_MANAGE_CONTRACTS,
        PERMISSIONS.CAN_CREATE_CAMPAIGNS,
        PERMISSIONS.CAN_PROCESS_ROYALTIES,
        PERMISSIONS.CAN_APPROVE_BOOKINGS // Labels can approve bookings for their artists
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

// =====================================================
// STUDIO OPS PERMISSION HELPERS
// =====================================================

/**
 * Check if a user has a specific studio permission
 * @param {Object} user - User object with studioRole
 * @param {string} permission - STUDIO_PERMISSIONS constant
 * @returns {boolean}
 *
 * @example
 * hasStudioPermission(user, STUDIO_PERMISSIONS.MANAGE_BOOKINGS)
 */
export const hasStudioPermission = (user, permission) => {
    if (!user || !user.studioRole) return false;

    const rolePermissions = STUDIO_ROLE_CONFIG[user.studioRole.toUpperCase()];
    return rolePermissions ? rolePermissions.includes(permission) : false;
};

/**
 * Check if user can perform an action in a specific context
 * @param {Object} user - User object with studioRole
 * @param {string} context - STUDIO_CONTEXT constant
 * @param {string} action - Specific action (optional)
 * @returns {boolean}
 *
 * @example
 * canAccessStudioContext(user, STUDIO_CONTEXT.BOOKING) // General booking access
 * canAccessStudioContext(user, STUDIO_CONTEXT.BOOKING, 'approve') // Can approve bookings
 */
export const canAccessStudioContext = (user, context, action = null) => {
    // Define context-permission mappings
    const contextPermissions = {
        [STUDIO_CONTEXT.BOOKING]: [
            STUDIO_PERMISSIONS.MANAGE_BOOKINGS,
            STUDIO_PERMISSIONS.APPROVE_BOOKINGS,
            STUDIO_PERMISSIONS.VIEW_ALL_BOOKINGS,
            STUDIO_PERMISSIONS.CHECK_IN_BOOKINGS,
            STUDIO_PERMISSIONS.BOOK_TEMPLATES,
            STUDIO_PERMISSIONS.MANAGE_WAITLIST
        ],
        [STUDIO_CONTEXT.CLIENT]: [
            STUDIO_PERMISSIONS.MANAGE_CLIENTS,
            STUDIO_PERMISSIONS.VIEW_CLIENT_HISTORY,
            STUDIO_PERMISSIONS.CLIENT_COMMUNICATIONS,
            STUDIO_PERMISSIONS.EXPORT_CLIENTS,
            STUDIO_PERMISSIONS.MANAGE_TALENT_NETWORK
        ],
        [STUDIO_CONTEXT.STAFF]: [
            STUDIO_PERMISSIONS.MANAGE_STAFF,
            STUDIO_PERMISSIONS.VIEW_STAFF_SCHEDULE,
            STUDIO_PERMISSIONS.MANAGE_SHIFTS,
            STUDIO_PERMISSIONS.CLOCK_IN_OUT,
            STUDIO_PERMISSIONS.VIEW_STAFF_PERFORMANCE,
            STUDIO_PERMISSIONS.MANAGE_TASKS
        ],
        [STUDIO_CONTEXT.EQUIPMENT]: [
            STUDIO_PERMISSIONS.MANAGE_EQUIPMENT,
            STUDIO_PERMISSIONS.MANAGE_INVENTORY,
            STUDIO_PERMISSIONS.VIEW_INVENTORY,
            STUDIO_PERMISSIONS.LOG_TRANSACTIONS,
            STUDIO_PERMISSIONS.MANAGE_MAINTENANCE
        ],
        [STUDIO_CONTEXT.FACILITY]: [
            STUDIO_PERMISSIONS.MANAGE_FACILITY,
            STUDIO_PERMISSIONS.MANAGE_ROOMS,
            STUDIO_PERMISSIONS.MANAGE_POLICIES,
            STUDIO_PERMISSIONS.MANAGE_AVAILABILITY
        ],
        [STUDIO_CONTEXT.FINANCIAL]: [
            STUDIO_PERMISSIONS.VIEW_REVENUE,
            STUDIO_PERMISSIONS.MANAGE_PAYMENTS,
            STUDIO_PERMISSIONS.SET_PRICING,
            STUDIO_PERMISSIONS.VIEW_INVOICES
        ],
        [STUDIO_CONTEXT.ANALYTICS]: [
            STUDIO_PERMISSIONS.VIEW_ANALYTICS,
            STUDIO_PERMISSIONS.VIEW_UTILIZATION,
            STUDIO_PERMISSIONS.EXPORT_REPORTS,
            STUDIO_PERMISSIONS.VIEW_PERFORMANCE,
            STUDIO_PERMISSIONS.VIEW_BOOKING_ANALYTICS
        ],
        [STUDIO_CONTEXT.SETTINGS]: [
            STUDIO_PERMISSIONS.MANAGE_SETTINGS,
            STUDIO_PERMISSIONS.IMPORT_DATA,
            STUDIO_PERMISSIONS.MANAGE_TEMPLATES
        ]
    };

    const permissions = contextPermissions[context];
    if (!permissions) return false;

    // If no specific action, check if user has ANY permission in this context
    if (!action) {
        return permissions.some(permission => hasStudioPermission(user, permission));
    }

    // For specific actions, you would need action-to-permission mapping
    // For now, check if user has the first permission in context (simplified)
    return hasStudioPermission(user, permissions[0]);
};

/**
 * Get user's studio role from userData
 * @param {Object} userData - User profile data
 * @returns {string|null} - Studio role (OWNER, MANAGER, STAFF, INTERN, CLIENT)
 */
export const getStudioRole = (userData) => {
    if (!userData) return null;

    // Check if user is a studio owner
    if (userData.accountTypes?.includes('Studio')) {
        return userData.isStudioOwner ? 'OWNER' : 'MANAGER';
    }

    // Check if user is staff/intern
    if (userData.accountTypes?.includes('Intern')) {
        return 'INTERN';
    }

    // Check if user is assigned as staff in a studio
    if (userData.studioRole) {
        return userData.studioRole.toUpperCase();
    }

    // Default to CLIENT (portal access)
    return 'CLIENT';
};

/**
 * Check if user is a studio owner
 * @param {Object} userData - User profile data
 * @returns {boolean}
 */
export const isStudioOwner = (userData) => {
    return getStudioRole(userData) === 'OWNER';
};

/**
 * Check if user is studio staff (owner, manager, or staff)
 * @param {Object} userData - User profile data
 * @returns {boolean}
 */
export const isStudioStaff = (userData) => {
    const role = getStudioRole(userData);
    return ['OWNER', 'MANAGER', 'STAFF'].includes(role);
};

/**
 * Get allowed tabs for a user in StudioManager
 * @param {Object} userData - User profile data
 * @returns {string[]} - Array of allowed tab IDs
 */
export const getAllowedStudioTabs = (userData) => {
    const role = getStudioRole(userData);

    // All tabs visible to owners and managers
    if (['OWNER', 'MANAGER'].includes(role)) {
        return ['overview', 'rooms', 'equipment', 'gallery', 'availability', 'policies', 'bookings', 'clients', 'staff', 'analytics', 'settings'];
    }

    // Staff see limited tabs
    if (role === 'STAFF') {
        return ['overview', 'bookings', 'equipment']; // Can view bookings and equipment
    }

    // Interns see basic tabs
    if (role === 'INTERN') {
        return ['overview', 'equipment'];
    }

    // Clients see nothing in StudioManager (they use portal)
    return [];
};

/**
 * Check if user can access a specific studio tab
 * @param {Object} userData - User profile data
 * @param {string} tabId - Tab identifier
 * @returns {boolean}
 */
export const canAccessStudioTab = (userData, tabId) => {
    return getAllowedStudioTabs(userData).includes(tabId);
};

/**
 * Authorization middleware for API routes
 * Use in API route handlers to check permissions
 * @param {Request} request - Next.js API request
 * @param {string} permission - Required STUDIO_PERMISSIONS constant
 * @returns {Object|null} - User object if authorized, null otherwise
 *
 * @example (in API route)
 * import { requireStudioPermission } from '@/utils/permissions';
 *
 * export default async function handler(req, res) {
 *   const auth = await requireStudioPermission(req, STUDIO_PERMISSIONS.MANAGE_BOOKINGS);
 *   if (!auth) {
 *     return res.status(403).json({ error: 'Forbidden' });
 *   }
 *   // ... proceed with authorized request
 * }
 */
export const requireStudioPermission = async (request, permission) => {
    // This is a placeholder - actual implementation would:
    // 1. Verify Clerk token from request
    // 2. Fetch user data from Neon/Convex
    // 3. Check studio role and permissions
    // 4. Return user object if authorized, null otherwise

    // For now, return null (implement when API routes are created)
    return null;
};

/**
 * Map account types to studio permissions for legacy compatibility
 * This helps bridge existing ACCOUNT_TYPES with new STUDIO_PERMISSIONS
 * @param {string[]} accountTypes - User's account types from userData
 * @returns {string[]} - Array of studio permissions
 */
export const getStudioPermissionsFromAccountTypes = (accountTypes) => {
    if (!accountTypes) return [];

    const permissions = [];

    // Studio account type gets owner/manager permissions
    if (accountTypes.includes('Studio')) {
        permissions.push(
            STUDIO_PERMISSIONS.MANAGE_BOOKINGS,
            STUDIO_PERMISSIONS.APPROVE_BOOKINGS,
            STUDIO_PERMISSIONS.VIEW_ALL_BOOKINGS,
            STUDIO_PERMISSIONS.MANAGE_CLIENTS,
            STUDIO_PERMISSIONS.MANAGE_STAFF,
            STUDIO_PERMISSIONS.MANAGE_EQUIPMENT,
            STUDIO_PERMISSIONS.MANAGE_INVENTORY,
            STUDIO_PERMISSIONS.VIEW_ANALYTICS
        );
    }

    // Talent/Engineer/Producer can approve bookings they receive
    if (accountTypes.some(type => ['Talent', 'Engineer', 'Producer', 'Composer'].includes(type))) {
        permissions.push(STUDIO_PERMISSIONS.APPROVE_BOOKINGS);
    }

    return [...new Set(permissions)]; // Remove duplicates
};
