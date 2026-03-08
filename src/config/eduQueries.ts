/**
 * EDU Database Queries
 *
 * All education-related database operations for Neon PostgreSQL
 */

import { neonClient } from './neon';

/**
 * Execute a SQL query with error handling
 *
 * @param sql - SQL query
 * @param params - Query parameters
 * @param queryName - Name for error tracking
 * @returns Query results
 */
async function executeQuery<T = any>(
  sql: string,
  params: any[] = [],
  queryName: string = 'Unnamed Query'
): Promise<T[]> {
  if (!neonClient) {
    throw new Error('Neon client is not configured');
  }

  try {
    const result = await neonClient(sql, params);
    return result as T[];
  } catch (error) {
    console.error(`Database error in ${queryName}:`, error);
    throw new Error(`Query ${queryName} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// =====================================================
// SCHOOL QUERIES
// =====================================================

/**
 * Get school by ID
 */
export async function getSchoolById(schoolId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT * FROM schools WHERE id = $1`,
    [schoolId],
    'getSchoolById'
  );
  return result[0] || null;
}

/**
 * Get all schools
 */
export async function getSchools(options: { isActive?: boolean; limit?: number } = {}): Promise<any[]> {
  const { isActive, limit = 100 } = options;

  let sql = `SELECT * FROM schools WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (isActive !== undefined) {
    sql += ` AND is_active = $${paramIndex}`;
    params.push(isActive);
    paramIndex++;
  }

  sql += ` ORDER BY name ASC LIMIT $${paramIndex}`;
  params.push(limit);

  return await executeQuery(sql, params, 'getSchools');
}

/**
 * Create a new school
 */
export async function createSchool(schoolData: {
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
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO schools (
      name, short_name, description, address, phone, email, website,
      logo_url, cover_image_url, type, accreditation, settings
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      schoolData.name,
      schoolData.short_name || null,
      schoolData.description || null,
      schoolData.address ? JSON.stringify(schoolData.address) : null,
      schoolData.phone || null,
      schoolData.email || null,
      schoolData.website || null,
      schoolData.logo_url || null,
      schoolData.cover_image_url || null,
      schoolData.type || 'Other',
      schoolData.accreditation || [],
      schoolData.settings ? JSON.stringify(schoolData.settings) : {},
    ],
    'createSchool'
  );

  return result[0];
}

/**
 * Update school
 */
export async function updateSchool(
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
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name) {
    fields.push(`name = $${paramIndex}`);
    values.push(updates.name);
    paramIndex++;
  }

  if (updates.short_name !== undefined) {
    fields.push(`short_name = $${paramIndex}`);
    values.push(updates.short_name);
    paramIndex++;
  }

  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    values.push(updates.description);
    paramIndex++;
  }

  if (updates.address !== undefined) {
    fields.push(`address = $${paramIndex}`);
    values.push(updates.address ? JSON.stringify(updates.address) : null);
    paramIndex++;
  }

  if (updates.phone !== undefined) {
    fields.push(`phone = $${paramIndex}`);
    values.push(updates.phone);
    paramIndex++;
  }

  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex}`);
    values.push(updates.email);
    paramIndex++;
  }

  if (updates.website !== undefined) {
    fields.push(`website = $${paramIndex}`);
    values.push(updates.website);
    paramIndex++;
  }

  if (updates.logo_url !== undefined) {
    fields.push(`logo_url = $${paramIndex}`);
    values.push(updates.logo_url);
    paramIndex++;
  }

  if (updates.cover_image_url !== undefined) {
    fields.push(`cover_image_url = $${paramIndex}`);
    values.push(updates.cover_image_url);
    paramIndex++;
  }

  if (updates.type) {
    fields.push(`type = $${paramIndex}`);
    values.push(updates.type);
    paramIndex++;
  }

  if (updates.accreditation) {
    fields.push(`accreditation = $${paramIndex}`);
    values.push(updates.accreditation);
    paramIndex++;
  }

  if (updates.settings) {
    fields.push(`settings = $${paramIndex}`);
    values.push(JSON.stringify(updates.settings));
    paramIndex++;
  }

  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex}`);
    values.push(updates.is_active);
    paramIndex++;
  }

  if (fields.length === 0) return;

  values.push(schoolId);

  await executeQuery(
    `UPDATE schools SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
    values,
    'updateSchool'
  );
}

// =====================================================
// STUDENT QUERIES
// =====================================================

/**
 * Get student by user ID and school ID
 */
export async function getStudentByUserAndSchool(userId: string, schoolId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT s.*, scu.username, scu.profile_photo_url
     FROM students s
     LEFT JOIN clerk_users scu ON scu.id = s.user_id::TEXT
     WHERE s.user_id = $1 AND s.school_id = $2`,
    [userId, schoolId],
    'getStudentByUserAndSchool'
  );

  return result[0] || null;
}

/**
 * Get all students for a school
 */
export async function getStudentsBySchool(schoolId: string, options: { status?: string; limit?: number } = {}): Promise<any[]> {
  const { status, limit = 100 } = options;

  let sql = `SELECT s.*, scu.username, scu.profile_photo_url, scu.email
             FROM students s
             LEFT JOIN clerk_users scu ON scu.id = s.user_id::TEXT
             WHERE s.school_id = $1`;
  const params: any[] = [schoolId];
  let paramIndex = 2;

  if (status) {
    sql += ` AND s.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY s.enrollment_date DESC LIMIT $${paramIndex}`;
  params.push(limit);

  return await executeQuery(sql, params, 'getStudentsBySchool');
}

/**
 * Create a new student
 */
export async function createStudent(studentData: {
  user_id: string;
  school_id: string;
  student_id?: string;
  enrollment_date?: string;
  graduation_date?: string;
  program?: string;
  cohort?: string;
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO students (
      user_id, school_id, student_id, enrollment_date, graduation_date, program, cohort
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      studentData.user_id,
      studentData.school_id,
      studentData.student_id || null,
      studentData.enrollment_date || new Date().toISOString().split('T')[0],
      studentData.graduation_date || null,
      studentData.program || null,
      studentData.cohort || null,
    ],
    'createStudent'
  );

  return result[0];
}

/**
 * Update student
 */
export async function updateStudent(
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
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.status) {
    fields.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex++;
  }

  if (updates.program) {
    fields.push(`program = $${paramIndex}`);
    values.push(updates.program);
    paramIndex++;
  }

  if (updates.cohort) {
    fields.push(`cohort = $${paramIndex}`);
    values.push(updates.cohort);
    paramIndex++;
  }

  if (updates.gpa !== undefined) {
    fields.push(`gpa = $${paramIndex}`);
    values.push(updates.gpa);
    paramIndex++;
  }

  if (updates.credits_earned !== undefined) {
    fields.push(`credits_earned = $${paramIndex}`);
    values.push(updates.credits_earned);
    paramIndex++;
  }

  if (updates.internship_studio_id) {
    fields.push(`internship_studio_id = $${paramIndex}`);
    values.push(updates.internship_studio_id);
    paramIndex++;
  }

  if (updates.graduation_date) {
    fields.push(`graduation_date = $${paramIndex}`);
    values.push(updates.graduation_date);
    paramIndex++;
  }

  if (updates.notes) {
    fields.push(`notes = $${paramIndex}`);
    values.push(updates.notes);
    paramIndex++;
  }

  if (fields.length === 0) return;

  values.push(studentId);

  await executeQuery(
    `UPDATE students SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
    values,
    'updateStudent'
  );
}

// =====================================================
// SCHOOL STAFF QUERIES
// =====================================================

/**
 * Get staff by user ID and school ID
 */
export async function getStaffByUserAndSchool(userId: string, schoolId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT ss.*, scu.username, scu.profile_photo_url, sr.name as role_name
     FROM school_staff ss
     LEFT JOIN clerk_users scu ON scu.id = ss.user_id::TEXT
     LEFT JOIN school_roles sr ON sr.id = ss.role_id
     WHERE ss.user_id = $1 AND ss.school_id = $2`,
    [userId, schoolId],
    'getStaffByUserAndSchool'
  );

  return result[0] || null;
}

/**
 * Get all staff for a school
 */
export async function getStaffBySchool(schoolId: string, options: { status?: string; limit?: number } = {}): Promise<any[]> {
  const { status, limit = 100 } = options;

  let sql = `SELECT ss.*, scu.username, scu.profile_photo_url, scu.email, sr.name as role_name
             FROM school_staff ss
             LEFT JOIN clerk_users scu ON scu.id = ss.user_id::TEXT
             LEFT JOIN school_roles sr ON sr.id = ss.role_id
             WHERE ss.school_id = $1`;
  const params: any[] = [schoolId];
  let paramIndex = 2;

  if (status) {
    sql += ` AND ss.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY ss.hire_date DESC LIMIT $${paramIndex}`;
  params.push(limit);

  return await executeQuery(sql, params, 'getStaffBySchool');
}

/**
 * Create a new staff member
 */
export async function createStaff(staffData: {
  user_id: string;
  school_id: string;
  role_id?: string;
  title?: string;
  department?: string;
  hire_date?: string;
  permissions?: any;
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO school_staff (
      user_id, school_id, role_id, title, department, hire_date, permissions
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      staffData.user_id,
      staffData.school_id,
      staffData.role_id || null,
      staffData.title || null,
      staffData.department || null,
      staffData.hire_date || new Date().toISOString().split('T')[0],
      staffData.permissions ? JSON.stringify(staffData.permissions) : {},
    ],
    'createStaff'
  );

  return result[0];
}

/**
 * Update staff
 */
export async function updateStaff(
  staffId: string,
  updates: {
    role_id?: string;
    title?: string;
    department?: string;
    status?: string;
    permissions?: any;
    notes?: string;
  }
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.role_id) {
    fields.push(`role_id = $${paramIndex}`);
    values.push(updates.role_id);
    paramIndex++;
  }

  if (updates.title) {
    fields.push(`title = $${paramIndex}`);
    values.push(updates.title);
    paramIndex++;
  }

  if (updates.department) {
    fields.push(`department = $${paramIndex}`);
    values.push(updates.department);
    paramIndex++;
  }

  if (updates.status) {
    fields.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex++;
  }

  if (updates.permissions) {
    fields.push(`permissions = $${paramIndex}`);
    values.push(JSON.stringify(updates.permissions));
    paramIndex++;
  }

  if (updates.notes) {
    fields.push(`notes = $${paramIndex}`);
    values.push(updates.notes);
    paramIndex++;
  }

  if (fields.length === 0) return;

  values.push(staffId);

  await executeQuery(
    `UPDATE school_staff SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
    values,
    'updateStaff'
  );
}

// =====================================================
// COURSE QUERIES
// =====================================================

/**
 * Get courses for a school
 */
export async function getCoursesBySchool(schoolId: string, options: { semester?: string; year?: number; status?: string } = {}): Promise<any[]> {
  const { semester, year, status } = options;

  let sql = `SELECT c.*, scu.username as instructor_name, scu.profile_photo_url as instructor_photo
             FROM courses c
             LEFT JOIN clerk_users scu ON scu.id = c.instructor_id::TEXT
             WHERE c.school_id = $1`;
  const params: any[] = [schoolId];
  let paramIndex = 2;

  if (semester) {
    sql += ` AND c.semester = $${paramIndex}`;
    params.push(semester);
    paramIndex++;
  }

  if (year) {
    sql += ` AND c.year = $${paramIndex}`;
    params.push(year);
    paramIndex++;
  }

  if (status) {
    sql += ` AND c.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY c.code ASC`;

  return await executeQuery(sql, params, 'getCoursesBySchool');
}

/**
 * Get a single course
 */
export async function getCourseById(courseId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT c.*, scu.username as instructor_name, scu.profile_photo_url as instructor_photo
     FROM courses c
     LEFT JOIN clerk_users scu ON scu.id = c.instructor_id::TEXT
     WHERE c.id = $1`,
    [courseId],
    'getCourseById'
  );

  return result[0] || null;
}

// =====================================================
// ENROLLMENT QUERIES
// =====================================================

/**
 * Get enrollments for a student
 */
export async function getEnrollmentsByStudent(studentId: string): Promise<any[]> {
  return await executeQuery(
    `SELECT e.*, c.code, c.title, c.credits, scu.username as instructor_name
     FROM enrollments e
     LEFT JOIN courses c ON c.id = e.course_id
     LEFT JOIN clerk_users scu ON scu.id = c.instructor_id::TEXT
     WHERE e.student_id = $1
     ORDER BY e.enrollment_date DESC`,
    [studentId],
    'getEnrollmentsByStudent'
  );
}

/**
 * Get enrollments for a course
 */
export async function getEnrollmentsByCourse(courseId: string): Promise<any[]> {
  return await executeQuery(
    `SELECT e.*, s.user_id, scu.username, scu.email, scu.profile_photo_url
     FROM enrollments e
     LEFT JOIN students s ON s.id = e.student_id
     LEFT JOIN clerk_users scu ON scu.id = s.user_id::TEXT
     WHERE e.course_id = $1
     ORDER BY e.enrollment_date DESC`,
    [courseId],
    'getEnrollmentsByCourse'
  );
}

/**
 * Enroll student in course
 */
export async function enrollStudent(studentId: string, courseId: string): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO enrollments (student_id, course_id, enrollment_date)
     VALUES ($1, $2, CURRENT_DATE)
     RETURNING *`,
    [studentId, courseId],
    'enrollStudent'
  );

  // Update course enrollment count
  await executeQuery(
    `UPDATE courses SET current_enrollment = current_enrollment + 1 WHERE id = $1`,
    [courseId],
    'enrollStudent'
  );

  return result[0];
}

// =====================================================
// ROLE QUERIES
// =====================================================

/**
 * Get user's schools by role
 */
export async function getSchoolsByRole(userId: string, role: 'Student' | 'Intern' | 'EDUStaff' | 'EDUAdmin'): Promise<string[]> {
  let sql = '';
  const params: any[] = [userId];

  switch (role) {
    case 'Student':
      sql = `SELECT DISTINCT school_id FROM students WHERE user_id = $1 AND status = 'active'`;
      break;
    case 'Intern':
    case 'EDUStaff':
      sql = `SELECT DISTINCT school_id FROM school_staff WHERE user_id = $1 AND status = 'active'`;
      break;
    case 'EDUAdmin':
      // For EDUAdmin, we'd need to check if user is in admins array of schools
      // This requires a more complex query or JSONB array operations
      sql = `SELECT DISTINCT id FROM schools WHERE settings->'admins' ? $1::text`;
      break;
  }

  const result = await executeQuery<{ school_id: string } | { id: string }>(
    sql,
    params,
    'getSchoolsByRole'
  );

  return result.map(r => 'school_id' in r ? r.school_id : r.id);
}

/**
 * Check if user has role at school
 */
export async function hasRoleAtSchool(userId: string, schoolId: string, role: 'Student' | 'Intern' | 'EDUStaff' | 'EDUAdmin'): Promise<boolean> {
  let sql = '';
  const params: any[] = [userId, schoolId];

  switch (role) {
    case 'Student':
      sql = `SELECT 1 FROM students WHERE user_id = $1 AND school_id = $2 AND status = 'active'`;
      break;
    case 'Intern':
    case 'EDUStaff':
      sql = `SELECT 1 FROM school_staff WHERE user_id = $1 AND school_id = $2 AND status = 'active'`;
      break;
    case 'EDUAdmin':
      sql = `SELECT 1 FROM schools WHERE id = $2 AND settings->'admins' ? $1::text`;
      break;
  }

  const result = await executeQuery(
    sql,
    params,
    'hasRoleAtSchool'
  );

  return result.length > 0;
}

// =====================================================
// ATTENDANCE/CHECK-IN QUERIES
// =====================================================

/**
 * Record check-in for student
 * Uses audit_log table for tracking
 */
export async function recordCheckIn(studentId: string, schoolId: string): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO audit_log (school_id, user_id, action, details, created_at)
     VALUES ($1, $2, 'check_in', '{"type": "check_in"}', NOW())
     RETURNING *`,
    [schoolId, studentId],
    'recordCheckIn'
  );

  return result[0];
}

/**
 * Record check-out for student
 */
export async function recordCheckOut(studentId: string, schoolId: string): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO audit_log (school_id, user_id, action, details, created_at)
     VALUES ($1, $2, 'check_out', '{"type": "check_out"}', NOW())
     RETURNING *`,
    [schoolId, studentId],
    'recordCheckOut'
  );

  return result[0];
}

/**
 * Get today's check-in for student
 */
export async function getTodayCheckIn(studentId: string, schoolId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT * FROM audit_log
     WHERE school_id = $1
     AND user_id = $2
     AND action = 'check_in'
     AND DATE(created_at) = CURRENT_DATE
     ORDER BY created_at DESC
     LIMIT 1`,
    [schoolId, studentId],
    'getTodayCheckIn'
  );

  return result[0] || null;
}

/**
 * Get today's check-out for student
 */
export async function getTodayCheckOut(studentId: string, schoolId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT * FROM audit_log
     WHERE school_id = $1
     AND user_id = $2
     AND action = 'check_out'
     AND DATE(created_at) = CURRENT_DATE
     ORDER BY created_at DESC
     LIMIT 1`,
    [schoolId, studentId],
    'getTodayCheckOut'
  );

  return result[0] || null;
}
