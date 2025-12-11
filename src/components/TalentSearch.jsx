import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, List, Map, ChevronDown, ChevronUp, Star, Plus, Check, Calendar,
    MapPin, Clock, DollarSign, Award, Zap, X, SlidersHorizontal, BadgeCheck,
    Music, Mic, Headphones, Radio, Guitar, Piano, Sparkles, TrendingUp
} from 'lucide-react';
import { collectionGroup, query, getDocs, where, limit, orderBy } from 'firebase/firestore';
import { db, getPaths } from '../config/firebase';
import StudioMap from './shared/StudioMap';
import LocationPicker from './shared/LocationPicker'; 
import { motion, AnimatePresence } from 'framer-motion';

// Profile type options with icons
const PROFILE_TYPES = [
    { value: 'All', label: 'All Profiles', icon: Sparkles },
    { value: 'Talent', label: 'Talent', icon: Music },
    { value: 'Producer', label: 'Producer', icon: Radio },
    { value: 'Engineer', label: 'Audio Engineer', icon: Headphones },
    { value: 'Vocalist', label: 'Vocalist', icon: Mic },
    { value: 'Guitarist', label: 'Guitarist', icon: Guitar },
    { value: 'Pianist', label: 'Pianist/Keys', icon: Piano },
    { value: 'Studio', label: 'Studio', icon: Headphones },
];

// Experience levels
const EXPERIENCE_LEVELS = [
    { value: 'All', label: 'Any Experience' },
    { value: 'beginner', label: 'Beginner (0-2 yrs)' },
    { value: 'intermediate', label: 'Intermediate (2-5 yrs)' },
    { value: 'advanced', label: 'Advanced (5-10 yrs)' },
    { value: 'expert', label: 'Expert (10+ yrs)' },
];

// Availability status helper
const getAvailabilityStatus = (profile) => {
    const lastActive = profile.lastActive?.toDate?.() || profile.lastActive;
    if (!lastActive) return { status: 'unknown', label: 'Unknown', color: 'gray' };
    
    const now = new Date();
    const diffMs = now - new Date(lastActive);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 5) return { status: 'online', label: 'Online now', color: 'green' };
    if (diffMins < 60) return { status: 'recent', label: `Active ${diffMins}m ago`, color: 'green' };
    if (diffHours < 24) return { status: 'today', label: `Active ${diffHours}h ago`, color: 'yellow' };
    if (diffDays < 7) return { status: 'week', label: `Active ${diffDays}d ago`, color: 'orange' };
    return { status: 'inactive', label: 'Inactive', color: 'gray' };
};

// Rating display component
const RatingBadge = ({ rating, reviewCount }) => {
    if (!rating && !reviewCount) return null;
    return (
        <div className="flex items-center gap-1 text-xs">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-yellow-600 dark:text-yellow-400">{rating?.toFixed(1) || '—'}</span>
            {reviewCount > 0 && <span className="text-gray-400">({reviewCount})</span>}
        </div>
    );
};

// Availability indicator component
const AvailabilityBadge = ({ profile }) => {
    const availability = getAvailabilityStatus(profile);
    const colorClasses = {
        green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        gray: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    };
    
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClasses[availability.color]}`}>
            {availability.status === 'online' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
            {availability.label}
        </span>
    );
};

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
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'rating', 'rate_low', 'rate_high', 'recent'
    
    // Advanced filters
    const [filters, setFilters] = useState({ 
        role: 'All', 
        minRate: 0, 
        maxRate: 500,
        experience: 'All',
        verified: false,
        availableNow: false,
        hasPortfolio: false,
        location: '',
        radius: 50, // miles
        genres: [],
        skills: []
    });

    // Active filter count for badge
    const activeFilterCount = [
        filters.role !== 'All',
        filters.minRate > 0,
        filters.maxRate < 500,
        filters.experience !== 'All',
        filters.verified,
        filters.availableNow,
        filters.hasPortfolio,
        filters.location,
        filters.genres.length > 0,
        filters.skills.length > 0
    ].filter(Boolean).length;

    const handleSearch = async () => {
        setLoadingSearch(true);
        try {
            const publicProfilesGroup = collectionGroup(db, getPaths().publicProfileCollectionGroup); 
            const constraints = [];
            
            if (filters.role !== 'All') {
                constraints.push(where('accountTypes', 'array-contains', filters.role));
            }
            constraints.push(limit(100));
            
            const q = query(publicProfilesGroup, ...constraints);
            const snap = await getDocs(q);
            
            let results = snap.docs.map(d => {
                const data = d.data();
                return { id: data.uid || d.ref.parent.parent.id, ...data };
            }).filter(p => p.id !== user.uid);
            
            // Apply text search
            if (searchQuery) {
                const lowerQ = searchQuery.toLowerCase();
                results = results.filter(p => 
                    p.firstName?.toLowerCase().includes(lowerQ) || 
                    p.lastName?.toLowerCase().includes(lowerQ) ||
                    p.profileName?.toLowerCase().includes(lowerQ) ||
                    p.bio?.toLowerCase().includes(lowerQ) ||
                    p.skills?.some(s => s.toLowerCase().includes(lowerQ)) ||
                    p.genres?.some(g => g.toLowerCase().includes(lowerQ)) ||
                    p.searchTerms?.includes(lowerQ)
                );
            }

            // Apply rate filter
            if (filters.minRate > 0 || filters.maxRate < 500) {
                results = results.filter(p => {
                    const rate = p.rate || 0;
                    return rate >= filters.minRate && rate <= filters.maxRate;
                });
            }

            // Apply experience filter
            if (filters.experience !== 'All') {
                results = results.filter(p => {
                    const years = p.yearsExperience || 0;
                    switch (filters.experience) {
                        case 'beginner': return years <= 2;
                        case 'intermediate': return years > 2 && years <= 5;
                        case 'advanced': return years > 5 && years <= 10;
                        case 'expert': return years > 10;
                        default: return true;
                    }
                });
            }

            // Apply verified filter
            if (filters.verified) {
                results = results.filter(p => p.verified === true);
            }

            // Apply available now filter
            if (filters.availableNow) {
                results = results.filter(p => {
                    const availability = getAvailabilityStatus(p);
                    return availability.status === 'online' || availability.status === 'recent';
                });
            }

            // Apply portfolio filter
            if (filters.hasPortfolio) {
                results = results.filter(p => 
                    (p.portfolio && p.portfolio.length > 0) || 
                    (p.audioSamples && p.audioSamples.length > 0) ||
                    p.spotifyUrl || p.soundcloudUrl
                );
            }

            // Apply sorting
            switch (sortBy) {
                case 'rating':
                    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    break;
                case 'rate_low':
                    results.sort((a, b) => (a.rate || 0) - (b.rate || 0));
                    break;
                case 'rate_high':
                    results.sort((a, b) => (b.rate || 0) - (a.rate || 0));
                    break;
                case 'recent':
                    results.sort((a, b) => {
                        const aTime = a.lastActive?.toDate?.() || a.lastActive || 0;
                        const bTime = b.lastActive?.toDate?.() || b.lastActive || 0;
                        return new Date(bTime) - new Date(aTime);
                    });
                    break;
                default: // relevance - verified first, then by rating
                    results.sort((a, b) => {
                        if (a.verified && !b.verified) return -1;
                        if (!a.verified && b.verified) return 1;
                        return (b.rating || 0) - (a.rating || 0);
                    });
            }
            
            setSearchResults(results);
        } catch (e) { 
            console.error("Search failed:", e); 
        }
        setLoadingSearch(false);
    };

    // Search on mount
    useEffect(() => {
        handleSearch();
    }, []);

    const clearFilters = () => {
        setFilters({
            role: 'All',
            minRate: 0,
            maxRate: 500,
            experience: 'All',
            verified: false,
            availableNow: false,
            hasPortfolio: false,
            location: '',
            radius: 50,
            genres: [],
            skills: []
        });
    };

    const FilterPanel = () => (
        <div className="space-y-5">
            {/* Profile Type */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Profile Type</label>
                <select 
                    className="w-full p-2.5 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                    value={filters.role} 
                    onChange={e => setFilters({...filters, role: e.target.value})}
                >
                    {PROFILE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
            </div>

            {/* Rate Range */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    Hourly Rate: ${filters.minRate} - ${filters.maxRate}
                </label>
                <div className="flex gap-2 items-center">
                    <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={filters.minRate}
                        onChange={e => setFilters({...filters, minRate: Math.min(parseInt(e.target.value), filters.maxRate - 10)})}
                        className="flex-1 accent-brand-blue"
                    />
                    <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={filters.maxRate}
                        onChange={e => setFilters({...filters, maxRate: Math.max(parseInt(e.target.value), filters.minRate + 10)})}
                        className="flex-1 accent-brand-blue"
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>$0</span>
                    <span>$500+</span>
                </div>
            </div>

            {/* Experience Level */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Experience Level</label>
                <select 
                    className="w-full p-2.5 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                    value={filters.experience}
                    onChange={e => setFilters({...filters, experience: e.target.value})}
                >
                    {EXPERIENCE_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                </select>
            </div>

            {/* Quick Filters */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Quick Filters</label>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#1f2128] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <input
                            type="checkbox"
                            checked={filters.availableNow}
                            onChange={e => setFilters({...filters, availableNow: e.target.checked})}
                            className="w-4 h-4 text-brand-blue rounded"
                        />
                        <Zap size={14} className="text-green-500" />
                        <span className="text-sm dark:text-white">Available Now</span>
                    </label>
                    
                    <label className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#1f2128] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <input
                            type="checkbox"
                            checked={filters.verified}
                            onChange={e => setFilters({...filters, verified: e.target.checked})}
                            className="w-4 h-4 text-brand-blue rounded"
                        />
                        <BadgeCheck size={14} className="text-blue-500" />
                        <span className="text-sm dark:text-white">Verified Only</span>
                    </label>
                    
                    <label className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#1f2128] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <input
                            type="checkbox"
                            checked={filters.hasPortfolio}
                            onChange={e => setFilters({...filters, hasPortfolio: e.target.checked})}
                            className="w-4 h-4 text-brand-blue rounded"
                        />
                        <Music size={14} className="text-purple-500" />
                        <span className="text-sm dark:text-white">Has Portfolio</span>
                    </label>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
                <button 
                    onClick={handleSearch} 
                    className="w-full bg-brand-blue text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                    <Search size={16} />
                    Search
                </button>
                {activeFilterCount > 0 && (
                    <button 
                        onClick={clearFilters}
                        className="w-full text-gray-500 dark:text-gray-400 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Clear Filters ({activeFilterCount})
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* DESKTOP FILTERS */}
            <div className={`hidden lg:block lg:col-span-3 space-y-4`}>
                <div className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm h-fit sticky top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold dark:text-white flex items-center gap-2">
                            <Filter size={18}/> Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </h3>
                    </div>
                    <FilterPanel />
                </div>
            </div>

            {/* MOBILE FILTER MODAL */}
            <AnimatePresence>
                {showMobileFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                        onClick={() => setShowMobileFilters(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween' }}
                            className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#2c2e36] p-5 overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold dark:text-white text-lg">Filters</h3>
                                <button onClick={() => setShowMobileFilters(false)}>
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>
                            <FilterPanel />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RESULTS */}
            <div className="lg:col-span-9 space-y-4">
                {/* Search Bar & Controls */}
                <div className="bg-white dark:bg-[#2c2e36] p-3 rounded-xl border dark:border-gray-700 shadow-sm space-y-3">
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                className="w-full pl-10 pr-4 p-2.5 bg-gray-50 dark:bg-[#1f2128] border-transparent focus:bg-white dark:focus:bg-black focus:border-brand-blue border rounded-lg dark:text-white transition-all outline-none" 
                                placeholder="Search by name, skill, genre..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handleSearch()} 
                            />
                        </div>
                        
                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg relative"
                        >
                            <SlidersHorizontal size={20} className="text-gray-600 dark:text-gray-300" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-blue text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Sort & View Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={e => { setSortBy(e.target.value); handleSearch(); }}
                                className="text-sm border-0 bg-transparent dark:text-white font-medium focus:ring-0 cursor-pointer"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="rating">Highest Rated</option>
                                <option value="rate_low">Price: Low to High</option>
                                <option value="rate_high">Price: High to Low</option>
                                <option value="recent">Recently Active</option>
                            </select>
                        </div>
                        <div className="text-xs text-gray-500">
                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
                
                {/* Results Grid */}
                <div className="min-h-[400px]">
                    {loadingSearch ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mb-3"></div>
                            <span>Searching talent...</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {searchResults.map(res => {
                                const isInCart = sessionCartIds.includes(res.id);
                                const availability = getAvailabilityStatus(res);
                                
                                return (
                                    <motion.div 
                                        key={res.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`bg-white dark:bg-[#2c2e36] p-4 rounded-xl border flex flex-col transition ${isInCart ? 'border-brand-blue ring-1 ring-brand-blue bg-blue-50 dark:bg-blue-900/10' : 'dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'}`}
                                    >
                                        {/* Profile Header */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div 
                                                className="relative cursor-pointer"
                                                onClick={() => openPublicProfile(res.id, res.firstName)}
                                            >
                                                {res.photoURL ? (
                                                    <img 
                                                        src={res.photoURL} 
                                                        alt={res.firstName}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-blue to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {res.firstName?.[0]}
                                                    </div>
                                                )}
                                                {/* Online indicator */}
                                                {availability.status === 'online' && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#2c2e36] rounded-full"></span>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 
                                                        className="font-bold dark:text-white truncate cursor-pointer hover:text-brand-blue transition"
                                                        onClick={() => openPublicProfile(res.id, res.firstName)}
                                                    >
                                                        {res.profileName || `${res.firstName} ${res.lastName}`}
                                                    </h4>
                                                    {res.verified && (
                                                        <BadgeCheck size={16} className="text-blue-500 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                                    <span className="text-xs text-gray-500">{res.accountTypes?.[0] || 'Talent'}</span>
                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                                        ${res.rate || '?'}/hr
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            <RatingBadge rating={res.rating} reviewCount={res.reviewCount} />
                                            <AvailabilityBadge profile={res} />
                                            {res.yearsExperience && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Award size={12} />
                                                    {res.yearsExperience}+ yrs
                                                </span>
                                            )}
                                        </div>

                                        {/* Bio Preview */}
                                        {res.bio && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                                {res.bio}
                                            </p>
                                        )}

                                        {/* Skills/Genres Tags */}
                                        {(res.skills?.length > 0 || res.genres?.length > 0) && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {[...(res.genres || []).slice(0, 2), ...(res.skills || []).slice(0, 2)].map((tag, i) => (
                                                    <span 
                                                        key={i}
                                                        className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Location */}
                                        {(res.city || res.state) && (
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                                                <MapPin size={12} />
                                                {[res.city, res.state].filter(Boolean).join(', ')}
                                            </div>
                                        )}
                                        
                                        {/* Action Button */}
                                        {mode === 'planner' && (
                                            <button 
                                                onClick={() => !isInCart && onAddToCart(res)}
                                                disabled={isInCart}
                                                className={`mt-auto w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${isInCart ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-brand-blue hover:text-white'}`}
                                            >
                                                {isInCart ? <><Check size={14}/> Added to Session</> : <><Plus size={14}/> Add to Session</>}
                                            </button>
                                        )}

                                        {mode === 'direct' && (
                                            <button 
                                                onClick={() => onBook(res)}
                                                className="mt-auto w-full py-2.5 rounded-lg text-xs font-bold bg-brand-blue text-white hover:bg-blue-600 transition flex items-center justify-center gap-2"
                                            >
                                                <Calendar size={14}/> Book Now
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Search size={48} className="mb-4 opacity-30" />
                            <p className="font-medium mb-2">No results found</p>
                            <p className="text-sm">Try adjusting your filters or search terms</p>
                            {activeFilterCount > 0 && (
                                <button 
                                    onClick={clearFilters}
                                    className="mt-4 text-brand-blue font-medium text-sm hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
