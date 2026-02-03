import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { UserData } from '../../types';

/**
 * Props for StudioAnalytics component
 */
export interface StudioAnalyticsProps {
    user?: any;
    userData?: UserData | null;
}

/**
 * StudioAnalytics - Business insights and reporting
 * Phase 1: Basic placeholder - will be expanded with full analytics dashboard
 */
export default function StudioAnalytics({ user, userData }: StudioAnalyticsProps) {
    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                            <TrendingUp size={20} />
                        </div>
                        Analytics Dashboard
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track revenue, utilization, client insights, and business performance
                    </p>
                </div>
            </div>

            {/* Coming Soon Content */}
            <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp size={48} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold dark:text-white mb-2">Analytics Dashboard Coming Soon</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    This module will include revenue tracking, room utilization, client lifetime value,
                    performance metrics, and custom reports.
                </p>

                {/* Feature Preview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl mb-2">💰</div>
                        <h4 className="font-semibold dark:text-white">Revenue Dashboard</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Income trends & forecasts</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl mb-2">📊</div>
                        <h4 className="font-semibold dark:text-white">Utilization Report</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Room usage statistics</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl mb-2">🎯</div>
                        <h4 className="font-semibold dark:text-white">Client Insights</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">CLV & engagement analysis</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
