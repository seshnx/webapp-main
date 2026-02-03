/**
 * src/utils/permissions.ts
 * Centralized Role-Based Access Control definitions.
 */

import type { UserData, AccountType } from '../types';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type StudioPermission = typeof STUDIO_PERMISSIONS[keyof typeof STUDIO_PERMISSIONS];
export type StudioRole = 'OWNER' | 'MANAGER' | 'STAFF' | 'INTERN' | 'CLIENT';
export type StudioContext = typeof STUDIO_CONTEXT[keyof typeof STUDIO_CONTEXT];

// =====================================================
// PERMISSIONS
// =====================================================

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
} as const;

// =====================================================
// STUDIO OPS PERMISSIONS
// =====================================================

export const STUDIO_PERMISSIONS = {
  // === BOOKING PERMISSIONS ===
  MANAGE_BOOKINGS: 'studio_manage_bookings',
  APPROVE_BOOKINGS: 'studio_approve_bookings',
  VIEW_ALL_BOOKINGS: 'studio_view_all_bookings',
  CHECK_IN_BOOKINGS: 'studio_check_in_bookings',
  BOOK_TEMPLATES: 'studio_book_templates',
  MANAGE_WAITLIST: 'studio_manage_waitlist',
  VIEW_BOOKING_ANALYTICS: 'studio_view_booking_analytics',

  // === CLIENT & CRM PERMISSIONS ===
  MANAGE_CLIENTS: 'studio_manage_clients',
  VIEW_CLIENT_HISTORY: 'studio_view_client_history',
  CLIENT_COMMUNICATIONS: 'studio_client_communications',
  EXPORT_CLIENTS: 'studio_export_clients',
  MANAGE_TALENT_NETWORK: 'studio_manage_talent_network',

  // === STAFF PERMISSIONS ===
  MANAGE_STAFF: 'studio_manage_staff',
  VIEW_STAFF_SCHEDULE: 'studio_view_staff_schedule',
  MANAGE_SHIFTS: 'studio_manage_shifts',
  CLOCK_IN_OUT: 'studio_clock_in_out',
  VIEW_STAFF_PERFORMANCE: 'studio_view_staff_performance',
  MANAGE_TASKS: 'studio_manage_tasks',

  // === EQUIPMENT & INVENTORY PERMISSIONS ===
  MANAGE_EQUIPMENT: 'studio_manage_equipment',
  MANAGE_INVENTORY: 'studio_manage_inventory',
  VIEW_INVENTORY: 'studio_view_inventory',
  LOG_TRANSACTIONS: 'studio_log_transactions',
  MANAGE_MAINTENANCE: 'studio_manage_maintenance',

  // === FACILITY PERMISSIONS ===
  MANAGE_FACILITY: 'studio_manage_facility',
  MANAGE_ROOMS: 'studio_manage_rooms',
  MANAGE_POLICIES: 'studio_manage_policies',
  MANAGE_AVAILABILITY: 'studio_manage_availability',

  // === FINANCIAL PERMISSIONS ===
  VIEW_REVENUE: 'studio_view_revenue',
  MANAGE_PAYMENTS: 'studio_manage_payments',
  SET_PRICING: 'studio_set_pricing',
  VIEW_INVOICES: 'studio_view_invoices',

  // === ANALYTICS & REPORTING ===
  VIEW_ANALYTICS: 'studio_view_analytics',
  VIEW_UTILIZATION: 'studio_view_utilization',
  EXPORT_REPORTS: 'studio_export_reports',
  VIEW_PERFORMANCE: 'studio_view_performance',

  // === SETTINGS & ADMIN ===
  MANAGE_SETTINGS: 'studio_manage_settings',
  IMPORT_DATA: 'studio_import_data',
  MANAGE_TEMPLATES: 'studio_manage_templates'
} as const;

// Studio role configurations
export const STUDIO_ROLE_CONFIG: Record<StudioRole, StudioPermission[]> = {
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
    STUDIO_PERMISSIONS.VIEW_ALL_BOOKINGS,
    STUDIO_PERMISSIONS.CHECK_IN_BOOKINGS,
    STUDIO_PERMISSIONS.VIEW_CLIENT_HISTORY,
    STUDIO_PERMISSIONS.VIEW_STAFF_SCHEDULE,
    STUDIO_PERMISSIONS.CLOCK_IN_OUT,
    STUDIO_PERMISSIONS.MANAGE_TASKS,
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
    STUDIO_PERMISSIONS.VIEW_ALL_BOOKINGS,
    STUDIO_PERMISSIONS.VIEW_INVOICES,
    STUDIO_PERMISSIONS.CLIENT_COMMUNICATIONS
  ]
};

// Determines which context to check permissions in
export const STUDIO_CONTEXT = {
  BOOKING: 'booking',
  CLIENT: 'client',
  STAFF: 'staff',
  EQUIPMENT: 'equipment',
  FACILITY: 'facility',
  FINANCIAL: 'financial',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings'
} as const;

// =====================================================
// ROLE CONFIGURATIONS
// =====================================================

type RoleConfigKey = AccountType | 'Admin';

const ROLE_CONFIG: Record<string, Permission[]> = {
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
  'Talent': [
    PERMISSIONS.CAN_POST,
    PERMISSIONS.CAN_COMMENT,
    PERMISSIONS.CAN_APPROVE_BOOKINGS
  ],
  'Engineer': [PERMISSIONS.CAN_POST, PERMISSIONS.CAN_COMMENT, PERMISSIONS.CAN_APPROVE_BOOKINGS],
  'Producer': [PERMISSIONS.CAN_POST, PERMISSIONS.CAN_COMMENT, PERMISSIONS.CAN_APPROVE_BOOKINGS],
  'Composer': [PERMISSIONS.CAN_POST, PERMISSIONS.CAN_COMMENT, PERMISSIONS.CAN_APPROVE_BOOKINGS],
  'Technician': [PERMISSIONS.CAN_POST, PERMISSIONS.CAN_COMMENT],
  'Fan': [
    PERMISSIONS.CAN_POST,
    PERMISSIONS.CAN_COMMENT
  ],
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
    PERMISSIONS.CAN_APPROVE_BOOKINGS
  ]
};

// =====================================================
// PERMISSION CHECK FUNCTIONS
// =====================================================

/**
 * Checks if a user has a specific permission based on their roles.
 */
export const checkPermission = (userData: UserData | null, permission: Permission): boolean => {
  if (!userData || !userData.accountTypes) return false;

  // Check all roles the user possesses
  return userData.accountTypes.some((role: string) => {
    const allowed = ROLE_CONFIG[role as RoleConfigKey];
    return allowed && allowed.includes(permission);
  });
};

export interface EnrollmentData {
  status: string;
  [key: string]: any;
}

export const isInternshipActive = (enrollmentData: EnrollmentData | null): boolean => {
  if (!enrollmentData || enrollmentData.status !== 'Active') return false;
  return true;
};

// =====================================================
// STUDIO OPS PERMISSION HELPERS
// =====================================================

interface StudioUser {
  studioRole?: StudioRole | string;
  isStudioOwner?: boolean;
  accountTypes?: AccountType[];
  [key: string]: any;
}

/**
 * Check if a user has a specific studio permission
 */
export const hasStudioPermission = (user: StudioUser | null, permission: StudioPermission): boolean => {
  if (!user || !user.studioRole) return false;

  const rolePermissions = STUDIO_ROLE_CONFIG[user.studioRole.toUpperCase() as StudioRole];
  return rolePermissions ? rolePermissions.includes(permission) : false;
};

/**
 * Check if user can perform an action in a specific context
 */
export const canAccessStudioContext = (
  user: StudioUser | null,
  context: StudioContext,
  action: string | null = null
): boolean => {
  // Define context-permission mappings
  const contextPermissions: Record<StudioContext, StudioPermission[]> = {
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

  // For specific actions, check if user has the first permission in context
  return hasStudioPermission(user, permissions[0]);
};

/**
 * Get user's studio role from userData
 */
export const getStudioRole = (userData: UserData | null): StudioRole | null => {
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
    return userData.studioRole.toUpperCase() as StudioRole;
  }

  // Default to CLIENT (portal access)
  return 'CLIENT';
};

/**
 * Check if user is a studio owner
 */
export const isStudioOwner = (userData: UserData | null): boolean => {
  return getStudioRole(userData) === 'OWNER';
};

/**
 * Check if user is studio staff (owner, manager, or staff)
 */
export const isStudioStaff = (userData: UserData | null): boolean => {
  const role = getStudioRole(userData);
  return ['OWNER', 'MANAGER', 'STAFF'].includes(role || '');
};

/**
 * Get allowed tabs for a user in StudioManager
 */
export const getAllowedStudioTabs = (userData: UserData | null): string[] => {
  const role = getStudioRole(userData);

  // All tabs visible to owners and managers
  if (role && ['OWNER', 'MANAGER'].includes(role)) {
    return ['overview', 'rooms', 'equipment', 'gallery', 'availability', 'policies', 'bookings', 'clients', 'staff', 'analytics', 'settings'];
  }

  // Staff see limited tabs
  if (role === 'STAFF') {
    return ['overview', 'bookings', 'equipment'];
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
 */
export const canAccessStudioTab = (userData: UserData | null, tabId: string): boolean => {
  return getAllowedStudioTabs(userData).includes(tabId);
};

/**
 * Authorization middleware for API routes (placeholder)
 */
export const requireStudioPermission = async (
  request: Request,
  permission: StudioPermission
): Promise<StudioUser | null> => {
  // Placeholder implementation
  // Actual implementation would:
  // 1. Verify Clerk token from request
  // 2. Fetch user data from Neon/Convex
  // 3. Check studio role and permissions
  return null;
};

/**
 * Map account types to studio permissions for legacy compatibility
 */
export const getStudioPermissionsFromAccountTypes = (accountTypes: AccountType[] | null | undefined): StudioPermission[] => {
  if (!accountTypes) return [];

  const permissions: StudioPermission[] = [];

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
