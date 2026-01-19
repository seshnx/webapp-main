import React from 'react';
import { Briefcase } from 'lucide-react';

/**
 * StudioStaff - Staff management and scheduling
 * Phase 1: Basic placeholder - will be expanded with full CRUD functionality
 */
export default function StudioStaff({ user, userData }) {
    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white">
                            <Briefcase size={20} />
                        </div>
                        Staff Management
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your team, schedule shifts, track hours, and assign tasks
                    </p>
                </div>
            </div>

            {/* Coming Soon Content */}
            <div className="text-center py-12">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase size={48} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold dark:text-white mb-2">Staff Management Coming Soon</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    This module will include staff roster, shift scheduling, time tracking,
                    task assignment, and performance analytics.
                </p>

                {/* Feature Preview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl mb-2">📋</div>
                        <h4 className="font-semibold dark:text-white">Staff Roster</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Engineers, assistants, managers</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl mb-2">📅</div>
                        <h4 className="font-semibold dark:text-white">Shift Scheduling</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Calendar-based scheduling</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl mb-2">✓</div>
                        <h4 className="font-semibold dark:text-white">Task Board</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Assignment & tracking</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
