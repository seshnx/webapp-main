import React from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import EduAdminDashboard from './EduAdminDashboard';
import { Lock } from 'lucide-react';
import { useEduAuth } from '../../contexts/EduAuthContext';

export default function EduStaffDashboard({ user: propUser, userData: propUserData, currentView }) {
    // Use EduAuth hook if available, otherwise fall back to props (backward compatibility)
    let eduAuth;
    try {
        eduAuth = useEduAuth();
    } catch (e) {
        // Not wrapped in EduAuthProvider, use props
        eduAuth = null;
    }
    
    const user = eduAuth?.user || propUser;
    const userData = eduAuth?.userData || propUserData;
    
    const { myPermissions, staffProfile } = useSchool();
    
    // Map permissions to the Tabs available in EduAdminDashboard
    const PERM_TO_TAB = {
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

    // Calculate allowed tabs
    const allowedTabs = myPermissions.includes('ALL') 
        ? Object.values(PERM_TO_TAB) 
        : myPermissions.map(p => PERM_TO_TAB[p]).filter(Boolean);

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
