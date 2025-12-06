import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Zap, ChevronDown, Loader2, Video, Image as ImageIcon, X } from 'lucide-react';
import { db, appId } from '../../config/firebase';
import { SERVICE_CATALOGUE } from '../../config/constants';
import { useMediaUpload } from '../../hooks/useMediaUpload';

export default function TechBroadcastBuilder({ user, userData, onSuccess, onCancel }) {
    const [category, setCategory] = useState(SERVICE_CATALOGUE[0].label);
    const [equipment, setEquipment] = useState('');
    const [urgency, setUrgency] = useState('Normal');
    const [budget, setBudget] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [media, setMedia] = useState(null); 
    const { uploadMedia, uploading } = useMediaUpload();

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const result = await uploadMedia(file, `service_requests/${user.uid}`);
        if (result) setMedia(result);
    };
 
    const handleSubmit = async () => {
        if (!equipment || !details) return alert("Please complete the request.");
        setSubmitting(true);
        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/service_requests`), {
                topic: `${category} for ${equipment}`,
                category, equipment, urgency,
                budget: budget ? parseInt(budget) : null,
                description: details,
                userId: user.uid,
                userName: `${userData.firstName} ${userData.lastName}`,
                status: 'Open',
                timestamp: serverTimestamp(),
                attachment: media || null 
            });
            alert("Tech Request Broadcasted!");
            onSuccess();
        } catch (e) { console.error(e); alert("Failed."); }
        setSubmitting(false);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#2c2e36] p-8 rounded-2xl border border-orange-200 dark:border-gray-700 shadow-xl animate-in zoom-in-95">
            <h2 className="text-2xl font-extrabold dark:text-white mb-6 flex items-center gap-2 text-orange-600"><Zap/> Broadcast Tech Need</h2>
            
            <div className="space-y-6">
                {/* UPDATED: Gray-800 background in dark mode for better readability */}
                <div className="p-6 bg-orange-50 dark:bg-gray-800 rounded-xl border border-orange-100 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-3 text-lg font-medium text-gray-700 dark:text-gray-200">
                        <span>I need</span>
                        <div className="relative">
                            {/* UPDATED: Gray-700 bg for select to pop against gray-800 container */}
                            <select value={category} onChange={e => setCategory(e.target.value)} className="appearance-none bg-white dark:bg-gray-700 border border-orange-300 dark:border-orange-700 rounded-lg py-1 pl-3 pr-8 font-bold text-orange-700 dark:text-white focus:outline-none">
                                {SERVICE_CATALOGUE.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 dark:text-white pointer-events-none"/>
                        </div>
                        <span>for my</span>
                        <input className="bg-transparent border-b-2 border-orange-300 dark:border-orange-700 text-center w-40 font-bold focus:outline-none focus:border-orange-500 dark:text-white" placeholder="Equipment Name" value={equipment} onChange={e => setEquipment(e.target.value)}/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Urgency</label>
                        <select className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" value={urgency} onChange={e => setUrgency(e.target.value)}>
                            <option>Normal</option>
                            <option>High (Session Blocked)</option>
                            <option>Emergency (24h)</option>
                            <option>Flexible</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Est. Budget ($)</label>
                        <input type="number" className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" placeholder="Optional" value={budget} onChange={e => setBudget(e.target.value)}/>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Details</label>
                    <textarea className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white min-h-[100px]" placeholder="Describe the issue, specific model, symptoms..." value={details} onChange={e => setDetails(e.target.value)}/>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Visual Reference</label>
                    {!media && !uploading && (
                        <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-500">
                            <Video size={20}/><span className="text-sm font-bold">Upload Video or Image</span>
                            <input type="file" className="hidden" accept="video/*,image/*" onChange={handleFileSelect} />
                        </label>
                    )}
                    {media && (
                        <div className="relative w-full rounded-xl overflow-hidden border dark:border-gray-700 bg-black">
                            {media.type === 'video' ? <video src={media.url} controls className="w-full h-48 object-contain"/> : <img src={media.url} className="w-full h-48 object-contain"/>}
                            <button onClick={() => setMedia(null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X size={14}/></button>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={onCancel} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting || uploading} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                        {submitting ? <Loader2 className="animate-spin"/> : "Broadcast Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}
