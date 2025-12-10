import React, { useState } from 'react';
import { 
    Briefcase, Home, Globe, Users, ChevronRight, 
    Building2, Music2, BarChart3, Settings2
} from 'lucide-react';

// Import business components
import StudioManager from './StudioManager';
import LabelManager from './LabelManager';
import DistributionManager from './marketplace/DistributionManager';

/**
 * BusinessCenter - Consolidated hub for all business-related features
 * 
 * Tabs:
 * 1. Studio Operations - Manage studio settings, rooms, amenities
 * 2. Distribution - Music distribution to streaming platforms
 * 3. Label/Roster - Manage artist roster (for labels/agents)
 */
export default function BusinessCenter({ user, userData }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Determine which features the user has access to
    const isStudio = userData?.accountTypes?.includes('Studio');
    const isLabel = userData?.accountTypes?.some(t => ['Label', 'Agent'].includes(t));
    const isArtist = userData?.accountTypes?.some(t => ['Artist', 'Producer', 'Engineer', 'DJ'].includes(t));
    
    // Everyone with business features gets distribution access
    const hasDistribution = isStudio || isLabel || isArtist;

    // Build available tabs based on user roles
    const tabs = [
        { 
            id: 'overview', 
            label: 'Overview', 
            icon: <Briefcase size={18} />,
            available: true
        },
        { 
            id: 'studio', 
            label: 'Studio Ops', 
            icon: <Home size={18} />,
            available: isStudio,
            description: 'Manage rooms, rates & amenities'
        },
        { 
            id: 'distribution', 
            label: 'Distribution', 
            icon: <Globe size={18} />,
            available: hasDistribution,
            description: 'Release music to streaming platforms'
        },
        { 
            id: 'roster', 
            label: 'Artist Roster', 
            icon: <Users size={18} />,
            available: isLabel,
            description: 'Manage your signed artists'
        },
    ].filter(tab => tab.available);

    // Stats for overview
    const stats = [
        { label: 'Account Type', value: userData?.accountTypes?.join(', ') || 'User', icon: <Building2 size={16} /> },
        { label: 'Studio Rooms', value: userData?.rooms?.length || 0, icon: <Home size={16} />, show: isStudio },
        { label: 'Releases', value: '—', icon: <Music2 size={16} />, show: hasDistribution },
        { label: 'Roster Artists', value: '—', icon: <Users size={16} />, show: isLabel },
    ].filter(s => s.show !== false);

    // Quick actions based on roles
    const quickActions = [
        { 
            id: 'studio', 
            title: 'Studio Settings', 
            description: 'Configure your studio rooms, rates, and amenities',
            icon: <Home className="text-blue-500" />,
            color: 'blue',
            show: isStudio
        },
        { 
            id: 'distribution', 
            title: 'New Release', 
            description: 'Distribute your music to 150+ streaming platforms',
            icon: <Globe className="text-green-500" />,
            color: 'green',
            show: hasDistribution
        },
        { 
            id: 'roster', 
            title: 'Manage Roster', 
            description: 'Sign artists and manage your label roster',
            icon: <Users className="text-purple-500" />,
            color: 'purple',
            show: isLabel
        },
    ].filter(a => a.show);

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'studio':
                return <StudioManager user={user} userData={userData} />;
            case 'distribution':
                return <DistributionManager user={user} userData={userData} />;
            case 'roster':
                return <LabelManager user={user} userData={userData} />;
            case 'overview':
            default:
                return (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Welcome Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold mb-2">Business Center</h1>
                                <p className="text-indigo-100 max-w-xl">
                                    Manage your studio operations, distribute music, and grow your roster — all in one place.
                                </p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                                        {stat.icon}
                                        <span className="text-xs font-bold uppercase tracking-wide">{stat.label}</span>
                                    </div>
                                    <div className="text-2xl font-bold dark:text-white">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        {quickActions.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                                    <Settings2 size={20} className="text-gray-400" />
                                    Quick Actions
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {quickActions.map(action => (
                                        <button
                                            key={action.id}
                                            onClick={() => setActiveTab(action.id)}
                                            className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-left group hover:border-brand-blue dark:hover:border-brand-blue"
                                        >
                                            <div className={`w-12 h-12 rounded-xl bg-${action.color}-50 dark:bg-${action.color}-900/20 flex items-center justify-center mb-4`}>
                                                {action.icon}
                                            </div>
                                            <h3 className="font-bold dark:text-white mb-1 flex items-center gap-2">
                                                {action.title}
                                                <ChevronRight size={16} className="text-gray-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {action.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Business Features Message */}
                        {quickActions.length === 0 && (
                            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Briefcase size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white mb-2">No Business Features Enabled</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                                    Upgrade your account to access studio management, music distribution, and label features.
                                </p>
                                <p className="text-sm text-gray-400">
                                    Update your profile to add "Studio", "Artist", "Label", or "Agent" account types.
                                </p>
                            </div>
                        )}

                        {/* Features Coming Soon */}
                        <div className="bg-gray-50 dark:bg-[#1f2128] rounded-xl p-6 border dark:border-gray-700">
                            <h3 className="font-bold dark:text-white mb-3 flex items-center gap-2">
                                <BarChart3 size={18} className="text-brand-blue" />
                                Coming Soon
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                                    Advanced Analytics Dashboard
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                                    Royalty Management & Splits
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                                    Contract Templates
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                                    Multi-Artist Collaboration Tools
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Tab Navigation */}
            <div className="mb-6 bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-1.5 flex flex-wrap gap-1 shadow-sm sticky top-0 z-10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                            ${activeTab === tab.id 
                                ? 'bg-brand-blue text-white shadow-md' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                        `}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {renderContent()}
        </div>
    );
}
