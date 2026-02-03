import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, DollarSign, Star, Clock,
  Filter, ChevronDown, User, Wrench, Briefcase,
  SlidersHorizontal, XCircle
} from 'lucide-react';
import { TECH_SPECIALTIES, SERVICE_CATALOGUE } from '../../config/constants';
import { searchTechnicians, type TechnicianProfile } from '../../config/neonQueries';
import type { UserData } from '../../types';

/**
 * Props for TechSearch component
 */
export interface TechSearchProps {
  user?: any;
  userData?: UserData | null;
  openPublicProfile?: (userId: string) => void;
  onRequestService?: (tech: TechnicianProfile) => void;
}

/**
 * Filter options interface
 */
interface SearchFilters {
  specialty: string;
  location: string | null;
  availability: 'any' | 'available' | 'busy';
  minRating: number;
  maxRate: number | null;
  responseTime: 'any' | '2h' | '6h' | '24h';
  serviceRadius: number;
  userLocation: { lat: number; lng: number } | null;
}

/**
 * Sort options
 */
type SortOption = 'match' | 'rating' | 'jobs' | 'rate' | 'distance';

/**
 * TechSearch - Streamlined technician search with intuitive filters
 *
 * Features:
 * - Comprehensive filters (specialty, location, availability, rating, price, response time)
 * - Debounced search (300ms)
 * - Availability status visibility
 * - Response time display
 * - Distance calculation
 * - Multiple sort options
 */
export default function TechSearch({ user, userData, openPublicProfile, onRequestService }: TechSearchProps) {
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [filters, setFilters] = useState<SearchFilters>({
    specialty: '',
    location: null,
    availability: 'any',
    minRating: 0,
    maxRate: null,
    responseTime: 'any',
    serviceRadius: 50,
    userLocation: null
  });

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, sortBy]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const userId = user?.id || user?.uid;

      // Build location filter for search
      const locationFilter = filters.userLocation ? {
        lat: filters.userLocation.lat,
        lng: filters.userLocation.lng,
        radius: filters.serviceRadius
      } : undefined;

      const results = await searchTechnicians({
        specialty: filters.specialty || undefined,
        location: locationFilter,
        availability: filters.availability === 'any' ? undefined : filters.availability,
        minRating: filters.minRating || undefined,
        maxRate: filters.maxRate,
        maxResponseTime: filters.responseTime === 'any' ? undefined :
                          filters.responseTime === '2h' ? 2 :
                          filters.responseTime === '6h' ? 6 : 24,
        limit: 50
      });

      // Sort results
      const sorted = sortTechnicians(results, sortBy);
      setTechnicians(sorted);
    } catch (error) {
      console.error('Error searching technicians:', error);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const sortTechnicians = (techs: TechnicianProfile[], sort: SortOption): TechnicianProfile[] => {
    const sorted = [...techs];
    switch (sort) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
      case 'jobs':
        return sorted.sort((a, b) => (b.completed_jobs || 0) - (a.completed_jobs || 0));
      case 'rate':
        return sorted.filter(t => t.hourly_rate).sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
      case 'distance':
        return sorted.filter(t => t.distance !== undefined).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'match':
      default:
        return sorted;
    }
  };

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      specialty: '',
      location: null,
      availability: 'any',
      minRating: 0,
      maxRate: null,
      responseTime: 'any',
      serviceRadius: 50,
      userLocation: null
    });
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return filters.specialty ||
           filters.location ||
           filters.availability !== 'any' ||
           filters.minRating > 0 ||
           filters.maxRate !== null ||
           filters.responseTime !== 'any';
  };

  const getAvailabilityBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Available': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Busy': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Unavailable': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return styles[status] || styles['Unavailable'];
  };

  const getResponseTimeBadge = (hours?: number) => {
    if (!hours) return null;
    if (hours < 2) return <span className="text-xs text-green-600 dark:text-green-400">⚡ Responds in &lt;2h</span>;
    if (hours < 6) return <span className="text-xs text-blue-600 dark:text-blue-400">⏱️ Responds in &lt;6h</span>;
    return <span className="text-xs text-gray-500">🕐 Avg {hours}h response</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <Search className="text-orange-500" />
          Find a Technician
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Search verified technicians for equipment repair, maintenance, and more
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            className="w-full pl-12 p-3 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
            placeholder="Search by name, specialty, or equipment..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
            showFilters || hasActiveFilters()
              ? 'bg-orange-500 text-white'
              : 'bg-white dark:bg-[#2c2e36] border dark:border-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
          {hasActiveFilters() && (
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">Active</span>
          )}
        </button>
        <select
          className="px-4 py-3 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white cursor-pointer"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortOption)}
        >
          <option value="match">Best Match</option>
          <option value="rating">Highest Rated</option>
          <option value="jobs">Most Jobs</option>
          <option value="rate">Lowest Rate</option>
          <option value="distance">Nearest</option>
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 space-y-4 animate-in slide-in-from-top">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold dark:text-white flex items-center gap-2">
              <Filter size={18} />
              Filter Results
            </h3>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              >
                <XCircle size={14} />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Specialty */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Specialty</label>
              <select
                className="w-full p-2.5 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white text-sm"
                value={filters.specialty}
                onChange={e => updateFilter('specialty', e.target.value)}
              >
                <option value="">All Specialties</option>
                {TECH_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Availability</label>
              <select
                className="w-full p-2.5 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white text-sm"
                value={filters.availability}
                onChange={e => updateFilter('availability', e.target.value as SearchFilters['availability'])}
              >
                <option value="any">Any Status</option>
                <option value="available">Available Now</option>
                <option value="busy">Busy</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Min Rating</label>
              <select
                className="w-full p-2.5 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white text-sm"
                value={filters.minRating}
                onChange={e => updateFilter('minRating', Number(e.target.value))}
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            {/* Max Rate */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Max Hourly Rate</label>
              <select
                className="w-full p-2.5 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white text-sm"
                value={filters.maxRate || ''}
                onChange={e => updateFilter('maxRate', e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Any Price</option>
                <option value="50">Up to $50/hr</option>
                <option value="100">Up to $100/hr</option>
                <option value="150">Up to $150/hr</option>
                <option value="200">Up to $200/hr</option>
              </select>
            </div>

            {/* Response Time */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Response Time</label>
              <select
                className="w-full p-2.5 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white text-sm"
                value={filters.responseTime}
                onChange={e => updateFilter('responseTime', e.target.value as SearchFilters['responseTime'])}
              >
                <option value="any">Any Response Time</option>
                <option value="2h">&lt; 2 hours</option>
                <option value="6h">&lt; 6 hours</option>
                <option value="24h">&lt; 24 hours</option>
              </select>
            </div>

            {/* Service Radius */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                Service Radius: {filters.serviceRadius} miles
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={filters.serviceRadius}
                onChange={e => updateFilter('serviceRadius', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{loading ? 'Searching...' : `${technicians.length} technicians found`}</span>
        {hasActiveFilters() && !showFilters && (
          <button onClick={clearFilters} className="text-orange-600 hover:text-orange-700">
            Clear filters
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Results Grid */}
      {!loading && technicians.length === 0 && (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
          <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold dark:text-white mb-2">No technicians found</h3>
          <p className="text-gray-500 text-sm">
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {!loading && technicians.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((tech) => (
            <div
              key={tech.user_id}
              className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition group"
            >
              {/* Header with gradient */}
              <div className="h-24 bg-gradient-to-r from-slate-700 to-slate-600 relative">
                <div className="absolute -bottom-8 left-6">
                  <div className="h-16 w-16 rounded-full border-4 border-white dark:border-[#2c2e36] bg-gray-200 overflow-hidden">
                    {tech.profile_photo ? (
                      <img src={tech.profile_photo} alt={tech.display_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <User />
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getAvailabilityBadge(tech.availability_status)}`}>
                    {tech.availability_status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="pt-10 px-6 pb-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold dark:text-white text-lg">{tech.display_name}</h3>
                    {tech.location && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {tech.location.city}, {tech.location.state}
                        {tech.distance !== undefined && (
                          <span className="text-orange-600 dark:text-orange-400 ml-1">
                            ({Math.round(tech.distance)} mi)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {tech.hourly_rate && tech.hourly_rate > 0 && (
                    <div className="text-sm font-bold dark:text-white bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-lg flex items-center gap-1">
                      <DollarSign size={14} />
                      {tech.hourly_rate}/hr
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {tech.specialties && tech.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tech.specialties.slice(0, 3).map((specialty, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800"
                      >
                        {specialty}
                      </span>
                    ))}
                    {tech.specialties.length > 3 && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 px-2 py-0.5">
                        +{tech.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Rating & Jobs */}
                <div className="flex items-center gap-3 mb-3 text-sm">
                  {tech.rating_average && (
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <Star size={14} fill="currentColor" />
                      <span className="font-bold">{tech.rating_average.toFixed(1)}</span>
                      {tech.review_count && (
                        <span className="text-gray-400 text-xs">({tech.review_count} reviews)</span>
                      )}
                    </div>
                  )}
                  {tech.completed_jobs && tech.completed_jobs > 0 && (
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Briefcase size={14} />
                      <span>{tech.completed_jobs} jobs</span>
                    </div>
                  )}
                </div>

                {/* Response Time Badge */}
                {tech.avg_response_hours && (
                  <div className="mb-3">
                    {getResponseTimeBadge(tech.avg_response_hours)}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => openPublicProfile?.(tech.user_id)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-xs font-bold transition"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onRequestService?.(tech)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1"
                  >
                    <Wrench size={14} />
                    Request Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
