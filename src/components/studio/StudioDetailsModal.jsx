import React, { useState } from 'react';
import { Shield, X } from 'lucide-react';
import { AMENITIES_DATA } from '../../config/constants';
import { MultiSelect } from '../shared/Inputs';

export default function StudioDetailsModal({ initialData, onClose, onSave }) {
    const [formData, setFormData] = useState(initialData || {});
    const handleChange = (k, v) => setFormData({...formData, [k]: v});
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                <div className="flex justify-between mb-4">
                    <h3 className="text-xl font-bold dark:text-white">Edit Studio Details</h3>
                    <button onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4">
                    {/* Privacy Toggle */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                        <div className="mt-1"><Shield size={18} className="text-brand-blue"/></div>
                        <div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="hideAddress" 
                                    className="w-4 h-4"
                                    checked={formData.hideAddress || false} 
                                    onChange={e => handleChange('hideAddress', e.target.checked)}
                                />
                                <label htmlFor="hideAddress" className="font-bold text-gray-700 dark:text-gray-200 text-sm">Private Home Studio Mode</label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                When enabled, your exact address is hidden from the public map. It will only be revealed to users <strong>after</strong> you approve their booking request.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Studio Name</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.profileName||''} onChange={e=>handleChange('profileName', e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Website</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.website||''} onChange={e=>handleChange('website', e.target.value)} /></div>
                    </div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Address</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.address||''} onChange={e=>handleChange('address', e.target.value)} /></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">City</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.city||''} onChange={e=>handleChange('city', e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">State</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.state||''} onChange={e=>handleChange('state', e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Zip</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.zip||''} onChange={e=>handleChange('zip', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Email</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.email||''} onChange={e=>handleChange('email', e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Cell Phone</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.phoneCell||''} onChange={e=>handleChange('phoneCell', e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Landline</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.phoneLand||''} onChange={e=>handleChange('phoneLand', e.target.value)} /></div>
                    </div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Hours</label><input className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={formData.hours||''} onChange={e=>handleChange('hours', e.target.value)} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Amenities</label><MultiSelect label="" fieldKey="amenities" options={AMENITIES_DATA} initialValues={formData.amenities} onChange={(k, v) => handleChange(k, v)} /></div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                    <button onClick={() => onSave(formData)} className="bg-brand-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600">Save Details</button>
                </div>
            </div>
        </div>
    );
}
