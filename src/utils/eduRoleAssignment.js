// src/utils/eduRoleAssignment.js
// Dynamic role assignment based on school enrollment/roster data

import { supabase } from '../config/supabase';

/**
 * Get user's assigned schools based on their role
 * @param {string} userId - User ID
 * @param {Array<string>} accountTypes - User's account types
 * @returns {Promise<Array<string>>} - Array of school IDs user is assigned to
 */
export async function getUserAssignedSchools(userId, accountTypes = []) {
    const assignedSchools = [];
    
    try {
        // Check if user is a Student - enrolled in schools
        if (accountTypes.includes('Student')) {
            const studentSchools = await getSchoolsForRole(userId, 'Student');
            studentSchools.forEach(schoolId => assignedSchools.push(schoolId));
        }
        
        // Check if user is an Intern - listed in school roster with "Active Internship" status
        if (accountTypes.includes('Intern')) {
            const internSchools = await getSchoolsForRole(userId, 'Intern');
            internSchools.forEach(schoolId => assignedSchools.push(schoolId));
        }
        
        // Check if user is EDUStaff - listed in school staff collection
        if (accountTypes.includes('EDUStaff')) {
            const staffSchools = await getSchoolsForRole(userId, 'EDUStaff');
            staffSchools.forEach(schoolId => assignedSchools.push(schoolId));
        }
        
        // Check if user is EDUAdmin - listed in school admins array
        if (accountTypes.includes('EDUAdmin')) {
            if (!supabase) return assignedSchools;
            // Query schools where admins array contains userId
            const { data: schools, error } = await supabase
                .from('schools')
                .select('id')
                .contains('admins', [userId]);
            
            if (!error && schools) {
                schools.forEach(school => {
                    assignedSchools.push(school.id);
                });
            }
        }
        
        // GAdmin can access all schools (handled separately in canAccessSchool)
        
    } catch (error) {
        console.error('Error getting user assigned schools:', error);
    }
    
    return assignedSchools;
}

/**
 * Check if user has Student role for a specific school
 * @param {string} userId - User ID
 * @param {string} schoolId - School ID
 * @returns {Promise<boolean>}
 */
export async function isStudentInSchool(userId, schoolId) {
    try {
        if (!supabase) return false;
        
        // Check if user is enrolled in the school
        // Option 1: Check enrollments table
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('id')
            .eq('school_id', schoolId)
            .eq('student_id', userId)
            .eq('status', 'active')
            .limit(1);
        
        if (enrollments && enrollments.length > 0) return true;
        
        // Option 2: Check students table (fallback)
        const { data: student } = await supabase
            .from('students')
            .select('status')
            .eq('school_id', schoolId)
            .eq('user_id', userId)
            .single();
        
        if (student) {
            // Check if status is enrolled (not graduated, dropped, etc.)
            return student.status === 'Enrolled' || student.status === 'Active';
        }
        
        return false;
    } catch (error) {
        console.error('Error checking student enrollment:', error);
        return false;
    }
}

/**
 * Check if user has Intern role for a specific school
 * @param {string} userId - User ID
 * @param {string} schoolId - School ID
 * @returns {Promise<boolean>}
 */
export async function isInternInSchool(userId, schoolId) {
    try {
        if (!supabase) return false;
        
        // Check if user is listed in school roster with "Active Internship" status
        const { data: student } = await supabase
            .from('students')
            .select('status')
            .eq('school_id', schoolId)
            .eq('user_id', userId)
            .single();
        
        if (student) {
            return student.status === 'Active Internship';
        }
        return false;
    } catch (error) {
        console.error('Error checking intern status:', error);
        return false;
    }
}

/**
 * Check if user has EDUStaff role for a specific school
 * @param {string} userId - User ID
 * @param {string} schoolId - School ID
 * @returns {Promise<boolean>}
 */
export async function isStaffInSchool(userId, schoolId) {
    try {
        if (!supabase) return false;
        
        // Check if user is listed in school staff collection
        const { data: staff, error } = await supabase
            .from('school_staff')
            .select('id')
            .eq('school_id', schoolId)
            .eq('user_id', userId)
            .limit(1);
        
        if (error) {
            console.error('Error checking staff status:', error);
            return false;
        }
        
        return staff && staff.length > 0;
    } catch (error) {
        console.error('Error checking staff status:', error);
        return false;
    }
}

/**
 * Check if user has EDUAdmin role for a specific school
 * @param {string} userId - User ID
 * @param {string} schoolId - School ID
 * @returns {Promise<boolean>}
 */
export async function isAdminInSchool(userId, schoolId) {
    try {
        if (!supabase) return false;
        
        // Check if user is listed in school admins array
        const { data: school, error } = await supabase
            .from('schools')
            .select('admins')
            .eq('id', schoolId)
            .single();
        
        if (error || !school) {
            return false;
        }
        
        return school.admins?.includes(userId) || false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

/**
 * Get all schools where user has a specific role
 * @param {string} userId - User ID
 * @param {string} role - Role to check ('Student', 'Intern', 'EDUStaff', 'EDUAdmin')
 * @returns {Promise<Array<string>>} - Array of school IDs
 */
export async function getSchoolsForRole(userId, role) {
    const schoolIds = [];
    
    try {
        if (!supabase) return schoolIds;
        
        if (role === 'Student') {
            // Query enrollments table for active enrollments
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('school_id')
                .eq('student_id', userId)
                .eq('status', 'active');
            
            if (enrollments) {
                enrollments.forEach(enrollment => {
                    if (!schoolIds.includes(enrollment.school_id)) {
                        schoolIds.push(enrollment.school_id);
                    }
                });
            }
            
            // Also check students table for enrolled/active status
            const { data: students } = await supabase
                .from('students')
                .select('school_id')
                .eq('user_id', userId)
                .in('status', ['Enrolled', 'Active']);
            
            if (students) {
                students.forEach(student => {
                    if (!schoolIds.includes(student.school_id)) {
                        schoolIds.push(student.school_id);
                    }
                });
            }
        } else if (role === 'Intern') {
            // Query students table for "Active Internship" status
            const { data: students } = await supabase
                .from('students')
                .select('school_id')
                .eq('user_id', userId)
                .eq('status', 'Active Internship');
            
            if (students) {
                students.forEach(student => {
                    schoolIds.push(student.school_id);
                });
            }
        } else if (role === 'EDUStaff') {
            // Query school_staff table
            const { data: staff } = await supabase
                .from('school_staff')
                .select('school_id')
                .eq('user_id', userId);
            
            if (staff) {
                staff.forEach(s => {
                    schoolIds.push(s.school_id);
                });
            }
        } else if (role === 'EDUAdmin') {
            // Query schools where admins array contains userId
            const { data: schools, error } = await supabase
                .from('schools')
                .select('id')
                .contains('admins', [userId]);
            
            if (!error && schools) {
                schools.forEach(school => {
                    schoolIds.push(school.id);
                });
            }
        }
    } catch (error) {
        console.error('Error getting schools for role:', error);
    }
    
    return schoolIds;
}

