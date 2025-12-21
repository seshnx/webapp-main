import React, { useState, useEffect } from 'react';
import { 
    School, Camera, Save, Globe, Mail, GraduationCap, 
    Settings, ToggleLeft, ToggleRight, MapPin 
} from 'lucide-react';
import { supabase } from '../../../config/supabase';
import { useImageUpload } from '../../../hooks/useImageUpload';

export default function EduSettings({ schoolId, initialData, logAction, refreshMeta }) {
    const [formData, setFormData] = useState(initialData || {});
    const { uploadImage, uploading } = useImageUpload();

    // Sync state if initialData loads late
    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    // --- ACTIONS ---

    const handleUpdate = async () => {
        if (!supabase || !schoolId) return;
        
        try {
            const updateData = {
                name: formData.name,
                primary_color: formData.primaryColor,
                website: formData.website || null,
                contact_email: formData.contactEmail || null,
                address: formData.address || null,
                description: formData.description || null,
                enabled_features: formData.enabledFeatures || {},
                updated_at: new Date().toISOString()
            };
            
            const { error } = await supabase
                .from('schools')
                .update(updateData)
                .eq('id', schoolId);
            
            if (error) throw error;
            
            alert("School settings updated successfully.");
            if (refreshMeta) refreshMeta(formData); // Update parent state immediately
            if (logAction) await logAction('Update Settings', 'Updated school configuration');
        } catch (e) {
            console.error("Update failed:", e);
            alert("Failed to update school settings.");
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !schoolId || !supabase) return;

        try {
            const url = await uploadImage(file, `schools/${schoolId}/images/logo`);
            if (url) {
                await supabase
                    .from('schools')
                    .update({ logo_url: url, updated_at: new Date().toISOString() })
                    .eq('id', schoolId);
                
                setFormData(prev => ({ ...prev, logoURL: url, logo_url: url }));
                if (refreshMeta) refreshMeta({ ...formData, logoURL: url });
                if (logAction) await logAction('Update Logo', 'Uploaded new school logo');
            }
        } catch (err) {
            console.error("Logo upload failed", err);
            alert("Failed to upload logo.");
        }
    };

    const toggleSetting = (key) => {
        setFormData(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!formData.name && !initialData) return <div className="p-10 text-center text-gray-500">Loading Settings...</div>;

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* School Identity Section */}
            <section className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative group">
                    <div className="h-32 w-32 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                        {formData.logoURL ? (
                            <img src={formData.logoURL} className="h-full w-full object-contain" alt="Logo" />
                        ) : (
                            <School size={40} className="text-gray-400"/>
                        )}
                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">Uploading...</div>}
                    </div>
                    <label className="absolute bottom-2 right-2 bg-indigo-600 p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-indigo-700 transition">
                        <Camera size={14}/>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading}/>
                    </label>
                </div>
                
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">School Name</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                            value={formData.name || ''} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Color</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                className="h-10 w-10 p-0 border-0 rounded cursor-pointer" 
                                value={formData.primaryColor || '#4f46e5'} 
                                onChange={e => setFormData({...formData, primaryColor: e.target.value})} 
                            />
                            <input 
                                className="flex-1 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white font-mono" 
                                value={formData.primaryColor || ''} 
                                onChange={e => setFormData({...formData, primaryColor: e.target.value})} 
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                className="w-full pl-10 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                                value={formData.address || ''} 
                                onChange={e => setFormData({...formData, address: e.target.value})} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Extended Details */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-700">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website</label>
                    <div className="relative">
                        <Globe size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                            className="w-full pl-10 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                            value={formData.website || ''} 
                            onChange={e => setFormData({...formData, website: e.target.value})} 
                            placeholder="https://" 
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Email</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                            className="w-full pl-10 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                            value={formData.contactEmail || ''} 
                            onChange={e => setFormData({...formData, contactEmail: e.target.value})} 
                            placeholder="admin@school.edu" 
                        />
                    </div>
                </div>
            </section>

            {/* Academic Config */}
            <section>
                <h3 className="font-bold text-lg dark:text-white border-b dark:border-gray-700 pb-2 mb-4 flex items-center gap-2">
                    <GraduationCap size={18} className="text-indigo-600"/> Academic Structure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cohort Mode</label>
                        <select 
                            className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                            value={formData.cohortMode || 'Semester'} 
                            onChange={e => setFormData({...formData, cohortMode: e.target.value})}
                        >
                            <option value="Semester">Semester Based</option>
                            <option value="Trimester">Trimester</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Rolling">Rolling</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grading Scale</label>
                        <select 
                            className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                            value={formData.gradingScale || '1-10'} 
                            onChange={e => setFormData({...formData, gradingScale: e.target.value})}
                        >
                            <option value="1-10">Numeric (1-10)</option>
                            <option value="Pass/Fail">Pass/Fail</option>
                            <option value="Letter">Letter Grades</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Operational Toggles */}
            <section>
                <h3 className="font-bold text-lg dark:text-white border-b dark:border-gray-700 pb-2 mb-4 flex items-center gap-2">
                    <Settings size={18} className="text-indigo-600"/> Operational Rules
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div>
                            <div className="font-bold text-sm dark:text-white">Strict Geofencing</div>
                            <div className="text-xs text-gray-500">Require GPS location match for clock-in</div>
                        </div>
                        <button onClick={() => toggleSetting('geofencing')}>
                            {formData.geofencing ? <ToggleRight size={24} className="text-indigo-600"/> : <ToggleLeft size={24} className="text-gray-400"/>}
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div>
                            <div className="font-bold text-sm dark:text-white">Supervisor Approval</div>
                            <div className="text-xs text-gray-500">Require partner studio sign-off on hours</div>
                        </div>
                        <button onClick={() => toggleSetting('requireApproval')}>
                            {formData.requireApproval ? <ToggleRight size={24} className="text-indigo-600"/> : <ToggleLeft size={24} className="text-gray-400"/>}
                        </button>
                    </div>
                </div>
            </section>

            <div className="pt-4 border-t dark:border-gray-700">
                <button 
                    onClick={handleUpdate} 
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg"
                >
                    <Save size={18}/> Save Configuration
                </button>
            </div>
        </div>
    );
}
