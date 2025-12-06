import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Save, Loader2 } from 'lucide-react';
import { db, getPaths } from '../../config/firebase';
import { TECH_SPECIALTIES } from '../../config/constants';
import { MultiSelect } from '../shared/Inputs';

export default function TechProfileEditor({ user }) {
    const [data, setData] = useState({ skills: '', rate: '', serviceRadius: '', subRoles: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDoc(doc(db, getPaths(user.uid).userSubProfile('Technician'))).then(snap => {
            if (snap.exists()) setData(snap.data());
            setLoading(false);
        });
    }, [user.uid]);

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, getPaths(user.uid).userSubProfile('Technician')), data);
            
            // Sync searchable fields to public profile
            const searchTerms = [
                ...(data.skills ? data.skills.toLowerCase().split(',').map(s => s.trim()) : []),
                ...(data.subRoles ? data.subRoles.map(r => r.toLowerCase()) : [])
            ];

            await updateDoc(doc(db, getPaths(user.uid).userPublicProfile), {
                rate: parseInt(data.rate) || 0,
                subRoles: data.subRoles || [],
                searchTerms: searchTerms
            });
            alert("Tech Profile Updated Successfully");
        } catch (e) { alert("Update failed"); }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm animate-in fade-in">
            <h3 className="font-bold text-lg dark:text-white mb-6 border-b dark:border-gray-700 pb-2">Your Technician Settings</h3>
            
            <div className="space-y-5">
                <MultiSelect 
                    label="Primary Specialties" 
                    fieldKey="subRoles" 
                    options={TECH_SPECIALTIES} 
                    initialValues={data.subRoles} 
                    onChange={(k, v) => setData(prev => ({...prev, [k]: v}))}
                />

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Detailed Skills (Comma Separated)</label>
                    <input className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" value={data.skills || ''} onChange={e => setData({...data, skills: e.target.value})} placeholder="e.g. SSL 4000 Maintenance, Tube Bias..."/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Hourly Rate ($)</label>
                        <input type="number" className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" value={data.rate || ''} onChange={e => setData({...data, rate: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Service Radius (Miles)</label>
                        <input type="number" className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white" value={data.serviceRadius || ''} onChange={e => setData({...data, serviceRadius: e.target.value})}/>
                    </div>
                </div>

                <div className="pt-4">
                    <button onClick={handleSave} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                        <Save size={18}/> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
