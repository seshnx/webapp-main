import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, DollarSign, PieChart } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { parseRoyaltyCSV, generateSampleCSV } from '../../utils/csvParser';

export default function RoyaltyManager({ user, userData }) {
    const [reports, setReports] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success'|'error', msg: '' }

    // 1. Fetch Report History
    useEffect(() => {
        if (!user?.id && !user?.uid || !supabase) return;
        const userId = user.id || user.uid;
        
        // Initial fetch
        supabase
            .from('royalty_reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error fetching royalty reports:', error);
                    return;
                }
                setReports((data || []).map(item => ({
                    id: item.id,
                    ...item,
                    createdAt: item.created_at
                })));
            });

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`royalty-reports-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'royalty_reports',
                    filter: `user_id=eq.${userId}`
                },
                async () => {
                    const { data } = await supabase
                        .from('royalty_reports')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false });
                    
                    if (data) {
                        setReports(data.map(item => ({
                            id: item.id,
                            ...item,
                            createdAt: item.created_at
                        })));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, user?.uid]);

    // 2. Handle File Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProcessing(true);
        setUploadStatus(null);

        try {
            // A. Parse File Client-Side
            const { items, summary } = await parseRoyaltyCSV(file);

            if (!supabase) {
                throw new Error('Database unavailable');
            }

            const userId = user?.id || user?.uid;

            // B. Create Report Document
            const { data: reportData, error: reportError } = await supabase
                .from('royalty_reports')
                .insert({
                    user_id: userId,
                    filename: file.name,
                    summary: summary,
                    status: 'Processed',
                    processed_by: userId
                })
                .select('id')
                .single();

            if (reportError) throw reportError;

            // C. Update Aggregates
            // Get current stats or create new
            const { data: currentStats } = await supabase
                .from('distribution_stats')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (currentStats) {
                // Update existing stats
                const { error: updateError } = await supabase
                    .from('distribution_stats')
                    .update({
                        lifetime_streams: (currentStats.lifetime_streams || 0) + summary.totalStreams,
                        lifetime_earnings: (currentStats.lifetime_earnings || 0) + summary.totalEarnings,
                        last_updated: new Date().toISOString()
                    })
                    .eq('user_id', userId);

                if (updateError) throw updateError;
            } else {
                // Create new stats record
                const { error: insertError } = await supabase
                    .from('distribution_stats')
                    .insert({
                        user_id: userId,
                        lifetime_streams: summary.totalStreams,
                        lifetime_earnings: summary.totalEarnings
                    });

                if (insertError) throw insertError;
            }
            
            setUploadStatus({ type: 'success', msg: `Successfully processed ${summary.rowCount} rows. Added $${summary.totalEarnings.toFixed(2)}.` });

        } catch (err) {
            console.error(err);
            setUploadStatus({ type: 'error', msg: "Failed to parse CSV. Format invalid." });
        }
        setProcessing(false);
    };

    const downloadSample = () => {
        const csvContent = generateSampleCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample_royalty_report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <DollarSign className="text-green-600" /> Royalties & Statements
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Ingest CSV reports from DSPs to update your analytics.
                    </p>
                </div>
                <button onClick={downloadSample} className="text-sm font-bold text-blue-500 hover:underline flex items-center gap-1">
                    <Download size={16}/> Download Sample CSV
                </button>
            </div>

            {/* Upload Area */}
            <div className="bg-white dark:bg-[#2c2e36] p-8 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                    <Upload size={32} className="text-brand-blue"/>
                </div>
                <h3 className="font-bold text-lg dark:text-white mb-1">Upload Sales Report</h3>
                <p className="text-sm text-gray-500 mb-6">Drag and drop CSV files from Spotify, Apple, or DistroKid.</p>
                
                <label className="bg-brand-blue hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition shadow-lg">
                    {processing ? 'Processing...' : 'Select CSV File'}
                    <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={processing} />
                </label>

                {uploadStatus && (
                    <div className={`mt-6 p-4 rounded-xl w-full max-w-lg flex items-center gap-3 text-sm font-bold ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {uploadStatus.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                        {uploadStatus.msg}
                    </div>
                )}
            </div>

            {/* Reports Ledger */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-[#23262f] border-b dark:border-gray-700">
                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Statement History</h4>
                </div>
                <div className="divide-y dark:divide-gray-700">
                    {reports.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No reports uploaded yet.</div>
                    ) : (
                        reports.map(report => (
                            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                                        <FileText size={20}/>
                                    </div>
                                    <div>
                                        <div className="font-bold dark:text-white text-sm">{report.filename}</div>
                                        <div className="text-xs text-gray-500">Uploaded {report.createdAt?.toDate().toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-600 dark:text-green-400">+${report.summary.totalEarnings.toFixed(2)}</div>
                                    <div className="text-xs text-gray-500">{report.summary.totalStreams.toLocaleString()} Streams</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
