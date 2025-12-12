// src/contexts/EduAuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
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
        if (!mainUser) {
            setEduUser(null);
            setEduUserData(null);
            setEduSessionValid(false);
            setLoading(false);
            return;
        }

        // Check if user has EDU access
        if (!mainUserData || !hasEduAccess(mainUserData)) {
            setEduUser(null);
            setEduUserData(null);
            setEduSessionValid(false);
            setLoading(false);
            return;
        }

        // User has EDU access - set up EDU session
        setEduUser(mainUser);
        
        // Listen to user data changes
        const userRef = doc(db, `artifacts/${appId}/users/${mainUser.uid}/profiles/main`);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEduUserData(data);
                // Validate EDU access on each update
                setEduSessionValid(hasEduAccess(data));
            } else {
                setEduUserData(null);
                setEduSessionValid(false);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error listening to EDU user data:', error);
            setEduUserData(null);
            setEduSessionValid(false);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [mainUser, mainUserData]);

    const value = {
        user: eduUser,
        userData: eduUserData,
        isAuthenticated: !!eduUser && eduSessionValid,
        hasEduAccess: eduSessionValid,
        eduRole: eduUserData ? getEduRole(eduUserData) : null,
        canAccessSchool: (schoolId) => eduUserData ? canAccessSchool(eduUserData, schoolId) : false,
        loading
    };

    return (
        <EduAuthContext.Provider value={value}>
            {children}
        </EduAuthContext.Provider>
    );
}

