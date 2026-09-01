import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    MapPin,
    Briefcase,
    Music,
    Save,
    Loader2,
    DollarSign,
    Settings,
    Users,
    ChevronRight,
    Check,
    ToggleLeft,
    ToggleRight,
    Camera,
    Eye,
    ExternalLink,
    Image as ImageIcon,
    Plus,
    Trash2,
    Sparkles,
    Globe,
    Link2,
    CheckCircle2,
    AlertCircle,
    UploadCloud,
    ShieldCheck,
    Layers,
    Radio,
    X
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useImageUpload } from '../hooks/useUpload';
import { STORAGE_FOLDERS } from '../config/storage';
import UserAvatar from './shared/UserAvatar';
import toast from 'react-hot-toast';
import SettingsTab from './SettingsTab';
import { PROFILE_SCHEMAS, GENRE_DATA, INSTRUMENT_DATA, ACCOUNT_TYPES } from '../config/constants';
import { MultiSelect, NestedSelect } from './shared/Inputs';
import EquipmentAutocomplete from './shared/EquipmentAutocomplete';
import SoftwareAutocomplete from './shared/SoftwareAutocomplete';
import { useUpdateProfile, useUpdateSubProfile, useCreateSubProfile } from '@/hooks/useConvex';
import PageLayout from './shared/PageLayout';

// --- Interfaces ---
interface UserData {
    id?: string;
    uid?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    username?: string;
    bio?: string;
    zip?: string;
    zipCode?: string;
    hourlyRate?: number;
    website?: string;
    avatarUrl?: string;
    photoURL?: string;
    bannerUrl?: string;
    bannerURL?: string;
    useLegalNameOnly?: boolean;
    useUserNameOnly?: boolean;
    useDisplayNameOnly?: boolean;
    effectiveDisplayName?: string;
    accountTypes?: string[];
    talentSubRole?: string;
    activeRole?: string;
    activeProfileRole?: string;
    studioName?: string;
    searchTerms?: string[];
    settings?: any;
    portfolioUrls?: Array<{ title: string; url: string; type: string }>;
}

interface UserAuth {
    id?: string;
    uid?: string;
    imageUrl?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
}

interface SubProfile {
    [key: string]: any;
}

interface ProfileFormValues {
    firstName: string;
    lastName: string;
    displayName: string;
    bio: string;
    zip: string;
    hourlyRate: number;
    website: string;
}

interface DynamicSubProfileFormProps {
    user: UserAuth;
    userData: UserData;
    role: string;
    initialData: any;
    schema: any[];
    onSave: () => Promise<void>;
    updateSubProfile: any;
    createSubProfile: any;
}

interface ProfileManagerProps {
    user: UserAuth;
    userData: UserData;
    subProfiles?: SubProfile;
    handleLogout?: () => void;
    openPublicProfile?: (userId: string) => void;
    onSubProfileUpdate?: () => Promise<void>;
    onRoleSwitch?: (role: string) => void;
}

interface TabInfo {
    mainTab: string;
    subTab?: string;
}

// --- Validation Schemas ---
const mainProfileSchema = z.object({
    firstName: z.string().min(2, "First name too short"),
    lastName: z.string().min(2, "Last name too short"),
    displayName: z.string().optional(),
    bio: z.string().max(500, "Bio exceeds 500 characters").optional(),
    zip: z.string().optional(),
    hourlyRate: z.number().min(0, "Rate cannot be negative").optional(),
    website: z.string().optional(),
});

// Helper for platform icon detection
function getPlatformBadge(type: string, url: string) {
    const lowerUrl = (url || '').toLowerCase();
    const lowerType = (type || '').toLowerCase();

    if (lowerType === 'spotify' || lowerUrl.includes('spotify.com')) {
        return { label: 'Spotify', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
    }
    if (lowerType === 'soundcloud' || lowerUrl.includes('soundcloud.com')) {
        return { label: 'SoundCloud', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30' };
    }
    if (lowerType === 'applemusic' || lowerType === 'apple' || lowerUrl.includes('music.apple.com')) {
        return { label: 'Apple Music', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' };
    }
    if (lowerType === 'youtube' || lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return { label: 'YouTube', color: 'bg-red-500/10 text-red-600 border-red-500/30' };
    }
    if (lowerType === 'instagram' || lowerUrl.includes('instagram.com')) {
        return { label: 'Instagram', color: 'bg-pink-500/10 text-pink-600 border-pink-500/30' };
    }
    if (lowerType === 'twitter' || lowerType === 'x' || lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
        return { label: 'X / Twitter', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' };
    }
    if (lowerType === 'tiktok' || lowerUrl.includes('tiktok.com')) {
        return { label: 'TikTok', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' };
    }
    return { label: 'Website', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-300 border-gray-500/30' };
}

export default function ProfileManager({
    user,
    userData,
    subProfiles = {},
    handleLogout,
    openPublicProfile,
    onSubProfileUpdate,
    onRoleSwitch
}: ProfileManagerProps) {
    const location = useLocation();
    const navigate = useNavigate();

    // Convex mutations
    const updateProfile = useUpdateProfile();
    const updateSubProfile = useUpdateSubProfile();
    const createSubProfile = useCreateSubProfile();

    // Get active tab from URL path
    const getTabFromPath = (path: string): TabInfo => {
        const parts = path.split('/').filter(Boolean);
        if (parts[0] === 'profile') {
            if (parts[1] === 'settings' && parts[2]) {
                return { mainTab: 'settings', subTab: parts[2] };
            } else if (parts[1] === 'settings') {
                return { mainTab: 'settings', subTab: 'general' };
            }
            return { mainTab: 'details', subTab: null };
        }
        return { mainTab: 'details', subTab: null };
    };

    const [activeSubTab, setActiveSubTab] = useState<string>(() => getTabFromPath(location.pathname).mainTab);
    const [selectedRole, setSelectedRole] = useState<string>('Main');
    const [saving, setSaving] = useState<boolean>(false);
    const { uploadImage, uploading } = useImageUpload();
    const [bannerUploading, setBannerUploading] = useState<boolean>(false);
    const [isDraggingAvatar, setIsDraggingAvatar] = useState<boolean>(false);
    const [isDraggingBanner, setIsDraggingBanner] = useState<boolean>(false);
    const [showAddRoleModal, setShowAddRoleModal] = useState<boolean>(false);
    const [showLivePreview, setShowLivePreview] = useState<boolean>(false);

    // Social / Portfolio Links State
    const [portfolioUrls, setPortfolioUrls] = useState<Array<{ title: string; url: string; type: string }>>(
        userData?.portfolioUrls || []
    );
    const [newLinkTitle, setNewLinkTitle] = useState<string>('');
    const [newLinkUrl, setNewLinkUrl] = useState<string>('');
    const [newLinkType, setNewLinkType] = useState<string>('website');

    // Sync URL with active tab
    useEffect(() => {
        if (activeSubTab === 'details') {
            if (location.pathname !== '/profile') {
                navigate('/profile');
            }
        } else if (activeSubTab === 'settings') {
            if (!location.pathname.startsWith('/profile/settings')) {
                navigate('/profile/settings/general');
            }
        } else {
            const currentTab = `/profile/${activeSubTab}`;
            if (location.pathname !== currentTab) {
                navigate(currentTab);
            }
        }
    }, [activeSubTab]);

    // Update tab when URL changes
    useEffect(() => {
        const { mainTab } = getTabFromPath(location.pathname);
        if (mainTab !== activeSubTab) {
            setActiveSubTab(mainTab);
        }
    }, [location.pathname]);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(mainProfileSchema),
        defaultValues: {
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
            displayName: userData?.displayName || '',
            bio: userData?.bio || '',
            zip: userData?.zipCode || userData?.zip || '',
            hourlyRate: userData?.hourlyRate || 0,
            website: userData?.website || '',
        }
    });

    // Reset form when userData changes
    useEffect(() => {
        if (userData) {
            reset({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                displayName: userData.displayName || '',
                bio: userData.bio || '',
                zip: userData.zipCode || userData.zip || '',
                hourlyRate: userData.hourlyRate || 0,
                website: userData.website || '',
            });
            if (userData.portfolioUrls) {
                setPortfolioUrls(userData.portfolioUrls);
            }
        }
    }, [userData, reset]);

    // Calculate Profile Completeness Score
    const calculateCompleteness = () => {
        const checks = [
            { label: 'Profile Photo', done: Boolean(userData?.avatarUrl || userData?.photoURL || (user as any)?.imageUrl), weight: 20 },
            { label: 'Display Name', done: Boolean(userData?.displayName), weight: 15 },
            { label: 'Bio / About', done: Boolean(userData?.bio && userData.bio.length >= 20), weight: 20 },
            { label: 'Cover Banner', done: Boolean(userData?.bannerUrl || userData?.bannerURL), weight: 15 },
            { label: 'Location / ZIP Code', done: Boolean(userData?.zipCode || userData?.zip), weight: 15 },
            { label: 'Website & Portfolio Links', done: Boolean(userData?.website || portfolioUrls.length > 0 || (userData?.hourlyRate && userData.hourlyRate > 0)), weight: 15 },
        ];
        const score = checks.reduce((acc, c) => acc + (c.done ? c.weight : 0), 0);
        return { score, checks };
    };

    const { score, checks } = calculateCompleteness();

    // --- Photo Upload Handler ---
    const handlePhotoFile = async (file: File) => {
        const userId = user?.id || user?.uid;
        const toastId = toast.loading('Uploading profile photo...');
        try {
            const res = await uploadImage(file, STORAGE_FOLDERS.PROFILE_PHOTOS);
            const url = res?.url;
            if (!url) throw new Error('Failed to get upload URL');

            await updateProfile({
                clerkId: userId,
                avatarUrl: url,
            });

            toast.success('Photo updated!', { id: toastId });
        } catch (err) {
            console.error(err);
            const errorMessage = (err as Error)?.message || 'Photo upload failed';
            toast.error(errorMessage, { id: toastId });
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handlePhotoFile(file);
    };

    // --- Banner Upload Handler ---
    const handleBannerFile = async (file: File) => {
        const userId = user?.id || user?.uid;
        setBannerUploading(true);
        const toastId = toast.loading('Uploading cover banner...');
        try {
            const res = await uploadImage(file, 'profile-banners');
            const url = res?.url;
            if (!url) throw new Error('Failed to get upload URL');

            await updateProfile({
                clerkId: userId,
                bannerUrl: url,
            });

            toast.success('Cover banner updated!', { id: toastId });
        } catch (err) {
            console.error(err);
            const errorMessage = (err as Error)?.message || 'Banner upload failed';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setBannerUploading(false);
        }
    };

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleBannerFile(file);
    };

    const handleRemoveBanner = async () => {
        const userId = user?.id || user?.uid;
        const toastId = toast.loading('Removing cover banner...');
        try {
            await updateProfile({
                clerkId: userId,
                bannerUrl: '',
            });
            toast.success('Cover banner removed', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove banner', { id: toastId });
        }
    };

    // --- Global Clipboard Paste Support ---
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    toast.success('Pasted image detected! Updating profile photo...');
                    handlePhotoFile(file);
                    break;
                }
            }
        }
    }, [user]);

    // --- Portfolio Link Handlers ---
    const handleAddLink = () => {
        if (!newLinkUrl.trim()) {
            toast.error('Please enter a valid link URL');
            return;
        }

        let detectedType = newLinkType;
        const lower = newLinkUrl.toLowerCase();
        if (lower.includes('spotify.com')) detectedType = 'spotify';
        else if (lower.includes('soundcloud.com')) detectedType = 'soundcloud';
        else if (lower.includes('music.apple.com')) detectedType = 'applemusic';
        else if (lower.includes('youtube.com') || lower.includes('youtu.be')) detectedType = 'youtube';
        else if (lower.includes('instagram.com')) detectedType = 'instagram';
        else if (lower.includes('twitter.com') || lower.includes('x.com')) detectedType = 'twitter';
        else if (lower.includes('tiktok.com')) detectedType = 'tiktok';

        const linkTitle = newLinkTitle.trim() || getPlatformBadge(detectedType, newLinkUrl).label;
        const updated = [...portfolioUrls, { title: linkTitle, url: newLinkUrl.trim(), type: detectedType }];
        setPortfolioUrls(updated);
        setNewLinkTitle('');
        setNewLinkUrl('');
        setNewLinkType('website');
        toast.success('Link added (click Save Changes to persist)');
    };

    const handleRemoveLink = (index: number) => {
        setPortfolioUrls(prev => prev.filter((_, i) => i !== index));
    };

    // --- Add New Role Handler ---
    const handleAddNewRole = async (roleName: string) => {
        const currentRoles = userData?.accountTypes || [];
        if (currentRoles.includes(roleName)) {
            setSelectedRole(roleName);
            setShowAddRoleModal(false);
            return;
        }

        const userId = user?.id || user?.uid;
        const toastId = toast.loading(`Adding ${roleName} persona...`);
        try {
            const updatedRoles = [...currentRoles, roleName];
            await updateProfile({
                clerkId: userId,
                accountTypes: updatedRoles,
            });

            setSelectedRole(roleName);
            setShowAddRoleModal(false);
            toast.success(`${roleName} role enabled!`, { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Failed to add role', { id: toastId });
        }
    };

    const onMainSubmit = async (data: ProfileFormValues): Promise<void> => {
        setSaving(true);
        const toastId = toast.loading('Saving main profile...');
        try {
            const userId = user?.id || user?.uid;

            await updateProfile({
                clerkId: userId,
                firstName: data.firstName,
                lastName: data.lastName,
                displayName: data.displayName || '',
                bio: data.bio || '',
                zipCode: data.zip || '',
                hourlyRate: data.hourlyRate || 0,
                website: data.website || '',
                avatarUrl: userData?.avatarUrl || userData?.photoURL || (user as any)?.imageUrl,
                bannerUrl: userData?.bannerUrl || userData?.bannerURL,
                portfolioUrls: portfolioUrls,
            });

            reset({
                firstName: data.firstName,
                lastName: data.lastName,
                displayName: data.displayName || '',
                bio: data.bio || '',
                zip: data.zip || '',
                hourlyRate: data.hourlyRate || 0,
                website: data.website || '',
            });

            toast.success('Profile Updated!', { id: toastId });
        } catch (error) {
            console.error("Update failed", error);
            const errorMessage = (error as Error)?.message || "Failed to update profile.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (error?: any): string => twMerge(
        "w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white transition-all focus:ring-2 focus:ring-brand-blue outline-none",
        error ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700"
    );

    return (
        <PageLayout
            title={activeSubTab === 'details' ? 'Edit Profile' : 'Account Settings'}
            subtitle="Manage your public profile, identity personas, and creator portfolio"
            headerActions={
                <div className="flex items-center gap-2">
                    {/* Live Preview Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowLivePreview(!showLivePreview)}
                        className={clsx(
                            "px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm border",
                            showLivePreview
                                ? "bg-brand-blue text-white border-brand-blue shadow-md"
                                : "bg-white dark:bg-[#2c2e36] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-brand-blue"
                        )}
                    >
                        <Eye size={15} /> {showLivePreview ? 'Hide Preview' : 'Live Card Preview'}
                    </button>

                    {/* View Public Profile Modal Action */}
                    <button
                        type="button"
                        onClick={() => {
                            const targetId = user?.id || user?.uid || (userData as any)?._id || (userData as any)?.clerkId;
                            if (openPublicProfile && targetId) {
                                openPublicProfile(targetId);
                            } else {
                                setShowLivePreview(true);
                            }
                        }}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:opacity-90 transition shadow-md"
                    >
                        <ExternalLink size={14} /> View Public Profile
                    </button>

                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex gap-1">
                        <button
                            onClick={() => setActiveSubTab('details')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeSubTab === 'details' ? 'bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={() => setActiveSubTab('settings')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${activeSubTab === 'settings' ? 'bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                        >
                            <Settings size={14} /> Settings
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6" onPaste={handlePaste}>

                {/* Profile Strength & Completeness Card */}
                {activeSubTab === 'details' && (
                    <div className="bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 dark:from-blue-950/30 dark:via-sky-950/30 dark:to-indigo-950/30 p-5 rounded-2xl border border-blue-200/60 dark:border-blue-800/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} className="text-brand-blue" />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    Profile Strength: <span className={clsx("font-extrabold", score >= 80 ? "text-emerald-500" : score >= 50 ? "text-brand-blue" : "text-amber-500")}>{score}%</span>
                                </h3>
                                <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full", score >= 80 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : score >= 50 ? "bg-blue-500/20 text-brand-blue" : "bg-amber-500/20 text-amber-600")}>
                                    {score >= 80 ? 'All-Star Creator' : score >= 50 ? 'Good Progress' : 'Needs Polish'}
                                </span>
                            </div>
                            {/* Checklist tags */}
                            <div className="flex flex-wrap gap-2 pt-1">
                                {checks.map((c, i) => (
                                    <span key={i} className={clsx("text-[11px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium transition", c.done ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" : "bg-gray-200/60 dark:bg-gray-800 text-gray-500 dark:text-gray-400")}>
                                        {c.done ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertCircle size={12} />}
                                        {c.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="w-full md:w-48 shrink-0">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className={clsx("h-full transition-all duration-500 rounded-full", score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-brand-blue" : "bg-amber-500")}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                {activeSubTab === 'details' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-2">
                        {/* Left Sidebar: Enriched Persona Switcher */}
                        <div className="lg:col-span-1 space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <span className="font-bold text-xs text-gray-500 uppercase tracking-wider">Your Profiles</span>
                                <button
                                    type="button"
                                    onClick={() => setShowAddRoleModal(true)}
                                    className="text-xs text-brand-blue font-bold flex items-center gap-1 hover:underline"
                                >
                                    <Plus size={14} /> Add Role
                                </button>
                            </div>

                            {/* Main Profile Tab */}
                            <button
                                onClick={() => setSelectedRole('Main')}
                                className={clsx(
                                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all border text-left",
                                    selectedRole === 'Main'
                                        ? "bg-brand-blue text-white border-brand-blue shadow-md"
                                        : "bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700 hover:border-brand-blue text-gray-700 dark:text-gray-200 shadow-sm"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        user={user}
                                        userData={userData}
                                        size="sm"
                                        className={clsx("border", selectedRole === 'Main' ? "border-white/50" : "border-gray-200 dark:border-gray-700")}
                                    />
                                    <div>
                                        <div className="font-bold text-sm leading-tight">Main Profile</div>
                                        <div className={clsx("text-[11px]", selectedRole === 'Main' ? "text-blue-100" : "text-gray-400")}>Primary Account</div>
                                    </div>
                                </div>
                                {selectedRole === 'Main' && <ChevronRight size={16} />}
                            </button>

                            {/* Role Sub-Profiles */}
                            {(userData?.accountTypes || []).map((role: string) => {
                                const subData = subProfiles?.[role] || {};
                                const isSelected = selectedRole === role;
                                const isCurrentActiveRole = userData?.activeRole === role;

                                return (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={clsx(
                                            "w-full flex items-center justify-between p-3 rounded-2xl transition-all border text-left",
                                            isSelected
                                                ? "bg-brand-blue text-white border-brand-blue shadow-md"
                                                : "bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700 hover:border-brand-blue text-gray-700 dark:text-gray-200 shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <UserAvatar
                                                user={user}
                                                userData={userData}
                                                subProfile={subData}
                                                size="sm"
                                                className={clsx("border", isSelected ? "border-white/50" : "border-gray-200 dark:border-gray-700")}
                                            />
                                            <div>
                                                <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                                                    {role}
                                                    {isCurrentActiveRole && (
                                                        <span className={clsx("text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase", isSelected ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400")}>
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={clsx("text-[11px] truncate max-w-[120px]", isSelected ? "text-blue-100" : "text-gray-400")}>
                                                    {subData.displayName || (subData.photoUrl ? 'Customized' : 'Inherits Global')}
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && <ChevronRight size={16} />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right Column: Profile Editor & Live Preview */}
                        <div className="lg:col-span-3 space-y-6">

                            {/* Optional Live Preview Card Floating Banner */}
                            {showLivePreview && (
                                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border-2 border-brand-blue/30 shadow-lg space-y-4 animate-in fade-in zoom-in-95">
                                    <div className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
                                        <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
                                            <Eye size={16} className="text-brand-blue" />
                                            <span>Live Creator Card Preview</span>
                                        </div>
                                        <button onClick={() => setShowLivePreview(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Preview Card Body */}
                                    <div className="relative rounded-2xl overflow-hidden border dark:border-gray-700 bg-gray-50 dark:bg-[#1f2128]">
                                        {/* Cover */}
                                        <div className="w-full h-28 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                                            {(userData?.bannerUrl || userData?.bannerURL) && (
                                                <img src={userData?.bannerUrl || userData?.bannerURL} alt="Banner" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        {/* Avatar & Info */}
                                        <div className="p-4 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-10">
                                            <div className="flex items-end gap-3">
                                                <UserAvatar
                                                    user={user}
                                                    userData={userData}
                                                    size="xl"
                                                    className="ring-4 ring-white dark:ring-[#1f2128] shadow-md"
                                                />
                                                <div className="mb-1">
                                                    <h4 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
                                                        {userData?.displayName || [userData?.firstName, userData?.lastName].filter(Boolean).join(' ') || (user as any)?.fullName || 'Creator'}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        {userData?.username && `@${userData.username} • `}
                                                        <MapPin size={11} /> {userData?.zipCode || userData?.zip || 'Global'}
                                                    </p>
                                                </div>
                                            </div>
                                            {userData?.hourlyRate ? (
                                                <div className="bg-brand-blue/10 text-brand-blue font-extrabold text-sm px-3 py-1.5 rounded-xl border border-brand-blue/30 self-end sm:self-auto">
                                                    ${userData.hourlyRate}/hr
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Bio Snippet */}
                                        {userData?.bio && (
                                            <p className="px-4 pb-3 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                                                {userData.bio}
                                            </p>
                                        )}

                                        {/* Links Preview */}
                                        {portfolioUrls.length > 0 && (
                                            <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                                                {portfolioUrls.map((link, idx) => {
                                                    const badge = getPlatformBadge(link.type, link.url);
                                                    return (
                                                        <span key={idx} className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border", badge.color)}>
                                                            {badge.label}: {link.title}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedRole === 'Main' ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Left Column: Drag & Drop Avatar & Banner Upload */}
                                    <div className="md:col-span-1 space-y-6">
                                        {/* Avatar Upload Box with Drag & Drop */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-bold text-gray-500 uppercase">Profile Photo</div>
                                                <span className="text-[10px] text-gray-400 font-medium">Drag & Drop / Paste</span>
                                            </div>

                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsDraggingAvatar(true); }}
                                                onDragLeave={() => setIsDraggingAvatar(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDraggingAvatar(false);
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file) handlePhotoFile(file);
                                                }}
                                                className={clsx(
                                                    "relative group w-full aspect-square rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 transition-all shadow-md flex items-center justify-center",
                                                    isDraggingAvatar ? "border-brand-blue ring-4 ring-brand-blue/30 scale-102" : "border-dashed border-gray-300 dark:border-gray-700"
                                                )}
                                            >
                                                <UserAvatar
                                                    user={user}
                                                    userData={userData}
                                                    name={userData?.displayName || user?.fullName}
                                                    size="2xl"
                                                    className="w-full h-full text-4xl rounded-full"
                                                />
                                                <label className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity z-10 rounded-full text-white">
                                                    <Camera size={22} className="mb-1" />
                                                    <span className="font-bold text-xs">Change Photo</span>
                                                    <span className="text-[10px] opacity-80">or drop here</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                                                </label>
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 rounded-full">
                                                        <Loader2 className="animate-spin text-white" size={24} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cover Banner Upload Box with Drag & Drop */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-bold text-gray-500 uppercase">Cover Banner</div>
                                                {(userData?.bannerUrl || userData?.bannerURL) && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveBanner}
                                                        className="text-[11px] text-red-500 hover:underline font-bold"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsDraggingBanner(true); }}
                                                onDragLeave={() => setIsDraggingBanner(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDraggingBanner(false);
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file) handleBannerFile(file);
                                                }}
                                                className={clsx(
                                                    "relative group w-full aspect-[3/1] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 transition-all shadow-sm flex items-center justify-center",
                                                    isDraggingBanner ? "border-brand-blue ring-4 ring-brand-blue/30 scale-102" : "border-dashed border-gray-300 dark:border-gray-700"
                                                )}
                                            >
                                                {(userData?.bannerUrl || userData?.bannerURL) ? (
                                                    <img src={userData?.bannerUrl || userData?.bannerURL} alt="Banner" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1 p-2 text-center">
                                                        <ImageIcon size={22} />
                                                        <span className="text-[11px] font-medium">Upload banner (1200×400)</span>
                                                    </div>
                                                )}
                                                <label className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white">
                                                    <Camera size={18} className="mb-0.5" />
                                                    <span className="font-bold text-xs">Change Banner</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={bannerUploading} />
                                                </label>
                                                {bannerUploading && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <Loader2 className="animate-spin text-white" size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-xs text-blue-800 dark:text-blue-200 space-y-1 border border-blue-200 dark:border-blue-800">
                                            <p className="font-bold flex items-center gap-1">
                                                <Sparkles size={14} className="text-brand-blue" /> Pro Tip:
                                            </p>
                                            <p>Clear profile photos, cover banners, and portfolio links help clients discover your services.</p>
                                        </div>
                                    </div>

                                    {/* Main Profile Form */}
                                    <div className="md:col-span-2">
                                        <form onSubmit={handleSubmit(onMainSubmit)} className="space-y-6 bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">First Name (Legal)</label>
                                                    <input {...register("firstName")} className={inputClass(errors.firstName)} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Last Name (Legal)</label>
                                                    <input {...register("lastName")} className={inputClass(errors.lastName)} />
                                                </div>
                                            </div>

                                            {/* Username (from Clerk, unchangeable directly) */}
                                            {userData?.username && (
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Username</label>
                                                    <input
                                                        value={`@${userData.username}`}
                                                        disabled
                                                        className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed font-mono text-sm font-semibold"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Display Name (Global)</label>
                                                <input {...register("displayName")} className={inputClass(errors.displayName)} placeholder="e.g. SeshMaster" />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Bio / About</label>
                                                <textarea {...register("bio")} rows={4} className={inputClass(errors.bio)} placeholder="Tell collaborators and studios about your musical journey, experience, and gear..." />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1">
                                                        <MapPin size={12} /> ZIP Code / Location
                                                    </label>
                                                    <input {...register("zip")} className={inputClass(errors.zip)} placeholder="e.g. 90210" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1">
                                                        <DollarSign size={12} /> Hourly Booking Rate ($)
                                                    </label>
                                                    <input type="number" {...register("hourlyRate", { valueAsNumber: true })} className={inputClass(errors.hourlyRate)} />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Primary Website</label>
                                                <input {...register("website")} className={inputClass(errors.website)} placeholder="https://yourwebsite.com" />
                                            </div>

                                            {/* Structured Portfolio & Social Links Manager */}
                                            <div className="bg-gray-50 dark:bg-[#1f2128] p-4 rounded-xl border dark:border-gray-700 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                                        <Link2 size={14} className="text-brand-blue" />
                                                        Portfolio & Streaming Links
                                                    </label>
                                                    <span className="text-[10px] text-gray-400">Spotify, SoundCloud, Apple, YouTube</span>
                                                </div>

                                                {/* Existing Links List */}
                                                {portfolioUrls.length > 0 && (
                                                    <div className="space-y-2">
                                                        {portfolioUrls.map((link, idx) => {
                                                            const badge = getPlatformBadge(link.type, link.url);
                                                            return (
                                                                <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#2c2e36] p-2.5 rounded-xl border dark:border-gray-700 shadow-sm text-xs">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <span className={clsx("font-bold px-2 py-0.5 rounded-md border text-[10px]", badge.color)}>
                                                                            {badge.label}
                                                                        </span>
                                                                        <span className="font-bold text-gray-800 dark:text-gray-200">{link.title}:</span>
                                                                        <span className="text-gray-500 truncate max-w-[200px]">{link.url}</span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveLink(idx)}
                                                                        className="text-gray-400 hover:text-red-500 transition p-1"
                                                                        title="Remove Link"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Add Link Row */}
                                                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                                    <select
                                                        value={newLinkType}
                                                        onChange={(e) => setNewLinkType(e.target.value)}
                                                        className="p-2 border rounded-xl dark:bg-[#2c2e36] dark:text-white dark:border-gray-600 text-xs font-semibold"
                                                    >
                                                        <option value="spotify">Spotify</option>
                                                        <option value="soundcloud">SoundCloud</option>
                                                        <option value="applemusic">Apple Music</option>
                                                        <option value="youtube">YouTube</option>
                                                        <option value="instagram">Instagram</option>
                                                        <option value="twitter">X / Twitter</option>
                                                        <option value="tiktok">TikTok</option>
                                                        <option value="website">Custom Website</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={newLinkTitle}
                                                        onChange={(e) => setNewLinkTitle(e.target.value)}
                                                        placeholder="Label (optional)"
                                                        className="p-2 border rounded-xl dark:bg-[#2c2e36] dark:text-white dark:border-gray-600 text-xs sm:w-28"
                                                    />
                                                    <input
                                                        type="url"
                                                        value={newLinkUrl}
                                                        onChange={(e) => setNewLinkUrl(e.target.value)}
                                                        placeholder="https://..."
                                                        className="p-2 border rounded-xl dark:bg-[#2c2e36] dark:text-white dark:border-gray-600 text-xs flex-1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddLink}
                                                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs hover:opacity-90 transition flex items-center justify-center gap-1 shrink-0 shadow-sm"
                                                    >
                                                        <Plus size={14} /> Add
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className={clsx(
                                                        "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg",
                                                        saving ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-brand-blue text-white hover:bg-blue-600 hover:scale-105"
                                                    )}
                                                >
                                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <DynamicSubProfileForm
                                    user={user}
                                    userData={userData}
                                    role={selectedRole}
                                    initialData={subProfiles[selectedRole] || {}}
                                    schema={PROFILE_SCHEMAS[selectedRole] || []}
                                    onSave={onSubProfileUpdate || (() => Promise.resolve())}
                                    updateSubProfile={updateSubProfile}
                                    createSubProfile={createSubProfile}
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <SettingsTab
                        user={user}
                        userData={userData}
                        onUpdate={(newSettings) => updateProfile({ clerkId: user?.id || user?.uid, settings: newSettings })}
                    />
                )}

                {/* Add Role Persona Modal */}
                {showAddRoleModal && (
                    <div
                        onClick={() => setShowAddRoleModal(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#2c2e36] rounded-2xl max-w-md w-full p-6 shadow-2xl border dark:border-gray-700 space-y-4 animate-in zoom-in-95 cursor-default"
                        >
                            <div className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
                                <div>
                                    <h3 className="font-extrabold text-lg dark:text-white flex items-center gap-2">
                                        <Layers size={18} className="text-brand-blue" />
                                        Add Role Persona
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Unlock role-specific rate cards, specialized booking features, and search ranking.
                                    </p>
                                </div>
                                <button onClick={() => setShowAddRoleModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
                                {ACCOUNT_TYPES.filter(r => r !== 'Main' && r !== 'GAdmin').map((roleName) => {
                                    const isAlreadyAdded = (userData?.accountTypes || []).includes(roleName);
                                    return (
                                        <button
                                            key={roleName}
                                            type="button"
                                            onClick={() => handleAddNewRole(roleName)}
                                            className={clsx(
                                                "p-3 rounded-xl border text-left flex flex-col justify-between transition",
                                                isAlreadyAdded
                                                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                                                    : "bg-gray-50 dark:bg-[#1f2128] border-gray-200 dark:border-gray-700 hover:border-brand-blue dark:hover:border-brand-blue text-gray-800 dark:text-gray-200"
                                            )}
                                        >
                                            <span className="font-bold text-sm">{roleName}</span>
                                            <span className="text-[10px] opacity-75">
                                                {isAlreadyAdded ? '✓ Added (Click to Edit)' : '+ Enable Role'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAddRoleModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

// --- Dynamic Sub-Profile Component ---
function DynamicSubProfileForm({ user, userData, role, initialData, schema, onSave, updateSubProfile, createSubProfile }: DynamicSubProfileFormProps) {
    const [formData, setFormData] = useState<any>(initialData);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { uploadImage: uploadSubAvatar, uploading: subAvatarUploading } = useImageUpload();
    const [isDraggingCustomAvatar, setIsDraggingCustomAvatar] = useState<boolean>(false);

    // Display name preference states: "global" | "legal" | "username" | "custom"
    const [displayNamePreference, setDisplayNamePreference] = useState<string>(
        initialData.displayNamePreference || "global"
    );
    const [customDisplayName, setCustomDisplayName] = useState<string>(
        initialData.customDisplayName || ""
    );

    // Avatar preference states: "global" | "custom"
    const [avatarPreference, setAvatarPreference] = useState<string>(
        initialData.avatarPreference || (initialData.photoUrl || initialData.photo_url || initialData.logoUrl ? "custom" : "global")
    );
    const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(
        initialData.photoUrl || initialData.photo_url || initialData.logoUrl || ""
    );

    useEffect(() => {
        setFormData(initialData || {});
        setDisplayNamePreference(initialData.displayNamePreference || "global");
        setCustomDisplayName(initialData.customDisplayName || "");
        setAvatarPreference(initialData.avatarPreference || (initialData.photoUrl || initialData.photo_url || initialData.logoUrl ? "custom" : "global"));
        setCustomAvatarUrl(initialData.photoUrl || initialData.photo_url || initialData.logoUrl || "");
    }, [initialData]);

    const handleChange = (key: string, value: any): void => setFormData(prev => ({ ...prev, [key]: value }));

    const handleCustomAvatarFile = async (file: File) => {
        try {
            const result = await uploadSubAvatar(file, STORAGE_FOLDERS.PROFILE_PHOTOS);
            if (result?.url) {
                setCustomAvatarUrl(result.url);
                setAvatarPreference("custom");
                toast.success(`${role} avatar uploaded!`);
            }
        } catch (error) {
            console.error("Custom avatar upload failed", error);
            toast.error("Failed to upload custom avatar.");
        }
    };

    const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleCustomAvatarFile(file);
    };

    // Compute preview name based on preference
    const getPreviewName = (): string => {
        switch (displayNamePreference) {
            case "global":
                return userData?.displayName || "Not Set";
            case "legal":
                return `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || "Not Set";
            case "username":
                return userData?.username ? `@${userData.username}` : "Not Set";
            case "custom":
                return customDisplayName || "Not Set";
            default:
                return "Not Set";
        }
    };

    const handleSave = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading(`Saving ${role} profile...`);
        try {
            let computedDisplayName = "";
            switch (displayNamePreference) {
                case "global":
                    computedDisplayName = userData?.displayName || "";
                    break;
                case "legal":
                    computedDisplayName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
                    break;
                case "username":
                    computedDisplayName = userData?.username || "";
                    break;
                case "custom":
                    computedDisplayName = customDisplayName ||
                        formData.profileName ||
                        userData?.displayName ||
                        `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
                    break;
                default:
                    computedDisplayName = formData.profileName ||
                        userData?.displayName ||
                        `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
            }

            const userId = user?.id || user?.uid;

            const dataToSave = {
                ...formData,
                displayNamePreference,
                customDisplayName,
                displayName: computedDisplayName,
                avatarPreference,
                photoUrl: avatarPreference === "custom" ? customAvatarUrl : undefined,
            };

            if (initialData._id) {
                await updateSubProfile({
                    subProfileId: initialData._id,
                    ...dataToSave
                });
            } else {
                await createSubProfile({
                    clerkId: userId,
                    role,
                    ...dataToSave
                });
            }

            if (onSave) {
                await onSave();
            }

            toast.success(`${role} Profile Saved!`, { id: toastId });
        } catch (err) {
            console.error(err);
            const errorMessage = (err as Error)?.message || "Failed to save.";
            toast.error(errorMessage, { id: toastId });
        }
        finally { setIsSaving(false); }
    };

    // Special case: Studio profiles are read-only and managed in Studio Manager
    if (role === 'Studio') {
        const hasStudioData = userData?.studioName || formData.profileName;

        return (
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                    <h2 className="text-xl font-bold dark:text-white">Studio Profile</h2>
                    <button
                        type="button"
                        onClick={() => window.location.href = '/studio-manager'}
                        className="px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition shadow-lg flex items-center gap-2"
                    >
                        <Settings size={14} />
                        Manage in Studio Manager
                    </button>
                </div>

                {!hasStudioData ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                        <div className="text-4xl mb-4">🏢</div>
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">No Studio Information Set</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                            Your studio profile hasn't been configured yet. Set up your studio information to appear in searches and accept bookings.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.href = '/studio-manager'}
                            className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition shadow-lg"
                        >
                            Set Up Studio Profile
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Studio Name</label>
                            <div className="text-lg font-bold dark:text-white">
                                {userData?.studioName || formData.profileName}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Description</label>
                            <div className="text-sm dark:text-gray-300">
                                {formData.bio || 'No description set'}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Address</label>
                            <div className="text-sm dark:text-gray-300">
                                {formData.address || 'No address set'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600">
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Hourly Rate</label>
                                <div className="text-sm dark:text-gray-300">
                                    {formData.hourlyRate ? `$${formData.hourlyRate}/hr` : 'Not set'}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600">
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Day Rate</label>
                                <div className="text-sm dark:text-gray-300">
                                    {formData.dayRate ? `$${formData.dayRate}/day` : 'Not set'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-800 dark:text-blue-300">
                                <strong>💡 Tip:</strong> To update your studio information, equipment, amenities, and photos, visit the <strong>Studio Manager</strong>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const currentSubRole = formData.talentSubRole || '';
    const filteredSchema = schema.filter((f: any) => {
        if (f.key === 'profileName' || f.key === 'useRealName') return false;
        if (f.showFor && Array.isArray(f.showFor)) {
            return f.showFor.includes(currentSubRole);
        }
        return true;
    });

    return (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm space-y-6">
            <h2 className="text-xl font-bold dark:text-white border-b dark:border-gray-700 pb-2">{role} Identity & Details</h2>

            {/* Avatar & Brand Logo Selector Section */}
            <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600 space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase block">
                        {role} Avatar & Logo
                    </label>
                    <span className="text-[10px] bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 font-bold px-2 py-0.5 rounded-full">
                        Heavy WebP Compression
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Live Persona Avatar Preview */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingCustomAvatar(true); }}
                        onDragLeave={() => setIsDraggingCustomAvatar(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingCustomAvatar(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleCustomAvatarFile(file);
                        }}
                        className={clsx(
                            "relative group shrink-0 flex flex-col items-center p-2 rounded-2xl transition-all border",
                            isDraggingCustomAvatar ? "border-brand-blue ring-4 ring-brand-blue/30 bg-blue-500/10" : "border-transparent"
                        )}
                    >
                        <UserAvatar
                            user={user}
                            userData={userData}
                            src={avatarPreference === "custom" ? customAvatarUrl : undefined}
                            name={getPreviewName()}
                            size="xl"
                            className="border-2 border-brand-blue/40 shadow-md"
                        />
                        <span className="text-[10px] text-gray-400 mt-1 font-semibold">
                            {avatarPreference === "global" ? "Global Photo" : `Custom ${role}`}
                        </span>
                    </div>

                    {/* Selector Tabs & Upload Controls */}
                    <div className="flex-1 space-y-3 w-full">
                        <div className="grid grid-cols-2 gap-2 bg-gray-200/70 dark:bg-gray-800 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setAvatarPreference("global")}
                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${avatarPreference === "global"
                                    ? "bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                🌐 Use Global
                            </button>
                            <button
                                type="button"
                                onClick={() => setAvatarPreference("custom")}
                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${avatarPreference === "custom"
                                    ? "bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                📸 Upload Custom
                            </button>
                        </div>

                        {avatarPreference === "global" ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                This persona will automatically use your main profile avatar image.
                            </p>
                        ) : (
                            <div className="flex items-center gap-2">
                                <label className="flex-1 cursor-pointer bg-white dark:bg-[#1f2128] border border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-blue dark:hover:border-brand-blue px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition group">
                                    <Camera size={14} className="text-brand-blue" />
                                    <span className="text-gray-700 dark:text-gray-200 group-hover:text-brand-blue">
                                        {customAvatarUrl ? "Change Custom Logo / Photo" : "Upload Custom Avatar / Logo"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCustomAvatarUpload}
                                        disabled={subAvatarUploading}
                                        className="hidden"
                                    />
                                </label>
                                {subAvatarUploading && (
                                    <Loader2 size={16} className="animate-spin text-brand-blue" />
                                )}
                                {customAvatarUrl && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomAvatarUrl("");
                                            setAvatarPreference("global");
                                        }}
                                        className="text-xs text-red-500 hover:text-red-600 px-2 py-1 font-medium transition"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Display Name Preferences Section */}
            <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600 space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Display Name Settings</label>

                <select
                    value={displayNamePreference}
                    onChange={(e) => setDisplayNamePreference(e.target.value)}
                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none"
                >
                    <option value="global">Use Global Display Name ({userData?.displayName || 'Not Set'})</option>
                    <option value="legal">Use Legal Name ({`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()})</option>
                    <option value="username">Use Username ({userData?.username ? `@${userData.username}` : 'Not Set'})</option>
                    <option value="custom">Custom Name</option>
                </select>

                {displayNamePreference === "custom" && (
                    <div className="mt-2">
                        <label className="text-xs font-bold text-brand-blue uppercase mb-1 block">Custom Display Name</label>
                        <input
                            type="text"
                            value={customDisplayName}
                            onChange={(e) => setCustomDisplayName(e.target.value)}
                            placeholder={`e.g. ${role === 'Label' ? 'Sony Music' : role === 'Studio' ? 'Sound City' : 'The Weeknd'}`}
                            className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none font-bold"
                        />
                    </div>
                )}

                <div className="text-xs text-gray-500 italic mt-2 border-t dark:border-gray-700 pt-2">
                    Preview: <strong className="text-brand-blue">{getPreviewName()}</strong>
                </div>
            </div>

            {filteredSchema.map((field: any) => {
                if (field.isToggle) return null;
                return (
                    <div key={field.key}>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{field.label}</label>
                        {field.type === 'textarea' ? (
                            <textarea className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none" rows={4} value={formData[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)} />
                        ) : field.type === 'select' ? (
                            <select className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none" value={formData[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)}>{field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}</select>
                        ) : field.type === 'multi_select' ? (
                            <MultiSelect label="" fieldKey={field.key} options={field.data || field.options || []} initialValues={formData[field.key] || []} onChange={handleChange} />
                        ) : field.type === 'nested_select' ? (
                            <NestedSelect label="" fieldKey={field.key} data={field.data} initialValues={formData[field.key] || []} onChange={handleChange} />
                        ) : field.key === 'equipment' ? (
                            <EquipmentAutocomplete
                                multi={true}
                                value={formData[field.key] || ''}
                                onChange={(val) => handleChange(field.key, val)}
                                placeholder="Add gear..."
                            />
                        ) : field.key === 'daw' ? (
                            <SoftwareAutocomplete
                                multi={field.type === 'multi_select'}
                                value={formData[field.key] || ''}
                                onChange={(val) => handleChange(field.key, val)}
                                placeholder="Search for DAW or software..."
                            />
                        ) : field.key === 'software' || field.key === 'softwareList' ? (
                            <SoftwareAutocomplete
                                multi={true}
                                value={formData[field.key] || ''}
                                onChange={(val) => handleChange(field.key, val)}
                                placeholder="Add software..."
                            />
                        ) : (
                            <input type={field.type === 'number' ? 'number' : 'text'} className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none" value={formData[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)} />
                        )}
                    </div>
                );
            })}

            <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
                <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl font-bold bg-brand-blue text-white hover:bg-blue-600 flex items-center gap-2 transition shadow-lg disabled:opacity-50">{isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save {role} Profile</>}</button>
            </div>
        </form>
    );
}