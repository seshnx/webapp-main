// src/contexts/SchoolContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { UserData } from '@/types';
import * as eduService from '@/services/eduService';

/**
 * School data interface
 */
export interface SchoolData {
  id: string;
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
  is_active?: boolean;
  [key: string]: any;
}

/**
 * Student profile interface
 */
export interface StudentProfile {
  id: string;
  user_id: string;
  school_id: string;
  student_id?: string;
  enrollment_date?: string;
  graduation_date?: string;
  status?: string;
  program?: string;
  cohort?: string;
  gpa?: number;
  credits_earned?: number;
  internship_studio_id?: string;
  username?: string;
  profile_photo_url?: string;
  [key: string]: any;
}

/**
 * Staff profile interface
 */
export interface StaffProfile {
  id: string;
  user_id: string;
  school_id: string;
  role_id?: string;
  title?: string;
  department?: string;
  hire_date?: string;
  status?: string;
  permissions?: any;
  role_name?: string;
  username?: string;
  profile_photo_url?: string;
  [key: string]: any;
}

/**
 * Check-in/check-out result interface
 */
export interface CheckInOutResult {
  success: boolean;
  timestamp?: Date;
  error?: string;
}

/**
 * School context value interface
 */
export interface SchoolContextValue {
  schoolId: string | null;
  schoolData: SchoolData | null;
  studentProfile: StudentProfile | null;
  staffProfile: StaffProfile | null;
  myPermissions: string[];
  internshipStudio: any;
  isStudent: boolean;
  isStaff: boolean;
  checkIn: () => Promise<CheckInOutResult>;
  checkOut: () => Promise<CheckInOutResult>;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * School provider props interface
 */
export interface SchoolProviderProps {
  children: React.ReactNode;
  user: any;
  userData: UserData | null;
}

// Provide default value to prevent errors when context is not available
const defaultContextValue: SchoolContextValue = {
  schoolId: null,
  schoolData: null,
  studentProfile: null,
  staffProfile: null,
  myPermissions: [],
  internshipStudio: null,
  isStudent: false,
  isStaff: false,
  checkIn: async () => ({ success: false }),
  checkOut: async () => ({ success: false }),
  loading: false,
  refresh: async () => {}
};

const SchoolContext = createContext<SchoolContextValue>(defaultContextValue);

/**
 * Hook for accessing school context
 *
 * @returns School context value
 *
 * @example
 * function StudentDashboard() {
 *   const { schoolData, isStudent, checkIn } = useSchool();
 *
 *   return (
 *     <div>
 *       <h1>{schoolData?.name}</h1>
 *       {isStudent && <button onClick={checkIn}>Check In</button>}
 *     </div>
 *   );
 * }
 */
export function useSchool(): SchoolContextValue {
  return useContext(SchoolContext);
}

/**
 * School Context Provider
 *
 * Loads school data, student/staff profiles, and provides EDU functionality
 *
 * @param props - Provider props
 * @returns School context provider
 *
 * @example
 * function App({ user, userData }) {
 *   return (
 *     <SchoolProvider user={user} userData={userData}>
 *       <YourApp />
 *     </SchoolProvider>
 *   );
 * }
 */
export function SchoolProvider({ children, user, userData }: SchoolProviderProps): React.ReactElement {
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [myPermissions, setMyPermissions] = useState<string[]>([]);
  const [internshipStudio, setInternshipStudio] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const schoolId: string | null | undefined = userData?.schoolId || null;
  const userId = user?.id || userData?.id;

  /**
   * Load school and profile data
   */
  const loadSchoolData = async () => {
    if (!schoolId || !userId) {
      setSchoolData(null);
      setStudentProfile(null);
      setStaffProfile(null);
      setMyPermissions([]);
      setInternshipStudio(null);
      return;
    }

    setLoading(true);

    try {
      // Load school data
      const school = await eduService.fetchSchool(schoolId);
      setSchoolData(school);

      // Try to load student profile
      const student = await eduService.fetchStudentByUserAndSchool(userId, schoolId);
      if (student) {
        setStudentProfile(student);
        setInternshipStudio(student.internship_studio_id || null);
      } else {
        setStudentProfile(null);
        setInternshipStudio(null);
      }

      // Try to load staff profile
      const staff = await eduService.fetchStaffByUserAndSchool(userId, schoolId);
      if (staff) {
        setStaffProfile(staff);
        // Extract permissions from staff record
        const permissions = staff.permissions || {};
        const permissionList = Object.keys(permissions).filter(key => permissions[key] === true);
        setMyPermissions(permissionList);
      } else {
        setStaffProfile(null);
        setMyPermissions([]);
      }
    } catch (error) {
      console.error('Failed to load school data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load school data when schoolId or userId changes
  useEffect(() => {
    loadSchoolData();
  }, [schoolId, userId]);

  const checkIn = useCallback(async (): Promise<CheckInOutResult> => {
    if (!userId || !schoolId) {
      return { success: false, error: 'User or school not found' };
    }

    return await eduService.checkInStudent(userId, schoolId);
  }, [userId, schoolId]);

  const checkOut = useCallback(async (): Promise<CheckInOutResult> => {
    if (!userId || !schoolId) {
      return { success: false, error: 'User or school not found' };
    }

    return await eduService.checkOutStudent(userId, schoolId);
  }, [userId, schoolId]);

  const refreshAction = useCallback(() => loadSchoolData(), [schoolId, userId]);

  const value = useMemo((): SchoolContextValue => ({
    schoolId: schoolId || null,
    schoolData,
    studentProfile,
    staffProfile,
    myPermissions,
    internshipStudio,
    isStudent: !!studentProfile,
    isStaff: !!staffProfile,
    checkIn,
    checkOut,
    loading,
    refresh: refreshAction
  }), [
    schoolId,
    schoolData,
    studentProfile,
    staffProfile,
    myPermissions,
    internshipStudio,
    checkIn,
    checkOut,
    loading,
    refreshAction
  ]);

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
}
