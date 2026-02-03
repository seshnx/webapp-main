import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, User, ChevronRight, Zap, Filter, Trash2 } from 'lucide-react';
import BidModal from './BidModal';
import { fetchZipLocation } from '../utils/geocode';

/**
 * Helper function to calculate distance between two coordinates
 */
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Location coordinates interface
 */
interface Location {
    lat: number;
    lng: number;
}

/**
 * Broadcast requirement interface
 */
interface Requirement {
    value: string;
    [key: string]: any;
}

/**
 * Broadcast data interface
 */
interface Broadcast {
    id: string;
    senderId?: string;
    sender_id?: string;
    targetId?: string;
    target_id?: string;
    timestamp?: string;
    created_at?: string;
    serviceType?: string;
    targetName?: string;
    senderName?: string;
    offerAmount?: number;
    date?: string;
    requirements?: Requirement[];
    location?: Location;
    distance?: number;
    type?: string;
    status?: string;
    updated_at?: string;
    [key: string]: any;
}

/**
 * Props for BroadcastList component
 */
export interface BroadcastListProps {
    user?: any;
    userData?: any;
    onBid?: (broadcastId: string) => void;
}

export default function BroadcastList({ user, userData, onBid }: BroadcastListProps) {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [filteredBroadcasts, setFilteredBroadcasts] = useState<Broadcast[]>([]);
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [rangeFilter, setRangeFilter] = useState<number>(50);

    useEffect(() => {
        const initLocation = async () => {
            if (userData?.zip) {
                const loc = await fetchZipLocation(userData.zip);
                if (loc) setUserLocation({ lat: loc.lat, lng: loc.lng });
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    p => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude })
                );
            }
        };
        initLocation();
    }, [userData]);

    useEffect(() => {
        // TODO: Migrate to Neon/Convex - Supabase legacy code
        const supabase = (window as any).supabase;
        if (!supabase) return;

        const loadBroadcasts = async () => {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('type', 'Broadcast')
                    .eq('status', 'Broadcasting')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setBroadcasts((data || []).map((b: any) => ({
                    id: b.id,
                    ...b,
                    senderId: b.sender_id,
                    targetId: b.target_id,
                    timestamp: b.created_at
                })));
            } catch (err) {
                console.error('Error loading broadcasts:', err);
            }
        };

        loadBroadcasts();

        // Subscribe to changes
        const channel = supabase
            .channel('broadcasts')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'bookings',
                filter: 'type=eq.Broadcast'
            }, () => {
                loadBroadcasts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (!userLocation) {
            setFilteredBroadcasts(broadcasts);
            return;
        }
        const nearby = broadcasts.filter(b => {
            if (!b.location || !b.location.lat || !b.location.lng) return true;
            const dist = getDistanceFromLatLonInKm(
                userLocation.lat,
                userLocation.lng,
                b.location.lat,
                b.location.lng
            );
            return dist <= rangeFilter;
        }).map(b => {
            const dist = b.location
                ? getDistanceFromLatLonInKm(
                    userLocation.lat,
                    userLocation.lng,
                    b.location.lat,
                    b.location.lng
                )
                : null;
            return { ...b, distance: dist };
        }).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        setFilteredBroadcasts(nearby);
    }, [broadcasts, userLocation, rangeFilter]);

    const cancelBroadcast = async (broadcastId: string) => {
        if (!window.confirm("Cancel this broadcast? This will remove it from the board.")) return;

        // TODO: Migrate to Neon/Convex - Supabase legacy code
        const supabase = (window as any).supabase;
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'Cancelled', updated_at: new Date().toISOString() })
                .eq('id', broadcastId);

            if (error) throw error;
        } catch (e) {
            console.error(e);
            alert("Failed to cancel.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                {/* ... (Header) ... */}
                <div>
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Zap className="text-yellow-500" size={20} /> Open Sessions
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Live opportunities near you.</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <MapPin size={14} className="ml-2 text-gray-500" />
                    <select
                        className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-300 p-1 outline-none cursor-pointer"
                        value={rangeFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRangeFilter(Number(e.target.value))}
                    >
                        <option value={10}>Within 10 mi</option>
                        <option value={25}>Within 25 mi</option>
                        <option value={50}>Within 50 mi</option>
                        <option value={100}>Within 100 mi</option>
                        <option value={5000}>Anywhere</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBroadcasts.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-[#2c2e36] rounded-xl border border-dashed dark:border-gray-700 text-gray-500">
                        No open sessions found.
                    </div>
                ) : (
                    filteredBroadcasts.map(b => (
                        <div
                            key={b.id}
                            className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                BUDGET: ${b.offerAmount || 'N/A'}
                            </div>
                            <div className="mb-4">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex justify-between">
                                    <span>{b.serviceType}</span>
                                    {typeof b.distance === 'number' && (
                                        <span className="text-brand-blue flex items-center gap-1">
                                            <MapPin size={10} /> {b.distance.toFixed(1)} mi
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-lg font-bold dark:text-white truncate pr-16">
                                    {b.targetName || 'Session Request'}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    <div className="flex items-center gap-1">
                                        <User size={14} /> {b.senderName}
                                    </div>
                                    {b.date && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} /> {b.date === 'Flexible' ? 'Flexible' : new Date(b.date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Requirements Tags */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                {b.requirements && b.requirements.slice(0, 3).map((req, i) => (
                                    <span
                                        key={i}
                                        className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300 border dark:border-gray-600"
                                    >
                                        {req.value}
                                    </span>
                                ))}
                            </div>
                            {/* Footer Actions */}
                            <div className="flex gap-2">
                                {b.sender_id === (user?.id || user?.uid) ? (
                                    <button
                                        onClick={() => cancelBroadcast(b.id)}
                                        className="w-full bg-red-100 text-red-600 py-2.5 rounded-lg font-bold text-sm hover:bg-red-200 transition flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Cancel
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setSelectedBroadcast(b)}
                                        className="w-full bg-gray-900 dark:bg-white dark:text-black text-white py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition flex justify-center items-center gap-2"
                                    >
                                        View & Bid <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {selectedBroadcast && (
                <BidModal
                    user={user}
                    userData={userData}
                    broadcast={selectedBroadcast}
                    onClose={() => setSelectedBroadcast(null)}
                />
            )}
        </div>
    );
}
