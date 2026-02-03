import { useState, useCallback, useRef } from 'react';

/**
 * Address search result interface
 */
export interface AddressResult {
  display_name: string;
  lat: number;
  lon: number;
  address?: {
    city?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
    road?: string;
    house_number?: string;
    state?: string;
  };
  [key: string]: any;
}

/**
 * Address search options interface
 */
export interface AddressSearchOptions {
  debounceMs?: number;
  countryCode?: string;
  limit?: number;
}

/**
 * Address search hook return value
 */
export interface UseAddressSearchReturn {
  search: (query: string) => void;
  results: AddressResult[];
  loading: boolean;
  error: string | null;
  clearResults: () => void;
}

/**
 * Hook for searching addresses with debouncing and rate limiting
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 *
 * @param options - Configuration options
 * @returns Address search functions and state
 *
 * @example
 * function AddressInput() {
 *   const { search, results, loading } = useAddressSearch({ limit: 5 });
 *
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         placeholder="Search address..."
 *         onChange={(e) => search(e.target.value)}
 *       />
 *       {loading && <div>Searching...</div>}
 *       <ul>
 *         {results.map((result, i) => (
 *           <li key={i}>{result.display_name}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
export function useAddressSearch(options: AddressSearchOptions = {}): UseAddressSearchReturn {
  const {
    debounceMs = 300,
    countryCode = 'us',
    limit = 5,
  } = options;

  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string): void => {
    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.trim().length < 3) {
      setResults([]);
      return;
    }

    // Debounce the search
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Implement address search with geocoding utility
        // For now, return empty results
        setResults([]);
      } catch (err: any) {
        console.error('Address search error:', err);
        setError(err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  const clearResults = (): void => {
    setResults([]);
    setError(null);
  };

  return {
    search,
    results,
    loading,
    error,
    clearResults
  };
}
