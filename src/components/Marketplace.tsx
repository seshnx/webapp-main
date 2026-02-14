import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GearExchange from './marketplace/GearExchange';
import SeshFxStore from './marketplace/SeshFxStore';
import { useLanguage } from '../contexts/LanguageContext';
import type { UserData } from '../types';
import PageLayout from './shared/PageLayout';

/**
 * Props for Marketplace component
 */
export interface MarketplaceProps {
    user?: any;
    userData?: UserData | null;
    tokenBalance?: number;
}

/**
 * Tab type for marketplace
 */
type MarketplaceTab = 'gear' | 'fx';

/**
 * Tab configuration interface
 */
interface TabConfig {
    id: MarketplaceTab;
    label: string;
}

export default function Marketplace({ user, userData, tokenBalance }: MarketplaceProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Get tab from URL path (e.g., /marketplace/fx -> 'fx')
    const getTabFromPath = (path: string): MarketplaceTab => {
        const parts = path.split('/').filter(Boolean);
        if (parts[0] === 'marketplace' && parts[1]) {
            return parts[1] as MarketplaceTab;
        }
        return 'gear'; // Default tab
    };

    const [subTab, setSubTab] = useState<MarketplaceTab>(() => getTabFromPath(location.pathname));

    // Update tab when URL changes
    useEffect(() => {
        const tabFromUrl = getTabFromPath(location.pathname);
        if (tabFromUrl !== subTab) {
            setSubTab(tabFromUrl);
        }
    }, [location.pathname, subTab]);

    // Update URL when tab changes
    const handleTabChange = (tab: MarketplaceTab) => {
        setSubTab(tab);
        navigate(`/marketplace/${tab}`); // Allow back button
    };

    const tabs: TabConfig[] = [
        { id: 'gear', label: t('gearExchange') },
        { id: 'fx', label: t('seshFxStore') },
    ];

    return (
        <PageLayout
            title={t('marketplace')}
            subtitle="Discover gear, effects, and more"
            tabs={
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
            }
        >
            <div className="space-y-6">
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
        </PageLayout>
    );
}
