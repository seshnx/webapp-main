import React from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import EduAdminDashboard from './EduAdminDashboard';
import { Lock } from 'lucide-react';
import { useEduAuth } from '../../contexts/EduAuthContext';
import type { UserData } from '../../types';

/**
 * Props for EduStaffDashboard component
 */
export interface EduStaffDashboardProps {
    user?: any;
    userData?: UserData | null;
    currentView?: string;
}

/**
 * Permission to tab mapping
 */
const PERM_TO_TAB: Record<string, string> = {
    'manage_roster': 'roster',
    'manage_enrollment': 'cohorts',
    'approve_hours': 'hours',
    'manage_partners': 'partners',
    'grade_students': 'evaluations',
    'post_announcements': 'news',
    'manage_resources': 'resources',
    'manage_staff': 'instructors',
    'view_audit': 'audit',
    'edit_settings': 'settings'
};

export default function EduStaffDashboard({ user: propUser, userData: propUserData, currentView }: EduStaffDashboardProps) {
    // Use EduAuth hook if available, otherwise fall back to props (backward compatibility)
    let eduAuth: ReturnType<typeof useEduAuth> | null = null;
    try {
        eduAuth = useEduAuth();
    } catch (e) {
        // Not wrapped in EduAuthProvider, use props
        eduAuth = null;
    }

    const user = eduAuth?.eduUser || propUser;
    const userData = eduAuth?.eduUserData || propUserData;

    const { myPermissions, staffProfile } = useSchool();

    // Calculate allowed tabs
    const allowedTabs = myPermissions.includes('ALL')
        ? Object.values(PERM_TO_TAB)
        : myPermissions.map((p: string) => PERM_TO_TAB[p]).filter(Boolean);

    // If no permissions found
    if (allowedTabs.length === 0 && !myPermissions.includes('ALL')) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                <Lock size={48} className="mb-4 text-gray-300"/>
                <h3 className="text-lg font-bold">Access Restricted</h3>
                <p>You are listed as staff but have no assigned permissions.</p>
            </div>
        );
    }

    return (
        <EduAdminDashboard
            user={user}
            userData={userData}
            allowedTabs={allowedTabs}
            staffTitle={staffProfile?.roleName}
            currentView={currentView}
        />
    );
}
