import React, { useState, useEffect } from 'react';
import {
    X, MapPin, MessageCircle, Shield, User,
    Briefcase, Music, Award, AlertTriangle, CheckCircle,
    DollarSign, Camera, Loader2, CalendarCheck, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StarRating from '@/components/shared/StarRating';
import { useImageUpload } from '@/hooks/useUpload';
import { useFollowSystem, useUserSocialStats } from '@/hooks/useFollowSystem';
import FollowButton from '@/features/social/components/FollowButton';
import FollowersListModal, { FollowStats } from '@/features/social/components/FollowersListModal';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { STORAGE_FOLDERS } from '@/config/storage';
import type { UserData } from '@/types';

interface ProfileData {
    id: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    effective_display_name?: string;
    avatar_url?: string;
    photo_url?: string;
    banner_url?: string;
    hourly_rate?: number;
    rate?: number;
    city?: string;
    state?: string;
    zip?: string;
    bio?: string;
    accountTypes?: string[];
    isVerified?: boolean;
    rating?: number;
    yearsExp?: number;
    completedJobs?: number;
    genres?: string[];
    instruments?: string[];
    equipmentList?: string[];
    subProfilesList?: any[];
    firstName?: string;
    lastName?: string;
    displayName?: string;
    photoURL?: string;
    bannerURL?: string;
}

interface CurrentUser {
    id?: string;
    uid?: string;
    displayName?: string;
}

export interface PublicProfileViewProps {
    userId: string;
    currentUser: CurrentUser | null;
    currentUserData: UserData | null;
}

export default function PublicProfileView({
    userId,
    currentUser,
    currentUserData,
}: PublicProfileViewProps) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [bannerUploading, setBannerUploading] = useState<boolean>(false);
    const [showFollowersModal, setShowFollowersModal] = useState<boolean>(false);
    const [followersModalTab, setFollowersModalTab] = useState<string>('followers');

    const currentUserId = currentUser?.id || currentUser?.uid;
    const isOwner = currentUserId === userId;

    const { uploadImage } = useImageUpload();

    const convexProfile = useQuery(
        api.users.getUserByClerkId,
        userId ? { clerkId: userId } : "skip"
    );
    const updateProfileMutation = useMutation(api.users.updateProfile);

    const { isFollowing, toggleFollow } = useFollowSystem(currentUserId);
    const { stats: socialStats } = useUserSocialStats(userId);

    const handleOpenFollowers = (tab: string = 'followers'): void => {
        setFollowersModalTab(tab);
        setShowFollowersModal(true);
    };

    useEffect(() => {
        if (convexProfile !== undefined) {
            if (!convexProfile) {
                setError("Profile not found or is private.");
                setLoading(false);
                return;
            }

            setProfile({
                ...convexProfile,
                firstName: convexProfile.firstName,
                lastName: convexProfile.lastName,
                displayName: convexProfile.profileName,
                photoURL: convexProfile.imageUrl,
                bannerURL: convexProfile.bannerUrl,
                rate: convexProfile.hourlyRate,
                zip: convexProfile.zipCode
            } as ProfileData);
            setLoading(false);
        }
    }, [convexProfile, userId]);

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isOwner) return;

        setBannerUploading(true);
        try {
            const uploadResult = await uploadImage(file, STORAGE_FOLDERS.PROFILE_PHOTOS);
            if (uploadResult?.url) {
                await updateProfileMutation({
                    clerkId: userId,
                    bannerUrl: uploadResult.url,
                });
                setProfile(prev => prev ? { ...prev, bannerURL: uploadResult.url } : null);
            }
        } catch (err) {
            console.error("Banner upload failed:", err);
        }
        setBannerUploading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-brand-blue" size={48} />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-12 text-gray-500">
                <AlertTriangle size={48} className="text-yellow-500 mb-4 opacity-80"/>
                <h3 className="text-xl font-bold dark:text-gray-200 mb-2">Profile Unavailable</h3>
                <p className="text-sm text-center max-w-xs">{error || "This user's profile information could not be retrieved."}</p>
                <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-full font-bold text-sm hover:bg-gray-300 transition flex items-center gap-2">
                    <ChevronLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
            <div className="max-w-4xl mx-auto bg-white dark:bg-[#1f2128] shadow-2xl overflow-hidden min-h-screen relative">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors backdrop-blur-md"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* COVER BANNER */}
                <div className="h-64 relative bg-gray-800 group">
                    {profile.bannerURL ? (
                        <img src={profile.bannerURL} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-brand-blue to-purple-600">
                            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        </div>
                    )}

                    {isOwner && (
                        <label className="absolute top-4 right-4 cursor-pointer bg-black/40 hover:bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 border border-white/10">
                            {bannerUploading ? <Loader2 size={14} className="animate-spin"/> : <Camera size={14}/>}
                            {bannerUploading ? 'Uploading...' : 'Edit Cover'}
                            <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={bannerUploading} />
                        </label>
                    )}

                    <div className="absolute bottom-4 right-6 flex gap-3 opacity-90">
                        {profile.rate && profile.rate > 0 && (
                            <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-sm">
                                <DollarSign size={12}/> ${profile.rate}/hr
                            </span>
                        )}
                        {profile.city && (
                            <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-sm">
                                <MapPin size={12}/> {profile.city}, {profile.state}
                            </span>
                        )}
                    </div>
                </div>

                {/* PROFILE HEADER INFO */}
                <div className="px-8 pb-8 relative">
                    <div className="flex justify-between items-end -mt-16 mb-8">
                        <div className="relative z-10 group">
                            <div className="h-40 w-40 rounded-full border-[6px] border-white dark:border-[#1f2128] bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-2xl">
                                {profile.photoURL ? (
                                    <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isOwner && (
                            <div className="flex gap-3 mb-2 flex-wrap">
                                <FollowButton
                                    isFollowing={isFollowing(userId)}
                                    onToggle={() => toggleFollow(userId)}
                                    size="lg"
                                />
                                <button
                                    onClick={() => navigate(`/messages/${userId}`)}
                                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2 border dark:border-gray-700"
                                >
                                    <MessageCircle size={20} /> Message
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold dark:text-white flex items-center gap-3 mb-2">
                            {profile.displayName || `${profile.firstName || 'User'} ${profile.lastName || ''}`.trim()}
                            {profile.isVerified && <Shield size={28} className="text-blue-500 fill-blue-500 text-white" />}
                        </h1>
                        
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
                            {Array.from(new Set([
                                ...((profile as any).subProfilesList?.map((sp: any) => sp.role) || []),
                                ...(profile.accountTypes || [])
                            ]))
                            .filter(role => role && role !== 'Creative' && role !== 'Fan' && role !== 'Studio' && role !== 'Label')
                            .map((role: any, i: number) => (
                                <span key={i} className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
                                    {role}
                                </span>
                            ))}
                        </div>

                        <FollowStats
                            followersCount={socialStats.followersCount || 0}
                            followingCount={socialStats.followingCount || 0}
                            onFollowersClick={() => handleOpenFollowers('followers')}
                            onFollowingClick={() => handleOpenFollowers('following')}
                            size="lg"
                        />
                    </div>

                    {/* STATS GRID */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y dark:border-gray-800 mb-8">
                        <div className="text-center md:text-left">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rating</div>
                            <div className="flex items-center justify-center md:justify-start gap-1">
                                <span className="text-2xl font-bold dark:text-white">{profile.rating || 'New'}</span>
                                {profile.rating && profile.rating > 0 && <StarRating rating={profile.rating} size={16} />}
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Experience</div>
                            <div className="text-2xl font-bold dark:text-white">{profile.yearsExp || '1+'} <span className="text-sm font-medium text-gray-500">Yrs</span></div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Response</div>
                            <div className="text-2xl font-bold dark:text-white">~1 <span className="text-sm font-medium text-gray-500">Hr</span></div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bookings</div>
                            <div className="text-2xl font-bold dark:text-white">{profile.completedJobs || 0}</div>
                        </div>
                    </div>

                    {/* BIO SECTION */}
                    <div className="mb-10">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User size={16}/> About
                        </h3>
                        <div className="bg-gray-50 dark:bg-[#252830] p-6 rounded-2xl border dark:border-gray-800">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line">
                                {profile.bio || "No biography provided yet."}
                            </p>
                        </div>
                    </div>

                    {/* EQUIPMENT LIST */}
                    {profile.equipmentList && profile.equipmentList.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Briefcase size={16}/> Professional Gear
                            </h3>
                            <div className="bg-gray-50 dark:bg-[#252830] rounded-2xl p-6 border dark:border-gray-800">
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    {profile.equipmentList.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle size={18} className="text-brand-blue shrink-0 mt-0.5"/>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showFollowersModal && (
                <FollowersListModal
                    userId={userId}
                    userName={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User'}
                    initialTab={followersModalTab}
                    currentUser={currentUser}
                    currentUserData={currentUserData}
                    isFollowing={isFollowing}
                    toggleFollow={toggleFollow}
                    onClose={() => setShowFollowersModal(false)}
                    openPublicProfile={(targetId) => {
                        setShowFollowersModal(false);
                        navigate(`/profile/${targetId}`);
                    }}
                />
            )}
        </div>
    );
}
