import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Briefcase, Music, Save, Loader2, DollarSign, Settings, Users, ChevronRight, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, appId, getPaths } from '../config/firebase';
import { useForm, Controller } from 'react-hook-form'; // Added Controller
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useImageUpload } from '../hooks/useImageUpload';
import toast from 'react-hot-toast';
import SettingsTab from './SettingsTab';
import { PROFILE_SCHEMAS, GENRE_DATA, INSTRUMENT_DATA } from '../config/constants';
import { MultiSelect, NestedSelect } from './shared/Inputs';
import EquipmentAutocomplete from './shared/EquipmentAutocomplete'; // Added Import

// ... (Schemas and Helper functions remain unchanged) ...
const mainProfileSchema = z.object({
    firstName: z.string().min(2, "First name too short"),
    lastName: z.string().min(2, "Last name too short"),
    displayName: z.string().optional(), 
    bio: z.string().max(500, "Bio exceeds 500 characters").optional(),
    zip: z.string().regex(/^\d{5}$/, "Invalid ZIP code").optional().or(z.literal('')),
    hourlyRate: z.number().min(0, "Rate cannot be negative").optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal('')),
});

const getInitials = (first, last, display) => {
    if (display) return display.substring(0, 2).toUpperCase();
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || 'U';
};

export default function ProfileManager({ user, userData, subProfiles = {}, handleLogout }) {
    // ... (State and handlers remain unchanged) ...
    const [activeSubTab, setActiveSubTab] = useState('details');
    const [selectedRole, setSelectedRole] = useState('Main');
    const [saving, setSaving] = useState(false);
    const { uploadImage, uploading } = useImageUpload();

    const [useLegalNameOnly, setUseLegalNameOnly] = useState(userData?.useLegalNameOnly || false);
    const [useUserNameOnly, setUseUserNameOnly] = useState(userData?.useUserNameOnly || false);

    useEffect(() => {
        setUseLegalNameOnly(userData?.useLegalNameOnly || false);
        setUseUserNameOnly(userData?.useUserNameOnly || false);
    }, [userData]);

    const toggleLegalOnly = () => {
        const newVal = !useLegalNameOnly;
        setUseLegalNameOnly(newVal);
        if (newVal) setUseUserNameOnly(false);
    };

    const toggleUserOnly = () => {
        const newVal = !useUserNameOnly;
        setUseUserNameOnly(newVal);
        if (newVal) setUseLegalNameOnly(false);
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(mainProfileSchema),
        defaultValues: {
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
            displayName: userData?.displayName || '',
            bio: userData?.bio || '',
            zip: userData?.zip || '',
            hourlyRate: userData?.hourlyRate || 0,
            website: userData?.website || '',
        }
    });

    // ... (onMainSubmit, handlePhotoUpload, handleSettingsUpdate unchanged) ...
    const onMainSubmit = async (data) => {
        setSaving(true);
        const toastId = toast.loading('Saving main profile...');
        try {
            let effectiveName = `${data.firstName} ${data.lastName}`;
            if (useLegalNameOnly) effectiveName = `${data.firstName} ${data.lastName}`;
            else if (useUserNameOnly && data.displayName) effectiveName = data.displayName;
            else if (data.displayName) effectiveName = `${data.firstName} "${data.displayName}" ${data.lastName}`;

            const userRef = doc(db, getPaths(user.uid).userProfile);
            await updateDoc(userRef, {
                ...data,
                useLegalNameOnly,
                useUserNameOnly,
                effectiveDisplayName: effectiveName,
                searchTerms: [data.firstName.toLowerCase(), data.lastName.toLowerCase(), (data.displayName || '').toLowerCase(), effectiveName.toLowerCase()].filter(Boolean)
            });
            toast.success('Main Profile Updated!', { id: toastId });
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update profile.", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const toastId = toast.loading('Uploading photo...');
        try {
            const url = await uploadImage(file, `users/${user.uid}/avatars`);
            const userRef = doc(db, getPaths(user.uid).userProfile);
            await updateDoc(userRef, { photoURL: url });
            toast.success('Photo uploaded!', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Photo upload failed', { id: toastId });
        }
    };

    const handleSettingsUpdate = async (newSettings) => {
        try {
            const userRef = doc(db, getPaths(user.uid).userProfile);
            await updateDoc(userRef, { settings: newSettings });
            toast.success("Settings saved.");
        } catch (error) {
            console.error("Settings save failed", error);
            toast.error("Failed to save settings.");
        }
    };

    const inputClass = (error) => twMerge(
        "w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white transition-all focus:ring-2 focus:ring-brand-blue outline-none",
        error ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700"
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
                    <User className="text-brand-blue"/> {activeSubTab === 'details' ? 'Edit Profile' : 'Account Settings'}
                </h1>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex gap-1 self-start md:self-auto">
                    <button onClick={() => setActiveSubTab('details')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeSubTab === 'details' ? 'bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>Edit Details</button>
                    <button onClick={() => setActiveSubTab('settings')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${activeSubTab === 'settings' ? 'bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}><Settings size={14}/> Settings</button>
                </div>
            </div>

            {/* Content Area */}
            {activeSubTab === 'details' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-2">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <div className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">Profiles</div>
                        <button onClick={() => setSelectedRole('Main')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedRole === 'Main' ? 'bg-brand-blue text-white shadow-md' : 'bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}><div className="flex items-center gap-2"><User size={16}/> <span className="font-bold text-sm">Main Profile</span></div>{selectedRole === 'Main' && <ChevronRight size={16}/>}</button>
                        {(userData?.accountTypes || []).map(role => {
                            if (!PROFILE_SCHEMAS[role]) return null;
                            return <button key={role} onClick={() => setSelectedRole(role)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedRole === role ? 'bg-brand-blue text-white shadow-md' : 'bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}><div className="flex items-center gap-2"><Briefcase size={16}/> <span className="font-bold text-sm">{role}</span></div>{selectedRole === role && <ChevronRight size={16}/>}</button>;
                        })}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-3">
                        {selectedRole === 'Main' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 space-y-4">
                                    <div className="relative group w-full aspect-square rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-md">
                                        {userData?.photoURL ? <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full bg-gradient-to-tr from-brand-blue to-purple-500 text-white font-bold text-4xl">{getInitials(userData?.firstName, userData?.lastName, userData?.displayName)}</div>}
                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"><span className="text-white font-bold text-sm">Change Photo</span><input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} /></label>
                                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>}
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-xs text-blue-800 dark:text-blue-200"><p className="font-bold mb-1">Pro Tip:</p>High-quality profile photos increase booking rates by 40%.</div>
                                </div>

                                <div className="md:col-span-2">
                                    <form onSubmit={handleSubmit(onMainSubmit)} className="space-y-6 bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">First Name (Legal)</label><input {...register("firstName")} className={inputClass(errors.firstName)} /></div>
                                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Last Name (Legal)</label><input {...register("lastName")} className={inputClass(errors.lastName)} /></div>
                                        </div>
                                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">User Name (Display Name)</label><input {...register("displayName")} className={inputClass(errors.displayName)} placeholder="e.g. SeshMaster" /></div>
                                        
                                        {/* Name Toggle Logic (Abbreviated for brevity, kept same as prior logic) */}
                                        <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600 space-y-3">
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Display Name Preferences</label>
                                            <div className="flex items-center justify-between"><span className="text-sm dark:text-gray-200">Use Legal Name Only</span><button type="button" onClick={toggleLegalOnly} className="text-brand-blue">{useLegalNameOnly ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-400"/>}</button></div>
                                            <div className="flex items-center justify-between"><span className="text-sm dark:text-gray-200">Use User Name Only</span><button type="button" onClick={toggleUserOnly} className="text-brand-blue">{useUserNameOnly ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-400"/>}</button></div>
                                            <div className="text-xs text-gray-500 italic mt-2 border-t dark:border-gray-700 pt-2">Preview: <strong className="text-brand-blue">{useLegalNameOnly ? `${userData.firstName} ${userData.lastName}` : useUserNameOnly ? (userData.displayName || 'Not Set') : `${userData.firstName} "${userData.displayName || 'User'}" ${userData.lastName}`}</strong></div>
                                        </div>

                                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Bio / About</label><textarea {...register("bio")} rows="4" className={inputClass(errors.bio)} placeholder="Tell us about your musical journey..." /></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1"><MapPin size={12}/> ZIP Code</label><input {...register("zip")} className={inputClass(errors.zip)} /></div>
                                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1"><DollarSign size={12}/> Hourly Rate ($)</label><input type="number" {...register("hourlyRate", { valueAsNumber: true })} className={inputClass(errors.hourlyRate)} /></div>
                                        </div>
                                        <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
                                            <button type="button" onClick={handleSubmit(onMainSubmit)} disabled={saving} className={clsx("px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg", saving ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-brand-blue text-white hover:bg-blue-600 hover:scale-105")}>{saving ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Save Changes</>}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <DynamicSubProfileForm user={user} userData={userData} role={selectedRole} initialData={subProfiles[selectedRole] || {}} schema={PROFILE_SCHEMAS[selectedRole] || []}/>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-2"><SettingsTab user={user} userData={userData} handleLogout={handleLogout} onUpdate={handleSettingsUpdate}/></div>
            )}
        </div>
    );
}

// --- Dynamic Form Component ---
function DynamicSubProfileForm({ user, userData, role, initialData, schema }) {
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    // ... (Toggle States logic remains same) ...
    const [followMainProfile, setFollowMainProfile] = useState(initialData.followMainProfile ?? true);
    const [useLegalNameOnly, setUseLegalNameOnly] = useState(initialData.useLegalNameOnly ?? false);
    const [useUserNameOnly, setUseUserNameOnly] = useState(initialData.useUserNameOnly ?? false);
    const [syncStudioOps, setSyncStudioOps] = useState(initialData.syncStudioOps ?? false);

    useEffect(() => { 
        setFormData(initialData || {}); 
        setFollowMainProfile(initialData.followMainProfile ?? true);
        setUseLegalNameOnly(initialData.useLegalNameOnly ?? false);
        setUseUserNameOnly(initialData.useUserNameOnly ?? false);
        setSyncStudioOps(initialData.syncStudioOps ?? false);
    }, [initialData]);

    const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
    const toggleLegalOnly = () => { setUseLegalNameOnly(!useLegalNameOnly); if(!useLegalNameOnly) setUseUserNameOnly(false); };
    const toggleUserOnly = () => { setUseUserNameOnly(!useUserNameOnly); if(!useUserNameOnly) setUseLegalNameOnly(false); };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading(`Saving ${role} profile...`);
        try {
            let effectiveName = '';
            if (followMainProfile) effectiveName = userData.effectiveDisplayName || `${userData.firstName} ${userData.lastName}`;
            else {
                if (useLegalNameOnly) effectiveName = `${userData.firstName} ${userData.lastName}`;
                else if (useUserNameOnly) effectiveName = userData.displayName || `${userData.firstName} ${userData.lastName}`; 
                else effectiveName = formData.profileName || `${userData.firstName} ${userData.lastName}`;
            }

            const dataToSave = { ...formData, followMainProfile, useLegalNameOnly, useUserNameOnly, syncStudioOps, displayName: effectiveName };
            const subRef = doc(db, getPaths(user.uid).userSubProfile(role));
            await setDoc(subRef, dataToSave, { merge: true });
            
            if (userData.activeProfileRole === role) {
                const publicRef = doc(db, getPaths(user.uid).userPublicProfile);
                await updateDoc(publicRef, { displayName: effectiveName, searchTerms: [effectiveName.toLowerCase()] });
            }
            if (role === 'Studio' && syncStudioOps) {
                const mainRef = doc(db, getPaths(user.uid).userProfile);
                await updateDoc(mainRef, { studioName: effectiveName });
            }
            toast.success(`${role} Profile Saved!`, { id: toastId });
        } catch (err) { console.error(err); toast.error("Failed to save.", { id: toastId }); } 
        finally { setIsSaving(false); }
    };

    if (schema.length === 0) return <div className="p-10 text-center text-gray-500">No configuration available for this role.</div>;
    
    // Get current sub-role (for Talent profiles)
    const currentSubRole = formData.talentSubRole || '';
    
    // Filter schema - hide profileName/useRealName and filter by showFor
    const filteredSchema = schema.filter(f => {
        if (f.key === 'profileName' || f.key === 'useRealName') return false;
        // If field has showFor restriction, check if current sub-role matches
        if (f.showFor && Array.isArray(f.showFor)) {
            return f.showFor.includes(currentSubRole);
        }
        return true;
    });

    return (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm space-y-6">
            <h2 className="text-xl font-bold dark:text-white border-b dark:border-gray-700 pb-2">{role} Identity & Details</h2>
            
            {/* Identity Toggles (Same as before) */}
            <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-600 space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Identity Settings</label>
                <div className="flex items-center justify-between">
                    <div><div className="text-sm font-bold dark:text-white">Follow Main Profile Name</div><div className="text-xs text-gray-500">Use "{userData.effectiveDisplayName || `${userData.firstName} ${userData.lastName}`}"</div></div>
                    <button type="button" onClick={() => setFollowMainProfile(!followMainProfile)} className="text-brand-blue">{followMainProfile ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-400"/>}</button>
                </div>
                {!followMainProfile && (
                    <div className="space-y-3 animate-in slide-in-from-top-1 pt-3 border-t dark:border-gray-700">
                         <div className="flex items-center justify-between"><span className="text-sm dark:text-gray-200">Use Legal Name Only</span><button type="button" onClick={toggleLegalOnly} className="text-brand-blue">{useLegalNameOnly ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-400"/>}</button></div>
                        <div className="flex items-center justify-between"><span className="text-sm dark:text-gray-200">Use Main User Name Only</span><button type="button" onClick={toggleUserOnly} className="text-brand-blue">{useUserNameOnly ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-400"/>}</button></div>
                        {!useLegalNameOnly && !useUserNameOnly && (
                            <div className="mt-2">
                                <label className="text-xs font-bold text-brand-blue uppercase mb-1 block">{role} Name</label>
                                <input type="text" className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none font-bold" placeholder={`e.g. ${role === 'Studio' ? 'Sound City' : 'The Weeknd'}`} value={formData.profileName || ''} onChange={e => handleChange('profileName', e.target.value)} />
                                {role === 'Studio' && (<div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={syncStudioOps} onChange={(e) => setSyncStudioOps(e.target.checked)} className="rounded text-brand-blue focus:ring-brand-blue"/><span className="text-xs text-gray-500 dark:text-gray-400">Force "Studio Ops" to use this name</span></div>)}
                            </div>
                        )}
                         <div className="text-xs text-gray-500 italic mt-2 border-t dark:border-gray-700 pt-2">Preview: <strong className="text-brand-blue">{useLegalNameOnly ? `${userData.firstName} ${userData.lastName}` : useUserNameOnly ? (userData.displayName || 'Not Set') : (formData.profileName || 'Not Set')}</strong></div>
                    </div>
                )}
            </div>

            {/* Dynamic Fields */}
            {filteredSchema.map((field) => {
                if (field.isToggle) return null; 
                return (
                    <div key={field.key}>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{field.label}</label>
                        {field.type === 'textarea' ? (
                            <textarea className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none" rows={4} value={formData[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)} />
                        ) : field.type === 'select' ? (
                            <select className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none" value={formData[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)}>{field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                        ) : field.type === 'multi_select' ? (
                            <MultiSelect label="" fieldKey={field.key} options={field.data || field.options || []} initialValues={formData[field.key] || []} onChange={handleChange} />
                        ) : field.type === 'nested_select' ? (
                            <NestedSelect label="" fieldKey={field.key} data={field.data} initialValues={formData[field.key] || []} onChange={handleChange} />
                        ) : (
                            /* FIX: Replaced simple input with EquipmentAutocomplete for "equipment" field */
                            field.key === 'equipment' ? (
                                <EquipmentAutocomplete 
                                    multi={true} 
                                    value={formData[field.key] || ''} 
                                    onChange={(val) => handleChange(field.key, val)}
                                    placeholder="Add gear..." 
                                />
                            ) : (
                                <input type={field.type === 'number' ? 'number' : 'text'} className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-brand-blue outline-none" value={formData[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)} />
                            )
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
