import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

// Provide default value to prevent errors when context is not available
const defaultContextValue = {
    schoolId: null,
    schoolData: null,
    studentProfile: null,
    staffProfile: null,
    myPermissions: [],
    internshipStudio: null,
    isStudent: false,
    isStaff: false,
    checkIn: async () => {},
    checkOut: async () => {},
    loading: false
};

const SchoolContext = createContext(defaultContextValue);

export function useSchool() {
    return useContext(SchoolContext);
}

export function SchoolProvider({ children, user, userData }) {
    const [schoolData, setSchoolData] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [staffProfile, setStaffProfile] = useState(null); // NEW: Staff Identity
    const [myPermissions, setMyPermissions] = useState([]); // NEW: Resolved Permissions
    const [internshipStudio, setInternshipStudio] = useState(null); // NEW: Assigned Studio Data
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !userData?.schoolId || !supabase) {
            setLoading(false);
            return;
        }

        const schoolId = userData.schoolId;
        const userId = user.id || user.uid;

        // 1. Fetch Public School Data
        supabase
            .from('schools')
            .select('*')
            .eq('id', schoolId)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error("Error fetching school data:", error);
                } else if (data) {
                    setSchoolData(data);
                }
            });

        // 2. Determine Role & Load Context (Student vs Staff)
        const loadContext = async () => {
            try {
                // A. Check if STUDENT/INTERN
                if (userData.accountTypes?.includes('Student') || userData.accountTypes?.includes('Intern')) {
                    // Subscribe to student record changes
                    const studentChannel = supabase
                        .channel(`student-${userId}-${schoolId}`)
                        .on(
                            'postgres_changes',
                            {
                                event: '*',
                                schema: 'public',
                                table: 'students',
                                filter: `school_id=eq.${schoolId} AND user_id=eq.${userId}`
                            },
                            async (payload) => {
                                if (payload.eventType === 'DELETE') {
                                    setStudentProfile(null);
                                } else {
                                    const sData = payload.new || payload.old;
                                    setStudentProfile(sData);
                                    
                                    // Load Assigned Studio if exists
                                    if (sData?.internship_studio_id) {
                                        // First check 'partners' table
                                        const { data: partnerData } = await supabase
                                            .from('school_partners')
                                            .select('*')
                                            .eq('school_id', schoolId)
                                            .eq('id', sData.internship_studio_id)
                                            .single();
                                        
                                        if (partnerData) {
                                            setInternshipStudio(partnerData);
                                        } else {
                                            // Fallback to global studios
                                            const { data: studioData } = await supabase
                                                .from('studios')
                                                .select('*')
                                                .eq('id', sData.internship_studio_id)
                                                .single();
                                            
                                            if (studioData) setInternshipStudio(studioData);
                                        }
                                    }
                                }
                            }
                        )
                        .subscribe();

                    // Initial fetch
                    const { data: studentData } = await supabase
                        .from('students')
                        .select('*')
                        .eq('school_id', schoolId)
                        .eq('user_id', userId)
                        .single();

                    if (studentData) {
                        setStudentProfile(studentData);
                        if (studentData.internship_studio_id) {
                            const { data: partnerData } = await supabase
                                .from('school_partners')
                                .select('*')
                                .eq('school_id', schoolId)
                                .eq('id', studentData.internship_studio_id)
                                .single();
                            
                            if (partnerData) {
                                setInternshipStudio(partnerData);
                            } else {
                                const { data: studioData } = await supabase
                                    .from('studios')
                                    .select('*')
                                    .eq('id', studentData.internship_studio_id)
                                    .single();
                                
                                if (studioData) setInternshipStudio(studioData);
                            }
                        }
                    }

                    return () => {
                        supabase.removeChannel(studentChannel);
                    };
                }

                // B. Check if STAFF (EDUStaff/EDUAdmin)
                if (userData.accountTypes?.includes('EDUStaff') || userData.accountTypes?.includes('EDUAdmin')) {
                    // Find my staff entry to get Role ID
                    const { data: staffData, error: staffError } = await supabase
                        .from('school_staff')
                        .select('*')
                        .eq('school_id', schoolId)
                        .eq('user_id', userId)
                        .single();
                    
                    if (!staffError && staffData) {
                        setStaffProfile(staffData);

                        // Fetch Permissions for this Role
                        if (staffData.role_id) {
                            const { data: roleData } = await supabase
                                .from('school_roles')
                                .select('*')
                                .eq('school_id', schoolId)
                                .eq('id', staffData.role_id)
                                .single();
                            
                            if (roleData) {
                                setMyPermissions(roleData.permissions || []);
                            }
                        } else if (userData.accountTypes.includes('EDUAdmin')) {
                            setMyPermissions(['ALL']); 
                        }
                    }
                }

            } catch (e) {
                console.error("Error setting up school context:", e);
            } finally {
                setLoading(false);
            }
        };

        loadContext();

    }, [user, userData]);

    // --- Time Tracking Actions ---
    const checkIn = async (location, type = 'remote') => {
        if (!studentProfile || !userData.schoolId || !supabase) return;
        try {
            const userId = user.id || user.uid;
            const { data: logData, error: logError } = await supabase
                .from('internship_logs')
                .insert({
                    school_id: userData.schoolId,
                    student_id: userId,
                    student_name: userData.displayName || userData.firstName || 'Unknown',
                    check_in: new Date().toISOString(),
                    check_out: null,
                    location: location || 'Unknown',
                    type: type,
                    status: 'active',
                    description: ''
                })
                .select()
                .single();

            if (logError) throw logError;

            // Update student record
            await supabase
                .from('students')
                .update({ 
                    active_session_id: logData.id, 
                    is_clocked_in: true 
                })
                .eq('school_id', userData.schoolId)
                .eq('user_id', userId);
        } catch (error) { 
            console.error("Check-in failed:", error); 
            throw error; 
        }
    };

    const checkOut = async (description) => {
        if (!studentProfile?.active_session_id || !userData.schoolId || !supabase) return;
        try {
            const userId = user.id || user.uid;
            
            // Update log
            await supabase
                .from('internship_logs')
                .update({ 
                    check_out: new Date().toISOString(), 
                    status: 'pending_approval', 
                    description: description || 'No description' 
                })
                .eq('id', studentProfile.active_session_id);

            // Update student record
            await supabase
                .from('students')
                .update({ 
                    active_session_id: null, 
                    is_clocked_in: false 
                })
                .eq('school_id', userData.schoolId)
                .eq('user_id', userId);
        } catch (error) { 
            console.error("Check-out failed:", error); 
            throw error; 
        }
    };

    const value = {
        schoolId: userData?.schoolId,
        schoolData,
        studentProfile,
        staffProfile,
        myPermissions,
        internshipStudio,
        isStudent: !!studentProfile,
        isStaff: !!staffProfile || userData?.accountTypes?.includes('EDUAdmin'),
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
