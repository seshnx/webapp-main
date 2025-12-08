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
    const [staffProfile, setStaffProfile] = useState(null); // Staff Identity
    const [myPermissions, setMyPermissions] = useState([]); // Resolved Permissions
    const [internshipStudio, setInternshipStudio] = useState(null); // Assigned Studio Data
    const [eduRole, setEduRole] = useState('GUEST'); // ADMIN | INSTRUCTOR | STUDENT | INTERN | UNVERIFIED | GUEST
    const [loading, setLoading] = useState(true);

    const resolveEduRole = (base = {}) => {
        const hasSchool = !!base.schoolId;
        if (!base.user) return 'GUEST';
        if (!hasSchool) return 'UNVERIFIED';
        if (base.accountTypes?.includes('Admin')) return 'ADMIN';
        if (base.accountTypes?.includes('Instructor') || base.staffProfile) return 'INSTRUCTOR';
        if (base.accountTypes?.includes('Intern')) return 'INTERN';
        if (base.accountTypes?.includes('Student') || base.studentProfile) return 'STUDENT';
        return 'UNVERIFIED';
    };

    useEffect(() => {
        if (!user) {
            setSchoolData(null);
            setStudentProfile(null);
            setStaffProfile(null);
            setMyPermissions([]);
            setInternshipStudio(null);
            setEduRole('GUEST');
            setLoading(false);
            return;
        }

        if (!userData?.schoolId) {
            setSchoolData(null);
            setStudentProfile(null);
            setStaffProfile(null);
            setMyPermissions([]);
            setInternshipStudio(null);
            setEduRole('UNVERIFIED');
            setLoading(false);
            return;
        }

        // 1. Fetch Public School Data
        getDoc(doc(db, 'schools', userData.schoolId)).then(snap => {
            if (snap.exists()) setSchoolData(snap.data());
        }).catch(e => console.error("Error fetching school data:", e));

        // 2. Determine Role & Load Context (Student vs Staff)
        const loadContext = async () => {
            try {
                let nextStudentProfile = null;
                let nextStaffProfile = null;
                let nextPermissions = [];

                // A. Check if STUDENT/INTERN
                if (userData.accountTypes?.includes('Student') || userData.accountTypes?.includes('Intern')) {
                    const recordPath = getPaths(user.uid).studentRecord(userData.schoolId, user.uid);
                    onSnapshot(doc(db, recordPath), async (snap) => {
                        if (snap.exists()) {
                            const sData = snap.data();
                            setStudentProfile(sData);
                            nextStudentProfile = sData;

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
                            setEduRole(resolveEduRole({
                                user,
                                schoolId: userData.schoolId,
                                accountTypes: userData.accountTypes,
                                studentProfile: sData,
                                staffProfile: nextStaffProfile
                            }));
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
                        nextStaffProfile = sData;

                        // Fetch Permissions for this Role
                        if (sData.roleId) {
                            const roleSnap = await getDoc(doc(db, `schools/${userData.schoolId}/roles/${sData.roleId}`));
                            if (roleSnap.exists()) {
                                const perms = roleSnap.data().permissions || [];
                                setMyPermissions(perms);
                                nextPermissions = perms;
                            }
                        } else if (userData.accountTypes.includes('Admin')) {
                            setMyPermissions(['ALL']);
                            nextPermissions = ['ALL'];
                        }
                    }
                }

            } catch (e) {
                console.error("Error setting up school context:", e);
            } finally {
                setEduRole(resolveEduRole({
                    user,
                    schoolId: userData.schoolId,
                    accountTypes: userData.accountTypes,
                    studentProfile,
                    staffProfile,
                }));
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
        eduRole,
        isStudent: !!studentProfile,
        isStaff: !!staffProfile || userData?.accountTypes?.includes('Admin'),
        checkIn,
        checkOut,
        loading
    };

    // Recompute role whenever inputs change (covers snapshot updates)
    useEffect(() => {
        setEduRole(resolveEduRole({
            user,
            schoolId: userData?.schoolId,
            accountTypes: userData?.accountTypes,
            studentProfile,
            staffProfile
        }));
    }, [user, userData?.schoolId, JSON.stringify(userData?.accountTypes || []), studentProfile, staffProfile]);

    return (
        <SchoolContext.Provider value={value}>
            {children}
        </SchoolContext.Provider>
    );
}
