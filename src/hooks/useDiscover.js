// src/hooks/useDiscover.js

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
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
        if (!user?.id && !user?.uid || !supabase) return;
        const userId = user?.id || user?.uid;

        const loadFollowing = async () => {
            try {
                const { data, error } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', userId);
                
                if (error) throw error;
                setFollowing((data || []).map(f => f.following_id));
            } catch (error) {
                console.error('Error loading following:', error);
            }
        };

        loadFollowing();
    }, [user?.id, user?.uid]);

    // Load all discover data
    useEffect(() => {
        if (!user?.id && !user?.uid || !supabase) {
            setLoading(false);
            return;
        }

        const loadDiscoverData = async () => {
            setLoading(true);
            try {
                // Load sounds (posts with audio) - using documents table for now
                const { data: postsData, error: postsError } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('collection_path', `artifacts/${import.meta.env.VITE_APP_ID || 'seshnx-70c04'}/public/data/posts`)
                    .order('created_at', { ascending: false })
                    .limit(50);
                
                if (!postsError && postsData) {
                    const postsList = postsData
                        .map(doc => ({
                            id: doc.id,
                            ...doc.data
                        }))
                        .filter(post => post.audioUrl || post.media?.some(m => m.type === 'audio'));
                    setSounds(postsList);
                }

                // Load artists (users with Talent role)
                const artistsList = await loadUsersByRole(['Talent']);
                setArtists(artistsList);

                // Load producers (users with Producer or Engineer role)
                const producersList = await loadUsersByRole(['Producer', 'Engineer']);
                setProducers(producersList);

                // Load studios (users with Studio role or isStudio flag)
                const studiosList = await loadStudios();
                setStudios(studiosList);

                // Load schools - using documents table for now
                const { data: schoolsData, error: schoolsError } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('collection_path', 'schools')
                    .limit(20);
                
                if (!schoolsError && schoolsData) {
                    const schoolsList = schoolsData.map(doc => ({
                        id: doc.id,
                        ...doc.data
                    }));
                    setSchools(schoolsList);
                }

            } catch (error) {
                console.error('Error loading discover data:', error);
            }
            setLoading(false);
        };

        loadDiscoverData();
    }, [user?.id, user?.uid]);

    // Helper to load users by role
    const loadUsersByRole = async (roles) => {
        if (!supabase) return [];
        try {
            // Query public_profiles table
            const { data, error } = await supabase
                .from('public_profiles')
                .select('*')
                .limit(100);
            
            if (error) throw error;
            
            return (data || [])
                .filter(profile => {
                    const userRoles = profile.account_types || [];
                    return roles.some(role => userRoles.includes(role));
                })
                .map(profile => ({
                    id: profile.id,
                    userId: profile.id,
                    ...profile
                }));
        } catch (error) {
            console.error('Error loading users by role:', error);
            return [];
        }
    };

    // Helper to load studios
    const loadStudios = async () => {
        if (!supabase) return [];
        try {
            // Load from documents table (legacy) and public_profiles
            const { data: studiosData } = await supabase
                .from('documents')
                .select('*')
                .eq('collection_path', 'studios')
                .limit(50);
            
            const studiosList = (studiosData || []).map(doc => ({
                id: doc.id,
                ...doc.data,
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

