import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapPin, Clock, DollarSign, User, ChevronRight, Zap, Filter, Trash2, X, SlidersHorizontal, List, Map as MapIcon, Navigation2 } from 'lucide-react';
import BidModal from './BidModal';
import TalentMap from './shared/TalentMap';
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
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // Filter states
    const [rangeFilter, setRangeFilter] = useState<number>(50);
    const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
    const [budgetFilter, setBudgetFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [durationFilter, setDurationFilter] = useState<string>('all');
    const [postedWithinFilter, setPostedWithinFilter] = useState<string>('all');
    const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<string>('newest');

    // Extract unique service types from broadcasts
    const serviceTypes = useMemo(() => {
        const types = new Set(broadcasts.map(b => b.serviceType).filter(Boolean));
        return Array.from(types);
    }, [broadcasts]);

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

    // Clear all filters
    const clearFilters = () => {
        setServiceTypeFilter('all');
        setBudgetFilter('all');
        setDateFilter('all');
        setDurationFilter('all');
        setPostedWithinFilter('all');
        setRangeFilter(50);
        setVerifiedOnly(false);
        setSortBy('newest');
    };

    // Get current location
    const getCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(location);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your location. Please enable location services.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }, []);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return serviceTypeFilter !== 'all' ||
               budgetFilter !== 'all' ||
               dateFilter !== 'all' ||
               durationFilter !== 'all' ||
               postedWithinFilter !== 'all' ||
               rangeFilter !== 50 ||
               verifiedOnly ||
               sortBy !== 'newest';
    }, [serviceTypeFilter, budgetFilter, dateFilter, durationFilter, postedWithinFilter, rangeFilter, verifiedOnly, sortBy]);

    // Comprehensive filtering logic
    useEffect(() => {
        let filtered = [...broadcasts];

        // Service type filter
        if (serviceTypeFilter !== 'all') {
            filtered = filtered.filter(b => b.serviceType === serviceTypeFilter);
        }

        // Budget filter
        if (budgetFilter !== 'all') {
            filtered = filtered.filter(b => {
                const amount = b.offerAmount || 0;
                switch (budgetFilter) {
                    case 'under-100': return amount < 100;
                    case '100-250': return amount >= 100 && amount < 250;
                    case '250-500': return amount >= 250 && amount < 500;
                    case '500-1000': return amount >= 500 && amount < 1000;
                    case 'over-1000': return amount >= 1000;
                    default: return true;
                }
            });
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            filtered = filtered.filter(b => {
                if (!b.date || b.date === 'Flexible') return dateFilter === 'flexible';
                const bookingDate = new Date(b.date);
                switch (dateFilter) {
                    case 'flexible': return b.date === 'Flexible';
                    case 'this-week': return bookingDate <= oneWeekFromNow;
                    case 'this-month': return bookingDate <= oneMonthFromNow;
                    default: return true;
                }
            });
        }

        // Duration filter
        if (durationFilter !== 'all') {
            filtered = filtered.filter(b => {
                const hours = b.duration_hours || 0;
                switch (durationFilter) {
                    case 'under-2': return hours < 2;
                    case '2-4': return hours >= 2 && hours < 4;
                    case '4-8': return hours >= 4 && hours < 8;
                    case 'over-8': return hours >= 8;
                    default: return true;
                }
            });
        }

        // Posted within filter
        if (postedWithinFilter !== 'all') {
            const now = new Date();
            const cutoffTime = {
                '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
                '3days': new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
                'week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                'month': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            }[postedWithinFilter];

            if (cutoffTime) {
                filtered = filtered.filter(b => {
                    const postedDate = new Date(b.timestamp || b.created_at || 0);
                    return postedDate >= cutoffTime;
                });
            }
        }

        // Verified only filter
        if (verifiedOnly) {
            filtered = filtered.filter(b => b.senderVerified || b.verified);
        }

        // Location filter
        if (userLocation && rangeFilter < 5000) {
            filtered = filtered.filter(b => {
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
            });
        }

        // Sorting
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => {
                    const dateA = new Date(a.timestamp || a.created_at || 0);
                    const dateB = new Date(b.timestamp || b.created_at || 0);
                    return dateB.getTime() - dateA.getTime();
                });
                break;
            case 'budget-high':
                filtered.sort((a, b) => (b.offerAmount || 0) - (a.offerAmount || 0));
                break;
            case 'budget-low':
                filtered.sort((a, b) => (a.offerAmount || 0) - (b.offerAmount || 0));
                break;
            case 'nearest':
                if (userLocation) {
                    filtered.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
                }
                break;
        }

        setFilteredBroadcasts(filtered);
    }, [broadcasts, userLocation, rangeFilter, serviceTypeFilter, budgetFilter, dateFilter, durationFilter, postedWithinFilter, verifiedOnly, sortBy]);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* DESKTOP FILTERS */}
            <div className="hidden lg:block lg:col-span-3 space-y-4">
                <div className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm h-fit sticky top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold dark:text-white flex items-center gap-2">
                            <Filter size={18} /> Filters
                            {hasActiveFilters && (
                                <span className="bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full">
                                    {[serviceTypeFilter, budgetFilter, dateFilter, durationFilter, postedWithinFilter].filter(f => f !== 'all').length + (rangeFilter !== 50 ? 1 : 0) + (verifiedOnly ? 1 : 0)}
                                </span>
                            )}
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                            >
                                <X size={14} />
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="space-y-5">
                        {/* Service Type Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Service Type
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                value={serviceTypeFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setServiceTypeFilter(e.target.value)}
                            >
                                <option value="all">All Services</option>
                                {serviceTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Budget Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Budget
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                value={budgetFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBudgetFilter(e.target.value)}
                            >
                                <option value="all">Any Budget</option>
                                <option value="under-100">Under $100</option>
                                <option value="100-250">$100 - $250</option>
                                <option value="250-500">$250 - $500</option>
                                <option value="500-1000">$500 - $1,000</option>
                                <option value="over-1000">$1,000+</option>
                            </select>
                        </div>

                        {/* Duration Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Duration
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                value={durationFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDurationFilter(e.target.value)}
                            >
                                <option value="all">Any Duration</option>
                                <option value="under-2">Under 2 hours</option>
                                <option value="2-4">2-4 hours</option>
                                <option value="4-8">4-8 hours</option>
                                <option value="over-8">8+ hours</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Availability
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                value={dateFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateFilter(e.target.value)}
                            >
                                <option value="all">Any Date</option>
                                <option value="flexible">Flexible</option>
                                <option value="this-week">This Week</option>
                                <option value="this-month">This Month</option>
                            </select>
                        </div>

                        {/* Posted Within Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Posted Within
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                value={postedWithinFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPostedWithinFilter(e.target.value)}
                            >
                                <option value="all">Any Time</option>
                                <option value="24h">Last 24 hours</option>
                                <option value="3days">Last 3 days</option>
                                <option value="week">Last week</option>
                                <option value="month">Last month</option>
                            </select>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Location
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                        placeholder="City, zip, or address"
                                    />
                                </div>
                                <button
                                    onClick={getCurrentLocation}
                                    className="p-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition"
                                    title="Use my current location"
                                >
                                    <Navigation2 size={16} />
                                </button>
                            </div>
                            {userLocation && (
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <MapPin size={12} /> Location set
                                    </span>
                                    <button
                                        onClick={() => setUserLocation(null)}
                                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Distance Filter - Only show when location is set */}
                        {userLocation && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                    Search Radius
                                </label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                    value={rangeFilter}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRangeFilter(Number(e.target.value))}
                                >
                                    <option value={10}>Within 10 mi</option>
                                    <option value={25}>Within 25 mi</option>
                                    <option value={50}>Within 50 mi</option>
                                    <option value={100}>Within 100 mi</option>
                                    <option value={250}>Within 250 mi</option>
                                    <option value={500}>Within 500 mi</option>
                                </select>
                            </div>
                        )}

                        {/* Quick Filters */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                Quick Filters
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                    <input
                                        type="checkbox"
                                        checked={verifiedOnly}
                                        onChange={e => setVerifiedOnly(e.target.checked)}
                                        className="w-4 h-4 text-brand-blue rounded"
                                    />
                                    <span className="text-sm dark:text-white">Verified Only</span>
                                </label>
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Sort by
                            </label>
                            <div className="space-y-2">
                                {[
                                    { value: 'newest', label: 'Newest First' },
                                    { value: 'budget-high', label: 'Budget: High to Low' },
                                    { value: 'budget-low', label: 'Budget: Low to High' },
                                    { value: 'nearest', label: 'Nearest' },
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSortBy(option.value)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            sortBy === option.value
                                                ? 'bg-brand-blue text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE FILTER BUTTON */}
            <div className="lg:hidden col-span-full">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                        showFilters || hasActiveFilters
                            ? 'bg-brand-blue text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    <SlidersHorizontal size={16} />
                    Filters
                    {hasActiveFilters && (
                        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                            {[serviceTypeFilter, budgetFilter, dateFilter, durationFilter, postedWithinFilter].filter(f => f !== 'all').length + (rangeFilter !== 50 ? 1 : 0) + (verifiedOnly ? 1 : 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* MOBILE FILTER PANEL */}
            {showFilters && (
                <div className="lg:hidden col-span-full bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold dark:text-white flex items-center gap-2">
                            <Filter size={18} />
                            Filter Opportunities
                        </h4>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                            >
                                <X size={14} />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Service Type Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Service Type
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white"
                                value={serviceTypeFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setServiceTypeFilter(e.target.value)}
                            >
                                <option value="all">All Services</option>
                                {serviceTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Budget Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Budget
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white"
                                value={budgetFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBudgetFilter(e.target.value)}
                            >
                                <option value="all">Any Budget</option>
                                <option value="under-100">Under $100</option>
                                <option value="100-250">$100 - $250</option>
                                <option value="250-500">$250 - $500</option>
                                <option value="500-1000">$500 - $1,000</option>
                                <option value="over-1000">$1,000+</option>
                            </select>
                        </div>

                        {/* Duration Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Duration
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white"
                                value={durationFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDurationFilter(e.target.value)}
                            >
                                <option value="all">Any Duration</option>
                                <option value="under-2">Under 2 hours</option>
                                <option value="2-4">2-4 hours</option>
                                <option value="4-8">4-8 hours</option>
                                <option value="over-8">8+ hours</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Availability
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white"
                                value={dateFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateFilter(e.target.value)}
                            >
                                <option value="all">Any Date</option>
                                <option value="flexible">Flexible</option>
                                <option value="this-week">This Week</option>
                                <option value="this-month">This Month</option>
                            </select>
                        </div>

                        {/* Posted Within Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Posted Within
                            </label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white"
                                value={postedWithinFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPostedWithinFilter(e.target.value)}
                            >
                                <option value="all">Any Time</option>
                                <option value="24h">Last 24 hours</option>
                                <option value="3days">Last 3 days</option>
                                <option value="week">Last week</option>
                                <option value="month">Last month</option>
                            </select>
                        </div>

                        {/* Distance Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Location
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white"
                                        placeholder="City, zip, or address"
                                    />
                                </div>
                                <button
                                    onClick={getCurrentLocation}
                                    className="p-2 bg-brand-blue text-white rounded-lg"
                                    title="Use my current location"
                                >
                                    <Navigation2 size={16} />
                                </button>
                            </div>
                            {userLocation && (
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <MapPin size={12} /> Location set
                                    </span>
                                    <button
                                        onClick={() => setUserLocation(null)}
                                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Search Radius - Only show when location is set */}
                        {userLocation && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                    Search Radius
                                </label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white"
                                    value={rangeFilter}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRangeFilter(Number(e.target.value))}
                                >
                                    <option value={10}>Within 10 mi</option>
                                    <option value={25}>Within 25 mi</option>
                                    <option value={50}>Within 50 mi</option>
                                    <option value={100}>Within 100 mi</option>
                                    <option value={250}>Within 250 mi</option>
                                    <option value={500}>Within 500 mi</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Quick Filters - Mobile */}
                    <div className="mt-4">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                            Quick Filters
                        </label>
                        <label className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={verifiedOnly}
                                onChange={e => setVerifiedOnly(e.target.checked)}
                                className="w-4 h-4 text-brand-blue rounded"
                            />
                            <span className="text-sm dark:text-white">Verified Only</span>
                        </label>
                    </div>

                    {/* Sort Options */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                Sort by:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'newest', label: 'Newest' },
                                    { value: 'budget-high', label: 'Budget High' },
                                    { value: 'budget-low', label: 'Budget Low' },
                                    { value: 'nearest', label: 'Nearest' },
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSortBy(option.value)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            sortBy === option.value
                                                ? 'bg-brand-blue text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* RESULTS */}
            <div className="col-span-1 lg:col-span-9 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <Zap className="text-yellow-500" size={20} /> Find Bookings
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredBroadcasts.length} {filteredBroadcasts.length === 1 ? 'opportunity' : 'opportunities'} available
                        </p>
                    </div>
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                            title="List view"
                        >
                            <List size={16} className={viewMode === 'list' ? 'text-brand-blue' : 'text-gray-500'} />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-1.5 rounded transition ${viewMode === 'map' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                            title="Map view"
                        >
                            <MapIcon size={16} className={viewMode === 'map' ? 'text-brand-blue' : 'text-gray-500'} />
                        </button>
                    </div>
                </div>

                {/* Map View or List View */}
                {viewMode === 'map' ? (
                    <TalentMap
                        itemType="booking"
                        items={filteredBroadcasts.map(b => ({
                            id: b.id,
                            name: b.targetName || b.senderName || 'Session Request',
                            location: b.location,
                            type: b.serviceType || 'Session',
                            budget: b.offerAmount,
                            ...b
                        }))}
                        onItemClick={(item) => setSelectedBroadcast(item)}
                        userLocation={userLocation}
                        radius={rangeFilter}
                    />
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBroadcasts.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-[#2c2e36] rounded-xl border border-dashed dark:border-gray-700">
                        <Filter className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {hasActiveFilters ? 'No opportunities match your filters' : 'No open sessions found'}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-3 text-brand-blue hover:text-blue-600 text-sm font-medium"
                            >
                                Clear filters to see all opportunities
                            </button>
                        )}
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
                )}

                {selectedBroadcast && (
                    <BidModal
                        user={user}
                        userData={userData}
                        broadcast={selectedBroadcast}
                        onClose={() => setSelectedBroadcast(null)}
                    />
                )}
            </div>
        </div>
    );
}
