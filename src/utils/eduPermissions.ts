// src/utils/eduPermissions.ts

import { EDU_ROLES, EDU_ROLE_HIERARCHY, GLOBAL_ADMIN_ROLE } from '../config/constants';
import type { UserData, AccountType } from '../types';

type EDURole = 'EDUAdmin' | 'EDUStaff' | 'Student' | 'Intern';

/**
 * Check if user has any EDU access (has any EDU role)
 */
export function hasEduAccess(userData: UserData | null): boolean {
  if (!userData || !userData.accountTypes) return false;
  return userData.accountTypes.some((role: AccountType) => EDU_ROLES.includes(role));
}

/**
 * Get user's highest EDU role level
 */
export function getEduRole(userData: UserData | null): EDURole | null {
  if (!hasEduAccess(userData)) return null;

  const userRoles = (userData.accountTypes || []).filter((role: AccountType) =>
    EDU_ROLES.includes(role)
  );

  // Return highest role based on hierarchy
  for (const role of EDU_ROLE_HIERARCHY) {
    if (userRoles.includes(role as AccountType)) {
      return role as EDURole;
    }
  }

  return (userRoles[0] as EDURole) || null;
}

/**
 * Check if user has specific EDU permission
 */
export function hasEduPermission(userData: UserData | null, permission: string): boolean {
  if (!hasEduAccess(userData)) return false;

  const role = getEduRole(userData);

  // EDU Admin has all school permissions
  if (role === 'EDUAdmin') return true;

  // For other roles, check if they have the permission in their role
  if (role === 'EDUStaff') {
    // EDUStaff typically have most permissions except school admin ones
    return permission !== 'edit_settings' || userData?.accountTypes?.includes('EDUAdmin');
  }

  // Students and Interns have limited permissions
  if (role === 'Student' || role === 'Intern') {
    return false; // Students don't have admin permissions
  }

  return false;
}

/**
 * Check if user can access a specific school
 */
export async function canAccessSchool(
  userData: UserData | null,
  schoolId: string,
  userSchoolIds: string[] | null = null
): Promise<boolean> {
  if (!userData) return false;

  // Global Admin (GAdmin) can access all schools
  if (userData.accountTypes?.includes(GLOBAL_ADMIN_ROLE as AccountType)) return true;

  // If userSchoolIds provided, check if schoolId is in the list
  if (userSchoolIds !== null && Array.isArray(userSchoolIds)) {
    return userSchoolIds.includes(schoolId);
  }

  // If no userSchoolIds provided, perform async check
  if (!hasEduAccess(userData)) return false;

  const { isStudentInSchool, isInternInSchool, isStaffInSchool, isAdminInSchool } =
    await import('./eduRoleAssignment');
  const accountTypes = userData.accountTypes || [];

  // Check each role
  if (accountTypes.includes('Student' as AccountType)) {
    if (await isStudentInSchool(userData.uid || userData.id || '', schoolId)) return true;
  }
  if (accountTypes.includes('Intern' as AccountType)) {
    if (await isInternInSchool(userData.uid || userData.id || '', schoolId)) return true;
  }
  if (accountTypes.includes('EDUStaff' as AccountType)) {
    if (await isStaffInSchool(userData.uid || userData.id || '', schoolId)) return true;
  }
  if (accountTypes.includes('EDUAdmin' as AccountType)) {
    if (await isAdminInSchool(userData.uid || userData.id || '', schoolId)) return true;
  }

  // Fallback: check if schoolId matches user's primary schoolId
  return userData.schoolId === schoolId;
}

/**
 * Check if user is a Global Admin (GAdmin)
 */
export function isGlobalAdmin(userData: UserData | null): boolean {
  if (!userData || !userData.accountTypes) return false;
  return userData.accountTypes.includes(GLOBAL_ADMIN_ROLE as AccountType);
}

/**
 * Check if user is an EDU Admin (school admin)
 */
export function isEduAdmin(userData: UserData | null): boolean {
  if (!userData || !userData.accountTypes) return false;
  return userData.accountTypes.includes('EDUAdmin');
}

/**
 * Check if user is EDU Staff
 */
export function isEduStaff(userData: UserData | null): boolean {
  if (!userData || !userData.accountTypes) return false;
  return userData.accountTypes.includes('EDUStaff');
}

/**
 * Get user's assigned schools
 */
export async function getUserAssignedSchools(
  userId: string,
  accountTypes: AccountType[] = []
): Promise<string[]> {
  const { getSchoolsForRole } = await import('./eduRoleAssignment');
  const schools = new Set<string>();

  // Check each EDU role the user has
  for (const role of ['Student', 'Intern', 'EDUStaff', 'EDUAdmin']) {
    if (accountTypes.includes(role as AccountType)) {
      const roleSchools = await getSchoolsForRole(userId, role as EDURole);
      roleSchools.forEach((schoolId: string) => schools.add(schoolId));
    }
  }

  return Array.from(schools);
}
