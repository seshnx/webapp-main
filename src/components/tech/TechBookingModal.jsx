import React, { useState } from 'react';
import { X, Wrench, Calendar, DollarSign, Loader2, Video } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { SERVICE_CATALOGUE } from '../../config/constants';

export default function TechBookingModal({ user, userData, target, onClose }) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        serviceCategory: 'Repair', equipmentName: '', issueDescription: '',
        logistics: 'Drop-off', preferredDate: '', budgetCap: ''
    });
    const [attachments, setAttachments] = useState([]);
    const { uploadMedia, uploading } = useMediaUpload();

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const result = await uploadMedia(file, `tech_requests/${user.uid}`);
        if (result) setAttachments(prev => [...prev, result]);
    };

    const handleSubmit = async () => {
        if (!form.equipmentName || !form.issueDescription || !supabase) {
            if (!form.equipmentName || !form.issueDescription) alert("Please describe the equipment and the issue.");
            return;
        }
        setSubmitting(true);
        const userId = user?.id || user?.uid;
        try {
            await supabase
                .from('bookings')
                .insert({
                    sender_id: userId,
                    sender_name: userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User' : 'User',
                    target_id: target.id,
                    target_name: target.firstName ? `${target.firstName} ${target.lastName}` : target.name,
                    type: 'TechRequest',
                    service_type: form.serviceCategory,
                    equipment: form.equipmentName,
                    description: form.issueDescription,
                    logistics: form.logistics,
                    budget_cap: form.budgetCap || null,
                    status: 'Pending',
                    date: form.preferredDate || 'Flexible',
                    message: `[${form.serviceCategory}] ${form.equipmentName}: ${form.issueDescription}`,
                    attachments: attachments || [],
                    timestamp: new Date().toISOString()
                });
            alert("Service request sent!");
            onClose();
        } catch (e) { alert("Failed to send."); }
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white dark:bg-[#2c2e36] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f]">
                    <div>
                        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><Wrench size={18} className="text-orange-500"/> Service Request</h3>
                        <p className="text-xs text-gray-500">Hiring <span className="font-bold text-orange-600 dark:text-orange-400">{target.firstName} {target.lastName}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Service Type</label><select className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={form.serviceCategory} onChange={e => setForm({...form, serviceCategory: e.target.value})}>{SERVICE_CATALOGUE.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Logistics</label><select className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white text-sm" value={form.logistics} onChange={e => setForm({...form, logistics: e.target.value})}><option value="Drop-off">I will drop it off</option><option value="On-site">Tech comes to me</option><option value="Ship">I will ship it</option></select></div>
                    </div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Equipment</label><input className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white font-bold" placeholder="e.g. Fender Twin Reverb" value={form.equipmentName} onChange={e => setForm({...form, equipmentName: e.target.value})}/></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Issue Description</label><textarea className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white min-h-[100px] text-sm" placeholder="Describe symptoms..." value={form.issueDescription} onChange={e => setForm({...form, issueDescription: e.target.value})}/></div>
                    <div className="pt-4 border-t dark:border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer text-brand-blue hover:text-blue-600 font-bold mb-3"><Video size={16}/> Add Video/Photo <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading}/></label>
                        <div className="flex gap-2 overflow-x-auto">{attachments.map((f, i) => <div key={i} className="h-12 w-12 bg-black rounded border dark:border-gray-600 overflow-hidden"><img src={f.url} className="h-full w-full object-cover"/></div>)}</div>
                    </div>
                </div>
                <div className="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]"><button onClick={handleSubmit} disabled={submitting || uploading} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg">{submitting ? <Loader2 className="animate-spin mx-auto"/> : "Submit Request"}</button></div>
            </div>
        </div>
    );
}
