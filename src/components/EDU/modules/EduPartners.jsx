import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Phone, Plus, Trash2, ExternalLink } from 'lucide-react';
import AddressAutocomplete from '../../shared/AddressAutocomplete';

export default function EduPartners({ schoolId, logAction }) {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [form, setForm] = useState({ 
        name: '', 
        address: '', 
        website: '', 
        contactEmail: '' 
    });

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!schoolId || !supabase) return;
        
        const fetchPartners = async () => {
            setLoading(true);
            try {
                const { data: partnersData, error } = await supabase
                    .from('school_partners')
                    .select('*')
                    .eq('school_id', schoolId)
                    .order('name', { ascending: true });
                
                if (error) throw error;
                
                setPartners((partnersData || []).map(p => ({ id: p.id, ...p })));
            } catch (e) {
                console.error("Error loading partners:", e);
            }
            setLoading(false);
        };
        fetchPartners();
    }, [schoolId]);

    // --- ACTIONS ---

    const handleAdd = async () => {
        if (!form.name || !supabase || !schoolId) {
            if (!form.name) alert("Partner Name is required.");
            return;
        }
        
        try {
            const { data: newPartner, error } = await supabase
                .from('school_partners')
                .insert({
                    school_id: schoolId,
                    name: form.name,
                    address: form.address || null,
                    website: form.website || null,
                    contact_email: form.contactEmail || null,
                    status: 'Approved'
                })
                .select()
                .single();
            
            if (error) throw error;
            
            setPartners(prev => [...prev, { id: newPartner.id, ...newPartner }]);
            if (logAction) await logAction('Add Partner', `Added studio: ${form.name}`);
            
            // Reset
            setForm({ name: '', address: '', website: '', contactEmail: '' });
        } catch (e) {
            console.error("Add partner failed:", e);
            alert("Failed to add partner.");
        }
    };

    const handleDelete = async (id, name) => {
        if(!confirm(`Remove ${name} from approved partners?`) || !supabase || !schoolId) return;
        try {
            await supabase
                .from('school_partners')
                .delete()
                .eq('id', id)
                .eq('school_id', schoolId);
            
            setPartners(prev => prev.filter(p => p.id !== id));
            if (logAction) await logAction('Remove Partner', `Removed: ${name}`);
        } catch (e) {
            console.error("Delete failed:", e);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Partners...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Add Partner Form */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Briefcase size={18} className="text-indigo-600"/> Add Approved Partner
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Studio / Company Name</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white font-bold"
                            placeholder="e.g. Sound City Studios"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <AddressAutocomplete
                            label="Address"
                            value={form.address}
                            onChange={(val) => setForm({...form, address: val})}
                            onSelect={(addressData) => {
                                setForm({
                                    ...form, 
                                    address: addressData.formattedAddress || addressData.displayName
                                });
                            }}
                            placeholder="123 Main St..."
                            showGeolocation={false}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Contact Email</label>
                        <div className="relative">
                            <Phone size={14} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                className="w-full pl-9 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                placeholder="manager@studio.com"
                                value={form.contactEmail}
                                onChange={e => setForm({...form, contactEmail: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="mt-3 flex justify-end">
                    <button 
                        onClick={handleAdd} 
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-md transition"
                    >
                        <Plus size={18}/> Add Partner
                    </button>
                </div>
            </div>

            {/* Partners List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500 border-2 border-dashed dark:border-gray-700 rounded-xl">
                        No partners added yet.
                    </div>
                ) : (
                    partners.map(p => (
                        <div key={p.id} className="bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition group relative">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold dark:text-white text-lg truncate pr-8">{p.name}</h4>
                                <button 
                                    onClick={() => handleDelete(p.id, p.name)}
                                    className="text-gray-400 hover:text-red-500 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                {p.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin size={14} className="mt-0.5 text-indigo-500 shrink-0"/>
                                        <span className="truncate">{p.address}</span>
                                    </div>
                                )}
                                {p.contactEmail && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-green-500 shrink-0"/>
                                        <a href={`mailto:${p.contactEmail}`} className="hover:underline truncate">{p.contactEmail}</a>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t dark:border-gray-700 flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded border border-green-200 dark:border-green-800">
                                    Approved
                                </span>
                                {p.website && (
                                    <a href={p.website} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-indigo-500">
                                        <ExternalLink size={14}/>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
