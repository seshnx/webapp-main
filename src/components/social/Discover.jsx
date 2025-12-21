// src/components/social/Discover.jsx

import React, { useState } from 'react';
import { Music, User, Headphones, Building2, School } from 'lucide-react';
import SoundsDiscover from './discover/SoundsDiscover';
import ArtistsDiscover from './discover/ArtistsDiscover';
import ProducersDiscover from './discover/ProducersDiscover';
import StudiosDiscover from './discover/StudiosDiscover';
import SchoolsDiscover from './discover/SchoolsDiscover';

const DISCOVER_TABS = [
    { id: 'sounds', label: 'Sounds', icon: Music },
    { id: 'artists', label: 'Artists', icon: User },
    { id: 'producers', label: 'Producers', icon: Headphones },
    { id: 'studios', label: 'Studios', icon: Building2 },
    { id: 'schools', label: 'Schools', icon: School },
];

export default function Discover({ user, userData, openPublicProfile }) {
    const [activeTab, setActiveTab] = useState('sounds');

    const renderContent = () => {
        switch (activeTab) {
            case 'sounds':
                return (
                    <SoundsDiscover 
                        user={user} 
                        userData={userData} 
                        openPublicProfile={openPublicProfile}
                    />
                );
            case 'artists':
                return (
                    <ArtistsDiscover 
                        user={user} 
                        userData={userData} 
                        openPublicProfile={openPublicProfile}
                    />
                );
            case 'producers':
                return (
                    <ProducersDiscover 
                        user={user} 
                        userData={userData} 
                        openPublicProfile={openPublicProfile}
                    />
                );
            case 'studios':
                return (
                    <StudiosDiscover 
                        user={user} 
                        userData={userData} 
                        openPublicProfile={openPublicProfile}
                    />
                );
            case 'schools':
                return (
                    <SchoolsDiscover 
                        user={user} 
                        userData={userData}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mb-6 bg-white dark:bg-dark-card p-1.5 rounded-xl border dark:border-gray-700 shadow-sm overflow-x-auto">
                {DISCOVER_TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-brand-blue text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <Icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
}

