import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, ChevronRight, Search, Loader2 } from 'lucide-react';
import { collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import LocationPicker from './shared/LocationPicker';
import { getDistanceFromLatLonInKm } from '../utils/geocode'; // Assuming this utility exists or inline it
import StudioMap from './shared/StudioMap';

// Inline Geo Utility if not imported
function calcDist(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2-lat1) * (Math.PI/180); 
  const dLon = (lon2-lon1) * (Math.PI/180); 
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))) * 0.621371; // Miles
}

export default function SessionWizard({ userData, sessionParams, setSessionParams, onNext }) {
    const [step, setStep] = useState(1);
    const [loadingStudios, setLoadingStudios] = useState(false);
    const [availableStudios, setAvailableStudios] = useState([]);

    // --- STEP 1: LOGISTICS ---
    const handleLogisticsSubmit = (e) => {
        e.preventDefault();
        setStep(2);
        fetchStudios();
    };

    // --- STEP 2: STUDIO FETCHING ---
    const fetchStudios = async () => {
        setLoadingStudios(true);
        try {
            // Fetch all studios (Optimization: Real app needs GeoFire or bounded queries)
            const q = query(collectionGroup(db, 'public_profile'), where('accountTypes', 'array-contains', 'Studio'));
            const snap = await getDocs(q);
            
            const rawStudios = snap.docs.map(d => ({ id: d.ref.parent.parent.id, ...d.data() }));
            
            // Client-side filtering for distance
            const filtered = rawStudios.filter(studio => {
                if (!studio.location || !sessionParams.location) return false;
                const dist = calcDist(
                    sessionParams.location.lat, sessionParams.location.lng,
                    studio.location.lat, studio.location.lng
                );
                return dist <= sessionParams.radius;
            }).map(s => ({
                ...s,
                distance: calcDist(sessionParams.location.lat, sessionParams.location.lng, s.location.lat, s.location.lng)
            })).sort((a, b) => a.distance - b.distance);

            setAvailableStudios(filtered);
        } catch (e) {
            console.error("Studio fetch error:", e);
        }
        setLoadingStudios(false);
    };

    const selectStudio = (studio) => {
        setSessionParams(prev => ({ ...prev, venue: studio }));
        onNext(); // Move to Talent Search/Summary
    };

    // --- RENDER ---
    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden min-h-[600px]">
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]">
                <h2 className="text-xl font-extrabold dark:text-white flex items-center gap-2">
                    <span className="bg-brand-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">{step}</span>
                    {step === 1 ? 'Session Logistics' : 'Select Studio'}
                </h2>
                <p className="text-sm text-gray-500 mt-1 ml-10">
                    {step === 1 ? 'Define the when and where.' : `Found ${availableStudios.length} studios within range.`}
                </p>
            </div>

            {/* STEP 1: FORM */}
            {step === 1 && (
                <form onSubmit={handleLogisticsSubmit} className="p-8 space-y-6 max-w-2xl mx-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block"><Calendar size={14} className="inline mr-1"/> Date</label>
                            <input 
                                type="date" required 
                                className="w-full p-3 border rounded-xl dark:bg-black/20 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                                value={sessionParams.date}
                                onChange={e => setSessionParams({...sessionParams, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block"><Clock size={14} className="inline mr-1"/> Start Time</label>
                            <input 
                                type="time" required 
                                className="w-full p-3 border rounded-xl dark:bg-black/20 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                                value={sessionParams.time}
                                onChange={e => setSessionParams({...sessionParams, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <LocationPicker 
                            initialZip={userData?.zip} 
                            label="Center Location"
                            onLocationChange={(loc) => setSessionParams({...sessionParams, location: loc})}
                        />
                        
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Distance</label>
                                <span className="text-xs font-bold text-brand-blue">{sessionParams.radius} miles</span>
                            </div>
                            <input 
                                type="range" min="5" max="100" step="5"
                                value={sessionParams.radius}
                                onChange={e => setSessionParams({...sessionParams, radius: parseInt(e.target.value)})}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block"><AlertCircle size={14} className="inline mr-1"/> Urgency</label>
                            <div className="flex gap-2">
                                {['Low', 'Normal', 'High'].map(u => (
                                    <button
                                        key={u} type="button"
                                        onClick={() => setSessionParams({...sessionParams, urgency: u})}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${sessionParams.urgency === u ? 'bg-brand-blue text-white border-brand-blue' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button type="submit" className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition flex justify-center items-center gap-2">
                            Find Studios <ChevronRight size={20}/>
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 2: STUDIO SELECTION */}
            {step === 2 && (
                <div className="flex flex-col h-[600px]">
                    {loadingStudios ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-brand-blue mb-4" size={40}/>
                            <p className="text-gray-500">Scouting locations...</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex overflow-hidden">
                            {/* List */}
                            <div className="w-full md:w-1/2 overflow-y-auto p-4 space-y-3">
                                <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-brand-blue mb-2 flex items-center gap-1">← Change Filters</button>
                                
                                {/* "No Studio Needed" Option */}
                                <div 
                                    onClick={() => selectStudio({ id: 'remote', name: 'Remote / TBD', address: 'No physical location set' })}
                                    className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-center"
                                >
                                    <h4 className="font-bold text-gray-600 dark:text-gray-300">No Studio Needed / Remote</h4>
                                    <p className="text-xs text-gray-400">Skip venue selection</p>
                                </div>

                                {availableStudios.map(studio => (
                                    <div 
                                        key={studio.id} 
                                        onClick={() => selectStudio(studio)}
                                        className="bg-white dark:bg-[#1f2128] p-4 rounded-xl border dark:border-gray-700 hover:border-brand-blue dark:hover:border-blue-500 cursor-pointer transition shadow-sm group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold dark:text-white group-hover:text-brand-blue">{studio.name || 'Studio'}</h4>
                                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">${studio.rate}/hr</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <MapPin size={10}/> {studio.distance.toFixed(1)} miles away
                                        </p>
                                        <div className="flex gap-1 mt-2">
                                            {(studio.equipmentList || []).slice(0, 3).map(e => (
                                                <span key={e} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded">{e}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Map Preview */}
                            <div className="hidden md:block w-1/2 h-full border-l dark:border-gray-700 relative">
                                <StudioMap 
                                    locations={availableStudios} 
                                    center={[sessionParams.location?.lat, sessionParams.location?.lng]} 
                                    height="100%" 
                                    drawRadius={true}
                                    radiusMiles={sessionParams.radius}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
