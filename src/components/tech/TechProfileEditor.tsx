import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { TECH_SPECIALTIES } from '../../config/constants';
import { MultiSelect } from '../shared/Inputs';
// TODO: Replace with Convex queries
// import { useQuery, useMutation } from 'convex/react';
// import { api } from '../../../convex/_generated';

/**
 * Tech profile form data interface
 */
interface TechProfileData {
    skills: string;
    rate: string;
    serviceRadius: string;
    subRoles: string[];
}

/**
 * Props for TechProfileEditor component
 */
export interface TechProfileEditorProps {
    user?: any;
}

/**
 * TechProfileEditor - Technician profile settings editor
 */
export default function TechProfileEditor({ user }: TechProfileEditorProps) {
    const [data, setData] = useState<TechProfileData>({ skills: '', rate: '', serviceRadius: '', subRoles: [] });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!user?.id && !user?.uid) {
            setLoading(false);
            return;
        }

        const userId = user.id || user.uid;

        // TODO: Replace with Convex query
        // convexQuery(api.tech.getSubProfile, { userId, role: 'Technician' })
        //   .then((profile) => { if (profile) setData({ ... }); });
        setLoading(false);
    }, [user?.id, user?.uid]);

    const handleSave = async () => {
        if (!user?.id && !user?.uid) {
            alert("User ID not available.");
            return;
        }

        try {
            const userId = user.id || user.uid;

            // TODO: Replace with Convex mutation
            // await upsertSubProfileMutation({ userId, role: 'Technician', data: { skills, rate, ... } });
            console.log('Would update tech profile (TODO: implement via Convex):', data);
            alert("Tech Profile Updated Successfully");
        } catch (e) {
            console.error(e);
            alert("Update failed: " + (e instanceof Error ? e.message : "Unknown error"));
        }
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
                    onChange={(k, v) => setData((prev: TechProfileData) => ({...prev, [k]: v}))}
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
