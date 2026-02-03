// src/contexts/EduAuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserData } from '../types';
import { hasEduAccess, getEduRole, canAccessSchool } from '../utils/eduPermissions';

/**
 * EDU role types
 */
export type EduRole = 'GAdmin' | 'EDUAdmin' | 'EDUStaff' | 'Student' | 'Intern' | null;

/**
 * EDU auth context value interface
 */
export interface EduAuthContextValue {
  eduUser: any;
  eduUserData: UserData | null;
  eduSessionValid: boolean;
  loading: boolean;
  hasEduAccess: (userData?: UserData | null) => boolean;
  getEduRole: (userData?: UserData | null) => EduRole;
  canAccessSchool: (schoolId: string, userData?: UserData | null) => Promise<boolean>;
}

/**
 * EDU auth provider props interface
 */
export interface EduAuthProviderProps {
  children: React.ReactNode;
  user: any;
  userData: UserData | null;
}

const EduAuthContext = createContext<EduAuthContextValue | undefined>(undefined);

/**
 * Hook for accessing EDU auth context
 *
 * @returns EDU auth context value
 * @throws Error if used outside of EduAuthProvider
 *
 * @example
 * function EduDashboard() {
 *   const { eduUserData, eduSessionValid, getEduRole } = useEduAuth();
 *
 *   if (!eduSessionValid) return <div>Access Denied</div>;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {eduUserData?.displayName}</h1>
 *       <p>Role: {getEduRole()}</p>
 *     </div>
 *   );
 * }
 */
export function useEduAuth(): EduAuthContextValue {
  const context = useContext(EduAuthContext);
  if (!context) {
    throw new Error('useEduAuth must be used within an EduAuthProvider');
  }
  return context;
}

/**
 * EDU Authentication Context Provider
 * TODO: Migrate EDU role queries to Neon
 * Currently provides basic EDU auth without database queries
 *
 * @param props - Provider props
 * @returns EDU auth context provider
 *
 * @example
 * function App({ user, userData }) {
 *   return (
 *     <EduAuthProvider user={user} userData={userData}>
 *       <YourApp />
 *     </EduAuthProvider>
 *   );
 * }
 */
export function EduAuthProvider({ children, user: mainUser, userData: mainUserData }: EduAuthProviderProps): React.ReactElement {
  const [eduUser, setEduUser] = useState<any>(null);
  const [eduUserData, setEduUserData] = useState<UserData | null>(null);
  const [eduSessionValid, setEduSessionValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!mainUser) {
      setEduUser(null);
      setEduUserData(null);
      setEduSessionValid(false);
      setLoading(false);
      return;
    }

    // Check if user has EDU access (EDUAdmin, EDUStaff, Student, Intern)
    // Note: GAdmin (Global Admin) is NOT an EDU role - they use separate Admin App
    if (!mainUserData || !hasEduAccess(mainUserData)) {
      setEduUser(null);
      setEduUserData(null);
      setEduSessionValid(false);
      setLoading(false);
      return;
    }

    // User has EDU access - set up EDU session
    setEduUser(mainUser);
    setEduUserData(mainUserData);
    setEduSessionValid(hasEduAccess(mainUserData));
    setLoading(false);

    // TODO: Implement Neon queries for:
    // - students table (Student role verification)
    // - school_staff table (Intern, EDUStaff role verification)
    // - Check enrollment status and school access

    console.warn('EDU auth not yet fully implemented with Neon');
  }, [mainUser, mainUserData]);

  const value: EduAuthContextValue = {
    eduUser,
    eduUserData,
    eduSessionValid,
    loading,
    // Helper functions
    hasEduAccess: (userData: UserData | null = mainUserData): boolean => hasEduAccess(userData),
    getEduRole: (userData: UserData | null = mainUserData): EduRole => getEduRole(userData),
    canAccessSchool: async (schoolId: string, userData: UserData | null = mainUserData): Promise<boolean> =>
      await canAccessSchool(userData, schoolId)
  };

  return (
    <EduAuthContext.Provider value={value}>
      {children}
    </EduAuthContext.Provider>
  );
}
