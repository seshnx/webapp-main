import React, { useState, useEffect, ReactElement, ComponentType } from 'react';
import { useLocation, useNavigate, Location } from 'react-router-dom';
import { useClerk } from '@clerk/react';
import {
    X, Loader2, Settings, Bell, Shield, Moon, Users, RefreshCw, Star,
    Filter, Lock, AlertTriangle, Key, Mail, CheckCircle, Eye, MapPin,
    MessageSquare, UserX, Download, Globe, Calendar, ShoppingBag,
    Image, Accessibility, Zap, Clock, Volume2, VolumeX, Monitor,
    Smartphone, Wifi, HardDrive, Languages, DollarSign, Video,
    FileText, Search, UserCheck, UserPlus, EyeOff, Hash, Save, Trash2, LucideIcon
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/@convex/api';
import { ACCOUNT_TYPES } from '@/config/constants';
import { useUserSettings, applySettingsToDom } from '@/hooks/useUserSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { BYPASS_ENABLED } from '@/utils/clerkOrgBypass';
import { detectContextFromPath, getRolesForContext } from '@/utils/contextDetection';
import type { AccountType, UserData } from '@/types';
import { useSettingsForm } from '../hooks/useSettingsForm';
import type { SettingsTabId, SettingsTabDef, SettingsUser, SettingsTabProps, ExtendedSettings } from '@/types';

// =====================================================
// HELPER COMPONENT TYPES
interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    label: string;
    description?: string;
    icon?: LucideIcon;
}

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[] | SelectOption[];
    icon?: LucideIcon;
    description?: string;
}

// Wrapper to handle string to AccountType conversion
const toAccountType = (value: string): AccountType => value as AccountType;

interface NumberInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    unit?: string;
    icon?: LucideIcon;
    description?: string;
}

interface ListManagerProps {
    title: string;
    items: string[];
    type: string;
    icon: LucideIcon;
}

// Security form state
interface SecurityFormState {
    newEmail: string;
    newPassword: string;
    currentPassword: string;
}

type SecurityAction = 'email' | 'password' | null;

// =====================================================
// CONSTANTS
// =====================================================

// Tab definitions - will be translated in component
const SETTINGS_TABS: SettingsTabDef[] = [
    { id: 'general', labelKey: 'general', icon: Settings },
    { id: 'security', labelKey: 'security', icon: Shield },
    { id: 'notifications', labelKey: 'notifications', icon: Bell },
    { id: 'messaging', labelKey: 'messaging', icon: MessageSquare },
    { id: 'social', labelKey: 'social', icon: Users },
    { id: 'bookings', labelKey: 'bookings', icon: Calendar },
    { id: 'marketplace', labelKey: 'marketplace', icon: ShoppingBag },
    { id: 'content', labelKey: 'content', icon: Image },
    { id: 'accessibility', labelKey: 'accessibility', icon: Accessibility },
    { id: 'performance', labelKey: 'performance', icon: Zap },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function SettingsTab({
    user,
    userData,
    onUpdate,
    onRoleSwitch,
    subProfiles = {}
}: SettingsTabProps): ReactElement {
    const { t, language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const clerk = useClerk();

    // Convex mutations
    const updateProfileMutation = useMutation(api.users.updateProfile);
    const updateSubProfileMutation = useMutation(api.users.updateSubProfile);

    // Get settings sub-tab from URL path
    const getSettingsTabFromPath = (path: string): SettingsTabId => {
        const parts = path.split('/').filter(Boolean);
        if (parts[0] === 'profile' && parts[1] === 'settings' && parts[2]) {
            return parts[2] as SettingsTabId;
        }
        return 'general';
    };

    const [activeTab, setActiveTab] = useState<SettingsTabId>(() => getSettingsTabFromPath(location.pathname));

    // Sync URL with active settings tab
    useEffect(() => {
        const currentPath = `/profile/settings/${activeTab}`;
        if (location.pathname !== currentPath) {
            navigate(currentPath, { replace: true });
        }
    }, [activeTab, navigate, location.pathname]);

    // Update tab when URL changes
    useEffect(() => {
        const tabFromPath = getSettingsTabFromPath(location.pathname);
        if (tabFromPath !== activeTab) {
            setActiveTab(tabFromPath);
        }
    }, [location.pathname]);


    const {
        localSettings, setLocalSettings, roles, setRoles, preferredRole, setPreferredRole,
        activeRole, setActiveRole, defaultProfileRole, setDefaultProfileRole,
        saving, setSaving, exporting, setExporting, activeSessions, setActiveSessions,
        isDeleting, setIsDeleting, deleteConfirm, setDeleteConfirm, showDeleteModal, setShowDeleteModal,
        roleToRemove, setRoleToRemove, showRoleRemoveModal, setShowRoleRemoveModal,
        showSecurityModal, setShowSecurityModal, securityAction, setSecurityAction,
        securityForm, setSecurityForm, isSecurityLoading, setIsSecurityLoading,
        handleToggle, handleValueChange, handleThemeChange, saveSettings, updateAccountTypes,
        toggleRole, confirmRoleRemoval, cancelRoleRemoval, openSecurityModal, handleSecurityUpdate,
        handleDataExport, handleDeleteAccount, clearCache, settingsLoading
    } = useSettingsForm({ user: user as any, userData, onUpdate, onRoleSwitch, subProfiles }, clerk);


    // =====================================================
    // HELPER COMPONENTS
    // =====================================================

    const ToggleSwitch = ({ checked, onChange, label, description, icon: Icon }: ToggleSwitchProps): ReactElement => (
        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <div className="flex items-center gap-3 flex-1">
                {Icon && <Icon size={16} className="text-gray-400 shrink-0" />}
                <div className="flex-1">
                    <span className="text-sm font-medium dark:text-gray-200 block">{label}</span>
                    {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <div
                onClick={onChange}
                className={`w-10 h-5 rounded-full p-0.5 flex cursor-pointer transition-colors shrink-0 ${
                    checked ? 'bg-brand-blue justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                }`}
            >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
        </div>
    );

    const SelectField = ({ label, value, onChange, options, icon: Icon, description }: SelectFieldProps): ReactElement => (
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                {Icon && <Icon size={12} />}
                {label}
            </label>
            {description && <p className="text-xs text-gray-500">{description}</p>}
            <select
                className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                {options.map(opt => (
                    <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                    </option>
                ))}
            </select>
        </div>
    );

    const NumberInput = ({ label, value, onChange, min, max, unit, icon: Icon, description }: NumberInputProps): ReactElement => (
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                {Icon && <Icon size={12} />}
                {label}
            </label>
            {description && <p className="text-xs text-gray-500">{description}</p>}
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    className="flex-1 p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    min={min}
                    max={max}
                />
                {unit && <span className="text-xs text-gray-500">{unit}</span>}
            </div>
        </div>
    );

    const ListManager = ({ title, items, type, icon: Icon }: ListManagerProps): ReactElement => (
        <div className="mt-4 border-t dark:border-gray-700 pt-4">
            <h5 className="text-sm font-bold dark:text-gray-300 mb-2 flex items-center gap-2">
                <Icon size={14}/> {title}
            </h5>
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

    const currentContext = detectContextFromPath(location.pathname);
    const displayedRoles = getRolesForContext(ACCOUNT_TYPES, currentContext);
    const activeTabInfo = SETTINGS_TABS.find(t => t.id === activeTab);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-hide border-b dark:border-gray-700">
                    {SETTINGS_TABS.map(tab => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-brand-blue text-brand-blue bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <TabIcon size={16} />
                                {t(tab.labelKey)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                        {activeTabInfo && <activeTabInfo.icon size={18} className="text-brand-blue" />}
                        {activeTabInfo ? t(activeTabInfo.labelKey) : t('general')}
                    </h3>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm font-medium transition"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {t('saveAll')}
                    </button>
                </div>

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        {/* Context Information Banner */}
                        {BYPASS_ENABLED && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
                                <AlertTriangle size={20} className="text-blue-600 dark:text-blue-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        Development Mode Active - Context-Based Role Filtering
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                        Roles are filtered by context ({currentContext === 'edu' ? 'EDU' : 'Studio'}). Navigate to /edu/* routes to see EDU roles.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Roles & Workflow */}
                        <div className="border-b dark:border-gray-700 pb-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
                                <Users size={16} className="text-purple-500"/> {t('rolesWorkflow')}
                            </h4>

                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                                    {t('activeAccountTypes')}
                                    <span className="ml-2 text-xs text-gray-400 normal-case">
                                        ({currentContext === 'edu' ? 'EDU Context' : 'Studio Context'})
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {displayedRoles.map(role => {
                                        const isEDURole = ['Student', 'EDUStaff', 'Intern', 'EDUAdmin'].includes(role);
                                        return (
                                            <button
                                                key={role}
                                                onClick={() => toggleRole(role)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                                                    roles.includes(role)
                                                        ? isEDURole
                                                            ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300'
                                                            : 'bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300'
                                                        : isEDURole
                                                            ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-transparent dark:border-amber-700 dark:text-amber-400'
                                                            : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-transparent dark:border-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {currentContext === 'edu'
                                        ? 'EDU roles are managed through the EDU platform.'
                                        : 'Studio roles are managed through your business settings.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <SelectField
                                    label={t('preferredProfile')}
                                    value={preferredRole}
                                    onChange={(val) => setPreferredRole(toAccountType(val))}
                                    options={roles.filter(r => displayedRoles.includes(r))}
                                    icon={Star}
                                />
                                <SelectField
                                    label={t('activeWorkflowContext')}
                                    value={activeRole}
                                    onChange={(val) => setActiveRole(toAccountType(val))}
                                    options={roles.filter(r => displayedRoles.includes(r))}
                                    icon={RefreshCw}
                                />
                                <SelectField
                                    label="Default Profile for Posts/Chats"
                                    value={defaultProfileRole}
                                    onChange={(val) => setDefaultProfileRole(toAccountType(val))}
                                    options={roles.filter(r => !HIDDEN_ROLES.includes(r))}
                                    icon={Star}
                                />
                            </div>

                            <ToggleSwitch
                                checked={localSettings.preferences?.seeAllProfiles || false}
                                onChange={() => handleToggle('preferences', 'seeAllProfiles')}
                                label={t('seeAllUnfiltered')}
                                description={t('seeAllDescription')}
                                icon={Filter}
                            />

                            <button
                                onClick={updateAccountTypes}
                                disabled={saving}
                                className="mt-4 w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>} {t('saveWorkflowSettings')}
                            </button>
                        </div>

                        {/* Appearance */}
                        <div className="border-b dark:border-gray-700 pb-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
                                <Moon size={16} className="text-purple-500"/> {t('appearance')}
                            </h4>
                            <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
                                {['light', 'dark', 'system'].map(theme => (
                                    <button
                                        key={theme}
                                        onClick={() => handleThemeChange(theme)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-md capitalize transition-all ${
                                            localSettings.theme === theme
                                                ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-blue'
                                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        {t(theme)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language & Localization */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
                                <Languages size={16} className="text-blue-500"/> {t('languageLocalization')}
                            </h4>

                            <SelectField
                                label={t('language')}
                                value={localSettings.language || 'en'}
                                onChange={val => {
                                    handleValueChange(null, 'language', val);
                                    // Update language context immediately
                                    if (typeof window !== 'undefined') {
                                        localStorage.setItem('language', val);
                                        document.documentElement.lang = val;
                                    }
                                }}
                                options={[
                                    { value: 'en', label: 'English' },
                                    { value: 'es', label: 'Español' },
                                    { value: 'fr', label: 'Français' },
                                    { value: 'de', label: 'Deutsch' },
                                ]}
                                icon={Globe}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Date Format"
                                    value={localSettings.dateFormat || 'MM/DD/YYYY'}
                                    onChange={val => handleValueChange(null, 'dateFormat', val)}
                                    options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']}
                                />
                                <SelectField
                                    label="Time Format"
                                    value={localSettings.timeFormat || '12h'}
                                    onChange={val => handleValueChange(null, 'timeFormat', val)}
                                    options={['12h', '24h']}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Timezone"
                                    value={localSettings.timezone || 'auto'}
                                    onChange={val => handleValueChange(null, 'timezone', val)}
                                    options={[
                                        { value: 'auto', label: 'Auto-detect' },
                                        { value: 'America/New_York', label: 'Eastern Time' },
                                        { value: 'America/Chicago', label: 'Central Time' },
                                        { value: 'America/Denver', label: 'Mountain Time' },
                                        { value: 'America/Los_Angeles', label: 'Pacific Time' },
                                    ]}
                                />
                                <SelectField
                                    label="Currency"
                                    value={localSettings.currency || 'USD'}
                                    onChange={val => handleValueChange(null, 'currency', val)}
                                    options={['USD', 'EUR', 'GBP', 'CAD', 'AUD']}
                                    icon={DollarSign}
                                />
                            </div>

                            <SelectField
                                label="Number Format"
                                value={localSettings.numberFormat || '1,000.00'}
                                onChange={val => handleValueChange(null, 'numberFormat', val)}
                                options={['1,000.00', '1.000,00', '1 000.00']}
                            />
                        </div>
                    </div>
                )}

                {/* Security & Privacy Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Account Security */}
                        <div className="border-b dark:border-gray-700 pb-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
                                <Shield size={16} className="text-blue-500"/> Account Security
                            </h4>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                                            <Mail size={18}/>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold dark:text-white">Email Address</div>
                                            <div className="text-xs text-gray-500">{user?.email || ''}</div>
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
                                            <div className="text-xs text-gray-500">Last changed: Unknown</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openSecurityModal('password')}
                                        className="text-xs font-bold bg-white dark:bg-gray-700 border dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                                    >
                                        Change Password
                                    </button>
                                </div>

                                <ToggleSwitch
                                    checked={localSettings.twoFactorEnabled || false}
                                    onChange={() => handleToggle(null, 'twoFactorEnabled')}
                                    label="Two-Factor Authentication (2FA)"
                                    description="Add an extra layer of security to your account"
                                    icon={Lock}
                                />
                            </div>
                        </div>

                        {/* Privacy Settings */}
                        <div className="border-b dark:border-gray-700 pb-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
                                <Eye size={16} className="text-green-500"/> Privacy & Visibility
                            </h4>

                            <div className="space-y-3">
                                <ToggleSwitch
                                    checked={localSettings.privacy?.publicProfile !== false}
                                    onChange={() => handleToggle('privacy', 'publicProfile')}
                                    label="Public Profile Visibility"
                                    description="Allow others to view your profile"
                                    icon={Eye}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.showLocation !== false}
                                    onChange={() => handleToggle('privacy', 'showLocation')}
                                    label="Show Location on Map"
                                    description="Display your location on studio maps"
                                    icon={MapPin}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.hideProfile || false}
                                    onChange={() => handleToggle('privacy', 'hideProfile')}
                                    label="Hide Profile Completely"
                                    description="Make your profile invisible to others"
                                    icon={EyeOff}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.showEmail || false}
                                    onChange={() => handleToggle('privacy', 'showEmail')}
                                    label="Show Email Address"
                                    description="Display your email on your profile"
                                    icon={Mail}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.showPhone || false}
                                    onChange={() => handleToggle('privacy', 'showPhone')}
                                    label="Show Phone Number"
                                    description="Display your phone on your profile"
                                    icon={Smartphone}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.showOnlineStatus !== false}
                                    onChange={() => handleToggle('privacy', 'showOnlineStatus')}
                                    label="Show Online Status"
                                    description="Let others see when you're online"
                                    icon={Monitor}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.showLastSeen !== false}
                                    onChange={() => handleToggle('privacy', 'showLastSeen')}
                                    label="Show Last Seen"
                                    description="Display when you were last active"
                                    icon={Clock}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.allowSearchEngines || false}
                                    onChange={() => handleToggle('privacy', 'allowSearchEngines')}
                                    label="Allow Search Engine Indexing"
                                    description="Let search engines index your profile"
                                    icon={Search}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.allowTagging !== false}
                                    onChange={() => handleToggle('privacy', 'allowTagging')}
                                    label="Allow Tagging"
                                    description="Let others tag you in posts"
                                    icon={Hash}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.reviewTagsBeforeAppear || false}
                                    onChange={() => handleToggle('privacy', 'reviewTagsBeforeAppear')}
                                    label="Review Tags Before They Appear"
                                    description="Approve tags before they show on your profile"
                                    icon={UserCheck}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.showFollowingList !== false}
                                    onChange={() => handleToggle('privacy', 'showFollowingList')}
                                    label="Show Following List"
                                    description="Let others see who you follow"
                                    icon={UserPlus}
                                />
                                <ToggleSwitch
                                    checked={localSettings.privacy?.showFollowersList !== false}
                                    onChange={() => handleToggle('privacy', 'showFollowersList')}
                                    label="Show Followers List"
                                    description="Let others see your followers"
                                    icon={Users}
                                />
                            </div>
                        </div>

                        {/* Content & Safety */}
                        <div>
                            <h4 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
                                <Shield size={16} className="text-red-500"/> Content & Safety
                            </h4>

                            <ListManager
                                title="Blocked Users"
                                items={localSettings.social?.blockedUsers || []}
                                type="blocks"
                                icon={UserX}
                            />
                        </div>

                        {/* Data Export */}
                        <div className="pt-4 border-t dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-bold dark:text-white">Your Data</span>
                                    <p className="text-xs text-gray-500">Download a copy of your personal data (GDPR/CCPA).</p>
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

                        {/* Danger Zone */}
                        <div className="pt-4 border-t dark:border-gray-700">
                            <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                <Lock size={16}/> Danger Zone
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                Deleting your account is permanent. This action will remove your profile, posts, and messages.
                            </p>

                            {!showDeleteModal ? (
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-bold transition"
                                >
                                    Delete Account
                                </button>
                            ) : (
                                <div className="bg-white dark:bg-[#1f2128] p-4 rounded-xl border border-red-200 dark:border-red-900 shadow-lg">
                                    <h5 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                        <AlertTriangle size={16}/> Confirm Deletion
                                    </h5>
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
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <div className="border-b dark:border-gray-700 pb-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
                                <Bell size={16} className="text-brand-blue"/> General Notifications
                            </h4>
                            <div className="space-y-3">
                                <ToggleSwitch
                                    checked={localSettings.notifications?.email !== false}
                                    onChange={() => handleToggle('notifications', 'email')}
                                    label="Email Notifications"
                                    icon={Mail}
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.push !== false}
                                    onChange={() => handleToggle('notifications', 'push')}
                                    label="Push Notifications"
                                    icon={Bell}
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.marketing || false}
                                    onChange={() => handleToggle('notifications', 'marketing')}
                                    label="Marketing & Updates"
                                    icon={Star}
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.soundEnabled !== false}
                                    onChange={() => handleToggle('notifications', 'soundEnabled')}
                                    label="Sound Notifications"
                                    icon={Volume2}
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.badgeCount !== false}
                                    onChange={() => handleToggle('notifications', 'badgeCount')}
                                    label="Badge Count"
                                    description="Show unread count on app icon"
                                />
                            </div>
                        </div>

                        <div className="border-b dark:border-gray-700 pb-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4">Booking Notifications</h4>
                            <div className="space-y-3">
                                <ToggleSwitch
                                    checked={localSettings.notifications?.booking?.newRequests !== false}
                                    onChange={() => handleToggle('notifications', 'booking', 'newRequests')}
                                    label="New Booking Requests"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.booking?.confirmations !== false}
                                    onChange={() => handleToggle('notifications', 'booking', 'confirmations')}
                                    label="Booking Confirmations"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.booking?.reminders !== false}
                                    onChange={() => handleToggle('notifications', 'booking', 'reminders')}
                                    label="Booking Reminders"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.booking?.cancellations !== false}
                                    onChange={() => handleToggle('notifications', 'booking', 'cancellations')}
                                    label="Booking Cancellations"
                                />
                            </div>
                        </div>

                        <div className="border-b dark:border-gray-700 pb-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4">Social Notifications</h4>
                            <div className="space-y-3">
                                <ToggleSwitch
                                    checked={localSettings.notifications?.social?.likes !== false}
                                    onChange={() => handleToggle('notifications', 'social', 'likes')}
                                    label="Likes"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.social?.comments !== false}
                                    onChange={() => handleToggle('notifications', 'social', 'comments')}
                                    label="Comments"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.social?.follows !== false}
                                    onChange={() => handleToggle('notifications', 'social', 'follows')}
                                    label="Follows"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.social?.mentions !== false}
                                    onChange={() => handleToggle('notifications', 'social', 'mentions')}
                                    label="Mentions"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.social?.reposts !== false}
                                    onChange={() => handleToggle('notifications', 'social', 'reposts')}
                                    label="Reposts"
                                />
                            </div>
                        </div>

                        <div className="border-b dark:border-gray-700 pb-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4">Marketplace Notifications</h4>
                            <div className="space-y-3">
                                <ToggleSwitch
                                    checked={localSettings.notifications?.marketplace?.newOffers !== false}
                                    onChange={() => handleToggle('notifications', 'marketplace', 'newOffers')}
                                    label="New Offers"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.marketplace?.sales !== false}
                                    onChange={() => handleToggle('notifications', 'marketplace', 'sales')}
                                    label="Sales"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.marketplace?.messages !== false}
                                    onChange={() => handleToggle('notifications', 'marketplace', 'messages')}
                                    label="Messages"
                                />
                            </div>
                        </div>

                        <div className="border-b dark:border-gray-700 pb-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4">System Notifications</h4>
                            <div className="space-y-3">
                                <ToggleSwitch
                                    checked={localSettings.notifications?.system?.maintenance !== false}
                                    onChange={() => handleToggle('notifications', 'system', 'maintenance')}
                                    label="Maintenance Alerts"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.system?.updates !== false}
                                    onChange={() => handleToggle('notifications', 'system', 'updates')}
                                    label="Updates"
                                />
                                <ToggleSwitch
                                    checked={localSettings.notifications?.system?.security !== false}
                                    onChange={() => handleToggle('notifications', 'system', 'security')}
                                    label="Security Alerts"
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold dark:text-white mb-4">Quiet Hours</h4>
                            <ToggleSwitch
                                checked={localSettings.notifications?.quietHours?.enabled || false}
                                onChange={() => handleToggle('notifications', 'quietHours', 'enabled')}
                                label="Enable Quiet Hours"
                                description="Disable notifications during specific times"
                            />
                            {localSettings.notifications?.quietHours?.enabled && (
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                            value={localSettings.notifications?.quietHours?.start || '22:00'}
                                            onChange={e => {
                                                setLocalSettings(prev => ({
                                                    ...prev,
                                                    notifications: {
                                                        ...prev.notifications,
                                                        quietHours: {
                                                            ...prev.notifications?.quietHours,
                                                            start: e.target.value
                                                        }
                                                    }
                                                }));
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                            value={localSettings.notifications?.quietHours?.end || '08:00'}
                                            onChange={e => {
                                                setLocalSettings(prev => ({
                                                    ...prev,
                                                    notifications: {
                                                        ...prev.notifications,
                                                        quietHours: {
                                                            ...prev.notifications?.quietHours,
                                                            end: e.target.value
                                                        }
                                                    }
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Messaging Tab */}
                {activeTab === 'messaging' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <ToggleSwitch
                                checked={localSettings.messaging?.readReceipts !== false}
                                onChange={() => handleToggle('messaging', 'readReceipts')}
                                label="Read Receipts"
                                description="Show when messages are read"
                                icon={CheckCircle}
                            />
                            <ToggleSwitch
                                checked={localSettings.messaging?.typingIndicators !== false}
                                onChange={() => handleToggle('messaging', 'typingIndicators')}
                                label="Typing Indicators"
                                description="Show when someone is typing"
                                icon={MessageSquare}
                            />
                            <ToggleSwitch
                                checked={localSettings.messaging?.messageRequests || false}
                                onChange={() => handleToggle('messaging', 'messageRequests')}
                                label="Message Requests"
                                description="Require approval for messages from non-contacts"
                                icon={UserCheck}
                            />
                            <SelectField
                                label="Who Can Message You"
                                value={localSettings.messaging?.whoCanMessage || 'everyone'}
                                onChange={val => handleValueChange('messaging', 'whoCanMessage', val)}
                                options={[
                                    { value: 'everyone', label: 'Everyone' },
                                    { value: 'followers', label: 'Followers Only' },
                                    { value: 'none', label: 'No One' },
                                ]}
                                icon={UserX}
                            />
                            <ToggleSwitch
                                checked={localSettings.messaging?.autoArchive || false}
                                onChange={() => handleToggle('messaging', 'autoArchive')}
                                label="Auto-archive Old Conversations"
                                description="Automatically archive conversations older than 30 days"
                            />
                            <ToggleSwitch
                                checked={localSettings.messaging?.soundNotifications !== false}
                                onChange={() => handleToggle('messaging', 'soundNotifications')}
                                label="Sound Notifications for Messages"
                                icon={Volume2}
                            />
                            <ToggleSwitch
                                checked={localSettings.messaging?.previewInNotifications !== false}
                                onChange={() => handleToggle('messaging', 'previewInNotifications')}
                                label="Message Preview in Notifications"
                                description="Show message content in notifications"
                            />
                        </div>

                        <ListManager
                            title="Muted Threads"
                            items={localSettings.messaging?.mutedThreads || []}
                            type="mutes"
                            icon={VolumeX}
                        />
                        <ListManager
                            title="Blocked Contacts"
                            items={localSettings.messaging?.blockedContacts || []}
                            type="blocks"
                            icon={UserX}
                        />
                    </div>
                )}

                {/* Social & Feed Tab */}
                {activeTab === 'social' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <SelectField
                                label="Feed Algorithm"
                                value={localSettings.social?.feedAlgorithm || 'recommended'}
                                onChange={val => handleValueChange('social', 'feedAlgorithm', val)}
                                options={[
                                    { value: 'chronological', label: 'Chronological' },
                                    { value: 'recommended', label: 'Recommended' },
                                    { value: 'following', label: 'Following Only' },
                                ]}
                                icon={RefreshCw}
                            />
                            <ToggleSwitch
                                checked={localSettings.social?.autoPlayVideos !== false}
                                onChange={() => handleToggle('social', 'autoPlayVideos')}
                                label="Auto-play Videos in Feed"
                                icon={Video}
                            />
                            <ToggleSwitch
                                checked={localSettings.social?.showSensitiveContentWarning !== false}
                                onChange={() => handleToggle('social', 'showSensitiveContentWarning')}
                                label="Show Sensitive Content Warning"
                            />
                            <ToggleSwitch
                                checked={localSettings.social?.showActivityStatus !== false}
                                onChange={() => handleToggle('social', 'showActivityStatus')}
                                label="Show Activity Status"
                                description="Let others see when you're active"
                            />
                            <ToggleSwitch
                                checked={localSettings.social?.showSuggestedAccounts !== false}
                                onChange={() => handleToggle('social', 'showSuggestedAccounts')}
                                label="Show Suggested Accounts"
                            />
                        </div>

                        <div className="border-t dark:border-gray-700 pt-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4">Content Filtering</h4>
                            <div className="space-y-3">
                                <SelectField
                                    label="Sensitivity Filter"
                                    value={localSettings.contentFiltering?.sensitivityFilter || 'medium'}
                                    onChange={val => handleValueChange('contentFiltering', 'sensitivityFilter', val)}
                                    options={[
                                        { value: 'off', label: 'Off' },
                                        { value: 'low', label: 'Low' },
                                        { value: 'medium', label: 'Medium' },
                                        { value: 'high', label: 'High' },
                                    ]}
                                />
                                <ToggleSwitch
                                    checked={localSettings.contentFiltering?.autoHideReported !== false}
                                    onChange={() => handleToggle('contentFiltering', 'autoHideReported')}
                                    label="Auto-hide Reported Content"
                                />
                                <ToggleSwitch
                                    checked={localSettings.contentFiltering?.showAgeRestricted || false}
                                    onChange={() => handleToggle('contentFiltering', 'showAgeRestricted')}
                                    label="Show Age-Restricted Content"
                                />
                            </div>
                        </div>

                        <ListManager
                            title="Muted Users"
                            items={localSettings.social?.mutedUsers || []}
                            type="mutes"
                            icon={VolumeX}
                        />
                        <ListManager
                            title="Blocked Users"
                            items={localSettings.social?.blockedUsers || []}
                            type="blocks"
                            icon={UserX}
                        />
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <ToggleSwitch
                                checked={localSettings.bookings?.autoAccept || false}
                                onChange={() => handleToggle('bookings', 'autoAccept')}
                                label="Auto-accept Bookings"
                                description="Automatically accept bookings that meet your criteria"
                            />
                            <NumberInput
                                label="Default Buffer Time"
                                value={localSettings.bookings?.defaultBufferTime || 15}
                                onChange={val => handleValueChange('bookings', 'defaultBufferTime', val)}
                                min={0}
                                max={120}
                                unit="minutes"
                                icon={Clock}
                                description="Time between sessions"
                            />
                            <ToggleSwitch
                                checked={localSettings.bookings?.showAvailabilityPublicly || false}
                                onChange={() => handleToggle('bookings', 'showAvailabilityPublicly')}
                                label="Show Availability Calendar Publicly"
                            />
                            <ToggleSwitch
                                checked={localSettings.bookings?.requireDeposit || false}
                                onChange={() => handleToggle('bookings', 'requireDeposit')}
                                label="Require Deposit for Bookings"
                            />
                            <ToggleSwitch
                                checked={localSettings.bookings?.autoDeclineExpired !== false}
                                onChange={() => handleToggle('bookings', 'autoDeclineExpired')}
                                label="Auto-decline Expired Booking Requests"
                            />
                            <NumberInput
                                label="Default Session Duration"
                                value={localSettings.bookings?.defaultSessionDuration || 60}
                                onChange={val => handleValueChange('bookings', 'defaultSessionDuration', val)}
                                min={15}
                                max={480}
                                unit="minutes"
                                icon={Clock}
                            />
                        </div>

                        <div className="border-t dark:border-gray-700 pt-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4">Booking Notifications</h4>
                            <div className="space-y-3">
                                <ToggleSwitch
                                    checked={localSettings.bookings?.notifications?.newRequests !== false}
                                    onChange={() => handleToggle('bookings', 'notifications', 'newRequests')}
                                    label="New Booking Requests"
                                />
                                <ToggleSwitch
                                    checked={localSettings.bookings?.notifications?.confirmations !== false}
                                    onChange={() => handleToggle('bookings', 'notifications', 'confirmations')}
                                    label="Booking Confirmations"
                                />
                                <ToggleSwitch
                                    checked={localSettings.bookings?.notifications?.reminders !== false}
                                    onChange={() => handleToggle('bookings', 'notifications', 'reminders')}
                                    label="Booking Reminders"
                                />
                                <ToggleSwitch
                                    checked={localSettings.bookings?.notifications?.cancellations !== false}
                                    onChange={() => handleToggle('bookings', 'notifications', 'cancellations')}
                                    label="Booking Cancellations"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Marketplace Tab */}
                {activeTab === 'marketplace' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <ToggleSwitch
                                checked={localSettings.marketplace?.autoListItems || false}
                                onChange={() => handleToggle('marketplace', 'autoListItems')}
                                label="Auto-list Items"
                                description="Automatically list items for sale"
                            />
                            <ToggleSwitch
                                checked={localSettings.marketplace?.requireApproval !== false}
                                onChange={() => handleToggle('marketplace', 'requireApproval')}
                                label="Require Approval"
                                description="Review items before they go live"
                            />
                            <SelectField
                                label="Default Shipping Method"
                                value={localSettings.marketplace?.defaultShippingMethod || 'standard'}
                                onChange={val => handleValueChange('marketplace', 'defaultShippingMethod', val)}
                                options={['standard', 'express', 'overnight', 'pickup']}
                            />
                            <SelectField
                                label="Default Payment Terms"
                                value={localSettings.marketplace?.defaultPaymentTerms || 'immediate'}
                                onChange={val => handleValueChange('marketplace', 'defaultPaymentTerms', val)}
                                options={[
                                    { value: 'immediate', label: 'Immediate' },
                                    { value: 'net15', label: 'Net 15' },
                                    { value: 'net30', label: 'Net 30' },
                                ]}
                            />
                            <ToggleSwitch
                                checked={localSettings.marketplace?.autoAcceptOffersAbove || false}
                                onChange={() => handleToggle('marketplace', 'autoAcceptOffersAbove')}
                                label="Auto-accept Offers Above Threshold"
                            />
                            {localSettings.marketplace?.autoAcceptOffersAbove && (
                                <NumberInput
                                    label="Auto-accept Threshold"
                                    value={localSettings.marketplace?.autoAcceptThreshold || 0}
                                    onChange={val => handleValueChange('marketplace', 'autoAcceptThreshold', val)}
                                    min={0}
                                    unit="$"
                                    icon={DollarSign}
                                />
                            )}
                            <ToggleSwitch
                                checked={localSettings.marketplace?.showSoldItems !== false}
                                onChange={() => handleToggle('marketplace', 'showSoldItems')}
                                label="Show Sold Items in Listings"
                            />
                        </div>

                        <div className="border-t dark:border-gray-700 pt-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4">Marketplace Notifications</h4>
                            <div className="space-y-3">
                                <ToggleSwitch
                                    checked={localSettings.marketplace?.notifications?.newOffers !== false}
                                    onChange={() => handleToggle('marketplace', 'notifications', 'newOffers')}
                                    label="New Offers"
                                />
                                <ToggleSwitch
                                    checked={localSettings.marketplace?.notifications?.sales !== false}
                                    onChange={() => handleToggle('marketplace', 'notifications', 'sales')}
                                    label="Sales"
                                />
                                <ToggleSwitch
                                    checked={localSettings.marketplace?.notifications?.messages !== false}
                                    onChange={() => handleToggle('marketplace', 'notifications', 'messages')}
                                    label="Messages"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Content & Media Tab */}
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <SelectField
                                label="Image Quality"
                                value={localSettings.content?.imageQuality || 'high'}
                                onChange={val => handleValueChange('content', 'imageQuality', val)}
                                options={[
                                    { value: 'high', label: 'High' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'low', label: 'Low (Faster Loading)' },
                                ]}
                                icon={Image}
                            />
                            <SelectField
                                label="Video Quality"
                                value={localSettings.content?.videoQuality || 'high'}
                                onChange={val => handleValueChange('content', 'videoQuality', val)}
                                options={[
                                    { value: 'high', label: 'High' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'low', label: 'Low (Faster Loading)' },
                                ]}
                                icon={Video}
                            />
                            <ToggleSwitch
                                checked={localSettings.content?.autoSaveUploaded !== false}
                                onChange={() => handleToggle('content', 'autoSaveUploaded')}
                                label="Auto-save Uploaded Media"
                                description="Automatically save uploaded images and videos"
                            />
                            <ToggleSwitch
                                checked={localSettings.content?.compressImages !== false}
                                onChange={() => handleToggle('content', 'compressImages')}
                                label="Compress Images Before Upload"
                                description="Reduce file size for faster uploads"
                            />
                            <NumberInput
                                label="Maximum Upload Size"
                                value={localSettings.content?.maxUploadSize || 10}
                                onChange={val => handleValueChange('content', 'maxUploadSize', val)}
                                min={1}
                                max={100}
                                unit="MB"
                                icon={FileText}
                            />
                        </div>
                    </div>
                )}

                {/* Accessibility Tab */}
                {activeTab === 'accessibility' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <SelectField
                                label="Font Size"
                                value={localSettings.accessibility?.fontSize || 'medium'}
                                onChange={val => handleValueChange('accessibility', 'fontSize', val)}
                                options={[
                                    { value: 'small', label: 'Small' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'large', label: 'Large' },
                                    { value: 'xlarge', label: 'Extra Large' },
                                ]}
                                icon={FileText}
                            />
                            <ToggleSwitch
                                checked={localSettings.accessibility?.reducedMotion || false}
                                onChange={() => handleToggle('accessibility', 'reducedMotion')}
                                label="Reduced Motion"
                                description="Disable animations for better accessibility"
                            />
                            <ToggleSwitch
                                checked={localSettings.accessibility?.highContrast || false}
                                onChange={() => handleToggle('accessibility', 'highContrast')}
                                label="High Contrast Mode"
                                description="Increase contrast for better visibility"
                            />
                            <ToggleSwitch
                                checked={localSettings.accessibility?.screenReaderAnnouncements !== false}
                                onChange={() => handleToggle('accessibility', 'screenReaderAnnouncements')}
                                label="Screen Reader Announcements"
                                description="Enable announcements for screen readers"
                            />
                            <ToggleSwitch
                                checked={localSettings.accessibility?.keyboardHints !== false}
                                onChange={() => handleToggle('accessibility', 'keyboardHints')}
                                label="Keyboard Navigation Hints"
                                description="Show hints for keyboard navigation"
                            />
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Navigation</p>
                            </div>
                            <ToggleSwitch
                                checked={localSettings.ui?.showBreadcrumbs === true}
                                onChange={() => handleToggle('ui', 'showBreadcrumbs')}
                                label="Show Breadcrumb Navigation"
                                description="Display breadcrumb trail at the top of the page"
                            />
                        </div>
                    </div>
                )}

                {/* Performance Tab */}
                {activeTab === 'performance' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <SelectField
                                label="Data Usage"
                                value={localSettings.performance?.dataUsage || 'auto'}
                                onChange={val => handleValueChange('performance', 'dataUsage', val)}
                                options={[
                                    { value: 'wifi-only', label: 'WiFi Only (for media)' },
                                    { value: 'auto', label: 'Auto' },
                                    { value: 'never', label: 'Never (save data)' },
                                ]}
                                icon={Wifi}
                            />
                            <ToggleSwitch
                                checked={localSettings.performance?.offlineMode || false}
                                onChange={() => handleToggle('performance', 'offlineMode')}
                                label="Offline Mode"
                                description="Enable offline functionality"
                            />
                            <ToggleSwitch
                                checked={localSettings.performance?.backgroundSync !== false}
                                onChange={() => handleToggle('performance', 'backgroundSync')}
                                label="Background Sync"
                                description="Sync data in the background"
                            />
                            <ToggleSwitch
                                checked={localSettings.performance?.autoClearOldNotifications !== false}
                                onChange={() => handleToggle('performance', 'autoClearOldNotifications')}
                                label="Auto-clear Old Notifications"
                            />
                            {localSettings.performance?.autoClearOldNotifications && (
                                <NumberInput
                                    label="Clear After"
                                    value={localSettings.performance?.autoClearAfterDays || 30}
                                    onChange={val => handleValueChange('performance', 'autoClearAfterDays', val)}
                                    min={1}
                                    max={365}
                                    unit="days"
                                    icon={Clock}
                                />
                            )}
                        </div>

                        <div className="border-t dark:border-gray-700 pt-6">
                            <h4 className="text-sm font-bold dark:text-white mb-4">Cache Management</h4>
                            <button
                                onClick={clearCache}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition"
                            >
                                <HardDrive size={16} />
                                Clear Cache
                            </button>
                            <p className="text-xs text-gray-500 mt-2">Clear cached data to free up storage space</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Security Modal */}
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

            {/* Role Removal Confirmation Modal */}
            {showRoleRemoveModal && roleToRemove && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] w-full max-w-md rounded-xl p-6 shadow-2xl animate-in zoom-in-95 border dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <Trash2 size={20} className="text-red-500"/>
                                Remove {roleToRemove} Role?
                            </h3>
                            <button onClick={cancelRoleRemoval} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>Warning:</strong> You have a profile configured for the {roleToRemove} role with data. Removing this role will:
                                </p>
                                <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 list-disc list-inside space-y-1">
                                    <li>Delete all your {roleToRemove} profile data</li>
                                    <li>Remove this role from your account</li>
                                    <li>This action cannot be undone</li>
                                </ul>
                            </div>

                            {roleToRemove === activeRole && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Note:</strong> This is your active role. You'll be switched to another available role after removal.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={confirmRoleRemoval}
                                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Trash2 size={16}/> Remove Role
                                </button>
                                <button
                                    onClick={cancelRoleRemoval}
                                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-bold hover:opacity-80"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
