// src/hooks/useDiscover.js

import { useState, useEffect, useMemo } from 'react';
import { 
    collection, query, getDocs, orderBy, limit, where,
    collectionGroup 
} from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { 
    getTrendingContent, 
    getPersonalizedRecommendations, 
    getRecentContent,
    calculateUserSimilarity 
} from '../utils/recommendations';

export function useDiscover(user, userData) {
    const [loading, setLoading] = useState(true);
    const [sounds, setSounds] = useState([]);
    const [artists, setArtists] = useState([]);
    const [producers, setProducers] = useState([]);
    const [studios, setStudios] = useState([]);
    const [schools, setSchools] = useState([]);
    const [following, setFollowing] = useState([]);

    // Load following list for recommendations
    useEffect(() => {
        if (!user?.uid) return;

        const loadFollowing = async () => {
            try {
                const followingRef = collection(db, `artifacts/${appId}/users/${user.uid}/following`);
                const snapshot = await getDocs(followingRef);
                setFollowing(snapshot.docs.map(doc => doc.id));
            } catch (error) {
                console.error('Error loading following:', error);
            }
        };

        loadFollowing();
    }, [user?.uid]);

    // Load all discover data
    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        const loadDiscoverData = async () => {
            setLoading(true);
            try {
                // Load sounds (posts with audio)
                const postsQuery = query(
                    collection(db, `artifacts/${appId}/public/data/posts`),
                    orderBy('timestamp', 'desc'),
                    limit(50)
                );
                const postsSnap = await getDocs(postsQuery);
                const postsList = postsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(post => post.audioUrl || post.media?.some(m => m.type === 'audio'));
                setSounds(postsList);

                // Load artists (users with Talent role)
                const artistsList = await loadUsersByRole(['Talent']);
                setArtists(artistsList);

                // Load producers (users with Producer or Engineer role)
                const producersList = await loadUsersByRole(['Producer', 'Engineer']);
                setProducers(producersList);

                // Load studios (users with Studio role or isStudio flag)
                const studiosList = await loadStudios();
                setStudios(studiosList);

                // Load schools
                const schoolsQuery = query(collection(db, 'schools'), limit(20));
                const schoolsSnap = await getDocs(schoolsQuery);
                const schoolsList = schoolsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSchools(schoolsList);

            } catch (error) {
                console.error('Error loading discover data:', error);
            }
            setLoading(false);
        };

        loadDiscoverData();
    }, [user?.uid]);

    // Helper to load users by role
    const loadUsersByRole = async (roles) => {
        try {
            // Query public profiles collection group
            const profilesQuery = query(
                collectionGroup(db, 'public_profile'),
                limit(100)
            );
            const snapshot = await getDocs(profilesQuery);
            
            return snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    userId: doc.ref.parent.parent.id,
                    ...doc.data()
                }))
                .filter(profile => {
                    const userRoles = profile.accountTypes || [];
                    return roles.some(role => userRoles.includes(role));
                });
        } catch (error) {
            console.error('Error loading users by role:', error);
            return [];
        }
    };

    // Helper to load studios
    const loadStudios = async () => {
        try {
            // Try to load from studios collection first
            const studiosQuery = query(collection(db, 'studios'), limit(50));
            const studiosSnap = await getDocs(studiosQuery);
            const studiosList = studiosSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isStudio: true
            }));

            // Also check user profiles with Studio role
            const studioUsers = await loadUsersByRole(['Studio']);
            
            return [...studiosList, ...studioUsers];
        } catch (error) {
            console.error('Error loading studios:', error);
            return [];
        }
    };

    // Memoized recommendations
    const recommendations = useMemo(() => {
        if (!userData || loading) return {};

        return {
            sounds: {
                trending: getTrendingContent('sounds', '7d', sounds, 10),
                recent: getRecentContent(sounds, 10),
                personalized: getPersonalizedRecommendations(
                    user.uid,
                    'sounds',
                    sounds,
                    userData,
                    [],
                    10
                )
            },
            artists: {
                trending: getTrendingContent('artists', '7d', artists, 10),
                recent: getRecentContent(artists, 10),
                personalized: getPersonalizedRecommendations(
                    user.uid,
                    'artists',
                    artists,
                    userData,
                    [],
                    10
                )
            },
            producers: {
                trending: getTrendingContent('producers', '7d', producers, 10),
                recent: getRecentContent(producers, 10),
                personalized: getPersonalizedRecommendations(
                    user.uid,
                    'producers',
                    producers,
                    userData,
                    [],
                    10
                )
            },
            studios: {
                trending: getTrendingContent('studios', '7d', studios, 10),
                recent: getRecentContent(studios, 10),
                personalized: getPersonalizedRecommendations(
                    user.uid,
                    'studios',
                    studios,
                    userData,
                    [],
                    10
                )
            },
            schools: {
                trending: getTrendingContent('schools', '7d', schools, 10),
                recent: getRecentContent(schools, 10),
                personalized: getPersonalizedRecommendations(
                    user.uid,
                    'schools',
                    schools,
                    userData,
                    [],
                    10
                )
            }
        };
    }, [sounds, artists, producers, studios, schools, userData, user?.uid, loading]);

    return {
        loading,
        sounds,
        artists,
        producers,
        studios,
        schools,
        following,
        recommendations
    };
}

