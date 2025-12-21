import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GearExchange from './marketplace/GearExchange';
import SeshFxStore from './marketplace/SeshFxStore'; // Sample Pack Store

export default function Marketplace({ user, userData, tokenBalance }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'gear';
    const [subTab, setSubTab] = useState(initialTab);

    // Update tab when URL params change
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && (tabParam === 'gear' || tabParam === 'fx')) {
            setSubTab(tabParam);
        }
    }, [searchParams]);

    // Update URL when tab changes
    const handleTabChange = (tab) => {
        setSubTab(tab);
        if (tab === 'gear') {
            setSearchParams({});
        } else {
            setSearchParams({ tab });
        }
    };

    const tabs = [
        { id: 'gear', label: 'Gear Exchange' },
        { id: 'fx', label: 'SeshFX Store' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">Marketplace</h1>
                <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-700 flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                                subTab === tab.id 
                                ? 'bg-brand-blue text-white shadow-md' 
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="tab-content-wrapper">
                {subTab === 'gear' && (
                    <div key="gear" className="tab-content">
                        <GearExchange user={user} userData={userData} />
                    </div>
                )}
                {subTab === 'fx' && (
                    <div key="fx" className="tab-content">
                        <SeshFxStore user={user} tokenBalance={tokenBalance} />
                    </div>
                )}
            </div>
        </div>
    );
}
