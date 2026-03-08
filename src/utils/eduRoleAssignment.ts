// src/utils/eduRoleAssignment.ts
// Dynamic role assignment based on school enrollment/roster data

import type { AccountType } from '../types';
import * as eduService from '../services/eduService';

/**
 * EDU role types
 */
export type EDURole = 'Student' | 'Intern' | 'EDUStaff' | 'EDUAdmin';

/**
 * Get user's assigned schools based on their role
 *
 * @param userId - User ID
 * @param accountTypes - User's account types
 * @returns Array of school IDs user is assigned to
 */
export async function getUserAssignedSchools(
  userId: string,
  accountTypes: AccountType[] = []
): Promise<string[]> {
  const schoolIds = new Set<string>();

  // Check each EDU role type
  const eduRoles: EDURole[] = ['Student', 'Intern', 'EDUStaff', 'EDUAdmin'];

  for (const role of eduRoles) {
    if (accountTypes.includes(role as AccountType)) {
      const schools = await eduService.fetchSchoolsByRole(userId, role);
      schools.forEach(id => schoolIds.add(id));
    }
  }

  return Array.from(schoolIds);
}

/**
 * Get schools for a specific role
 */
export async function getSchoolsForRole(userId: string, role: EDURole): Promise<string[]> {
  return await eduService.fetchSchoolsByRole(userId, role);
}

/**
 * Check if user has specific EDU role at a school
 */
export async function hasEduRoleAtSchool(
  userId: string,
  schoolId: string,
  role: EDURole
): Promise<boolean> {
  return await eduService.checkRoleAtSchool(userId, schoolId, role);
}

/**
 * Get user's EDU role at a specific school
 * Returns the highest priority role (EDUAdmin > EDUStaff > Intern > Student)
 */
export async function getEduRoleAtSchool(
  userId: string,
  schoolId: string
): Promise<EDURole | null> {
  // Check in order of priority
  const roles: EDURole[] = ['EDUAdmin', 'EDUStaff', 'Intern', 'Student'];

  for (const role of roles) {
    const hasRole = await eduService.checkRoleAtSchool(userId, schoolId, role);
    if (hasRole) {
      return role;
    }
  }

  return null;
}

/**
 * Check if user is a student in school
 */
export async function isStudentInSchool(userId: string, schoolId: string): Promise<boolean> {
  return await eduService.checkRoleAtSchool(userId, schoolId, 'Student');
}

/**
 * Check if user is an intern in school
 */
export async function isInternInSchool(userId: string, schoolId: string): Promise<boolean> {
  return await eduService.checkRoleAtSchool(userId, schoolId, 'Intern');
}

/**
 * Check if user is staff in school
 */
export async function isStaffInSchool(userId: string, schoolId: string): Promise<boolean> {
  return await eduService.checkRoleAtSchool(userId, schoolId, 'EDUStaff');
}

/**
 * Check if user is admin in school
 */
export async function isAdminInSchool(userId: string, schoolId: string): Promise<boolean> {
  return await eduService.checkRoleAtSchool(userId, schoolId, 'EDUAdmin');
}

/**
 * Get all EDU roles for a user at a specific school
 * User can have multiple roles (e.g., be both a Student and an Intern)
 */
export async function getAllEduRolesAtSchool(
  userId: string,
  schoolId: string
): Promise<EDURole[]> {
  const roles: EDURole[] = [];
  const allRoles: EDURole[] = ['Student', 'Intern', 'EDUStaff', 'EDUAdmin'];

  for (const role of allRoles) {
    const hasRole = await eduService.checkRoleAtSchool(userId, schoolId, role);
    if (hasRole) {
      roles.push(role);
    }
  }

  return roles;
}

/**
 * Check if user has any EDU role at any school
 */
export async function hasAnyEduRole(userId: string): Promise<boolean> {
  const schoolIds = await getUserAssignedSchools(userId);
  return schoolIds.length > 0;
}

/**
 * Get user's primary school (first school found)
 * Useful for UI navigation when user has multiple schools
 */
export async function getPrimarySchool(userId: string): Promise<string | null> {
  const schoolIds = await getUserAssignedSchools(userId);
  return schoolIds.length > 0 ? schoolIds[0] : null;
}
