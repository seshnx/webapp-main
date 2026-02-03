// src/contexts/SchoolContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { UserData } from '../types';

/**
 * School data interface
 * TODO: Define based on Neon schools table schema
 */
export interface SchoolData {
  id: string;
  name: string;
  [key: string]: any;
}

/**
 * Student profile interface
 * TODO: Define based on Neon students table schema
 */
export interface StudentProfile {
  id: string;
  user_id: string;
  school_id: string;
  [key: string]: any;
}

/**
 * Staff profile interface
 * TODO: Define based on Neon school_staff table schema
 */
export interface StaffProfile {
  id: string;
  user_id: string;
  school_id: string;
  role: string;
  permissions: string[];
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
  loading: false
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
 * TODO: Migrate all EDU school queries to Neon
 * Currently provides basic context structure without database queries
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

  // TODO: Implement Neon queries for:
  // - schools table (school data)
  // - students table (student profile)
  // - school_staff table (staff profile, permissions)
  // - internships table (internship studio assignments)
  // - attendance/check-in system

  const checkIn = async (): Promise<CheckInOutResult> => {
    // TODO: Implement Neon query for attendance tracking
    console.warn('School check-in not yet implemented with Neon');
    return { success: false };
  };

  const checkOut = async (): Promise<CheckInOutResult> => {
    // TODO: Implement Neon query for attendance tracking
    console.warn('School check-out not yet implemented with Neon');
    return { success: false };
  };

  const value: SchoolContextValue = {
    schoolId,
    schoolData,
    studentProfile,
    staffProfile,
    myPermissions,
    internshipStudio,
    isStudent: !!studentProfile,
    isStaff: !!staffProfile,
    checkIn,
    checkOut,
    loading
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
}
