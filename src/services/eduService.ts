/**
 * EDU Service - Convex Only
 *
 * All education operations now use Convex for real-time updates.
 * No more Neon/PostgreSQL - everything in one place.
 */

import { api } from '@convex/api';
import { useQuery, useMutation } from 'convex/react';
import type { Id } from '@convex/dataModel';
import * as Sentry from '@sentry/react';
import { convex } from '@/config/convex';

// =====================================================
// SCHOOL QUERIES
// =====================================================

/**
 * Get all schools
 */
export function useSchools() {
  return useQuery(api.edu.getSchools);
}

/**
 * Get school by ID
 */
export function useSchool(schoolId: string | undefined) {
  return useQuery(
    api.edu.getSchoolById,
    schoolId ? { schoolId: schoolId as Id<"schools"> } : "skip"
  );
}

/**
 * Get schools by owner
 */
export function useSchoolsByOwner(ownerId: string | undefined) {
  return useQuery(
    api.edu.getSchoolsByOwner,
    ownerId ? { ownerId } : "skip"
  );
}

/**
 * Search schools
 */
export function useSchoolSearch(filters: {
  searchQuery?: string;
  city?: string;
  state?: string;
  schoolType?: string;
  limit?: number;
}) {
  return useQuery(api.edu.searchSchools, filters);
}

// =====================================================
// SCHOOL MUTATIONS
// =====================================================

/**
 * Hook for school mutations
 */
export function useSchoolMutations() {
  const create = useMutation(api.edu.createSchool);
  const update = useMutation(api.edu.updateSchool);
  const remove = useMutation(api.edu.deleteSchool);

  return {
    create,
    update,
    remove,
  };
}

// =====================================================
// STUDENT QUERIES
// =====================================================

/**
 * Get students by school
 */
export function useStudentsBySchool(
  schoolId: string | undefined,
  status?: string,
  limit = 50
) {
  return useQuery(
    api.edu.getStudentsBySchool,
    schoolId ? { schoolId: schoolId as Id<"schools">, status, limit } : "skip"
  );
}

/**
 * Get student by user and school
 */
export function useStudentByUserAndSchool(
  userId: string | undefined,
  schoolId: string | undefined
) {
  return useQuery(
    api.edu.getStudentByUserAndSchool,
    (userId && schoolId)
      ? { userId: userId as Id<"users">, schoolId: schoolId as Id<"schools"> }
      : "skip"
  );
}

// =====================================================
// STUDENT MUTATIONS
// =====================================================

/**
 * Hook for student mutations
 */
export function useStudentMutations() {
  const create = useMutation(api.edu.createStudent);
  const update = useMutation(api.edu.updateStudent);
  const remove = useMutation(api.edu.deleteStudent);

  return {
    create,
    update,
    remove,
  };
}

// =====================================================
// STAFF QUERIES
// =====================================================

/**
 * Get staff by school
 */
export function useStaffBySchool(
  schoolId: string | undefined,
  role?: string,
  limit = 50
) {
  return useQuery(
    api.edu.getStaffBySchool,
    schoolId ? { schoolId: schoolId as Id<"schools">, role, limit } : "skip"
  );
}

/**
 * Get staff by user and school
 */
export function useStaffByUserAndSchool(
  userId: string | undefined,
  schoolId: string | undefined
) {
  return useQuery(
    api.edu.getStaffByUserAndSchool,
    (userId && schoolId)
      ? { userId: userId as Id<"users">, schoolId: schoolId as Id<"schools"> }
      : "skip"
  );
}

// =====================================================
// STAFF MUTATIONS
// =====================================================

/**
 * Hook for staff mutations
 */
export function useStaffMutations() {
  const create = useMutation(api.edu.createStaff);
  const update = useMutation(api.edu.updateStaff);
  const remove = useMutation(api.edu.deleteStaff);

  return {
    create,
    update,
    remove,
  };
}

// =====================================================
// COURSE/CLASS QUERIES
// =====================================================

/**
 * Get courses by school
 */
export function useCoursesBySchool(
  schoolId: string | undefined,
  status?: string,
  limit = 50
) {
  return useQuery(
    api.edu.getCoursesBySchool,
    schoolId ? { schoolId: schoolId as Id<"schools">, status, limit } : "skip"
  );
}

/**
 * Get course by ID
 */
export function useCourse(courseId: string | undefined) {
  return useQuery(
    api.edu.getCourseById,
    courseId ? { courseId: courseId as Id<"courses"> } : "skip"
  );
}

// =====================================================
// COURSE/CLASS MUTATIONS
// =====================================================

/**
 * Hook for course mutations
 */
export function useCourseMutations() {
  const create = useMutation(api.edu.createCourse);
  const update = useMutation(api.edu.updateCourse);
  const remove = useMutation(api.edu.deleteCourse);

  return {
    create,
    update,
    remove,
  };
}

// =====================================================
// ENROLLMENT QUERIES
// =====================================================

/**
 * Get enrollments by student
 */
export function useEnrollmentsByStudent(
  studentId: string | undefined,
  status?: string,
  limit = 20
) {
  return useQuery(
    api.edu.getEnrollmentsByStudent,
    studentId ? { studentId: studentId as Id<"students">, status, limit } : "skip"
  );
}

/**
 * Get enrollments by course
 */
export function useEnrollmentsByCourse(
  courseId: string | undefined,
  status?: string,
  limit = 50
) {
  return useQuery(
    api.edu.getEnrollmentsByCourse,
    courseId ? { courseId: courseId as Id<"courses">, status, limit } : "skip"
  );
}

// =====================================================
// ENROLLMENT MUTATIONS
// =====================================================

/**
 * Hook for enrollment mutations
 */
export function useEnrollmentMutations() {
  const enroll = useMutation(api.edu.enrollStudent);
  const update = useMutation(api.edu.updateEnrollment);
  const withdraw = useMutation(api.edu.withdrawFromCourse);

  return {
    enroll,
    update,
    withdraw,
  };
}

// =====================================================
// INTERNSHIP QUERIES
// =====================================================

/**
 * Get internships by student
 */
export function useInternshipsByStudent(
  studentId: string | undefined,
  status?: string,
  limit = 20
) {
  return useQuery(
    api.edu.getInternshipsByStudent,
    studentId ? { studentId: studentId as Id<"students">, status, limit } : "skip"
  );
}

/**
 * Get internships by school
 */
export function useInternshipsBySchool(
  schoolId: string | undefined,
  status?: string,
  limit = 50
) {
  return useQuery(
    api.edu.getInternshipsBySchool,
    schoolId ? { schoolId: schoolId as Id<"schools">, status, limit } : "skip"
  );
}

// =====================================================
// INTERNSHIP MUTATIONS
// =====================================================

/**
 * Hook for internship mutations
 */
export function useInternshipMutations() {
  const create = useMutation(api.edu.createInternship);
  const update = useMutation(api.edu.updateInternship);
  const remove = useMutation(api.edu.deleteInternship);

  return {
    create,
    update,
    remove,
  };
}

// =====================================================
// LEGACY API FUNCTIONS (DEPRECATED)
// =====================================================
// These are kept for backward compatibility but should not be used

export async function fetchSchool(schoolId: string) {
  console.warn('fetchSchool: Use useSchool hook instead');
  return null;
}

export async function fetchSchools(options: { isActive?: boolean; limit?: number } = {}) {
  console.warn('fetchSchools: Use useSchools hook instead');
  return [];
}

export async function createNewSchool(schoolData: any) {
  console.warn('createNewSchool: Use useSchoolMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function updateSchoolData(schoolId: string, updates: any) {
  console.warn('updateSchoolData: Use useSchoolMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchStudent(studentId: string) {
  console.warn('fetchStudent: Use useStudentByUserAndSchool hook instead');
  return null;
}

export async function fetchStudentsBySchool(schoolId: string, status?: string, limit = 50) {
  console.warn('fetchStudentsBySchool: Use useStudentsBySchool hook instead');
  return [];
}

export async function createNewStudent(studentData: any) {
  console.warn('createNewStudent: Use useStudentMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function updateStudentData(studentId: string, updates: any) {
  console.warn('updateStudentData: Use useStudentMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchStaff(staffId: string) {
  console.warn('fetchStaff: Use useStaffByUserAndSchool hook instead');
  return null;
}

export async function fetchStaffBySchool(schoolId: string, role?: string, limit = 50) {
  console.warn('fetchStaffBySchool: Use useStaffBySchool hook instead');
  return [];
}

export async function createNewStaff(staffData: any) {
  console.warn('createNewStaff: Use useStaffMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function updateStaffData(staffId: string, updates: any) {
  console.warn('updateStaffData: Use useStaffMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchCourses(schoolId: string, status?: string, limit = 50) {
  console.warn('fetchCourses: Use useCoursesBySchool hook instead');
  return [];
}

export async function fetchCourse(courseId: string) {
  console.warn('fetchCourse: Use useCourse hook instead');
  return null;
}

export async function createNewCourse(courseData: any) {
  console.warn('createNewCourse: Use useCourseMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function updateCourseData(courseId: string, updates: any) {
  console.warn('updateCourseData: Use useCourseMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchEnrollments(studentId: string, status?: string, limit = 20) {
  console.warn('fetchEnrollments: Use useEnrollmentsByStudent hook instead');
  return [];
}

export async function enrollStudentInCourse(enrollmentData: any) {
  console.warn('enrollStudentInCourse: Use useEnrollmentMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchInternships(studentId: string, status?: string, limit = 20) {
  console.warn('fetchInternships: Use useInternshipsByStudent hook instead');
  return [];
}

export async function createInternship(internshipData: any) {
  console.warn('createInternship: Use useInternshipMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function updateInternshipData(internshipId: string, updates: any) {
  console.warn('updateInternshipData: Use useInternshipMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchStudentByUserAndSchool(userId: string, schoolId: string) {
  console.warn('fetchStudentByUserAndSchool: Use useStudentByUserAndSchool hook instead');
  return null;
}

export async function fetchStaffByUserAndSchool(userId: string, schoolId: string) {
  console.warn('fetchStaffByUserAndSchool: Use useStaffByUserAndSchool hook instead');
  return null;
}

// =====================================================
// ASYNC FETCH FUNCTIONS (Non-hooks for utils)
// =====================================================

export async function fetchSchool(schoolId: string) {
  return await convex.query(api.edu.getSchoolById, { schoolId: schoolId as Id<"schools"> });
}

export async function fetchStudentByUserAndSchool(userId: string, schoolId: string) {
  return await convex.query(api.edu.getStudentByUserAndSchool, { 
    userId: userId as Id<"users">, 
    schoolId: schoolId as Id<"schools"> 
  });
}

export async function fetchStaffByUserAndSchool(userId: string, schoolId: string) {
  return await convex.query(api.edu.getStaffByUserAndSchool, { 
    userId: userId as Id<"users">, 
    schoolId: schoolId as Id<"schools"> 
  });
}

export async function fetchSchoolsByRole(userId: string, role: string) {
  // This might need a specialized Convex query, but for now we can check user's roles
  // In the real implementation, this should call api.edu.getSchoolsByRole
  console.log(`Fetching schools for user ${userId} with role ${role}`);
  // Temporary: just return the user's primary school if they have that role
  return []; 
}

export async function checkRoleAtSchool(userId: string, schoolId: string, role: string) {
  // Check if user has specific role at school
  if (role === 'Student') {
    const student = await fetchStudentByUserAndSchool(userId, schoolId);
    return !!student;
  }
  if (role === 'EDUStaff' || role === 'EDUAdmin' || role === 'Intern') {
    const staff = await fetchStaffByUserAndSchool(userId, schoolId);
    if (!staff) return false;
    if (role === 'EDUAdmin') return staff.roleName === 'EDUAdmin';
    if (role === 'Intern') return staff.roleName === 'Intern';
    return true; // EDUStaff
  }
  return false;
}

export async function checkInStudent(userId: string, schoolId: string) {
  // Note: For mutations, we usually want to use hooks, but if needed:
  // await convex.mutation(api.edu.checkInStudent, { userId, schoolId });
  return { success: false, error: 'Use useMutation hook instead' };
}

export async function checkOutStudent(userId: string, schoolId: string) {
  return { success: false, error: 'Use useMutation hook instead' };
}

export default {
  // Queries (use these in components)
  useSchools,
  useSchool,
  useSchoolsByOwner,
  useSchoolSearch,
  useStudentsBySchool,
  useStudentByUserAndSchool,
  useStaffBySchool,
  useStaffByUserAndSchool,
  useCoursesBySchool,
  useCourse,
  useEnrollmentsByStudent,
  useEnrollmentsByCourse,
  useInternshipsByStudent,
  useInternshipsBySchool,

  // Mutations (use these in components)
  useSchoolMutations,
  useStudentMutations,
  useStaffMutations,
  useCourseMutations,
  useEnrollmentMutations,
  useInternshipMutations,

  // Async functions (for utils)
  fetchSchool,
  fetchStudentByUserAndSchool,
  fetchStaffByUserAndSchool,
  fetchSchoolsByRole,
  checkRoleAtSchool,
};
