import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

            <AnimatePresence mode="wait">
                <motion.div
                    key={subTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {subTab === 'distribution' && <DistributionManager user={user} userData={userData} />}
                    {subTab === 'gear' && <GearExchange user={user} />}
                    {subTab === 'fx' && <SeshFxStore user={user} tokenBalance={tokenBalance} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
