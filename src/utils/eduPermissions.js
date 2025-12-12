// src/utils/eduPermissions.js

import { EDU_ROLES, EDU_ROLE_HIERARCHY } from '../config/constants';

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
    
    // Global Admin has all permissions
    if (role === 'Admin') return true;
    
    // For other roles, check if they have the permission in their role
    // This would need to check the school's role permissions
    // For now, return true for Instructor/Staff for most permissions
    if (role === 'Instructor') {
        // Instructors typically have most permissions except global admin ones
        return permission !== 'edit_settings' || userData.accountTypes?.includes('Admin');
    }
    
    // Students and Interns have limited permissions
    if (role === 'Student' || role === 'Intern') {
        return false; // Students don't have admin permissions
    }
    
    return false;
}

/**
 * Check if user can access a specific school
 * @param {Object} userData - User profile data
 * @param {string} schoolId - School ID to check
 * @returns {boolean}
 */
export function canAccessSchool(userData, schoolId) {
    if (!hasEduAccess(userData)) return false;
    
    const role = getEduRole(userData);
    
    // Global Admin can access all schools
    if (role === 'Admin') return true;
    
    // Other users can only access their own school
    return userData.schoolId === schoolId;
}

