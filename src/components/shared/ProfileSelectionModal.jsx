import React, { useState } from 'react';
import { X, Check, User as UserIcon, ChevronDown } from 'lucide-react';
import UserAvatar from './UserAvatar';

/**
 * ProfileSelectionModal
 * A reusable modal for confirming which profile to use for posts, chats, etc.
 *
 * @param {boolean} show - Whether to show the modal
 * @param {function} onConfirm - Callback with selected role: (role) => void
 * @param {function} onCancel - Callback when user cancels: () => void
 * @param {object} userData - User data with account types and active role
 * @param {object} subProfiles - User's sub-profiles keyed by account type
 * @param {string} title - Modal title (default: "Select Profile")
 * @param {string} message - Additional message to show (optional)
 * @param {array} excludeRoles - Roles to exclude from selection (optional, e.g., ['Fan', 'User'])
 */
export default function ProfileSelectionModal({
    show,
    onConfirm,
    onCancel,
    userData,
    subProfiles = {},
    title = "Select Profile",
    message = "Which profile would you like to use?",
    excludeRoles = ['Fan', 'User'],
}) {
    const [step, setStep] = useState('confirm'); // 'confirm' or 'select'
    const [selectedRole, setSelectedRole] = useState(null);

    if (!show) return null;

    const activeRole = userData?.activeProfileRole || userData?.accountTypes?.[0] || 'Fan';
    const activeProfile = subProfiles?.[activeRole] || {};
    const availableRoles = (userData?.accountTypes || [])
        .filter(role => !excludeRoles.includes(role))
        .filter(role => subProfiles?.[role]); // Only show roles that have sub-profiles

    const getDisplayRole = (role) => {
        if (!role || role === 'User' || role === 'Fan') return role || 'User';
        if (role === 'Talent') {
            const talentSub = subProfiles?.['Talent'];
            const subRole = talentSub?.profile_data?.talentSubRole || talentSub?.talentSubRole;
            if (subRole && subRole !== '') return subRole;
        }
        return role;
    };

    const getDisplayName = (role) => {
        const profile = subProfiles?.[role];
        return profile?.display_name || profile?.profile_data?.displayName || userData?.effectiveDisplayName || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'User';
    };

    const handleUseActive = () => {
        onConfirm(activeRole);
        resetModal();
    };

    const handleSelectDifferent = () => {
        setStep('select');
        setSelectedRole(activeRole);
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const handleConfirmSelection = () => {
        if (selectedRole) {
            onConfirm(selectedRole);
            resetModal();
        }
    };

    const resetModal = () => {
        setStep('confirm');
        setSelectedRole(null);
    };

    const handleClose = () => {
        resetModal();
        onCancel();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#2c2e36] w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95 border dark:border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                        <UserIcon size={20} className="text-brand-blue"/>
                        {title}
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <X size={20}/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {message && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>
                    )}

                    {step === 'confirm' && (
                        <div className="space-y-4">
                            {/* Active Profile Display */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <UserIcon size={16} className="text-brand-blue"/>
                                    <span className="text-sm font-bold text-brand-blue">Current Active Profile</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        src={activeProfile?.photo_url || userData?.photoURL}
                                        name={getDisplayName(activeRole)}
                                        size="lg"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold dark:text-white">{getDisplayName(activeRole)}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{getDisplayRole(activeRole)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleUseActive}
                                    className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-600 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Check size={18}/> Yes, Use Active Profile
                                </button>
                                <button
                                    onClick={handleSelectDifferent}
                                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                                >
                                    <UserIcon size={18}/> No, Select Different Profile
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'select' && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Choose a profile for this {title.toLowerCase()}:</p>

                            {availableRoles.map(role => {
                                const isSelected = selectedRole === role;
                                const profile = subProfiles?.[role] || {};

                                return (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleSelect(role)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                            isSelected
                                                ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <UserAvatar
                                            src={profile?.photo_url}
                                            name={getDisplayName(role)}
                                            size="md"
                                        />
                                        <div className="flex-1 text-left">
                                            <div className="font-bold dark:text-white">{getDisplayName(role)}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{getDisplayRole(role)}</div>
                                        </div>
                                        {isSelected && (
                                            <div className="bg-brand-blue text-white p-1 rounded-full">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleConfirmSelection}
                                    disabled={!selectedRole}
                                    className="flex-1 bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Check size={18}/> Confirm Selection
                                </button>
                                <button
                                    onClick={() => setStep('confirm')}
                                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:opacity-80"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
