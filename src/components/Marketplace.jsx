import React, { useState } from 'react';
import DistributionManager from './marketplace/DistributionManager';
import GearExchange from './marketplace/GearExchange';
import SeshFxStore from './marketplace/SeshFxStore'; // Sample Pack Store

export default function Marketplace({ user, userData, tokenBalance }) {
    const [subTab, setSubTab] = useState('distribution');

    const tabs = [
        { id: 'distribution', label: 'Music Distribution' },
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
                            onClick={() => setSubTab(tab.id)}
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
                {subTab === 'distribution' && (
                    <div key="distribution" className="tab-content">
                        <DistributionManager user={user} userData={userData} />
                    </div>
                )}
                {subTab === 'gear' && (
                    <div key="gear" className="tab-content">
                        <GearExchange user={user} />
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
