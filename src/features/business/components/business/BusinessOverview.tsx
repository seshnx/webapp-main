import React, { useState } from 'react';
import { Building2, Wrench, Music, GraduationCap, ArrowRight } from 'lucide-react';

/**
 * Business option interface
 */
interface BusinessOption {
    id: 'studio' | 'tech' | 'label' | 'edu';
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    isComingSoon?: boolean;
}

/**
 * Props for BusinessOverview component
 */
export interface BusinessOverviewProps {
    user?: any;
    userData?: any;
    setActiveTab?: (tab: string) => void;
}

/**
 * BusinessOverview - Welcome page for selecting business types
 *
 * Allows users to choose their business type and launch the appropriate setup wizard.
 * Business types: Studio, Tech Shop, Label, EDU Institution
 */
export default function BusinessOverview({ user, userData, setActiveTab }: BusinessOverviewProps) {
    const businessOptions: BusinessOption[] = [
        {
            id: 'studio',
            title: 'Open A Studio',
            description: 'Set up your recording studio, manage rooms, bookings, and clients',
            icon: Building2,
            color: 'blue',
        },
        {
            id: 'tech',
            title: 'Start Your Tech Shop',
            description: 'Offer technical services, equipment repair, and studio installation',
            icon: Wrench,
            color: 'green',
        },
        {
            id: 'label',
            title: 'Register a Platform Label',
            description: 'Sign artists, manage releases, and grow your music label',
            icon: Music,
            color: 'purple',
        },
        {
            id: 'edu',
            title: 'Launch an EDU Institution',
            description: 'Create educational programs, manage students and staff',
            icon: GraduationCap,
            color: 'orange',
            isComingSoon: true,
        },
    ];

    const handleSelect = (option: BusinessOption) => {
        if (option.isComingSoon) return;

        // Redirect to appropriate setup wizard
        switch (option.id) {
            case 'studio':
                window.location.href = '/studio/setup';
                break;
            case 'tech':
                window.location.href = '/business/tech/setup';
                break;
            case 'label':
                window.location.href = '/business/label/setup';
                break;
            case 'edu':
                // Coming soon
                break;
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Business Center</h1>
                <p className="text-indigo-100 max-w-xl">
                    Start your music business journey. Choose your business type below to get started.
                </p>
            </div>

            {/* Business Type Selection */}
            <div>
                <h2 className="text-2xl font-bold dark:text-white mb-6">
                    What would you like to start?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {businessOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option)}
                                disabled={option.isComingSoon}
                                className={`
                                    relative bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700
                                    shadow-sm hover:shadow-md transition-all text-left group
                                    ${option.isComingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-blue dark:hover:border-brand-blue'}
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`
                                        w-14 h-14 rounded-xl flex items-center justify-center shrink-0
                                        bg-${option.color}-100 dark:bg-${option.color}-900/20
                                    `}>
                                        <IconComponent size={28} className={`text-${option.color}-600 dark:text-${option.color}-400`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold dark:text-white mb-2">
                                            {option.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {option.description}
                                        </p>
                                    </div>
                                    {!option.isComingSoon && (
                                        <ArrowRight size={20} className="text-gray-400 group-hover:text-brand-blue transition-colors" />
                                    )}
                                </div>
                                {option.isComingSoon && (
                                    <div className="absolute top-4 right-4">
                                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
                                            Coming Soon
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Existing Orgs Section */}
            {userData?.accountTypes && userData.accountTypes.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white mb-4">
                        Your Businesses
                    </h2>
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                        <p className="text-gray-500 dark:text-gray-400">
                            You have access to: {userData.accountTypes.join(', ')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
