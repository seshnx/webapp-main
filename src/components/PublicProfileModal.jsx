import React, { useState, useEffect } from 'react';
import {
    X, MapPin, MessageCircle, Shield, User,
    Briefcase, Music, Award, AlertTriangle, CheckCircle,
    DollarSign, Camera, Loader2
} from 'lucide-react';
import StarRating from './shared/StarRating';
import { useVercelImageUpload } from '../hooks/useVercelUpload';
import { useFollowSystem, useUserSocialStats } from '../hooks/useFollowSystem';
import FollowButton from './social/FollowButton';
import FollowersListModal, { FollowStats } from './social/FollowersListModal';
import { getProfile, updateProfile } from '../config/neonQueries';

export default function PublicProfileModal({ userId, currentUser, currentUserData, onClose, onMessage }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState('followers');

  // Determine if the viewer is the owner
  const currentUserId = currentUser?.id || currentUser?.uid;
  const isOwner = currentUserId === userId;

  const { uploadImage } = useVercelImageUpload();

  // Follow system hooks
  const { isFollowing, toggleFollow } = useFollowSystem(currentUserId, currentUserData);
  const { stats: socialStats } = useUserSocialStats(userId);

  const handleOpenFollowers = (tab = 'followers') => {
    setFollowersModalTab(tab);
    setShowFollowersModal(true);
  };

  const refreshProfile = async () => {
      try {
        // Fetch profile using Neon
        const profileData = await getProfile(userId);

        if (!profileData) {
            setError("Profile not found or is private.");
            setLoading(false);
            return;
        }

        // Normalize data structure
        setProfile({
            ...profileData,
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            displayName: profileData.display_name || profileData.effective_display_name,
            photoURL: profileData.avatar_url || profileData.photo_url,
            bannerURL: profileData.banner_url,
            hourlyRate: profileData.hourly_rate,
            zip: profileData.zip
        });
      } catch (e) {
        console.error("Failed to load profile:", e);
        setError("Unable to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (userId) refreshProfile();
  }, [userId]);

  const handleBannerUpload = async (e) => {
      const file = e.target.files[0];
      if (!file || !isOwner) return;

      setBannerUploading(true);
      try {
          // Upload to Vercel Blob
          const url = await uploadImage(file, 'profile-banners');
          if (url) {
              // Update Profile using Neon
              await updateProfile(userId, {
                  banner_url: url,
              });

              // Optimistic update
              setProfile(prev => ({ ...prev, bannerURL: url, banner_url: url }));
          }
      } catch (err) {
          console.error("Banner upload failed:", err);
          alert("Failed to upload banner.");
      }
      setBannerUploading(false);
  };

  if (!userId) return null;

  // --- RENDER HELPERS ---

  const LoadingSkeleton = () => (
      <div className="p-8 flex flex-col items-center space-y-6 animate-pulse">
          <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-28 w-28 bg-gray-300 dark:bg-gray-600 rounded-full -mt-20 border-4 border-white dark:border-dark-card"></div>
          <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#1f2128] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* --- CLOSE BUTTON --- */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors backdrop-blur-md"
        >
            <X size={20} />
        </button>

        {/* --- MAIN CONTENT SCROLL AREA --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            
            {loading ? <LoadingSkeleton /> : error || !profile ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-gray-500">
                    <AlertTriangle size={48} className="text-yellow-500 mb-4 opacity-80"/>
                    <h3 className="text-xl font-bold dark:text-gray-200 mb-2">Profile Unavailable</h3>
                    <p className="text-sm text-center max-w-xs">{error || "This user's profile information could not be retrieved."}</p>
                    <button onClick={onClose} className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-full font-bold text-sm hover:bg-gray-300 transition">Close</button>
                </div>
            ) : (
                <>
                    {/* COVER BANNER */}
                    <div className="h-48 relative bg-gray-800 group">
                        {profile.bannerURL ? (
                            <img src={profile.bannerURL} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-brand-blue to-purple-600">
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            </div>
                        )}
                        
                        {/* Edit Banner Trigger */}
                        {isOwner && (
                            <label className="absolute top-4 left-4 cursor-pointer bg-black/40 hover:bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 border border-white/10">
                                {bannerUploading ? <Loader2 size={14} className="animate-spin"/> : <Camera size={14}/>}
                                {bannerUploading ? 'Uploading...' : 'Edit Cover'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={bannerUploading} />
                            </label>
                        )}

                        {/* Badges Overlay */}
                        <div className="absolute bottom-4 right-6 flex gap-3 opacity-90">
                            {profile.rate > 0 && (
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
                        <div className="flex justify-between items-end -mt-14 mb-6">
                            {/* Avatar */}
                            <div className="relative z-10 group">
                                <div className="h-32 w-32 rounded-full border-[5px] border-white dark:border-[#1f2128] bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-xl">
                                    {profile.photoURL ? (
                                        <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* CTA Actions */}
                            {currentUser && !isOwner && (
                                <div className="flex gap-2 mb-2">
                                    <FollowButton
                                        isFollowing={isFollowing(userId)}
                                        onToggle={() => toggleFollow(userId, {
                                            displayName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                                            photoURL: profile.photoURL,
                                            role: profile.accountTypes?.[0] || 'User'
                                        })}
                                        size="md"
                                    />
                                    <button 
                                        onClick={() => onMessage(userId, `${profile.firstName} ${profile.lastName}`)}
                                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2 border dark:border-gray-700"
                                    >
                                        <MessageCircle size={18} /> Message
                                    </button>
                                </div>
                            )}
                            
                            {isOwner && (
                                <div className="mb-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg border border-green-200 dark:border-green-800">
                                    Public View Mode
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <h1 className="text-3xl font-extrabold dark:text-white flex items-center gap-2 mb-2">
                                {profile.firstName || 'User'} {profile.lastName || ''}
                                {profile.isVerified && <Shield size={22} className="text-blue-500 fill-blue-500 text-white" />}
                            </h1>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">
                                {(profile.accountTypes || ['Creative']).map((role, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                                        {role}
                                    </span>
                                ))}
                            </div>
                            
                            {/* Follower/Following Stats */}
                            <FollowStats
                                followersCount={socialStats.followersCount || 0}
                                followingCount={socialStats.followingCount || 0}
                                onFollowersClick={() => handleOpenFollowers('followers')}
                                onFollowingClick={() => handleOpenFollowers('following')}
                                size="md"
                            />
                        </div>

                        {/* STATS GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y dark:border-gray-800 mb-8">
                            <div className="text-center md:text-left">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rating</div>
                                <div className="flex items-center justify-center md:justify-start gap-1">
                                    <span className="text-xl font-bold dark:text-white">{profile.rating || 'New'}</span>
                                    {profile.rating > 0 && <StarRating rating={profile.rating} size={14} />}
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</div>
                                <div className="text-xl font-bold dark:text-white">{profile.yearsExp || '1+'} <span className="text-sm font-medium text-gray-500">Yrs</span></div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Response</div>
                                <div className="text-xl font-bold dark:text-white">~1 <span className="text-sm font-medium text-gray-500">Hr</span></div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bookings</div>
                                <div className="text-xl font-bold dark:text-white">{profile.completedJobs || 0}</div>
                            </div>
                        </div>

                        {/* BIO SECTION */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <User size={14}/> About
                            </h3>
                            <div className="bg-gray-50 dark:bg-[#252830] p-5 rounded-xl border dark:border-gray-800">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                                    {profile.bio || "No biography provided yet."}
                                </p>
                            </div>
                        </div>

                        {/* SKILLS & GENRES */}
                        {(profile.genres?.length > 0 || profile.instruments?.length > 0) && (
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Music size={14}/> Sound Profile
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.genres?.map(g => (
                                        <span key={g} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-800">
                                            {g}
                                        </span>
                                    ))}
                                    {profile.instruments?.map(i => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-brand-blue dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-800">
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* EQUIPMENT LIST */}
                        {profile.equipmentList?.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Briefcase size={14}/> Select Gear
                                </h3>
                                <div className="bg-gray-50 dark:bg-[#252830] rounded-xl p-4 border dark:border-gray-800">
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        {profile.equipmentList.slice(0, 10).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <CheckCircle size={14} className="text-brand-blue shrink-0 mt-0.5"/> 
                                                <span className="truncate">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {profile.equipmentList.length > 10 && (
                                        <div className="mt-3 pt-3 border-t dark:border-gray-700 text-center">
                                            <span className="text-xs text-gray-400 font-medium italic">
                                                +{profile.equipmentList.length - 10} more items available
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Followers/Following Modal */}
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
                  // Re-open with new user - handled by parent
              }}
          />
      )}
    </div>
  );
}
