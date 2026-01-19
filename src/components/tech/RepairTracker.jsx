import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, MessageSquare, Image as ImageIcon, Send, FileText } from 'lucide-react';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import InspectionEditor from './InspectionEditor';

const REPAIR_STAGES = [
    { id: 'Pending', label: 'Request Received' },
    { id: 'Diagnosing', label: 'Diagnosing Issue' },
    { id: 'PartsOrdered', label: 'Waiting for Parts' },
    { id: 'Repairing', label: 'On The Bench' },
    { id: 'Testing', label: 'Quality Testing' },
    { id: 'Ready', label: 'Ready for Pickup' },
    { id: 'Completed', label: 'Completed' }
];

export default function RepairTracker({ bookingId, currentUser }) {
    const [booking, setBooking] = useState(null);
    const [newLog, setNewLog] = useState('');
    const [isPrivateLog, setIsPrivateLog] = useState(false);
    const [activeInspection, setActiveInspection] = useState(null);
    const { uploadMedia, uploading } = useMediaUpload();
    const [logImage, setLogImage] = useState(null);

    useEffect(() => {
        if (!bookingId || !supabase) return;
        
        // Initial fetch
        supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()
            .then(({ data, error }) => {
                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching booking:', error);
                    return;
                }
                if (data) {
                    setBooking({ id: data.id, ...data });
                }
            });

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`booking-${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${bookingId}`
                },
                async () => {
                    const { data } = await supabase
                        .from('bookings')
                        .select('*')
                        .eq('id', bookingId)
                        .single();
                    
                    if (data) {
                        setBooking({ id: data.id, ...data });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [bookingId]);

    const userId = currentUser?.id || currentUser?.uid;
    const isTech = userId === booking?.target_id;
    const isClient = userId === booking?.sender_id;

    const handleStatusUpdate = async (newStatus) => {
        if (!isTech || !supabase) return;
        
        const { error } = await supabase
            .from('bookings')
            .update({ 
                repair_status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);
        
        if (error) {
            console.error('Error updating status:', error);
            return;
        }
        
        await addLogEntry(`Status updated to: ${REPAIR_STAGES.find(s=>s.id===newStatus)?.label}`, false);
    };

    const addLogEntry = async (text, isPrivate = false, imageUrl = null) => {
        if (!supabase) return;
        
        const userId = currentUser?.id || currentUser?.uid;
        const entry = { 
            text, 
            timestamp: new Date().toISOString(), 
            author_id: userId, 
            author_name: currentUser?.displayName || currentUser?.firstName || 'User', 
            is_private: isPrivate, 
            image_url: imageUrl 
        };
        
        // Get current repair logs and append new entry
        const { data: booking } = await supabase
            .from('bookings')
            .select('repair_logs')
            .eq('id', bookingId)
            .single();
        
        const currentLogs = booking?.repair_logs || [];
        const updatedLogs = [...currentLogs, entry];
        
        const { error } = await supabase
            .from('bookings')
            .update({ repair_logs: updatedLogs })
            .eq('id', bookingId);
        
        if (error) {
            console.error('Error adding log entry:', error);
            return;
        }
        
        setNewLog(''); 
        setLogImage(null);
    };

    const handleLogSubmit = async () => {
        if (!newLog) return;
        let url = null;
        if (logImage) {
            const res = await uploadMedia(logImage, `repair_logs/${bookingId}`);
            url = res?.url;
        }
        await addLogEntry(newLog, isPrivateLog, url);
    };

    const handleSaveInspection = async (data) => {
        if (!activeInspection || !supabase) return;
        try {
            const field = activeInspection === 'Pre' ? 'pre_inspection' : 'post_inspection';
            const { error } = await supabase
                .from('bookings')
                .update({ [field]: data })
                .eq('id', bookingId);
            
            if (error) throw error;
            
            await addLogEntry(`${activeInspection}-Inspection completed. ${data.markers?.length || 0} issues noted.`, false);
            setActiveInspection(null);
        } catch (e) { 
            console.error(e);
            alert("Failed to save inspection: " + (e.message || "Unknown error"));
        }
    };

    if (!booking) return <div className="p-8 text-center">Loading...</div>;
    const currentStageIndex = REPAIR_STAGES.findIndex(s => s.id === (booking.repair_status || booking.repairStatus || 'Pending'));
    const progressPercent = ((currentStageIndex) / (REPAIR_STAGES.length - 1)) * 100;
    const repairLogs = booking.repair_logs || booking.repairLogs || [];
    const visibleLogs = repairLogs.filter(l => isTech || !(l.is_private || l.isPrivate));

    if (activeInspection) return <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4"><div className="w-full max-w-5xl h-full"><InspectionEditor type={activeInspection} initialData={booking[activeInspection === 'Pre' ? 'preInspection' : 'postInspection']} onSave={handleSaveInspection} onCancel={() => setActiveInspection(null)}/></div></div>;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div><h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><Wrench className="text-orange-500"/> Repair Ticket #{booking.id.slice(-6)}</h2><p className="text-sm text-gray-500">{booking.equipment} - {booking.serviceType}</p></div>
                    {isClient && <button onClick={async () => { await addLogEntry("Customer requested update.", true); alert("Update requested."); }} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-200">Request Update</button>}
                </div>
                <div className="relative mb-8 px-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full absolute top-1/2 -translate-y-1/2 z-0"></div>
                    <div className="h-2 bg-green-500 rounded-full absolute top-1/2 -translate-y-1/2 z-0 transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                    <div className="flex justify-between relative z-10">{REPAIR_STAGES.map((stage, idx) => { const isCompleted = idx <= currentStageIndex; return (<div key={stage.id} className="flex flex-col items-center group cursor-pointer" onClick={() => isTech && handleStatusUpdate(stage.id)}><div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}`}>{isCompleted ? <CheckCircle size={14}/> : <div className="w-2 h-2 rounded-full bg-gray-300"/>}</div><span className={`text-[10px] mt-2 font-bold uppercase tracking-wider absolute -bottom-6 w-24 text-center ${idx === currentStageIndex ? 'text-green-600 dark:text-green-400' : 'text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'}`}>{stage.label}</span></div>); })}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className={`p-4 rounded-xl border ${booking.preInspection ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-white border-dashed border-gray-300 dark:bg-black/20 dark:border-gray-700'}`}>
                        <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold uppercase text-gray-500">Intake</span>{booking.preInspection && <CheckCircle size={16} className="text-green-500"/>}</div>
                        {booking.preInspection ? (<div><div className="font-bold dark:text-white">Inspection Complete</div><button onClick={() => setActiveInspection('Pre')} className="text-xs text-blue-500 font-bold mt-2 hover:underline">View Report</button></div>) : (isTech ? <button onClick={() => setActiveInspection('Pre')} className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">Start Pre-Inspection</button> : <div className="text-xs text-gray-400 italic">Pending tech review...</div>)}
                    </div>
                    <div className={`p-4 rounded-xl border ${booking.postInspection ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-white border-dashed border-gray-300 dark:bg-black/20 dark:border-gray-700'}`}>
                        <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold uppercase text-gray-500">Final QC</span>{booking.postInspection && <CheckCircle size={16} className="text-green-500"/>}</div>
                        {booking.postInspection ? (<div><div className="font-bold dark:text-white">Ready for Pickup</div><button onClick={() => setActiveInspection('Post')} className="text-xs text-blue-500 font-bold mt-2 hover:underline">View Report</button></div>) : (isTech ? <button onClick={() => setActiveInspection('Post')} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">Start Post-Inspection</button> : <div className="text-xs text-gray-400 italic">Pending completion...</div>)}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold dark:text-white flex items-center gap-2"><FileText size={18} className="text-gray-400"/> Repair Log</h3>
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4 max-h-[400px] overflow-y-auto">
                    {visibleLogs.map((log, i) => {
                        const isPrivate = log.is_private || log.isPrivate;
                        const authorName = log.author_name || log.authorName;
                        const imageUrl = log.image_url || log.imageUrl;
                        return (
                            <div key={i} className={`mb-4 pl-4 border-l-2 ${isPrivate ? 'border-yellow-500' : 'border-blue-500'}`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold dark:text-white">{authorName}</span>
                                    <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">{log.text}</p>
                                {imageUrl && <img src={imageUrl} className="mt-2 rounded-lg max-h-48 border dark:border-gray-600"/>}
                                {isPrivate && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded ml-2">Internal Note</span>}
                            </div>
                        );
                    })}
                </div>
                {isTech && (<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700"><textarea className="w-full p-2 bg-white dark:bg-[#1f2128] border dark:border-gray-600 rounded-lg text-sm mb-2 outline-none focus:ring-2 focus:ring-orange-500 dark:text-white" placeholder="Add update..." value={newLog} onChange={e => setNewLog(e.target.value)}/><div className="flex justify-between items-center"><div className="flex gap-2"><label className="flex items-center gap-1 cursor-pointer text-gray-500 hover:text-brand-blue"><ImageIcon size={18}/><input type="file" className="hidden" onChange={e => setLogImage(e.target.files[0])}/></label><label className="flex items-center gap-1 cursor-pointer text-gray-500 hover:text-yellow-500"><input type="checkbox" checked={isPrivateLog} onChange={e => setIsPrivateLog(e.target.checked)} className="rounded text-yellow-500"/><span className="text-xs font-bold">Private</span></label></div><button onClick={handleLogSubmit} disabled={uploading} className="bg-orange-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1">{uploading ? '...' : <><Send size={14}/> Add Log</>}</button></div></div>)}
            </div>
        </div>
    );
}
