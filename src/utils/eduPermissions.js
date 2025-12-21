// src/utils/eduPermissions.js

import { EDU_ROLES, EDU_ROLE_HIERARCHY, GLOBAL_ADMIN_ROLE } from '../config/constants';

/**
 * Check if user has any EDU access (has any EDU role)
 * @param {Object} userData - User profile data
 * @returns {boolean}
 */
export function hasEduAccess(userData) {
    if (!userData || !userData.accountTypes) return false;
    return userData.accountTypes.some(role => EDU_ROLES.includes(role));
}

/**
 * Get user's highest EDU role level
 * @param {Object} userData - User profile data
 * @returns {string|null} - Highest role or null if no EDU access
 */
export function getEduRole(userData) {
    if (!hasEduAccess(userData)) return null;
    
    const userRoles = userData.accountTypes.filter(role => EDU_ROLES.includes(role));
    
    // Return highest role based on hierarchy
    for (const role of EDU_ROLE_HIERARCHY) {
        if (userRoles.includes(role)) {
            return role;
        }
    }
    
    return userRoles[0] || null;
}

/**
 * Check if user has specific EDU permission
 * @param {Object} userData - User profile data
 * @param {string} permission - Permission ID to check
 * @returns {boolean}
 */
export function hasEduPermission(userData, permission) {
    if (!hasEduAccess(userData)) return false;
    
    const role = getEduRole(userData);
    
    // EDU Admin has all school permissions
    if (role === 'EDUAdmin') return true;
    
    // For other roles, check if they have the permission in their role
    // This would need to check the school's role permissions
    // For now, return true for EDUStaff for most permissions
    if (role === 'EDUStaff') {
        // EDUStaff typically have most permissions except school admin ones
        return permission !== 'edit_settings' || userData.accountTypes?.includes('EDUAdmin');
    }
    
    // Students and Interns have limited permissions
    if (role === 'Student' || role === 'Intern') {
        return false; // Students don't have admin permissions
    }
    
    return false;
}

/**
 * Check if user can access a specific school
 * This checks:
 * - Student: enrolled in school (enrollments collection or students collection)
 * - Intern: listed in school roster with "Active Internship" status
 * - EDUStaff: listed in school staff collection
 * - EDUAdmin: listed in school admins array
 * - GAdmin: can access all schools
 * 
 * @param {Object} userData - User profile data
 * @param {string} schoolId - School ID to check
 * @param {Array} userSchoolIds - Array of school IDs user is assigned to (from enrollments/staff)
 * @returns {boolean|Promise<boolean>} - Returns boolean if userSchoolIds provided, Promise if needs async check
 */
export async function canAccessSchool(userData, schoolId, userSchoolIds = null) {
    if (!userData) return false;
    
    // Global Admin (GAdmin) can access all schools
    if (userData.accountTypes?.includes(GLOBAL_ADMIN_ROLE)) return true;
    
    // If userSchoolIds provided, check if schoolId is in the list
    if (userSchoolIds !== null && Array.isArray(userSchoolIds)) {
        return userSchoolIds.includes(schoolId);
    }
    
    // If no userSchoolIds provided, perform async check
    if (!hasEduAccess(userData)) return false;
    
    const { isStudentInSchool, isInternInSchool, isStaffInSchool, isAdminInSchool } = await import('./eduRoleAssignment');
    const accountTypes = userData.accountTypes || [];
    
    // Check each role
    if (accountTypes.includes('Student')) {
        if (await isStudentInSchool(userData.uid || userData.id, schoolId)) return true;
    }
    if (accountTypes.includes('Intern')) {
        if (await isInternInSchool(userData.uid || userData.id, schoolId)) return true;
    }
    if (accountTypes.includes('EDUStaff')) {
        if (await isStaffInSchool(userData.uid || userData.id, schoolId)) return true;
    }
    if (accountTypes.includes('EDUAdmin')) {
        if (await isAdminInSchool(userData.uid || userData.id, schoolId)) return true;
    }
    
    // Fallback: check if schoolId matches user's primary schoolId
    return userData.schoolId === schoolId;
}

/**
 * Check if user is a Global Admin (GAdmin)
 * @param {Object} userData - User profile data
 * @returns {boolean}
 */
export function isGlobalAdmin(userData) {
    if (!userData || !userData.accountTypes) return false;
    return userData.accountTypes.includes(GLOBAL_ADMIN_ROLE);
}

/**
 * Check if user is an EDU Admin (school admin)
 * @param {Object} userData - User profile data
 * @returns {boolean}
 */
export function isEduAdmin(userData) {
    if (!userData || !userData.accountTypes) return false;
    return userData.accountTypes.includes('EDUAdmin');
}

/**
 * Check if user is EDU Staff
 * @param {Object} userData - User profile data
 * @returns {boolean}
 */
export function isEduStaff(userData) {
    if (!userData || !userData.accountTypes) return false;
    return userData.accountTypes.includes('EDUStaff');
}

/**
 * Get user's assigned schools
 * This checks:
 * - Students: enrollments collection or students collection
 * - Interns: school roster with "Active Internship" status
 * - EDUStaff: staff collection
 * - EDUAdmin: school admins arrays
 * 
 * @param {string} userId - User ID
 * @param {Array<string>} accountTypes - User's account types
 * @returns {Promise<Array<string>>} - Array of school IDs
 */
export async function getUserAssignedSchools(userId, accountTypes = []) {
    const { getSchoolsForRole } = await import('./eduRoleAssignment');
    const schools = new Set();
    
    // Check each EDU role the user has
    for (const role of ['Student', 'Intern', 'EDUStaff', 'EDUAdmin']) {
        if (accountTypes.includes(role)) {
            const roleSchools = await getSchoolsForRole(userId, role);
            roleSchools.forEach(schoolId => schools.add(schoolId));
        }
    }
    
    return Array.from(schools);
}

