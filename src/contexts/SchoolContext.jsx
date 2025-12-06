import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, addDoc, collection, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, getPaths } from '../config/firebase';

const SchoolContext = createContext();

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
        if (!user || !userData?.schoolId) {
            setLoading(false);
            return;
        }

        // 1. Fetch Public School Data
        getDoc(doc(db, 'schools', userData.schoolId)).then(snap => {
            if(snap.exists()) setSchoolData(snap.data());
        }).catch(e => console.error("Error fetching school data:", e));

        // 2. Determine Role & Load Context (Student vs Staff)
        const loadContext = async () => {
            try {
                // A. Check if STUDENT/INTERN
                if (userData.accountTypes?.includes('Student') || userData.accountTypes?.includes('Intern')) {
                    const recordPath = getPaths(user.uid).studentRecord(userData.schoolId, user.uid);
                    
                    onSnapshot(doc(db, recordPath), async (snap) => {
                        if(snap.exists()) {
                            const sData = snap.data();
                            setStudentProfile(sData);
                            
                            // Load Assigned Studio if exists
                            if (sData.internshipStudioId) {
                                // First check 'partners' subcollection
                                const partnerSnap = await getDoc(doc(db, `schools/${userData.schoolId}/partners/${sData.internshipStudioId}`));
                                if (partnerSnap.exists()) {
                                    setInternshipStudio(partnerSnap.data());
                                } else {
                                    // Fallback to global studios
                                    const studioSnap = await getDoc(doc(db, 'studios', sData.internshipStudioId)); 
                                    if (studioSnap.exists()) setInternshipStudio(studioSnap.data());
                                }
                            }
                        }
                    });
                }

                // B. Check if STAFF (Instructor/Admin)
                if (userData.accountTypes?.includes('Instructor') || userData.accountTypes?.includes('Admin')) {
                    // Find my staff entry to get Role ID
                    const q = query(collection(db, `schools/${userData.schoolId}/staff`), where('uid', '==', user.uid));
                    const staffSnap = await getDocs(q);
                    
                    if (!staffSnap.empty) {
                        const sData = staffSnap.docs[0].data();
                        setStaffProfile(sData);

                        // Fetch Permissions for this Role
                        if (sData.roleId) {
                            const roleSnap = await getDoc(doc(db, `schools/${userData.schoolId}/roles/${sData.roleId}`));
                            if (roleSnap.exists()) {
                                setMyPermissions(roleSnap.data().permissions || []);
                            }
                        } else if (userData.accountTypes.includes('Admin')) {
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
        if (!studentProfile || !userData.schoolId) return;
        try {
            const logsRef = collection(db, `schools/${userData.schoolId}/internship_logs`);
            const docRef = await addDoc(logsRef, {
                studentId: user.uid,
                studentName: userData.displayName || 'Unknown',
                checkIn: serverTimestamp(),
                checkOut: null,
                location: location || 'Unknown',
                type: type,
                status: 'active',
                description: ''
            });
            const recordPath = getPaths(user.uid).studentRecord(userData.schoolId, user.uid);
            await updateDoc(doc(db, recordPath), { activeSessionId: docRef.id, isClockedIn: true });
        } catch (error) { console.error("Check-in failed:", error); throw error; }
    };

    const checkOut = async (description) => {
        if (!studentProfile?.activeSessionId || !userData.schoolId) return;
        try {
            const logPath = `schools/${userData.schoolId}/internship_logs/${studentProfile.activeSessionId}`;
            await updateDoc(doc(db, logPath), { checkOut: serverTimestamp(), status: 'pending_approval', description: description || 'No description' });
            const recordPath = getPaths(user.uid).studentRecord(userData.schoolId, user.uid);
            await updateDoc(doc(db, recordPath), { activeSessionId: null, isClockedIn: false });
        } catch (error) { console.error("Check-out failed:", error); throw error; }
    };

    const value = {
        schoolId: userData?.schoolId,
        schoolData,
        studentProfile,
        staffProfile,
        myPermissions,
        internshipStudio,
        isStudent: !!studentProfile,
        isStaff: !!staffProfile || userData?.accountTypes?.includes('Admin'),
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
