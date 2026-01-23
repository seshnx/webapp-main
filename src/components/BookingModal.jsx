import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, MessageSquare, Loader2, Music, AlertCircle, User, Briefcase, FileText } from 'lucide-react';
import { SERVICE_TYPES, GENRE_DATA } from '../config/constants';

export default function BookingModal({ user, userData, target, onClose }) {
    const [loading, setLoading] = useState(false);
    
    // Proxy Booking State
    const [roster, setRoster] = useState([]);
    const [bookOnBehalf, setBookOnBehalf] = useState('me'); // 'me' or artistId
    const isAgentOrLabel = userData?.accountTypes?.some(t => ['Label', 'Agent'].includes(t));

    // Form State
    const [form, setForm] = useState({
        date: '',
        time: '',
        duration: 2,
        serviceType: 'Session',
        offerAmount: target.rate ? target.rate * 2 : 100, 
        message: '',
        // Project details - helps talent understand the opportunity
        projectGenre: '',
        projectType: '', // e.g., "Album", "Single", "Live Show", etc.
        referenceLinks: '' // YouTube, Spotify links for reference
    });
    
    // Get relevant service types based on target's role and sub-role
    // NOTE: Main app handles all user bookings (talent, engineer, studio, tech, etc.)
    //       BCM Studio Management is a control center for studio owners, not a booking interface
    const getServiceTypes = () => {
        const types = [...SERVICE_TYPES.general];
        const targetRoles = target.accountTypes || [];
        const targetSubRole = target.talentSubRole || '';
        
        // Talent-specific types based on sub-role
        if (targetRoles.includes('Talent')) {
            // Vocal sub-roles
            if (['Singer', 'Vocalist', 'Singer-Songwriter', 'Backup Singer', 'Rapper'].includes(targetSubRole)) {
                types.push(...SERVICE_TYPES.talent);
            }
            // DJ sub-roles
            else if (['DJ', 'Beatmaker'].includes(targetSubRole)) {
                types.push(...(SERVICE_TYPES.dj || []));
            }
            // Instrumentalist sub-roles
            else if (['Guitarist', 'Bassist', 'Drummer', 'Keyboardist', 'Pianist', 'Session Musician', 'Multi-Instrumentalist'].includes(targetSubRole)) {
                types.push(...(SERVICE_TYPES.instrumentalist || []));
            }
            // Default talent types
            else {
                types.push(...SERVICE_TYPES.talent, ...(SERVICE_TYPES.instrumentalist || []));
            }
        }
        
        // Producer-specific types
        if (targetRoles.includes('Producer')) {
            types.push(...(SERVICE_TYPES.production || []));
        }
        
        // Engineer-specific types
        if (targetRoles.includes('Engineer')) {
            types.push(...(SERVICE_TYPES.engineering || []));
        }
        
        // Studio-specific types (handled in main app)
        if (targetRoles.includes('Studio')) {
            types.push(...(SERVICE_TYPES.studio || []));
        }
        
        // Composer-specific types
        if (targetRoles.includes('Composer')) {
            types.push(...(SERVICE_TYPES.composer || []));
        }
        
        // Tech/Technician-specific types
        if (targetRoles.includes('Technician')) {
            types.push(...(SERVICE_TYPES.tech || []));
        }
        
        return [...new Set(types)]; // Remove duplicates
    };

    // Fetch Roster if Agent/Label
    useEffect(() => {
        if (isAgentOrLabel) {
            const userId = userData?.id || user?.id || user?.uid;
            const fetchRoster = async () => {
                try {
                    const response = await fetch(`/api/studio-ops/roster/${userId}`);
                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || 'Failed to fetch roster');
                    }

                    setRoster(result.data || []);
                } catch (e) {
                    console.error("Roster fetch error", e);
                }
            };
            fetchRoster();
        }
    }, [isAgentOrLabel, userData?.id, user?.id, user?.uid]);

    const handleDurationChange = (e) => {
        const val = e.target.value;
        const dur = val === '' ? '' : parseInt(val);
        setForm(prev => ({
            ...prev,
            duration: dur,
            offerAmount: (dur && target.rate) ? target.rate * dur : prev.offerAmount
        }));
    };

    const handleSubmit = async () => {
        if (!form.date || !form.time || !form.message) return alert("Please fill in all required fields.");
        if (!form.duration || form.duration <= 0) return alert("Duration must be at least 1 hour.");

        setLoading(true);
        try {
            const bookingDateTime = new Date(`${form.date}T${form.time}`);

            // Determine Sender Info (Direct vs Proxy)
            let senderInfo = {
                senderId: userData?.id || user?.id || user?.uid,
                senderName: userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User' : 'User',
                onBehalfOf: null
            };

            if (bookOnBehalf !== 'me') {
                const artist = roster.find(r => r.artistId === bookOnBehalf);
                if (artist) {
                    senderInfo.senderName = userData ? `${userData.firstName || 'User'} (for ${artist.name})` : `User (for ${artist.name})`;
                    senderInfo.onBehalfOf = {
                        id: artist.artistId,
                        name: artist.name,
                        photo: artist.photoURL
                    };
                }
            }

            const endTime = new Date(bookingDateTime.getTime() + (form.duration * 60 * 60 * 1000));
            const timeString = endTime.toTimeString().slice(0, 5); // HH:MM format

            const response = await fetch('/api/studio-ops/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studioId: target.id,
                    senderId: senderInfo.senderId,
                    type: form.serviceType,
                    date: form.date,
                    startTime: form.time,
                    endTime: timeString,
                    offerAmount: Number(form.offerAmount),
                    notes: form.message
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send booking request');
            }

            alert("Booking request sent successfully!");
            onClose();
        } catch (error) {
            console.error("Booking failed:", error);
            alert("Failed to send booking request.");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white dark:bg-[#2c2e36] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f]">
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">Book Session</h3>
                        <p className="text-xs text-gray-500">with <span className="text-brand-blue font-bold">{target.firstName || target.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500 dark:text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-5">
                    {/* PROXY SELECTOR */}
                    {isAgentOrLabel && roster.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800">
                            <label className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase mb-1 flex items-center gap-1">
                                <Briefcase size={12}/> Booking On Behalf Of:
                            </label>
                            <select 
                                className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-purple-800/50 dark:text-white text-sm font-bold"
                                value={bookOnBehalf}
                                onChange={e => setBookOnBehalf(e.target.value)}
                            >
                                <option value="me">Myself ({userData?.firstName || 'User'})</option>
                                {roster.map(r => (
                                    <option key={r.artistId} value={r.artistId}>
                                        Artist: {r.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Standard Rates Info */}
                    {target.rate && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                            <AlertCircle size={14}/>
                            <span>Standard Rate: <strong>${target.rate}/hr</strong></span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                <input 
                                    type="date" 
                                    className="w-full pl-10 p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    value={form.date}
                                    onChange={e => setForm({...form, date: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                <input 
                                    type="time" 
                                    className="w-full pl-10 p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    value={form.time}
                                    onChange={e => setForm({...form, time: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Duration (Hrs)</label>
                            <input 
                                type="number" 
                                min="1"
                                className="w-full p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm font-bold"
                                value={form.duration}
                                onChange={handleDurationChange}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Total Offer ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 text-green-500" size={16}/>
                                <input 
                                    type="number" 
                                    className="w-full pl-9 p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm font-bold text-green-600"
                                    value={form.offerAmount}
                                    onChange={e => setForm({...form, offerAmount: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Service Type</label>
                        <select 
                            className="w-full p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            value={form.serviceType}
                            onChange={e => setForm({...form, serviceType: e.target.value})}
                        >
                            {getServiceTypes().map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Project Details Section - Helps talent understand the gig */}
                    <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-700 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
                            <FileText size={14} /> Project Details (Optional)
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Project Type</label>
                                <select
                                    className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    value={form.projectType}
                                    onChange={e => setForm({...form, projectType: e.target.value})}
                                >
                                    <option value="">Select...</option>
                                    <option>Single Release</option>
                                    <option>EP / Album</option>
                                    <option>Live Performance</option>
                                    <option>Cover Song</option>
                                    <option>Demo Recording</option>
                                    <option>Commercial / Jingle</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Genre</label>
                                <select
                                    className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    value={form.projectGenre}
                                    onChange={e => setForm({...form, projectGenre: e.target.value})}
                                >
                                    <option value="">Select...</option>
                                    {GENRE_DATA.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Reference Links (YouTube, Spotify, etc.)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                placeholder="Paste links to reference tracks..."
                                value={form.referenceLinks}
                                onChange={e => setForm({...form, referenceLinks: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Message / Requirements</label>
                        <textarea 
                            className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm min-h-[100px] resize-none"
                            placeholder="Describe what you need, any specific style, key references..."
                            value={form.message}
                            onChange={e => setForm({...form, message: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]">
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : "Send Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}
