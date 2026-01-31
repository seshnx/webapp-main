import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GearExchange from './marketplace/GearExchange';
import SeshFxStore from './marketplace/SeshFxStore'; // Sample Pack Store
import { useLanguage } from '../contexts/LanguageContext';

export default function Marketplace({ user, userData, tokenBalance }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    
    // Get tab from URL path (e.g., /marketplace/fx -> 'fx')
    const getTabFromPath = (path) => {
        const parts = path.split('/').filter(Boolean);
        if (parts[0] === 'marketplace' && parts[1]) {
            return parts[1]; // Return the nested route (gear, fx, etc.)
        }
        return 'gear'; // Default tab
    };
    
    const [subTab, setSubTab] = useState(() => getTabFromPath(location.pathname));

    // Update tab when URL changes
    useEffect(() => {
        const tabFromUrl = getTabFromPath(location.pathname);
        if (tabFromUrl !== subTab) {
            setSubTab(tabFromUrl);
        }
    }, [location.pathname]);

    // Update URL when tab changes
    const handleTabChange = (tab) => {
        setSubTab(tab);
        navigate(`/marketplace/${tab}`, { replace: true });
    };

    const tabs = [
        { id: 'gear', label: t('gearExchange') },
        { id: 'fx', label: t('seshFxStore') },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">{t('marketplace')}</h1>
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
                        <SeshFxStore user={user} userData={userData} tokenBalance={tokenBalance} />
                    </div>
                )}
            </div>
        </div>
    );
}
