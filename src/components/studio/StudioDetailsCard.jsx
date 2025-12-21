import React from 'react';
import { MapPin, Mail, Phone, Globe, Clock, EyeOff } from 'lucide-react';

export default function StudioDetailsCard({ studioData }) {
    // REMOVED 'h-full' from the class list below to let the card hug its content
    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl shadow-sm border dark:border-gray-700 p-5">
            <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2 mb-4">
                <h3 className="font-bold text-lg dark:text-white">Studio Details</h3>
                {studioData.hideAddress && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <EyeOff size={12}/> Private Location
                    </span>
                )}
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                    <div className="dark:text-gray-200 text-sm">
                        {studioData.address ? <><MapPin size={14} className="inline me-1"/>{studioData.address}</> : <span className="text-gray-400 italic">Not set</span>}
                        {(studioData.city || studioData.state) && <div className="ml-5">{studioData.city}, {studioData.state} {studioData.zip}</div>}
                        {studioData.hideAddress && <div className="mt-1 text-xs text-gray-400 italic">Address hidden from public map until booking is approved.</div>}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Contact</label>
                    <div className="dark:text-gray-200 text-sm space-y-1">
                        {studioData.email && <div><Mail size={14} className="inline me-1"/> {studioData.email}</div>}
                        {studioData.phoneCell && <div><Phone size={14} className="inline me-1"/> {studioData.phoneCell} (Cell)</div>}
                        {studioData.website && <div><Globe size={14} className="inline me-1"/> <a href={studioData.website} target="_blank" className="text-blue-500 hover:underline" rel="noreferrer">Website</a></div>}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Hours</label>
                    <div className="dark:text-gray-200 text-sm"><Clock size={14} className="inline me-1"/> {studioData.hours || 'Not listed'}</div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Amenities</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {(studioData.amenities || []).map(a => (
                            <span key={a} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{a}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
