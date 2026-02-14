import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Filter, Mic, Disc, Radio, Headphones, Guitar, Zap, BadgeCheck, Music, Search, Sparkles, Loader2, X } from 'lucide-react';

interface FilterPanelProps {
    filters: any;
    setFilters: (filters: any) => void;
    userLocation: any;
    setUserLocation: (location: any) => void;
    getCurrentLocation: () => void;
    PROFILE_TYPES: any[];
    isVocalRole: boolean;
    isInstrumentalistRole: boolean;
    isDjRole: boolean;
    isProducerRole: boolean;
    isEngineerRole: boolean;
    VOCAL_RANGES: any[];
    VOCAL_STYLES: any[];
    DJ_STYLES: any[];
    PRODUCTION_STYLES: any[];
    ENGINEERING_SPECIALTIES: any[];
    GENRE_DATA: any[];
    EXPERIENCE_LEVELS: any[];
    activeFilterCount: number;
    handleSearch: () => void;
    clearFilters: () => void;
    onLocationSelect?: (location: { lat: number; lng: number }, address: string) => void;
}

interface LocationSuggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

export default function TalentSearchFilterPanel({
    filters,
    setFilters,
    userLocation,
    setUserLocation,
    getCurrentLocation,
    PROFILE_TYPES,
    isVocalRole,
    isInstrumentalistRole,
    isDjRole,
    isProducerRole,
    isEngineerRole,
    VOCAL_RANGES,
    VOCAL_STYLES,
    DJ_STYLES,
    PRODUCTION_STYLES,
    ENGINEERING_SPECIALTIES,
    GENRE_DATA,
    EXPERIENCE_LEVELS,
    activeFilterCount,
    handleSearch,
    clearFilters,
    onLocationSelect
}: FilterPanelProps) {
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<{ timeout: NodeJS.Timeout | null }>({ timeout: null });

    // Geocoding with autocomplete using Nominatim API (OpenStreetMap)
    const searchLocation = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);

        try {
            // Clear previous timeout
            if (searchRef.current.timeout) {
                clearTimeout(searchRef.current.timeout);
            }

            // Debounce the API call
            searchRef.current.timeout = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=us`,
                        {
                            headers: {
                                'Accept-Language': 'en-US,en'
                            }
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        setSuggestions(data);
                        setShowSuggestions(data.length > 0);
                    }
                } catch (error) {
                    console.error('Geocoding error:', error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            }, 300);
        } catch (error) {
            console.error('Search error:', error);
            setIsLoading(false);
        }
    };

    // Handle location selection from autocomplete
    const handleSelectLocation = (suggestion: LocationSuggestion) => {
        const location = {
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon)
        };

        // Extract city/state for display
        const parts = suggestion.display_name.split(',');
        const displayAddress = parts.slice(0, 2).join(',').trim();

        setUserLocation(location);
        setFilters({ ...filters, location: displayAddress });
        setShowSuggestions(false);

        // Notify parent component to update map center
        if (onLocationSelect) {
            onLocationSelect(location, displayAddress);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchRef.current.timeout) {
                clearTimeout(searchRef.current.timeout);
            }
        };
    }, []);
    return (
        <div className="space-y-5">
            {/* Profile Type */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Profile Type</label>
                <select
                    className="w-full p-2.5 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                    value={filters.role}
                    onChange={e => setFilters({
                        ...filters,
                        role: e.target.value,
                        vocalRange: '',
                        vocalStyle: '',
                        djStyle: '',
                        productionStyle: '',
                        engineeringSpecialty: ''
                    })}
                >
                    {PROFILE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
            </div>

            {/* Location Filter */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Location</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-10 p-2.5 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                            placeholder="City, zip, or address"
                            value={filters.location}
                            onChange={e => {
                                setFilters({...filters, location: e.target.value});
                                searchLocation(e.target.value);
                            }}
                            onFocus={() => {
                                if (filters.location.length >= 2 && suggestions.length > 0) {
                                    setShowSuggestions(true);
                                }
                            }}
                            onBlur={() => {
                                // Delay hiding to allow click on suggestions
                                setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            onKeyDown={e => {
                                // Prevent form submission on Enter
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            }}
                        />
                        {filters.location && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFilters({...filters, location: ''});
                                    setUserLocation(null);
                                    setSuggestions([]);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
                            >
                                <X size={14} />
                            </button>
                        )}

                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.place_id}
                                        type="button"
                                        onClick={() => handleSelectLocation(suggestion)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                                    >
                                        <div className="flex items-start gap-2">
                                            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                                    {suggestion.display_name.split(',')[0]}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {suggestion.display_name}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-lg shadow-lg z-50 px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Loader2 size={16} className="animate-spin" />
                                    Searching locations...
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="p-2.5 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition"
                        title="Use my current location"
                    >
                        <Navigation size={18} />
                    </button>
                </div>
                {userLocation && (
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <MapPin size={12} /> Location set
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setUserLocation(null);
                                setFilters({...filters, location: ''});
                                setSuggestions([]);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Radius Filter - Only show when location is set */}
            {(filters.location || userLocation) && (
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Search Radius</label>
                    <select
                        className="w-full p-2.5 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                        value={filters.radius}
                        onChange={e => setFilters({...filters, radius: parseInt(e.target.value)})}
                    >
                        <option value={10}>Within 10 miles</option>
                        <option value={25}>Within 25 miles</option>
                        <option value={50}>Within 50 miles</option>
                        <option value={100}>Within 100 miles</option>
                        <option value={250}>Within 250 miles</option>
                        <option value={500}>Within 500 miles</option>
                    </select>
                </div>
            )}

            {/* Vocal-Specific Filters - Only shown for singer roles */}
            {isVocalRole && (
                <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg border border-pink-200 dark:border-pink-800 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-pink-700 dark:text-pink-300 uppercase">
                        <Mic size={12} /> Vocal Filters
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Vocal Range</label>
                        <select
                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-pink-800 dark:text-white"
                            value={filters.vocalRange}
                            onChange={e => setFilters({...filters, vocalRange: e.target.value})}
                        >
                            <option value="">Any Range</option>
                            {VOCAL_RANGES.filter(r => r !== 'Not Applicable').map(range => (
                                <option key={range} value={range}>{range}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Vocal Style</label>
                        <select
                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-pink-800 dark:text-white"
                            value={filters.vocalStyle}
                            onChange={e => setFilters({...filters, vocalStyle: e.target.value})}
                        >
                            <option value="">Any Style</option>
                            {VOCAL_STYLES.map(style => (
                                <option key={style} value={style}>{style}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* DJ-Specific Filters */}
            {isDjRole && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">
                        <Disc size={12} /> DJ Filters
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">DJ Style</label>
                        <select
                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-purple-800 dark:text-white"
                            value={filters.djStyle}
                            onChange={e => setFilters({...filters, djStyle: e.target.value})}
                        >
                            <option value="">Any Style</option>
                            {DJ_STYLES.map(style => (
                                <option key={style} value={style}>{style}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Producer-Specific Filters */}
            {isProducerRole && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-700 dark:text-orange-300 uppercase">
                        <Radio size={12} /> Producer Filters
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Production Style</label>
                        <select
                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-orange-800 dark:text-white"
                            value={filters.productionStyle}
                            onChange={e => setFilters({...filters, productionStyle: e.target.value})}
                        >
                            <option value="">Any Style</option>
                            {PRODUCTION_STYLES.map(style => (
                                <option key={style} value={style}>{style}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Engineer-Specific Filters */}
            {isEngineerRole && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">
                        <Headphones size={12} /> Engineer Filters
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Specialty</label>
                        <select
                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-blue-800 dark:text-white"
                            value={filters.engineeringSpecialty}
                            onChange={e => setFilters({...filters, engineeringSpecialty: e.target.value})}
                        >
                            <option value="">Any Specialty</option>
                            {ENGINEERING_SPECIALTIES.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Instrumentalist-Specific Filters */}
            {isInstrumentalistRole && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-300 uppercase">
                        <Guitar size={12} /> Instrumentalist Filters
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Genre Preference</label>
                        <select
                            className="w-full p-2 text-sm border rounded-lg dark:bg-[#1f2128] dark:border-green-800 dark:text-white"
                            value={filters.genres[0] || ''}
                            onChange={e => setFilters({...filters, genres: e.target.value ? [e.target.value] : []})}
                        >
                            <option value="">Any Genre</option>
                            {GENRE_DATA.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

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
                    type="button"
                    onClick={handleSearch}
                    className="w-full bg-brand-blue text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                    <Search size={16} />
                    Search
                </button>
                {activeFilterCount > 0 && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="w-full text-gray-500 dark:text-gray-400 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Clear Filters ({activeFilterCount})
                    </button>
                )}
            </div>
        </div>
    );
}
