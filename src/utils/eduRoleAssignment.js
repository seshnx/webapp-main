// src/utils/eduRoleAssignment.js
// Dynamic role assignment based on school enrollment/roster data

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

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
            // Query schools where admins array contains userId
            const schoolsQuery = query(
                collection(db, 'schools'),
                where('admins', 'array-contains', userId)
            );
            const schoolsSnap = await getDocs(schoolsQuery);
            schoolsSnap.docs.forEach(doc => {
                assignedSchools.push(doc.id);
            });
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
        // Check if user is enrolled in the school
        // Option 1: Check enrollments collection
        const enrollmentsQuery = query(
            collection(db, `schools/${schoolId}/enrollments`),
            where('studentId', '==', userId),
            where('status', '==', 'active')
        );
        const enrollmentsSnap = await getDocs(enrollmentsQuery);
        if (!enrollmentsSnap.empty) return true;
        
        // Option 2: Check students collection (fallback)
        const studentDoc = await getDoc(doc(db, `schools/${schoolId}/students/${userId}`));
        if (studentDoc.exists()) {
            const data = studentDoc.data();
            // Check if status is enrolled (not graduated, dropped, etc.)
            return data.status === 'Enrolled' || data.status === 'Active';
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
        // Check if user is listed in school roster with "Active Internship" status
        const studentDoc = await getDoc(doc(db, `schools/${schoolId}/students/${userId}`));
        if (studentDoc.exists()) {
            const data = studentDoc.data();
            return data.status === 'Active Internship';
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
        // Check if user is listed in school staff collection
        const staffQuery = query(
            collection(db, `schools/${schoolId}/staff`),
            where('uid', '==', userId)
        );
        const staffSnap = await getDocs(staffQuery);
        return !staffSnap.empty;
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
        // Check if user is listed in school admins array
        const schoolDoc = await getDoc(doc(db, `schools/${schoolId}`));
        if (schoolDoc.exists()) {
            const data = schoolDoc.data();
            return data.admins?.includes(userId) || false;
        }
        return false;
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
        if (role === 'Student') {
            // Iterate through all schools and check enrollments/students collections
            // Note: This is less efficient but works without collection group indexes
            // Better long-term solution: maintain a user-schools mapping document
            const schoolsSnap = await getDocs(collection(db, 'schools'));
            for (const schoolDoc of schoolsSnap.docs) {
                const schoolId = schoolDoc.id;
                if (await isStudentInSchool(userId, schoolId)) {
                    schoolIds.push(schoolId);
                }
            }
        } else if (role === 'Intern') {
            // Iterate through all schools and check students collection for "Active Internship" status
            const schoolsSnap = await getDocs(collection(db, 'schools'));
            for (const schoolDoc of schoolsSnap.docs) {
                const schoolId = schoolDoc.id;
                if (await isInternInSchool(userId, schoolId)) {
                    schoolIds.push(schoolId);
                }
            }
        } else if (role === 'EDUStaff') {
            // Iterate through all schools and check staff collection
            const schoolsSnap = await getDocs(collection(db, 'schools'));
            for (const schoolDoc of schoolsSnap.docs) {
                const schoolId = schoolDoc.id;
                if (await isStaffInSchool(userId, schoolId)) {
                    schoolIds.push(schoolId);
                }
            }
        } else if (role === 'EDUAdmin') {
            // Query schools where admins array contains userId
            const schoolsQuery = query(
                collection(db, 'schools'),
                where('admins', 'array-contains', userId)
            );
            const schoolsSnap = await getDocs(schoolsQuery);
            schoolsSnap.docs.forEach(doc => {
                schoolIds.push(doc.id);
            });
        }
    } catch (error) {
        console.error('Error getting schools for role:', error);
    }
    
    return schoolIds;
}

