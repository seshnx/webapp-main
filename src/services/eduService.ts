/**
 * EDU Service
 *
 * Handles all education operations using Neon PostgreSQL database.
 * Provides a clean API layer for EDU components to use.
 */

import {
  getSchoolById,
  getSchools,
  createSchool,
  updateSchool,
  getStudentByUserAndSchool,
  getStudentsBySchool,
  createStudent,
  updateStudent,
  getStaffByUserAndSchool,
  getStaffBySchool,
  createStaff,
  updateStaff,
  getCoursesBySchool,
  getCourseById,
  getEnrollmentsByStudent,
  getEnrollmentsByCourse,
  enrollStudent,
  getSchoolsByRole,
  hasRoleAtSchool,
  recordCheckIn,
  recordCheckOut,
  getTodayCheckIn,
  getTodayCheckOut,
} from '../config/eduQueries';
import * as Sentry from '@sentry/react';

// =====================================================
// SCHOOL FUNCTIONS
// =====================================================

/**
 * Get school by ID
 */
export async function fetchSchool(schoolId: string) {
  try {
    return await getSchoolById(schoolId);
  } catch (error) {
    console.error('Failed to fetch school:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchSchool' },
      extra: { schoolId }
    });
    return null;
  }
}

/**
 * Get all schools
 */
export async function fetchSchools(options: { isActive?: boolean; limit?: number } = {}) {
  try {
    return await getSchools(options);
  } catch (error) {
    console.error('Failed to fetch schools:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchSchools' }
    });
    return [];
  }
}

/**
 * Create a new school
 */
export async function createNewSchool(schoolData: {
  name: string;
  short_name?: string;
  description?: string;
  address?: any;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  type?: string;
  accreditation?: string[];
  settings?: any;
}) {
  try {
    return await createSchool(schoolData);
  } catch (error) {
    console.error('Failed to create school:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'createNewSchool' }
    });
    throw error;
  }
}

/**
 * Update school
 */
export async function updateExistingSchool(
  schoolId: string,
  updates: {
    name?: string;
    short_name?: string;
    description?: string;
    address?: any;
    phone?: string;
    email?: string;
    website?: string;
    logo_url?: string;
    cover_image_url?: string;
    type?: string;
    accreditation?: string[];
    settings?: any;
    is_active?: boolean;
  }
) {
  try {
    await updateSchool(schoolId, updates);
  } catch (error) {
    console.error('Failed to update school:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'updateExistingSchool' },
      extra: { schoolId }
    });
    throw error;
  }
}

// =====================================================
// STUDENT FUNCTIONS
// =====================================================

/**
 * Get student by user and school
 */
export async function fetchStudentByUserAndSchool(userId: string, schoolId: string) {
  try {
    return await getStudentByUserAndSchool(userId, schoolId);
  } catch (error) {
    console.error('Failed to fetch student:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchStudentByUserAndSchool' },
      extra: { userId, schoolId }
    });
    return null;
  }
}

/**
 * Get students by school
 */
export async function fetchStudentsBySchool(schoolId: string, options: { status?: string; limit?: number } = {}) {
  try {
    return await getStudentsBySchool(schoolId, options);
  } catch (error) {
    console.error('Failed to fetch students:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchStudentsBySchool' },
      extra: { schoolId }
    });
    return [];
  }
}

/**
 * Create a new student
 */
export async function createNewStudent(studentData: {
  user_id: string;
  school_id: string;
  student_id?: string;
  enrollment_date?: string;
  graduation_date?: string;
  program?: string;
  cohort?: string;
}) {
  try {
    return await createStudent(studentData);
  } catch (error) {
    console.error('Failed to create student:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'createNewStudent' }
    });
    throw error;
  }
}

/**
 * Update student
 */
export async function updateExistingStudent(
  studentId: string,
  updates: {
    status?: string;
    program?: string;
    cohort?: string;
    gpa?: number;
    credits_earned?: number;
    internship_studio_id?: string;
    graduation_date?: string;
    notes?: string;
  }
) {
  try {
    await updateStudent(studentId, updates);
  } catch (error) {
    console.error('Failed to update student:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'updateExistingStudent' },
      extra: { studentId }
    });
    throw error;
  }
}

// =====================================================
// STAFF FUNCTIONS
// =====================================================

/**
 * Get staff by user and school
 */
export async function fetchStaffByUserAndSchool(userId: string, schoolId: string) {
  try {
    return await getStaffByUserAndSchool(userId, schoolId);
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchStaffByUserAndSchool' },
      extra: { userId, schoolId }
    });
    return null;
  }
}

/**
 * Get staff by school
 */
export async function fetchStaffBySchool(schoolId: string, options: { status?: string; limit?: number } = {}) {
  try {
    return await getStaffBySchool(schoolId, options);
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchStaffBySchool' },
      extra: { schoolId }
    });
    return [];
  }
}

/**
 * Create a new staff member
 */
export async function createNewStaff(staffData: {
  user_id: string;
  school_id: string;
  role_id?: string;
  title?: string;
  department?: string;
  hire_date?: string;
  permissions?: any;
}) {
  try {
    return await createStaff(staffData);
  } catch (error) {
    console.error('Failed to create staff:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'createNewStaff' }
    });
    throw error;
  }
}

/**
 * Update staff
 */
export async function updateExistingStaff(
  staffId: string,
  updates: {
    role_id?: string;
    title?: string;
    department?: string;
    status?: string;
    permissions?: any;
    notes?: string;
  }
) {
  try {
    await updateStaff(staffId, updates);
  } catch (error) {
    console.error('Failed to update staff:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'updateExistingStaff' },
      extra: { staffId }
    });
    throw error;
  }
}

// =====================================================
// COURSE FUNCTIONS
// =====================================================

/**
 * Get courses by school
 */
export async function fetchCoursesBySchool(schoolId: string, options: { semester?: string; year?: number; status?: string } = {}) {
  try {
    return await getCoursesBySchool(schoolId, options);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchCoursesBySchool' },
      extra: { schoolId }
    });
    return [];
  }
}

/**
 * Get course by ID
 */
export async function fetchCourseById(courseId: string) {
  try {
    return await getCourseById(courseId);
  } catch (error) {
    console.error('Failed to fetch course:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchCourseById' },
      extra: { courseId }
    });
    return null;
  }
}

// =====================================================
// ENROLLMENT FUNCTIONS
// =====================================================

/**
 * Get enrollments for student
 */
export async function fetchEnrollmentsByStudent(studentId: string) {
  try {
    return await getEnrollmentsByStudent(studentId);
  } catch (error) {
    console.error('Failed to fetch enrollments:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchEnrollmentsByStudent' },
      extra: { studentId }
    });
    return [];
  }
}

/**
 * Get enrollments for course
 */
export async function fetchEnrollmentsByCourse(courseId: string) {
  try {
    return await getEnrollmentsByCourse(courseId);
  } catch (error) {
    console.error('Failed to fetch course enrollments:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchEnrollmentsByCourse' },
      extra: { courseId }
    });
    return [];
  }
}

/**
 * Enroll student in course
 */
export async function enrollStudentInCourse(studentId: string, courseId: string) {
  try {
    return await enrollStudent(studentId, courseId);
  } catch (error) {
    console.error('Failed to enroll student:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'enrollStudentInCourse' },
      extra: { studentId, courseId }
    });
    throw error;
  }
}

// =====================================================
// ROLE FUNCTIONS
// =====================================================

/**
 * Get schools for a specific role
 */
export async function fetchSchoolsByRole(userId: string, role: 'Student' | 'Intern' | 'EDUStaff' | 'EDUAdmin'): Promise<string[]> {
  try {
    return await getSchoolsByRole(userId, role);
  } catch (error) {
    console.error('Failed to fetch schools by role:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'fetchSchoolsByRole' },
      extra: { userId, role }
    });
    return [];
  }
}

/**
 * Check if user has role at school
 */
export async function checkRoleAtSchool(userId: string, schoolId: string, role: 'Student' | 'Intern' | 'EDUStaff' | 'EDUAdmin'): Promise<boolean> {
  try {
    return await hasRoleAtSchool(userId, schoolId, role);
  } catch (error) {
    console.error('Failed to check role at school:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'checkRoleAtSchool' },
      extra: { userId, schoolId, role }
    });
    return false;
  }
}

// =====================================================
// ATTENDANCE FUNCTIONS
// =====================================================

/**
 * Check in student
 */
export async function checkInStudent(studentId: string, schoolId: string) {
  try {
    const record = await recordCheckIn(studentId, schoolId);
    return {
      success: true,
      timestamp: record.created_at,
      error: undefined
    };
  } catch (error) {
    console.error('Failed to check in student:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'checkInStudent' },
      extra: { studentId, schoolId }
    });
    return {
      success: false,
      timestamp: undefined,
      error: error instanceof Error ? error.message : 'Failed to check in'
    };
  }
}

/**
 * Check out student
 */
export async function checkOutStudent(studentId: string, schoolId: string) {
  try {
    const record = await recordCheckOut(studentId, schoolId);
    return {
      success: true,
      timestamp: record.created_at,
      error: undefined
    };
  } catch (error) {
    console.error('Failed to check out student:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'checkOutStudent' },
      extra: { studentId, schoolId }
    });
    return {
      success: false,
      timestamp: undefined,
      error: error instanceof Error ? error.message : 'Failed to check out'
    };
  }
}

/**
 * Get today's check-in status
 */
export async function getTodayCheckInStatus(studentId: string, schoolId: string) {
  try {
    return await getTodayCheckIn(studentId, schoolId);
  } catch (error) {
    console.error('Failed to get check-in status:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'getTodayCheckInStatus' },
      extra: { studentId, schoolId }
    });
    return null;
  }
}

/**
 * Get today's check-out status
 */
export async function getTodayCheckOutStatus(studentId: string, schoolId: string) {
  try {
    return await getTodayCheckOut(studentId, schoolId);
  } catch (error) {
    console.error('Failed to get check-out status:', error);
    Sentry.captureException(error, {
      tags: { service: 'edu', function: 'getTodayCheckOutStatus' },
      extra: { studentId, schoolId }
    });
    return null;
  }
}
