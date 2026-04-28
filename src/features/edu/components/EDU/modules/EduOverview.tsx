import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';
import { Users, Briefcase, Clock, Activity, School, Globe } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';

/**
 * Stats interface
 */
interface EduStats {
    students: number;
    interns: number;
    pending: number;
}

/**
 * Activity log interface
 */
interface ActivityLog {
    id: string;
    action?: string;
    details?: string;
    adminName?: string;
    timestamp?: Date | null;
    [key: string]: any;
}

/**
 * School data interface
 */
interface SchoolData {
    name?: string;
    logoURL?: string;
    address?: string;
    website?: string;
    [key: string]: any;
}

/**
 * EduOverview props
 */
export interface EduOverviewProps {
    schoolId?: string;
    schoolData?: SchoolData;
}
export default function EduOverview({ schoolId, schoolData }: EduOverviewProps) {
    // Convex Query
    const overviewData = useQuery(api.edu.getEduOverviewStats,
        schoolId ? { schoolId: schoolId as Id<"schools"> } : "skip"
    );

    const stats = useMemo(() => {
        if (!overviewData) return { students: 0, interns: 0, pending: 0 };
        return {
            students: overviewData.studentCount,
            interns: overviewData.activeInterns,
            pending: overviewData.pendingLogsCount
        };
    }, [overviewData]);

    const recentActivity: ActivityLog[] = useMemo(() => {
        if (!overviewData) return [];
        return overviewData.recentActivity.map(a => ({
            id: a._id,
            ...a,
            adminName: a.userName || 'System',
            timestamp: new Date(a.timestamp)
        }));
    }, [overviewData]);

    if (overviewData === undefined) return <div className="p-10 text-center text-gray-500">Loading Overview...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Students"
                    value={stats.students}
                    icon={<Users className="text-white"/>}
                    bg="bg-gradient-to-br from-indigo-500 to-blue-600"
                    text="text-white"
                />
                <StatCard
                    title="Active Internships"
                    value={stats.interns}
                    icon={<Briefcase className="text-white"/>}
                    bg="bg-gradient-to-br from-purple-500 to-pink-600"
                    text="text-white"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pending}
                    icon={<Clock className="text-white"/>}
                    bg="bg-gradient-to-br from-yellow-500 to-orange-600"
                    text="text-white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="border dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-gray-400"/> Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No recent activity recorded.</p>
                        ) : (
                            recentActivity.map(log => (
                                <div key={log.id} className="text-xs border-b dark:border-gray-700 pb-2 last:border-0">
                                    <div className="flex justify-between font-bold dark:text-gray-200">
                                        <span>{log.action}</span>
                                        <span className="text-gray-500 font-normal">
                                            {log.timestamp?.toLocaleTimeString() || ''}
                                        </span>
                                    </div>
                                    <div className="text-gray-500 mt-0.5">
                                        {log.details} <span className="opacity-70">— {log.adminName}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* School Identity Card */}
                <div className="border dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-black/20 shadow-sm">
                    <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-4 overflow-hidden border-4 border-white dark:border-gray-700">
                        {schoolData?.logoURL ? (
                            <img src={schoolData.logoURL} className="h-full w-full object-contain" alt="School Logo" />
                        ) : (
                            <School size={40} className="text-indigo-500"/>
                        )}
                    </div>
                    <h2 className="text-2xl font-extrabold dark:text-white mb-1">{schoolData?.name || 'School Name'}</h2>
                    <p className="text-sm text-gray-500 mb-4">{schoolData?.address || 'No Address Set'}</p>

                    {schoolData?.website && (
                        <a
                            href={schoolData.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition flex items-center gap-1"
                        >
                            <Globe size={12}/> Visit Website
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
