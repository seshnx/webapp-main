import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import {
    Search, Filter, List, Map, ChevronDown, ChevronUp, Star, Plus, Check, Calendar,
    MapPin, Clock, DollarSign, Award, Zap, X, SlidersHorizontal, BadgeCheck,
    Music, Mic, Headphones, Radio, Guitar, Piano, Sparkles, TrendingUp, Disc, Loader2, Navigation
} from 'lucide-react';
import {
    VOCAL_RANGES, VOCAL_STYLES, TALENT_SUBROLES,
    DJ_STYLES, PRODUCTION_STYLES, ENGINEERING_SPECIALTIES,
    VOCAL_SUBROLES, INSTRUMENTALIST_SUBROLES, DJ_SUBROLES, GENRE_DATA
} from '../config/constants';
import StudioMap from './shared/StudioMap';
import TalentMap from './shared/TalentMap';
import LocationPicker from './shared/LocationPicker';
import TalentSearchFilterPanel from './TalentSearchFilterPanel.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProfiles } from '../config/neonQueries';

// Lazy load BroadcastRequest component
const BroadcastRequest = lazy(() => import('./BroadcastRequest'));

// Types
interface ProfileType {
    value: string;
    label: string;
    icon: any;
    isSubRole?: boolean;
    category?: string;
}

interface ExperienceLevel {
    value: string;
    label: string;
}

interface AvailabilityStatus {
    status: string;
    label: string;
    color: string;
}

interface TalentProfile {
    id: string;
    firstName?: string;
    lastName?: string;
    profileName?: string;
    photoURL?: string;
    bio?: string;
    accountTypes?: string[];
    rate?: number;
    yearsExperience?: number;
    rating?: number;
    reviewCount?: number;
    verified?: boolean;
    skills?: string[];
    genres?: string[];
    vocalRange?: string;
    vocalStyles?: string[];
    djStyles?: string[];
    productionStyles?: string[];
    location?: { lat: number; lng: number };
    city?: string;
    state?: string;
    lastActive?: any;
}

interface FiltersState {
    role: string;
    minRate: number;
    maxRate: number;
    experience: string;
    verified: boolean;
    availableNow: boolean;
    hasPortfolio: boolean;
    location: string;
    radius: number;
    genres: string[];
    skills: string[];
    vocalRange: string;
    vocalStyle: string;
    djStyle: string;
    productionStyle: string;
    engineeringSpecialty: string;
}

interface UserLocation {
    lat: number;
    lng: number;
}

interface TalentSearchProps {
    user?: any;
    userData?: any;
    openPublicProfile: (id: string, name?: string) => void;
    onAddToCart?: (profile: TalentProfile) => void;
    sessionCartIds?: string[];
    onBook?: (profile: TalentProfile) => void;
    mode?: 'direct' | 'planner';
}

// Profile type options with icons - comprehensive list for all roles
const PROFILE_TYPES: ProfileType[] = [
    { value: 'All', label: 'All Profiles', icon: Sparkles },
    // Main roles
    { value: 'Talent', label: 'All Talent', icon: Music },
    { value: 'Producer', label: 'Producer', icon: Radio },
    { value: 'Engineer', label: 'Audio Engineer', icon: Headphones },
    { value: 'Studio', label: 'Studio', icon: Headphones },
    { value: 'Composer', label: 'Composer', icon: Music },
    // Vocal sub-roles
    { value: 'Singer', label: 'Singer', icon: Mic, isSubRole: true, category: 'vocal' },
    { value: 'Vocalist', label: 'Vocalist', icon: Mic, isSubRole: true, category: 'vocal' },
    { value: 'Singer-Songwriter', label: 'Singer-Songwriter', icon: Mic, isSubRole: true, category: 'vocal' },
    { value: 'Rapper', label: 'Rapper', icon: Mic, isSubRole: true, category: 'vocal' },
    { value: 'Backup Singer', label: 'Backup Singer', icon: Mic, isSubRole: true, category: 'vocal' },
    // Instrumentalist sub-roles
    { value: 'Guitarist', label: 'Guitarist', icon: Guitar, isSubRole: true, category: 'instrumentalist' },
    { value: 'Bassist', label: 'Bassist', icon: Guitar, isSubRole: true, category: 'instrumentalist' },
    { value: 'Drummer', label: 'Drummer', icon: Music, isSubRole: true, category: 'instrumentalist' },
    { value: 'Keyboardist', label: 'Keyboardist', icon: Piano, isSubRole: true, category: 'instrumentalist' },
    { value: 'Pianist', label: 'Pianist', icon: Piano, isSubRole: true, category: 'instrumentalist' },
    { value: 'Session Musician', label: 'Session Musician', icon: Music, isSubRole: true, category: 'instrumentalist' },
    { value: 'Multi-Instrumentalist', label: 'Multi-Instrumentalist', icon: Music, isSubRole: true, category: 'instrumentalist' },
    // DJ/Electronic sub-roles
    { value: 'DJ', label: 'DJ', icon: Disc, isSubRole: true, category: 'dj' },
    { value: 'Beatmaker', label: 'Beatmaker', icon: Disc, isSubRole: true, category: 'dj' },
];

// Experience levels
const EXPERIENCE_LEVELS: ExperienceLevel[] = [
    { value: 'All', label: 'Any Experience' },
    { value: 'beginner', label: 'Beginner (0-2 yrs)' },
    { value: 'intermediate', label: 'Intermediate (2-5 yrs)' },
    { value: 'advanced', label: 'Advanced (5-10 yrs)' },
    { value: 'expert', label: 'Expert (10+ yrs)' },
];

// Availability status helper
const getAvailabilityStatus = (profile: TalentProfile): AvailabilityStatus => {
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
interface RatingBadgeProps {
    rating?: number;
    reviewCount?: number;
}

const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, reviewCount }) => {
    if (!rating && !reviewCount) return null;
    const numericRating = typeof rating === 'number' ? rating : parseFloat(rating as any);
    const displayRating = !isNaN(numericRating) ? numericRating.toFixed(1) : '—';
    return (
        <div className="flex items-center gap-1 text-xs">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-yellow-600 dark:text-yellow-400">{rating ? displayRating : '—'}</span>
            {reviewCount && reviewCount > 0 && <span className="text-gray-400">({reviewCount})</span>}
        </div>
    );
};

// Availability indicator component
interface AvailabilityBadgeProps {
    profile: TalentProfile;
}

const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({ profile }) => {
    const availability = getAvailabilityStatus(profile);
    const colorClasses: Record<string, string> = {
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

const TalentSearch: React.FC<TalentSearchProps> = ({
    user,
    userData,
    openPublicProfile,
    onAddToCart,
    sessionCartIds = [],
    onBook,
    mode = 'direct'
}) => {
    // Search or Broadcast mode toggle
    const [toolMode, setToolMode] = useState<string>('search'); // 'search' | 'broadcast'

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<TalentProfile[]>([]);
    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<string>('list'); // 'list' or 'map'
    const [showFilters, setShowFilters] = useState<boolean>(true);
    const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<string>('relevance'); // 'relevance', 'rating', 'rate_low', 'rate_high', 'recent'
    const [mapCenter, setMapCenter] = useState<UserLocation | null>(null);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

    // Advanced filters
    const [filters, setFilters] = useState<FiltersState>({
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
        skills: [],
        // Role-specific filters
        vocalRange: '',
        vocalStyle: '',
        djStyle: '',
        productionStyle: '',
        engineeringSpecialty: ''
    });

    // Check role category for showing relevant filters
    const selectedType = PROFILE_TYPES.find(t => t.value === filters.role);
    const isVocalRole = selectedType?.category === 'vocal' || VOCAL_SUBROLES.includes(filters.role);
    const isInstrumentalistRole = selectedType?.category === 'instrumentalist' || INSTRUMENTALIST_SUBROLES.includes(filters.role);
    const isDjRole = selectedType?.category === 'dj' || DJ_SUBROLES.includes(filters.role);
    const isProducerRole = filters.role === 'Producer';
    const isEngineerRole = filters.role === 'Engineer';

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
        filters.skills.length > 0,
        filters.vocalRange,
        filters.vocalStyle,
        filters.djStyle,
        filters.productionStyle,
        filters.engineeringSpecialty
    ].filter(Boolean).length;

    const handleSearch = async () => {
        setLoadingSearch(true);
        try {
            const userId = user?.id || user?.uid;

            // Build search options
            const searchOptions: any = {
                searchQuery: searchQuery || undefined,
                accountTypes: filters.role !== 'All' ? [filters.role] : undefined,
                minRate: filters.minRate > 0 ? filters.minRate : undefined,
                maxRate: filters.maxRate < 500 ? filters.maxRate : undefined,
                experience: filters.experience !== 'All' ? filters.experience : undefined,
                verifiedOnly: filters.verified || undefined,
                availableNow: filters.availableNow || undefined,
                hasPortfolio: filters.hasPortfolio || undefined,
                vocalRange: filters.vocalRange || undefined,
                vocalStyle: filters.vocalStyle || undefined,
                djStyle: filters.djStyle || undefined,
                productionStyle: filters.productionStyle || undefined,
                engineeringSpecialty: filters.engineeringSpecialty || undefined,
                genres: filters.genres.length > 0 ? filters.genres : undefined,
                sortBy: sortBy,
                limit: 100,
                excludeUserId: userId,
            };

            // Add location filter if set
            if (userLocation && filters.location) {
                searchOptions.location = {
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                    radius: filters.radius || 50,
                };
            }

            const results = await searchProfiles(searchOptions);

            // Map results to expected format
            const mappedResults: TalentProfile[] = results.map((profile: any): TalentProfile => ({
                id: profile.id,
                firstName: profile.first_name,
                lastName: profile.last_name,
                profileName: profile.display_name || profile.username,
                photoURL: profile.profile_photo || profile.profile_photo_url,
                bio: profile.bio,
                accountTypes: profile.account_types || [],
                rate: profile.talent_info?.rate,
                yearsExperience: profile.talent_info?.yearsExperience,
                rating: profile.rating,
                reviewCount: profile.review_count || 0,
                verified: profile.verified,
                skills: profile.talent_info?.skills || [],
                genres: profile.talent_info?.genres || [],
                vocalRange: profile.talent_info?.vocalRange,
                vocalStyles: profile.talent_info?.vocalStyles || [],
                djStyles: profile.talent_info?.djStyles || [],
                productionStyles: profile.talent_info?.productionStyles || [],
                location: profile.talent_info?.location,
                city: profile.talent_info?.city,
                state: profile.talent_info?.state,
                lastActive: profile.updated_at,
            }));

            setSearchResults(mappedResults);
        } catch (e) {
            console.error("Search failed:", e);
            setSearchResults([]);
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
            skills: [],
            vocalRange: '',
            vocalStyle: '',
            djStyle: '',
            productionStyle: '',
            engineeringSpecialty: ''
        });
    };

    // Get current location
    const getCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: UserLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(location);
                    setMapCenter(location);
                    setFilters({...filters, location: 'Current Location'});
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your location. Please enable location services.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }, [filters]);

    const clearLocation = useCallback(() => {
        setUserLocation(null);
        setFilters({...filters, location: ''});
    }, [filters]);

    const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({...filters, location: e.target.value});
    }, [filters]);

    // Handle location selection from autocomplete
    const handleLocationSelect = useCallback((location: UserLocation, address: string) => {
        setUserLocation(location);
        setMapCenter(location);
        setFilters({...filters, location: address});
    }, [filters]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* DESKTOP FILTERS - Only show in search mode */}
            {toolMode === 'search' && (
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
                        <TalentSearchFilterPanel
                            filters={filters}
                            setFilters={setFilters}
                            userLocation={userLocation}
                            setUserLocation={setUserLocation}
                            getCurrentLocation={getCurrentLocation}
                            PROFILE_TYPES={PROFILE_TYPES}
                            isVocalRole={isVocalRole}
                            isInstrumentalistRole={isInstrumentalistRole}
                            isDjRole={isDjRole}
                            isProducerRole={isProducerRole}
                            isEngineerRole={isEngineerRole}
                            VOCAL_RANGES={VOCAL_RANGES}
                            VOCAL_STYLES={VOCAL_STYLES}
                            DJ_STYLES={DJ_STYLES}
                            PRODUCTION_STYLES={PRODUCTION_STYLES}
                            ENGINEERING_SPECIALTIES={ENGINEERING_SPECIALTIES}
                            GENRE_DATA={GENRE_DATA}
                            EXPERIENCE_LEVELS={EXPERIENCE_LEVELS}
                            activeFilterCount={activeFilterCount}
                            handleSearch={handleSearch}
                            clearFilters={clearFilters}
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>
                </div>
            )}

            {/* MOBILE FILTER MODAL - Only show in search mode */}
            {toolMode === 'search' && (
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
                            <TalentSearchFilterPanel
                                filters={filters}
                                setFilters={setFilters}
                                userLocation={userLocation}
                                setUserLocation={setUserLocation}
                                getCurrentLocation={getCurrentLocation}
                                PROFILE_TYPES={PROFILE_TYPES}
                                isVocalRole={isVocalRole}
                                isInstrumentalistRole={isInstrumentalistRole}
                                isDjRole={isDjRole}
                                isProducerRole={isProducerRole}
                                isEngineerRole={isEngineerRole}
                                VOCAL_RANGES={VOCAL_RANGES}
                                VOCAL_STYLES={VOCAL_STYLES}
                                DJ_STYLES={DJ_STYLES}
                                PRODUCTION_STYLES={PRODUCTION_STYLES}
                                ENGINEERING_SPECIALTIES={ENGINEERING_SPECIALTIES}
                                GENRE_DATA={GENRE_DATA}
                                EXPERIENCE_LEVELS={EXPERIENCE_LEVELS}
                                activeFilterCount={activeFilterCount}
                                handleSearch={handleSearch}
                                clearFilters={clearFilters}
                                onLocationSelect={handleLocationSelect}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            )}

            {/* RESULTS */}
            <div className={`${toolMode === 'broadcast' ? 'lg:col-span-12' : 'lg:col-span-9'} space-y-4`}>
                {/* Mode Toggle: Search Talent vs Post Broadcast */}
                <div className="bg-white dark:bg-[#2c2e36] p-1 rounded-xl border dark:border-gray-700 shadow-sm flex">
                    <button
                        onClick={() => setToolMode('search')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            toolMode === 'search'
                                ? 'bg-brand-blue text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Search size={18} />
                        <span>Search Talent</span>
                    </button>
                    <button
                        onClick={() => setToolMode('broadcast')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            toolMode === 'broadcast'
                                ? 'bg-brand-blue text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Zap size={18} />
                        <span>Post Broadcast</span>
                    </button>
                </div>

                {/* Show Broadcast Request Form when in broadcast mode */}
                {toolMode === 'broadcast' ? (
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-brand-blue" size={32} />
                        </div>
                    }>
                        <BroadcastRequest
                            user={user}
                            userData={userData}
                            onSuccess={() => setToolMode('search')}
                        />
                    </Suspense>
                ) : (
                    <>
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
                        <div className="flex items-center gap-3">
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
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                            </span>
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
                                    <Map size={16} className={viewMode === 'map' ? 'text-brand-blue' : 'text-gray-500'} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid or Map */}
                <div className="min-h-[400px]">
                    {viewMode === 'map' ? (
                        <TalentMap
                            itemType="talent"
                            items={searchResults.map(r => ({
                                id: r.id,
                                name: `${r.firstName} ${r.lastName || ''}`.trim(),
                                location: r.location ? { lat: r.location.lat, lng: r.location.lng } : undefined,
                                avatar: r.photoURL,
                                type: r.accountTypes?.[0] || 'Talent',
                                budget: r.rate,
                                ...r
                            }))}
                            onItemClick={(item) => openPublicProfile(item.id, item.name?.split(' ')[0])}
                            userLocation={userLocation}
                            radius={filters.radius}
                        />
                    ) : loadingSearch ? (
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
                                        {mode === 'planner' && onAddToCart && (
                                            <button
                                                onClick={() => !isInCart && onAddToCart(res)}
                                                disabled={isInCart}
                                                className={`mt-auto w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${isInCart ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-brand-blue hover:text-white'}`}
                                            >
                                                {isInCart ? <><Check size={14}/> Added to Session</> : <><Plus size={14}/> Add to Session</>}
                                            </button>
                                        )}

                                        {mode === 'direct' && onBook && (
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
                </>
                )}
            </div>
        </div>
    );
}

// Wrap with React.memo to prevent remounts when parent re-renders
export default React.memo(TalentSearch);
