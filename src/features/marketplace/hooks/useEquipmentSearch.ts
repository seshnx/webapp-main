import { useState } from 'react';

/**
 * Equipment item interface
 */
export interface EquipmentItem {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  subCategory?: string;
  description?: string;
  [key: string]: any;
}

/** Type alias for compatibility */
export type EquipmentSearchResult = EquipmentItem;

/**
 * Equipment search hook return value
 */
export interface UseEquipmentSearchReturn {
  results: EquipmentItem[];
  loading: boolean;
  error: string | null;
  searchEquipment: (searchTerm: string) => Promise<void>;
  getEquipmentById: (id: string) => Promise<EquipmentItem | null>;
}

/**
 * Hook for equipment search functionality
 * TODO: Migrate to Neon equipment_items table queries
 * Currently returns empty results to prevent app crashes
 *
 * @returns Equipment search state and functions
 *
 * @example
 * function EquipmentSearchBar() {
 *   const { results, loading, searchEquipment } = useEquipmentSearch();
 *
 *   const handleSearch = async (e) => {
 *     await searchEquipment(e.target.value);
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         placeholder="Search equipment..."
 *         onChange={handleSearch}
 *       />
 *       {loading && <div>Searching...</div>}
 *       <ul>
 *         {results.map(item => (
 *           <li key={item.id}>{item.brand} {item.name}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
export function useEquipmentSearch(): UseEquipmentSearchReturn {
  const [results, setResults] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchEquipment = async (searchTerm: string): Promise<void> => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement Neon query for equipment_items
      // Example SQL needed:
      // SELECT * FROM equipment_items WHERE search_tokens @> ARRAY[LOWER($1)] LIMIT 20

      console.warn('Equipment search not yet implemented with Neon');
      setResults([]);
    } catch (err: any) {
      console.error("Equipment search failed:", err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get equipment by ID
   * TODO: Implement with Neon
   */
  const getEquipmentById = async (id: string): Promise<EquipmentItem | null> => {
    // TODO: Implement Neon query
    return null;
  };

  return {
    results,
    loading,
    error,
    searchEquipment,
    getEquipmentById
  };
}
