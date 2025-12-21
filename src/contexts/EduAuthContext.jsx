// src/contexts/EduAuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { hasEduAccess, getEduRole, canAccessSchool } from '../utils/eduPermissions';

const EduAuthContext = createContext();

export function useEduAuth() {
    const context = useContext(EduAuthContext);
    if (!context) {
        throw new Error('useEduAuth must be used within an EduAuthProvider');
    }
    return context;
}

export function EduAuthProvider({ children, user: mainUser, userData: mainUserData }) {
    const [eduUser, setEduUser] = useState(null);
    const [eduUserData, setEduUserData] = useState(null);
    const [eduSessionValid, setEduSessionValid] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!mainUser || !supabase) {
            setEduUser(null);
            setEduUserData(null);
            setEduSessionValid(false);
            setLoading(false);
            return;
        }

        // Check if user has EDU access (EDUAdmin, EDUStaff, Student, Intern)
        // Note: GAdmin (Global Admin) is NOT an EDU role - they use separate Admin App
        // Role assignment rules:
        // - Student: Only when enrolled in a school (enrollments collection)
        // - Intern: Only when listed as "Active Internship" on school roster
        // - EDUStaff: Only when listed as "Staff" within a school
        // - EDUAdmin: Only granted by GAdmin from Global Admin App
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

        // Subscribe to profile changes via Supabase realtime
        const userId = mainUser.id || mainUser.uid;
        const profileChannel = supabase
            .channel(`edu-profile-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${userId}`
                },
                async (payload) => {
                    try {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', userId)
                            .single();
                        
                        if (profile) {
                            // Normalize data structure
                            const normalizedData = {
                                ...profile,
                                firstName: profile.first_name,
                                lastName: profile.last_name,
                                accountTypes: profile.account_types || ['Fan'],
                                activeProfileRole: profile.active_role || 'Fan',
                                photoURL: profile.avatar_url
                            };
                            setEduUserData(normalizedData);
                            setEduSessionValid(hasEduAccess(normalizedData));
                        } else {
                            setEduUserData(null);
                            setEduSessionValid(false);
                        }
                    } catch (error) {
                        console.error('Error updating EDU user data:', error);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(profileChannel);
        };
    }, [mainUser, mainUserData]);

    const value = {
        user: eduUser,
        userData: eduUserData,
        isAuthenticated: !!eduUser && eduSessionValid,
        hasEduAccess: eduSessionValid,
        eduRole: eduUserData ? getEduRole(eduUserData) : null,
        canAccessSchool: async (schoolId) => {
            if (!eduUserData) return false;
            // canAccessSchool is now async - it checks school assignments dynamically
            return await canAccessSchool(eduUserData, schoolId);
        },
        loading
    };

    return (
        <EduAuthContext.Provider value={value}>
            {children}
        </EduAuthContext.Provider>
    );
}

