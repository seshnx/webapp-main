import React, { useState, useEffect } from 'react';
import { Search, Loader2, User, Briefcase, Wrench } from 'lucide-react';
import { TECH_SPECIALTIES } from '../../config/constants';
import TechBookingModal from './TechBookingModal';

export default function TechDirectory({ user, userData, openPublicProfile }) {
    const [techs, setTechs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [selectedTech, setSelectedTech] = useState(null);

    const runSearch = async () => {
        if (!supabase) return;
        setLoading(true);
        const userId = user?.id || user?.uid;
        try {
            let query = supabase
                .from('profiles')
                .select('id, first_name, last_name, photo_url, account_types, sub_roles, skills, rate, search_terms')
                .contains('account_types', ['Technician'])
                .limit(20);
            
            if (search) {
                query = query.ilike('search_terms', `%${search.toLowerCase()}%`);
            }
            
            const { data: profilesData, error } = await query;
            
            if (error) throw error;
            
            let results = (profilesData || [])
                .filter(t => t.id !== userId)
                .map(t => ({
                    id: t.id,
                    firstName: t.first_name,
                    lastName: t.last_name,
                    photoURL: t.photo_url,
                    accountTypes: t.account_types,
                    subRoles: t.sub_roles,
                    skills: t.skills,
                    rate: t.rate,
                    searchTerms: t.search_terms
                }));

            if (specialtyFilter) {
                results = results.filter(t => t.subRoles && t.subRoles.includes(specialtyFilter));
            }

            setTechs(results);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { runSearch(); }, [specialtyFilter]);

    return (
        <div className="animate-in fade-in">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                    <input 
                        className="w-full pl-12 p-3 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                        placeholder="Search technicians..."
                        value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch()}
                    />
                </div>
                <div className="md:w-1/3">
                    <select 
                        className="w-full p-3 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white cursor-pointer"
                        value={specialtyFilter}
                        onChange={e => setSpecialtyFilter(e.target.value)}
                    >
                        <option value="">All Specialties</option>
                        {TECH_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {loading ? <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-orange-500"/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {techs.map(tech => (
                        <div key={tech.id} className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition group">
                            <div className="h-24 bg-gradient-to-r from-slate-700 to-slate-600 relative">
                                <div className="absolute -bottom-8 left-6">
                                    <div className="h-16 w-16 rounded-full border-4 border-white dark:border-[#2c2e36] bg-gray-200 overflow-hidden">
                                        {tech.photoURL ? <img src={tech.photoURL} className="h-full w-full object-cover"/> : <div className="h-full w-full flex items-center justify-center text-gray-400"><User/></div>}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-10 px-6 pb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold dark:text-white text-lg">{tech.firstName} {tech.lastName}</h3>
                                        <div className="text-xs text-orange-600 dark:text-orange-400 font-bold mb-2 flex items-center gap-1">
                                            <Briefcase size={12}/> {tech.subRoles?.[0] || 'Technician'}
                                        </div>
                                    </div>
                                    {tech.rate > 0 && <div className="text-sm font-bold dark:text-gray-300 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-lg">${tech.rate}/hr</div>}
                                </div>
                                
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {tech.subRoles?.slice(0, 3).map(role => (
                                        <span key={role} className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">{role}</span>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
                                    {(tech.skills?.split(',') || []).slice(0, 3).map((s,i) => (
                                        <span key={i} className="text-[10px] text-gray-500 dark:text-gray-400 pr-2 border-r border-gray-300 dark:border-gray-600 last:border-0">{s.trim()}</span>
                                    ))}
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <button onClick={() => openPublicProfile(tech.id)} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-xs font-bold transition">Profile</button>
                                    <button onClick={() => setSelectedTech(tech)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1"><Wrench size={14}/> Request</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedTech && (
                <TechBookingModal 
                    user={user} 
                    userData={userData} 
                    target={selectedTech} 
                    onClose={() => setSelectedTech(null)} 
                />
            )}
        </div>
    );
}
