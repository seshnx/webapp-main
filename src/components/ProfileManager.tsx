import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Briefcase, Music, Save, Loader2, DollarSign, Settings, Users, ChevronRight, Check, ToggleLeft, ToggleRight, Camera, Eye, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useImageUpload } from '../hooks/useUpload';
import toast from 'react-hot-toast';
import SettingsTab from './SettingsTab';
import { PROFILE_SCHEMAS, GENRE_DATA, INSTRUMENT_DATA } from '../config/constants';
import { MultiSelect, NestedSelect } from './shared/Inputs';
import EquipmentAutocomplete from './shared/EquipmentAutocomplete';
import SoftwareAutocomplete from './shared/SoftwareAutocomplete';
import { useUpdateProfile, useUpdateSubProfile, useCreateSubProfile } from '@/hooks/useConvex';
import PageLayout from './shared/PageLayout';

// --- Interfaces ---
interface UserData {
  id?: string;
  uid?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  zip?: string;
  hourlyRate?: number;
  website?: string;
  photoURL?: string;
  bannerURL?: string;
  useLegalNameOnly?: boolean;
  useUserNameOnly?: boolean;
  useDisplayNameOnly?: boolean;
  effectiveDisplayName?: string;
  accountTypes?: string[];
  talentSubRole?: string;
  activeProfileRole?: string;
  studioName?: string;
  searchTerms?: string[];
}

interface UserAuth {
  id?: string;
  uid?: string;
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

const getInitials = (first?: string, last?: string, display?: string): string => {
    if (display) return display.substring(0, 2).toUpperCase();
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || 'U';
};

// Added openPublicProfile, onSubProfileUpdate, and onRoleSwitch to props
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
                // Return both settings tab and sub-tab
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
    const [bannerUploading, setBannerUploading] = useState<boolean>(false); // New state for banner

    // Sync URL with active tab
    useEffect(() => {
        const currentTab = activeSubTab === 'details' ? '/profile' : `/profile/${activeSubTab}`;
        if (location.pathname !== currentTab) {
            navigate(currentTab); // Allow back button for profile tab switching
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
            zip: userData?.zipCode || '',
            hourlyRate: userData?.hourlyRate || 0,
            website: userData?.website || '',
        }
    });

    // Reset form when userData changes (e.g., after Convex updates)
    useEffect(() => {
        if (userData) {
            reset({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                displayName: userData.displayName || '',
                bio: userData.bio || '',
                zip: userData.zipCode || '',
                hourlyRate: userData.hourlyRate || 0,
                website: userData.website || '',
            });
        }
    }, [userData, reset]);

    // Remove MongoDB loading - all data now from Convex userData


    const onMainSubmit = async (data: ProfileFormValues): Promise<void> => {
        setSaving(true);
        const toastId = toast.loading('Saving main profile...');
        try {
            const userId = user?.id || user?.uid;

            // Save everything to Convex
            await updateProfile({
                clerkId: userId,
                firstName: data.firstName,
                lastName: data.lastName,
                displayName: data.displayName || '',
                bio: data.bio || '',
                zipCode: data.zip || '',
                hourlyRate: data.hourlyRate || 0,
                website: data.website || '',
                avatarUrl: userData?.photoURL,
                bannerUrl: userData?.bannerURL,
            });

            // Reset form with saved data to ensure displayName persists
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

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) return;
        const userId = user?.id || user?.uid;
        const toastId = toast.loading('Uploading photo...');
        try {
            const url = await uploadImage(file, 'profile-photos');

            // Update profile photo URL in Convex
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

    // --- NEW: Handle Banner Upload ---
    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) return;
        const userId = user?.id || user?.uid;
        setBannerUploading(true);
        const toastId = toast.loading('Uploading cover banner...');
        try {
            // Upload to Vercel Blob
            const url = await uploadImage(file, 'profile-banners');

            // Update banner URL in Convex
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

    const handleSettingsUpdate = async (newSettings: any): Promise<void> => {
        const userId = user?.id || user?.uid;
        try {
            // Update settings using Convex
            await updateProfile({
                clerkId: userId,
                settings: newSettings,
            });

            toast.success("Settings saved.");
        } catch (error) {
            console.error("Settings save failed", error);
            const errorMessage = (error as Error)?.message || "Failed to save settings.";
            toast.error(errorMessage);
        }
    };

    const inputClass = (error?: any): string => twMerge(
        "w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white transition-all focus:ring-2 focus:ring-brand-blue outline-none",
        error ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700"
    );

    return (
        <PageLayout
            title={activeSubTab === 'details' ? 'Edit Profile' : 'Account Settings'}
            subtitle="Manage your public profile and account settings"
            headerActions={
                <>
                    {/* View Public Profile Button */}
                    <button
                        onClick={() => openPublicProfile?.(user?.id || user?.uid)}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition shadow-lg"
                    >
                        <Eye size={16}/> View Public Profile
                    </button>

                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex gap-1">
                        <button onClick={() => setActiveSubTab('details')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeSubTab === 'details' ? 'bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>Edit Details</button>
                        <button onClick={() => setActiveSubTab('settings')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${activeSubTab === 'settings' ? 'bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}><Settings size={14}/> Settings</button>
                    </div>
                </>
            }
        >
            <div className="space-y-6">

            {/* Content Area */}
            {activeSubTab === 'details' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-2">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <div className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">Profiles</div>
                        <button onClick={() => setSelectedRole('Main')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedRole === 'Main' ? 'bg-brand-blue text-white shadow-md' : 'bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}><div className="flex items-center gap-2"><User size={16}/> <span className="font-bold text-sm">Main Profile</span></div>{selectedRole === 'Main' && <ChevronRight size={16}/>}</button>
                        {(userData?.accountTypes || []).map((role: string) => {
                            if (!PROFILE_SCHEMAS[role]) return null;
                            return <button key={role} onClick={() => setSelectedRole(role)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedRole === role ? 'bg-brand-blue text-white shadow-md' : 'bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}><div className="flex items-center gap-2"><Briefcase size={16}/> <span className="font-bold text-sm">{role}</span></div>{selectedRole === role && <ChevronRight size={16}/>}</button>;
                        })}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-3">
                        {selectedRole === 'Main' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 space-y-6">
                                    {/* Avatar Upload */}
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-gray-500 uppercase">Profile Photo</div>
                                        <div className="relative group w-full aspect-square rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-md">
                                            {userData?.photoURL ? <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full bg-gradient-to-tr from-brand-blue to-purple-500 text-white font-bold text-4xl">{getInitials(userData?.firstName, userData?.lastName, userData?.displayName)}</div>}
                                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"><span className="text-white font-bold text-sm flex items-center gap-1"><Camera size={16}/> Change</span><input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} /></label>
                                            {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>}
                                        </div>
                                    </div>

                                    {/* NEW: Banner Upload */}
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-gray-500 uppercase">Cover Banner</div>
                                        <div className="relative group w-full aspect-[3/1] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
                                            {userData?.bannerURL ? (
                                                <img src={userData.bannerURL} alt="Banner" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={24}/>
                                                </div>
                                            )}
                                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                                <span className="text-white font-bold text-xs flex items-center gap-1"><Camera size={14}/> Upload Cover</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={bannerUploading} />
                                            </label>
                                            {bannerUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-xs text-blue-800 dark:text-blue-200"><p className="font-bold mb-1">Pro Tip:</p>High-quality profile photos & banners increase booking rates by 40%.</div>
                                </div>

                                <div className="md:col-span-2">
                                    <form onSubmit={handleSubmit(onMainSubmit)} className="space-y-6 bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">First Name (Legal)</label><input {...register("firstName")} className={inputClass(errors.firstName)} /></div>
                                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Last Name (Legal)</label><input {...register("lastName")} className={inputClass(errors.lastName)} /></div>
                                        </div>

                                        {/* Username (from Clerk, never editable) */}
                                        {userData?.username && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Username</label>
                                                <input
                                                    value={userData.username}
                                                    disabled
                                                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed font-mono text-sm"
                                                />
                                            </div>
                                        )}

                                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Display Name (Editable)</label><input {...register("displayName")} className={inputClass(errors.displayName)} placeholder="e.g. SeshMaster" /></div>

                                        {/* Info Banner: Display preferences moved to SubProfiles */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">ℹ️ Note:</p>
                                            <p className="text-xs text-blue-800 dark:text-blue-300">Display name preferences are now configured per role (Talent, Studio, Producer, etc.) in each SubProfile tab.</p>
                                        </div>

                                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Bio / About</label><textarea {...register("bio")} rows="4" className={inputClass(errors.bio)} placeholder="Tell us about your musical journey..." /></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1"><MapPin size={12}/> ZIP Code</label><input {...register("zip")} className={inputClass(errors.zip)} /></div>
                                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1"><DollarSign size={12}/> Hourly Rate ($)</label><input type="number" {...register("hourlyRate", { valueAsNumber: true })} className={inputClass(errors.hourlyRate)} /></div>
                                        </div>
                                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Website</label><input {...register("website")} className={inputClass(errors.website)} placeholder="https://..." /></div>

                                        <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
                                            <button type="submit" disabled={saving} className={clsx("px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg", saving ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-brand-blue text-white hover:bg-blue-600 hover:scale-105")}>{saving ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Save Changes</>}</button>
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
                <div className="animate-in fade-in slide-in-from-right-2"><SettingsTab user={user} userData={userData} handleLogout={handleLogout} onUpdate={handleSettingsUpdate} onRoleSwitch={onRoleSwitch} subProfiles={subProfiles}/></div>
            )}
            </div>
        </PageLayout>
    );
}

// ... (DynamicSubProfileForm remains unchanged from previous version) ...
function DynamicSubProfileForm({ user, userData, role, initialData, schema, onSave, updateSubProfile, createSubProfile }: DynamicSubProfileFormProps) {
    const [formData, setFormData] = useState<any>(initialData);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // NEW: Display name preference states
    const [displayNamePreference, setDisplayNamePreference] = useState<string>(
        initialData.displayNamePreference || "legal"
    );
    const [customDisplayName, setCustomDisplayName] = useState<string>(
        initialData.customDisplayName || ""
    );

    useEffect(() => {
        setFormData(initialData || {});
        setDisplayNamePreference(initialData.displayNamePreference || "legal");
        setCustomDisplayName(initialData.customDisplayName || "");
    }, [initialData]);

    const handleChange = (key: string, value: any): void => setFormData(prev => ({ ...prev, [key]: value }));

    // NEW: Compute preview name based on preference
    const getPreviewName = (): string => {
        switch (displayNamePreference) {
            case "legal":
                return `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || "Not Set";
            case "username":
                return userData?.username || "Not Set";
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
            // Compute display name based on preference
            let computedDisplayName = "";
            switch (displayNamePreference) {
                case "legal":
                    computedDisplayName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
                    break;
                case "username":
                    computedDisplayName = userData?.username || "";
                    break;
                case "custom":
                    computedDisplayName = customDisplayName ||
                                        formData.profileName ||
                                        `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
                    break;
                default:
                    computedDisplayName = formData.profileName ||
                                        `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
            }

            const userId = user?.id || user?.uid;

            // Save sub-profile data using Convex
            const dataToSave = {
                ...formData,
                displayNamePreference,
                customDisplayName,
                displayName: computedDisplayName
            };

            // Check if sub-profile already exists (has _id)
            if (initialData._id) {
                // Update existing sub-profile
                await updateSubProfile({
                    subProfileId: initialData._id,
                    ...dataToSave
                });
            } else {
                // Create new sub-profile
                await createSubProfile({
                    clerkId: userId,
                    role,
                    ...dataToSave
                });
            }

            // Refresh sub-profiles in parent component
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

            {/* NEW: Display Name Preferences Section */}
            <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600 space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Display Name Settings</label>

                <select
                    value={displayNamePreference}
                    onChange={(e) => setDisplayNamePreference(e.target.value)}
                    className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none"
                >
                    <option value="legal">Use Legal Name ({`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()})</option>
                    <option value="username">Use Username ({userData?.username || 'Not Set'})</option>
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
                <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl font-bold bg-brand-blue text-white hover:bg-blue-600 flex items-center gap-2 transition shadow-lg disabled:opacity-50">{isSaving ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Save {role} Profile</>}</button>
            </div>
        </form>
    );
}