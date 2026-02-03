import React, { useState, useEffect } from 'react';
import { Activity, Shield, FileText, Clock } from 'lucide-react';
import { exportToCSV } from '../../../utils/dataExport';

/**
 * Audit log interface
 */
interface AuditLog {
    id: string;
    action?: string;
    details?: string;
    adminName?: string;
    admin_name?: string;
    timestamp?: Date | null;
    [key: string]: any;
}

/**
 * EduAudit props
 */
export interface EduAuditProps {
    schoolId?: string;
}

export default function EduAudit({ schoolId }: EduAuditProps) {
    // TODO: Migrate to Neon/Convex - Supabase legacy code
    // @ts-ignore - supabase is global for legacy support
    const supabase = (window as any).supabase;

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [logLimit, setLogLimit] = useState<number>(50);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!schoolId || !supabase) return;

        const fetchLogs = async () => {
            setLoading(true);
            try {
                const { data: logsData, error } = await supabase
                    .from('audit_logs')
                    .select('*')
                    .eq('school_id', schoolId)
                    .order('timestamp', { ascending: false })
                    .limit(logLimit);

                if (error) throw error;

                setLogs((logsData || []).map((log: any) => ({
                    id: log.id,
                    ...log,
                    adminName: log.admin_name,
                    timestamp: log.timestamp ? new Date(log.timestamp) : null
                })));
            } catch (e) {
                console.error("Error loading audit logs:", e);
            }
            setLoading(false);
        };
        fetchLogs();
    }, [schoolId, logLimit]);

    // --- RENDER HELPERS ---
    const getActionColor = (action?: string): string => {
        if (!action) return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
        if (action.includes('Delete') || action.includes('Remove')) return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
        if (action.includes('Create') || action.includes('Add')) return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
        if (action.includes('Update') || action.includes('Edit')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    };

    if (loading && logs.length === 0) return <div className="p-10 text-center text-gray-500">Loading Audit Trail...</div>;

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Activity size={16}/>
                    <span>Showing last <strong>{logs.length}</strong> actions</span>
                </div>
                <button
                    onClick={() => exportToCSV(logs, 'audit_logs')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1f2128] border dark:border-gray-600 rounded-md text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <FileText size={14}/> Export Log
                </button>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Admin / Staff</th>
                            <th className="p-3">Action Type</th>
                            <th className="p-3">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {logs.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No audit history found.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <td className="p-3 text-gray-500 whitespace-nowrap flex items-center gap-2">
                                        <Clock size={14} className="opacity-50"/>
                                        {log.timestamp?.toLocaleString() || 'N/A'}
                                    </td>
                                    <td className="p-3 font-bold dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-indigo-500"/>
                                            {log.adminName || 'System'}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                                        {log.details}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Load More */}
            {logs.length >= logLimit && (
                <div className="text-center pt-2">
                    <button
                        onClick={() => setLogLimit(prev => prev + 50)}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                        Load Older Logs
                    </button>
                </div>
            )}
        </div>
    );
}
