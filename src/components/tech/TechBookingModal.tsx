import React, { useState } from 'react';
import { X, Wrench, Calendar, DollarSign, Loader2, Video } from 'lucide-react';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { SERVICE_CATALOGUE } from '../../config/constants';
import EquipmentAutocomplete from '../shared/EquipmentAutocomplete';
import type { UserData } from '../../types';

/**
 * Form state interface
 */
interface TechBookingForm {
    serviceCategory: string;
    equipmentName: string;
    issueDescription: string;
    logistics: string;
    preferredDate: string;
    budgetCap: string;
}

/**
 * Target user data interface
 */
interface TargetUser {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    [key: string]: any;
}

/**
 * Props for TechBookingModal component
 */
export interface TechBookingModalProps {
    user?: any;
    userData?: UserData | null;
    target: TargetUser;
    onClose?: () => void;
}

/**
 * TechBookingModal - Modal for submitting technician service requests
 * TODO: Migrate booking submission to Neon database
 */
export default function TechBookingModal({ user, userData, target, onClose }: TechBookingModalProps) {
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [form, setForm] = useState<TechBookingForm>({
        serviceCategory: 'Repair',
        equipmentName: '',
        issueDescription: '',
        logistics: 'Drop-off',
        preferredDate: '',
        budgetCap: ''
    });
    const [attachments, setAttachments] = useState<any[]>([]);
    const { uploadMedia, uploading } = useMediaUpload();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const result = await uploadMedia(file, `tech_requests/${user?.uid}`);
        if (result?.url) setAttachments(prev => [...prev, result]);
    };

    const handleSubmit = async () => {
        if (!form.equipmentName || !form.issueDescription) {
            alert("Please describe the equipment and the issue.");
            return;
        }

        // TODO: Implement Neon booking submission
        console.warn('Tech booking submission not yet implemented with Neon database');
        console.log('Form data:', form, 'Attachments:', attachments);

        setSubmitting(true);

        // Placeholder for future implementation
        setTimeout(() => {
            alert("Service request submission temporarily disabled during migration.");
            setSubmitting(false);
            onClose?.();
        }, 1000);
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
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Equipment</label>
                        <EquipmentAutocomplete
                            placeholder="Search for equipment (e.g. Fender Twin Reverb, U87)..."
                            value={form.equipmentName}
                            onChange={(value: string) => setForm({...form, equipmentName: value})}
                            onSelect={(item: any) => {
                                const fullName = item.brand !== 'Various' && item.brand !== 'Unknown'
                                    ? `${item.brand} ${item.name}`
                                    : item.name;
                                setForm({...form, equipmentName: fullName});
                            }}
                        />
                    </div>
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
