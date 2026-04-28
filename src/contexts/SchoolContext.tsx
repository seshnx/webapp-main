import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import type { Id } from '@convex/dataModel';
import type { UserData } from '@/types';

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
  const schoolId = userData?.schoolId;
  const userId = user?.id || userData?.id;

  // Use Convex hooks for real-time data
  const schoolDataRaw = useQuery(api.edu.getSchoolById, schoolId ? { schoolId: schoolId as Id<"schools"> } : "skip");
  const studentProfileRaw = useQuery(api.edu.getStudentByUserId, userId ? { userId } : "skip");
  const staffProfileRaw = useQuery(api.edu.getStaffByUserId, userId ? { userId } : "skip");

  // Mutations
  const checkInMutation = useMutation(api.edu.checkInStudent);
  const checkOutMutation = useMutation(api.edu.checkOutStudent);

  // Parse permissions from staff profile
  const myPermissions = useMemo(() => {
    if (!staffProfileRaw?.permissions) return [];
    const perms = staffProfileRaw.permissions as Record<string, boolean>;
    return Object.keys(perms).filter(key => perms[key] === true);
  }, [staffProfileRaw]);

  // Loading state
  const loading = schoolDataRaw === undefined || 
                  (!!schoolId && schoolDataRaw === null);

  const checkIn = useCallback(async (): Promise<CheckInOutResult> => {
    if (!userId || !schoolId) {
      return { success: false, error: 'User or school not found' };
    }
    try {
      await checkInMutation({ userId: userId as Id<"users">, schoolId: schoolId as Id<"schools"> });
      return { success: true, timestamp: new Date() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [userId, schoolId, checkInMutation]);

  const checkOut = useCallback(async (): Promise<CheckInOutResult> => {
    if (!userId || !schoolId) {
      return { success: false, error: 'User or school not found' };
    }
    try {
      await checkOutMutation({ userId: userId as Id<"users">, schoolId: schoolId as Id<"schools"> });
      return { success: true, timestamp: new Date() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [userId, schoolId, checkOutMutation]);

  const value = useMemo((): SchoolContextValue => ({
    schoolId: schoolId || null,
    schoolData: schoolDataRaw || null,
    studentProfile: studentProfileRaw || null,
    staffProfile: staffProfileRaw || null,
    myPermissions,
    internshipStudio: studentProfileRaw?.internship_studio_id || null,
    isStudent: !!studentProfileRaw,
    isStaff: !!staffProfileRaw,
    checkIn,
    checkOut,
    loading,
    refresh: async () => {} // Convex handles refresh automatically
  }), [
    schoolId,
    schoolDataRaw,
    studentProfileRaw,
    staffProfileRaw,
    myPermissions,
    checkIn,
    checkOut,
    loading
  ]);

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
}
