import { useState, useCallback, useRef } from 'react';
import { searchAddress } from '../utils/geocode';

/**
 * Hook for searching addresses with debouncing and rate limiting
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default 300)
 * @param {string} options.countryCode - Limit results to country (default 'us')
 * @param {number} options.limit - Max results to return (default 5)
 * @returns {Object} { search, results, loading, error, clearResults }
 */
export function useAddressSearch(options = {}) {
    const {
        debounceMs = 300,
        countryCode = 'us',
        limit = 5,
    } = options;

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Refs for debouncing and preventing stale results
    const debounceTimer = useRef(null);
    const lastQuery = useRef('');
    const requestId = useRef(0);

    /**
     * Search for addresses
     * @param {string} query - Search query
     */
    const search = useCallback(async (query) => {
        const trimmedQuery = query?.trim() || '';
        
        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // If query is too short, clear results
        if (trimmedQuery.length < 3) {
            setResults([]);
            setLoading(false);
            setError(null);
            return;
        }

        // Don't search if same as last query
        if (trimmedQuery === lastQuery.current) {
            return;
        }

        setLoading(true);
        setError(null);

        // Debounce the actual API call
        debounceTimer.current = setTimeout(async () => {
            const currentRequestId = ++requestId.current;
            lastQuery.current = trimmedQuery;

            try {
                const searchResults = await searchAddress(trimmedQuery, {
                    countryCode,
                    limit,
                    addressDetails: true,
                });

                // Only update if this is still the most recent request
                if (currentRequestId === requestId.current) {
                    setResults(searchResults);
                    setLoading(false);
                }
            } catch (err) {
                if (currentRequestId === requestId.current) {
                    setError(err.message || 'Address search failed');
                    setResults([]);
                    setLoading(false);
                }
            }
        }, debounceMs);
    }, [debounceMs, countryCode, limit]);

    /**
     * Clear all results
     */
    const clearResults = useCallback(() => {
        setResults([]);
        setError(null);
        lastQuery.current = '';
    }, []);

    return {
        search,
        results,
        loading,
        error,
        clearResults,
    };
}

export default useAddressSearch;
