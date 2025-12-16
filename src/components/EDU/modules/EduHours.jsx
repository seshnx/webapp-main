import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react';
import { db } from '../../../config/firebase';
import { formatHours, calculateDurationMinutes } from '../../../utils/eduTime';
import { exportToCSV } from '../../../utils/dataExport';

export default function EduHours({ schoolId }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending_approval', 'approved'

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!schoolId || !supabase) return;
        
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const { data: logsData, error } = await supabase
                    .from('internship_logs')
                    .select('*')
                    .eq('school_id', schoolId)
                    .order('check_in', { ascending: false })
                    .limit(100);
                
                if (error) throw error;
                
                const fetchedLogs = (logsData || []).map(log => {
                    const duration = calculateDurationMinutes(log.check_in, log.check_out);
                    return {
                        id: log.id,
                        ...log,
                        checkIn: log.check_in,
                        checkOut: log.check_out,
                        studentId: log.student_id,
                        studentName: log.student_name,
                        duration
                    };
                });

                setLogs(fetchedLogs);
            } catch (e) {
                console.error("Error fetching logs:", e);
            }
            setLoading(false);
        };

        fetchLogs();
    }, [schoolId]);

    // --- ACTIONS ---

    const handleLogAction = async (logId, status) => {
        if (!supabase || !schoolId) return;
        
        try {
            // 1. Update the log status
            const { error } = await supabase
                .from('internship_logs')
                .update({ status })
                .eq('id', logId)
                .eq('school_id', schoolId);
            
            if (error) throw error;
            
            // 2. Optimistic Update UI
            setLogs(prev => prev.map(log => log.id === logId ? { ...log, status } : log));
            
            // Note: In a real app, if 'approved', you might trigger a Cloud Function 
            // to increment the student's total hours atomically.
            
        } catch (error) {
            console.error("Error updating log:", error);
            alert("Failed to update log status.");
        }
    };

    // Filter Logic
    const visibleLogs = filterStatus === 'all' 
        ? logs 
        : logs.filter(l => l.status === filterStatus);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Internship Hours...</div>;

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500"/>
                    <select 
                        className="bg-white dark:bg-[#1f2128] border dark:border-gray-600 text-sm rounded-md p-1.5 outline-none dark:text-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Activity</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="active">Active (Clocked In)</option>
                    </select>
                </div>

                <button 
                    onClick={() => exportToCSV(visibleLogs, 'internship_hours')} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1f2128] border dark:border-gray-600 rounded-md text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <Download size={14}/> Export CSV
                </button>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Student</th>
                            <th className="p-3">Activity / Description</th>
                            <th className="p-3">Duration</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {visibleLogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">No logs found matching criteria.</td>
                            </tr>
                        ) : (
                            visibleLogs.map(log => (
                                <tr key={log.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <td className="p-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                        <div className="font-medium">
                                            {log.checkIn?.toDate ? log.checkIn.toDate().toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            {log.checkIn?.toDate ? log.checkIn.toDate().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                                        </div>
                                    </td>
                                    <td className="p-3 font-bold dark:text-white">
                                        {log.studentName}
                                    </td>
                                    <td className="p-3 max-w-xs">
                                        <span className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                                            {log.type} • {log.location}
                                        </span>
                                        <span className="text-gray-700 dark:text-gray-300 truncate block" title={log.description}>
                                            {log.description || <span className="italic opacity-50">No description provided</span>}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                        {log.checkOut ? formatHours(log.duration) : <span className="animate-pulse text-green-500">Active...</span>}
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={log.status} />
                                    </td>
                                    <td className="p-3 text-right">
                                        {log.status === 'pending_approval' && (
                                            <div className="flex justify-end gap-1">
                                                <button 
                                                    onClick={() => handleLogAction(log.id, 'approved')} 
                                                    className="p-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded hover:bg-green-200 transition" 
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={16}/>
                                                </button>
                                                <button 
                                                    onClick={() => handleLogAction(log.id, 'rejected')} 
                                                    className="p-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200 transition" 
                                                    title="Reject"
                                                >
                                                    <XCircle size={16}/>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Helper Component for Status Styles
function StatusBadge({ status }) {
    const styles = {
        'approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'pending_approval': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'active': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse',
    };
    
    const labels = {
        'approved': 'Approved',
        'rejected': 'Rejected',
        'pending_approval': 'Pending',
        'active': 'In Progress',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
            {labels[status] || status}
        </span>
    );
}
