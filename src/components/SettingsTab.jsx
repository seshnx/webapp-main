import React, { useState, useEffect } from 'react';
import { 
    X, Loader2, Settings, Bell, Shield, Moon, Users, RefreshCw, Star, 
    Filter, Lock, AlertTriangle, Key, Mail, CheckCircle, Eye, MapPin, 
    MessageSquare, UserX, Download
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { ACCOUNT_TYPES } from '../config/constants';

// Roles that should never be shown in account settings (managed through other systems)
const HIDDEN_ROLES = ['Student', 'EDUStaff', 'Intern', 'EDUAdmin', 'GAdmin'];

export default function SettingsTab({ user, userData, onUpdate, onRoleSwitch }) {
    const [localSettings, setLocalSettings] = useState(userData?.settings || {
        notifications: { email: true, push: true, marketing: false },
        privacy: { publicProfile: true, showLocation: true, hideProfile: false },
        theme: 'system',
        social: { mutedUsers: [], blockedUsers: [] },
        messenger: { mutedThreads: [], blockedContacts: [] },
        preferences: { seeAllProfiles: false }
    });
    
    const [roles, setRoles] = useState(userData?.accountTypes || []);
    const [preferredRole, setPreferredRole] = useState(userData?.preferredRole || roles[0]);
    const [activeRole, setActiveRole] = useState(userData?.activeProfileRole || roles[0]);
    const [savingRoles, setSavingRoles] = useState(false);
    const [exporting, setExporting] = useState(false);
    
    // Deletion State
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Security / Account State
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [securityAction, setSecurityAction] = useState(null); // 'email' or 'password'
    const [securityForm, setSecurityForm] = useState({ newEmail: '', newPassword: '', currentPassword: '' });
    const [isSecurityLoading, setIsSecurityLoading] = useState(false);


    useEffect(() => {
        if (userData?.activeProfileRole) {
            setActiveRole(userData.activeProfileRole);
        }
    }, [userData?.activeProfileRole]);

    // Generic Toggle Handler for nested settings
    const handleToggle = (category, key) => {
        setLocalSettings(prev => {
            const updated = { 
                ...prev, 
                [category]: { 
                    ...prev[category], 
                    [key]: !prev[category]?.[key] 
                } 
            };
            onUpdate(updated);
            return updated;
        });
    };

    const handleThemeChange = (val) => {
        setLocalSettings(prev => {
            const updated = { ...prev, theme: val };
            onUpdate(updated);
            return updated;
        });
    };

    const updateAccountTypes = async () => {
        if (roles.length === 0 || !supabase) return alert("You must have at least one role.");
        setSavingRoles(true);
        try {
            await supabase
                .from('profiles')
                .update({ 
                    account_types: roles,
                    preferred_role: preferredRole,
                    active_role: activeRole,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);
            
            if (userData && activeRole !== userData.activeProfileRole && onRoleSwitch) {
                onRoleSwitch(activeRole);
            }

            // Note: Sub-profiles can be handled separately if needed
            // For now, we'll just update the main profile
            alert("Roles & Preferences updated!");
        } catch (e) {
            console.error(e);
            alert("Failed to update.");
        }
        setSavingRoles(false);
    };

    const toggleRole = (role) => {
        setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    };

    // --- SECURITY HANDLERS ---
    const openSecurityModal = (action) => {
        setSecurityAction(action);
        setSecurityForm({ newEmail: '', newPassword: '', currentPassword: '' });
        setShowSecurityModal(true);
    };

    const handleSecurityUpdate = async () => {
        if (!securityForm.currentPassword || !supabase) {
            if (!securityForm.currentPassword) alert("Current password is required to verify your identity.");
            return;
        }
        setIsSecurityLoading(true);

        try {
            // Verify current password by attempting to sign in
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: securityForm.currentPassword
            });
            
            if (verifyError) {
                throw new Error("Incorrect current password.");
            }

            if (securityAction === 'email') {
                if (!securityForm.newEmail) throw new Error("New email address is required.");
                const { error: emailError } = await supabase.auth.updateUser({ 
                    email: securityForm.newEmail 
                });
                if (emailError) throw emailError;
                
                // Update profile email
                await supabase
                    .from('profiles')
                    .update({ email: securityForm.newEmail, updated_at: new Date().toISOString() })
                    .eq('id', user.id);
                
                alert("Email updated successfully.");
            } 
            else if (securityAction === 'password') {
                if (securityForm.newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
                const { error: passwordError } = await supabase.auth.updateUser({ 
                    password: securityForm.newPassword 
                });
                if (passwordError) throw passwordError;
                alert("Password updated successfully.");
            }

            setShowSecurityModal(false);
            setSecurityForm({ newEmail: '', newPassword: '', currentPassword: '' });

        } catch (e) {
            console.error("Security Update Error:", e);
            if (e.message?.includes('Incorrect current password') || e.message?.includes('Invalid')) {
                alert("Incorrect current password.");
            } else if (e.message?.includes('already registered') || e.message?.includes('already in use')) {
                alert("This email is already associated with another account.");
            } else {
                alert("Failed to update: " + e.message);
            }
        }
        setIsSecurityLoading(false);
    };

    const handleDataExport = async () => {
        setExporting(true);
        try {
            // TEMPORARILY DISABLED: Firebase Functions not available
            throw new Error("Data export functionality is temporarily unavailable. Firebase Functions service is not configured.");
            
            /* const functions = getFunctions();
            const exportFn = httpsCallable(functions, 'exportUserData');
            
            const result = await exportFn();
            const jsonString = result.data.data; // Backend returns { data: "string" }
            
            // Create a Blob and trigger download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `seshnx_data_export_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert("Your data has been downloaded successfully."); */
        } catch (e) {
            console.error(e);
            alert("Failed to export data. Please try again later.");
        }
        setExporting(false);
    };

    // --- DELETION LOGIC ---
    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE' || !supabase || !user) return;
        setIsDeleting(true);
        const userId = user.id;
        
        try {
            // Step 1: Delete all related data first to avoid foreign key constraint violations
            // Delete profile and related records
            const relatedTables = [
                'profiles',
                'wallets',
                'notifications',
                'saved_posts',
                'followers',
                'following',
                'posts',
                'comments',
                'bookings',
                'marketplace_items',
                'distribution_releases',
                'equipment_submissions',
                'safe_exchange_transactions',
                'shipping_transactions'
            ];
            
            for (const table of relatedTables) {
                try {
                    // Delete records where user is the owner or participant
                    const deleteQueries = [];
                    
                    if (table === 'profiles' || table === 'wallets') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('id', userId)
                        );
                    } else if (table === 'notifications' || table === 'saved_posts') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('user_id', userId)
                        );
                    } else if (table === 'followers') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('follower_id', userId),
                            supabase.from(table).delete().eq('following_id', userId)
                        );
                    } else if (table === 'following') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('user_id', userId),
                            supabase.from(table).delete().eq('target_id', userId)
                        );
                    } else if (table === 'posts' || table === 'comments') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('user_id', userId)
                        );
                    } else if (table === 'bookings') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('sender_id', userId),
                            supabase.from(table).delete().eq('target_id', userId)
                        );
                    } else if (table === 'marketplace_items') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('seller_id', userId)
                        );
                    } else if (table === 'distribution_releases') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('uploader_id', userId)
                        );
                    } else if (table === 'equipment_submissions') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('submitted_by', userId)
                        );
                    } else if (table === 'safe_exchange_transactions') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('buyer_id', userId),
                            supabase.from(table).delete().eq('seller_id', userId)
                        );
                    } else if (table === 'shipping_transactions') {
                        deleteQueries.push(
                            supabase.from(table).delete().eq('buyer_id', userId),
                            supabase.from(table).delete().eq('seller_id', userId)
                        );
                    }
                    
                    // Execute all delete queries for this table
                    await Promise.all(deleteQueries);
                } catch (tableError) {
                    // Log but don't fail - some tables might not exist or have different schemas
                    console.warn(`Could not delete from ${table}:`, tableError);
                }
            }
            
            // Step 2: Call Supabase admin API to delete the auth user
            // Note: This requires a backend endpoint with service_role key
            // For now, we'll use the Supabase client which may not have permissions
            const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
            
            if (deleteError) {
                // If admin API fails, try regular signOut and show message
                console.warn("Admin delete failed, using signOut:", deleteError);
                await supabase.auth.signOut();
                alert("Account data has been deleted. Please contact support to complete account deletion if needed.");
            } else {
                alert("Account successfully deleted.");
            }
            
            // Step 3: Clear local state and redirect
            setShowDeleteModal(false);
            setDeleteConfirm('');
            window.location.href = '/';
            
        } catch (error) {
            console.error("Deletion Error:", error);
            alert("Failed to delete account: " + (error.message || "Unknown error. Please contact support."));
            setIsDeleting(false);
        }
    };

    

    // Helper for Block Lists
    const ListManager = ({ title, items, type, icon: Icon }) => (
        <div className="mt-4 border-t dark:border-gray-700 pt-4">
            <h5 className="text-sm font-bold dark:text-gray-300 mb-2 flex items-center gap-2"><Icon size={14}/> {title}</h5>
            {items && items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {items.map((id, i) => (
                        <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            {id.substring(0,8)}... <X size={10} className="cursor-pointer hover:text-red-500"/>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic">No active {type}.</p>
            )}
        </div>
    );

    // Always filter out EDU and GAdmin roles from settings - they are managed through other systems
    const displayedRoles = ACCOUNT_TYPES.filter(role => !HIDDEN_ROLES.includes(role));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
            
            {/* 1. ROLES & WORKFLOW */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2"><Users size={18} className="text-purple-500"/> Roles & Workflow</h3>
                
                <div className="mb-6">
                    <div className="mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase block">Active Account Types</label>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {displayedRoles.map(role => (
                            <button 
                                key={role} 
                                onClick={() => toggleRole(role)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${roles.includes(role) ? 'bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300' : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-transparent dark:border-gray-600 dark:text-gray-400'}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1"><Star size={12}/> Preferred Profile</label>
                        <select 
                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                            value={preferredRole}
                            onChange={e => setPreferredRole(e.target.value)}
                        >
                            {roles.filter(r => !HIDDEN_ROLES.includes(r)).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1"><RefreshCw size={12}/> Active Workflow Context</label>
                        <select 
                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                            value={activeRole}
                            onChange={e => setActiveRole(e.target.value)}
                        >
                            {roles.filter(r => !HIDDEN_ROLES.includes(r)).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>

                <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-brand-blue"/>
                        <div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">See All (Unfiltered View)</span>
                            <p className="text-[10px] text-gray-500">Show all content types regardless of active workflow.</p>
                        </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full p-0.5 flex transition-colors ${localSettings.preferences?.seeAllProfiles ? 'bg-brand-blue justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}>
                        <input type="checkbox" className="hidden" checked={localSettings.preferences?.seeAllProfiles || false} onChange={() => handleToggle('preferences', 'seeAllProfiles')} />
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                </label>

                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <button onClick={updateAccountTypes} disabled={savingRoles} className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition">
                        {savingRoles ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>} Save Workflow Settings
                    </button>
                </div>
            </div>

            {/* 2. ACCOUNT SECURITY */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={18} className="text-blue-500"/> Account Security
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                                <Mail size={18}/>
                            </div>
                            <div>
                                <div className="text-sm font-bold dark:text-white">Email Address</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => openSecurityModal('email')}
                            className="text-xs font-bold bg-white dark:bg-gray-700 border dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                        >
                            Change Email
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                                <Key size={18}/>
                            </div>
                            <div>
                                <div className="text-sm font-bold dark:text-white">Password</div>
                                <div className="text-xs text-gray-500">Last changed: Never (or unknown)</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => openSecurityModal('password')}
                            className="text-xs font-bold bg-white dark:bg-gray-700 border dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. MODULE SETTINGS (Content & Safety) */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2"><Settings size={18} className="text-gray-500"/> Content & Safety</h3>
                
                <ListManager 
                    title="Blocked Users" 
                    items={localSettings.social?.blockedUsers} 
                    type="blocks" 
                    icon={UserX}
                />
                
                <ListManager 
                    title="Muted Threads" 
                    items={localSettings.messenger?.mutedThreads} 
                    type="mutes" 
                    icon={MessageSquare}
                />
            </div>

            {/* 4. NOTIFICATION PREFERENCES */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2"><Bell size={18} className="text-brand-blue"/> Notification Preferences</h3>
                <div className="space-y-3">
                    {Object.entries({
                        email: "Email Notifications",
                        push: "Push Notifications",
                        marketing: "Marketing & Updates"
                    }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300">{label}</span>
                            <div 
                                onClick={() => handleToggle('notifications', key)}
                                className={`w-10 h-5 rounded-full p-0.5 flex cursor-pointer transition-colors ${localSettings.notifications?.[key] ? 'bg-brand-blue justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}
                            >
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. PRIVACY & VISIBILITY */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2"><Shield size={18} className="text-green-500"/> Privacy & Visibility</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye size={16} className="text-gray-400"/>
                            <span className="text-sm dark:text-gray-300">Public Profile Visibility</span>
                        </div>
                        <div 
                            onClick={() => handleToggle('privacy', 'publicProfile')}
                            className={`w-10 h-5 rounded-full p-0.5 flex cursor-pointer transition-colors ${localSettings.privacy?.publicProfile ? 'bg-green-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}
                        >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400"/>
                            <span className="text-sm dark:text-gray-300">Show Location on Map</span>
                        </div>
                        <div 
                            onClick={() => handleToggle('privacy', 'showLocation')}
                            className={`w-10 h-5 rounded-full p-0.5 flex cursor-pointer transition-colors ${localSettings.privacy?.showLocation ? 'bg-green-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}
                        >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserX size={16} className="text-gray-400"/>
                            <span className="text-sm dark:text-gray-300">Hide Profile Completely</span>
                        </div>
                        <div 
                            onClick={() => handleToggle('privacy', 'hideProfile')}
                            className={`w-10 h-5 rounded-full p-0.5 flex cursor-pointer transition-colors ${localSettings.privacy?.hideProfile ? 'bg-brand-blue justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}
                        >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
               
        
                    {/* NEW: Data Export Button */}
                    <div className="pt-4 mt-2 border-t dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-bold dark:text-white">Your Data</span>
                                <p className="text-[10px] text-gray-500">Download a copy of your personal data (GDPR/CCPA).</p>
                            </div>
                            <button 
                                onClick={handleDataExport} 
                                disabled={exporting}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 transition"
                            >
                                {exporting ? <Loader2 size={14} className="animate-spin"/> : <Download size={14}/>}
                                Download Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. APPEARANCE */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2"><Moon size={18} className="text-purple-500"/> Appearance</h3>
                <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
                    {['light', 'dark', 'system'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => handleThemeChange(t)}
                            className={`flex-1 py-2 text-xs font-bold rounded-md capitalize transition-all ${localSettings.theme === t ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* 7. DANGER ZONE */}
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-800/30 shadow-sm">
                <h3 className="font-bold text-lg text-red-600 dark:text-red-400 mb-2 flex items-center gap-2"><Lock size={18}/> Danger Zone</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Deleting your account is permanent. This action will trigger the data cleanup process, removing your profile, posts, and messages.
                </p>
                
                {!showDeleteModal ? (
                    <button 
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                        Delete Account
                    </button>
                ) : (
                    <div className="bg-white dark:bg-[#1f2128] p-4 rounded-xl border border-red-200 dark:border-red-900 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                        <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Confirm Deletion</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            Type <strong>DELETE</strong> below to confirm. This cannot be undone.
                        </p>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-red-300 dark:border-red-900 rounded mb-3 text-sm focus:ring-2 focus:ring-red-500 outline-none dark:bg-black/20 dark:text-white"
                            placeholder="Type DELETE"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={handleDeleteAccount} 
                                disabled={deleteConfirm !== 'DELETE' || isDeleting}
                                className="flex-1 bg-red-600 text-white py-2 rounded font-bold text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="animate-spin" size={14}/> : 'Confirm Delete'}
                            </button>
                            <button 
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded font-bold text-xs hover:opacity-80"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- SECURITY MODAL --- */}
            {showSecurityModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] w-full max-w-md rounded-xl p-6 shadow-2xl animate-in zoom-in-95 border dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                {securityAction === 'email' ? <Mail size={20}/> : <Key size={20}/>}
                                Update {securityAction === 'email' ? 'Email' : 'Password'}
                            </h3>
                            <button onClick={() => setShowSecurityModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Current Password Field (Always Required) */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Current Password (Required)</label>
                                <input 
                                    type="password"
                                    className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                    placeholder="Verify your identity"
                                    value={securityForm.currentPassword}
                                    onChange={e => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                                />
                            </div>

                            {/* Dynamic Field based on Action */}
                            {securityAction === 'email' ? (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">New Email Address</label>
                                    <input 
                                        type="email"
                                        className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                        placeholder="name@example.com"
                                        value={securityForm.newEmail}
                                        onChange={e => setSecurityForm({...securityForm, newEmail: e.target.value})}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">New Password</label>
                                    <input 
                                        type="password"
                                        className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                        placeholder="Min 6 characters"
                                        value={securityForm.newPassword}
                                        onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})}
                                    />
                                </div>
                            )}

                            <button 
                                onClick={handleSecurityUpdate}
                                disabled={isSecurityLoading}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg mt-2"
                            >
                                {isSecurityLoading ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                                Confirm Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
