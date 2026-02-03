// src/utils/eduRoleAssignment.ts
// Dynamic role assignment based on school enrollment/roster data

import type { AccountType } from '../types';

/**
 * EDU role types
 */
export type EDURole = 'Student' | 'Intern' | 'EDUStaff' | 'EDUAdmin';

/**
 * Get user's assigned schools based on their role
 * TODO: Migrate all EDU role queries to Neon schools tables
 * Currently returns empty array to prevent app crashes
 *
 * @param userId - User ID
 * @param accountTypes - User's account types
 * @returns Array of school IDs user is assigned to
 */
export async function getUserAssignedSchools(
  userId: string,
  accountTypes: AccountType[] = []
): Promise<string[]> {
  // TODO: Implement Neon queries for:
  // - students table (for Student role)
  // - school_staff table (for Intern, EDUStaff roles)
  // - schools table (for EDUAdmin role - check admins array)

  console.warn('EDU role assignment not yet implemented with Neon');
  return [];
}

/**
 * Get schools for a specific role
 * TODO: Implement Neon query
 */
export async function getSchoolsForRole(userId: string, role: EDURole): Promise<string[]> {
  // TODO: Query appropriate table based on role
  // Student: SELECT school_id FROM students WHERE user_id = $1
  // Intern: SELECT school_id FROM school_staff WHERE user_id = $1 AND status = 'Active Internship'
  // EDUStaff: SELECT school_id FROM school_staff WHERE user_id = $1 AND status = 'Active'
  // EDUAdmin: SELECT id FROM schools WHERE $1 = ANY(admins)

  return [];
}

/**
 * Check if user has specific EDU role at a school
 * TODO: Implement Neon query
 */
export async function hasEduRoleAtSchool(
  userId: string,
  schoolId: string,
  role: EDURole
): Promise<boolean> {
  // TODO: Implement Neon query
  return false;
}

/**
 * Get user's EDU role at a specific school
 * TODO: Implement Neon query
 */
export async function getEduRoleAtSchool(
  userId: string,
  schoolId: string
): Promise<EDURole | null> {
  // TODO: Implement Neon query to check all EDU role tables
  return null;
}

/**
 * Check if user is a student in school
 * TODO: Implement Neon query
 */
export async function isStudentInSchool(userId: string, schoolId: string): Promise<boolean> {
  // TODO: SELECT 1 FROM students WHERE user_id = $1 AND school_id = $2
  return false;
}

/**
 * Check if user is an intern in school
 * TODO: Implement Neon query
 */
export async function isInternInSchool(userId: string, schoolId: string): Promise<boolean> {
  // TODO: SELECT 1 FROM school_staff WHERE user_id = $1 AND school_id = $2 AND status = 'Active Internship'
  return false;
}

/**
 * Check if user is staff in school
 * TODO: Implement Neon query
 */
export async function isStaffInSchool(userId: string, schoolId: string): Promise<boolean> {
  // TODO: SELECT 1 FROM school_staff WHERE user_id = $1 AND school_id = $2 AND status = 'Active'
  return false;
}

/**
 * Check if user is admin in school
 * TODO: Implement Neon query
 */
export async function isAdminInSchool(userId: string, schoolId: string): Promise<boolean> {
  // TODO: SELECT 1 FROM schools WHERE $1 = ANY(admins) AND id = $2
  return false;
}
