import React from 'react';
import { Users } from 'lucide-react';

/**
 * StudioClients - Client database and CRM management
 * Phase 1: Basic placeholder - will be expanded with full CRUD functionality
 */
export default function StudioClients({ user, userData }) {
    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <Users size={20} />
                        </div>
                        Client Database
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your client relationships, track bookings, and view client history
                    </p>
                </div>
            </div>

            {/* Coming Soon Content */}
            <div className="text-center py-12">
                <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={48} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold dark:text-white mb-2">Client CRM Coming Soon</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    This module will include client database, booking history, communication timeline,
                    talent pipeline, and client portal access.
                </p>

                {/* Feature Preview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl mb-2">👥</div>
                        <h4 className="font-semibold dark:text-white">Client Database</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">VIP, Regular, Prospect segmentation</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl mb-2">💬</div>
                        <h4 className="font-semibold dark:text-white">Communication History</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Unified message timeline</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl mb-2">🎯</div>
                        <h4 className="font-semibold dark:text-white">Talent Pipeline</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Network tracking system</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
