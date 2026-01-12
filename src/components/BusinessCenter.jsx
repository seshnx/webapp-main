import React, { useState } from 'react';
import {
    Briefcase, Home, Globe, Users, ChevronRight,
    Building2, Music2, BarChart3, Settings2
} from 'lucide-react';

// Import business components
import StudioManager from './StudioManager';
import LabelDashboard from './labels/LabelDashboard';
import DistributionManager from './marketplace/DistributionManager';
import BusinessOverview from './business/BusinessOverview';

/**
 * BusinessCenter - Consolidated hub for all business-related features
 *
 * Tabs:
 * 1. Overview - Real-time metrics for each business type
 * 2. Studio Operations - Manage studio settings, rooms, amenities
 * 3. Distribution - Music distribution to streaming platforms
 * 4. Label/Roster - Manage artist roster (for labels/agents)
 */
export default function BusinessCenter({ user, userData }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Determine which features the user has access to
    const isStudio = userData?.accountTypes?.includes('Studio');
    const isLabel = userData?.accountTypes?.some(t => ['Label', 'Agent'].includes(t));
    const isArtist = userData?.accountTypes?.some(t => ['Talent', 'Producer', 'Engineer'].includes(t));

    // Everyone with business features gets distribution access
    const hasDistribution = isStudio || isLabel || isArtist;

    // Build available tabs based on user roles
    const tabs = [
        {
            id: 'overview',
            label: 'Overview',
            icon: Briefcase,
            iconSize: 18,
            available: true
        },
        {
            id: 'studio',
            label: 'Studio Ops',
            icon: Home,
            iconSize: 18,
            available: isStudio,
            description: 'Manage rooms, rates & amenities'
        },
        {
            id: 'distribution',
            label: 'Distribution',
            icon: Globe,
            iconSize: 18,
            available: hasDistribution,
            description: 'Release music to streaming platforms'
        },
        {
            id: 'roster',
            label: 'Artist Roster',
            icon: Users,
            iconSize: 18,
            available: isLabel,
            description: 'Manage your signed artists'
        },
    ].filter(tab => tab.available);

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'studio':
                return <StudioManager user={user} userData={userData} />;
            case 'distribution':
                return <DistributionManager user={user} userData={userData} />;
            case 'roster':
                return <LabelDashboard user={user} userData={userData} />;
            case 'overview':
            default:
                return <BusinessOverview user={user} userData={userData} setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Tab Navigation */}
            <div className="mb-6 bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-1.5 flex flex-wrap gap-1 shadow-sm sticky top-0 z-10">
                {tabs.map(tab => {
                    const IconComponent = tab.icon;
                    return (
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
                            <IconComponent size={tab.iconSize} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            {renderContent()}
        </div>
    );
}
