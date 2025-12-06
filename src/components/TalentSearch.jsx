import React, { useState } from 'react';
import { Search, Filter, List, Map, ChevronDown, ChevronUp, Star, Plus, Check, Calendar } from 'lucide-react';
import { collectionGroup, query, getDocs, where, limit } from 'firebase/firestore';
import { db, getPaths } from '../config/firebase';
import StudioMap from './shared/StudioMap';
import LocationPicker from './shared/LocationPicker'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function TalentSearch({ 
    user, 
    userData, 
    openPublicProfile, 
    onAddToCart, 
    sessionCartIds = [], 
    onBook, 
    mode = 'direct' // 'direct' | 'planner'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({ role: 'All', minRate: 0, maxRate: 500 });

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      const publicProfilesGroup = collectionGroup(db, getPaths().publicProfileCollectionGroup); 
      const constraints = [];
      if (filters.role !== 'All') constraints.push(where('accountTypes', 'array-contains', filters.role));
      constraints.push(limit(50));
      
      const q = query(publicProfilesGroup, ...constraints);
      const snap = await getDocs(q);
      
      let results = snap.docs.map(d => {
          const data = d.data();
          return { id: data.uid || d.ref.parent.parent.id, ...data };
      }).filter(p => p.id !== user.uid);
      
      if (searchQuery) {
          const lowerQ = searchQuery.toLowerCase();
          results = results.filter(p => 
              p.firstName?.toLowerCase().includes(lowerQ) || 
              p.lastName?.toLowerCase().includes(lowerQ) ||
              p.searchTerms?.includes(lowerQ)
          );
      }
        
      setSearchResults(results);
    } catch (e) { console.error("Search failed:", e); }
    setLoadingSearch(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* FILTERS */}
        <div className={`lg:col-span-3 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
             <div className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm h-fit sticky top-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold dark:text-white flex items-center gap-2"><Filter size={18}/> Filters</h3>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Profile Type</label>
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white" value={filters.role} onChange={e => setFilters({...filters, role: e.target.value})}>
                            <option value="All">All Profiles</option>
                            <option value="Musician">Musician</option>
                            <option value="Producer">Producer</option>
                            <option value="Engineer">Audio Engineer</option>
                        </select>
                    </div>
                    <button onClick={handleSearch} className="w-full bg-brand-blue text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition">Update Results</button>
                </div>
             </div>
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-9 space-y-4">
            <div className="bg-white dark:bg-[#2c2e36] p-3 rounded-xl border dark:border-gray-700 flex gap-3 items-center shadow-sm">
                <div className="relative flex-1 w-full"><Search className="absolute left-3 top-3 text-gray-400" size={18} /><input className="w-full pl-10 p-2.5 bg-gray-50 dark:bg-[#1f2128] border-transparent focus:bg-white dark:focus:bg-black focus:border-brand-blue border rounded-lg dark:text-white transition-all outline-none" placeholder="Search talent..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} /></div>
            </div>
            
            <div className="min-h-[400px]">
                {loadingSearch ? (
                    <div className="text-center py-10 text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map(res => {
                            const isInCart = sessionCartIds.includes(res.id);
                            return (
                                <div key={res.id} className={`bg-white dark:bg-[#2c2e36] p-4 rounded-xl border flex flex-col transition ${isInCart ? 'border-brand-blue ring-1 ring-brand-blue bg-blue-50 dark:bg-blue-900/10' : 'dark:border-gray-700 hover:border-gray-400'}`}>
                                    <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => openPublicProfile(res.id, res.firstName)}>
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">{res.firstName?.[0]}</div>
                                        <div>
                                            <h4 className="font-bold dark:text-white">{res.firstName} {res.lastName}</h4>
                                            <p className="text-xs text-gray-500">{res.accountTypes[0]} • ${res.rate || '?'}/hr</p>
                                        </div>
                                    </div>
                                    
                                    {/* MODE: PLANNER (Cart) */}
                                    {mode === 'planner' && (
                                        <button 
                                            onClick={() => !isInCart && onAddToCart(res)}
                                            disabled={isInCart}
                                            className={`mt-auto w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${isInCart ? 'bg-green-100 text-green-700 cursor-default' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-brand-blue hover:text-white transition'}`}
                                        >
                                            {isInCart ? <><Check size={14}/> Added to Session</> : <><Plus size={14}/> Add to Session</>}
                                        </button>
                                    )}

                                    {/* MODE: DIRECT (Book Now) */}
                                    {mode === 'direct' && (
                                        <button 
                                            onClick={() => onBook(res)}
                                            className="mt-auto w-full py-2 rounded-lg text-xs font-bold bg-brand-blue text-white hover:bg-blue-600 transition flex items-center justify-center gap-2"
                                        >
                                            <Calendar size={14}/> Book Now
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">Try adjusting filters to find talent.</div>
                )}
            </div>
        </div>
    </div>
  );
}
