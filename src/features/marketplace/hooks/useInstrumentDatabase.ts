import { useState, useEffect } from 'react';

/**
 * Instrument item interface
 */
export interface InstrumentItem {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category: string;
  subCategory: string;
  description?: string;
  [key: string]: any;
}

/**
 * Instrument database structure
 */
export interface InstrumentDatabase {
  [category: string]: {
    [subcategory: string]: InstrumentItem[];
  };
}

/**
 * Instrument database hook return value
 */
export interface UseInstrumentDatabaseReturn {
  loading: boolean;
  data: InstrumentDatabase;
}

/**
 * Hook to fetch instrument database from Neon
 * Returns all instrument items grouped by category for use in autocomplete/search
 *
 * @returns Instrument database data and loading state
 */
export function useInstrumentDatabase(): UseInstrumentDatabaseReturn {
  const [dbData, setDbData] = useState<InstrumentDatabase>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // TODO: Implement Neon query when available
    const fetchData = async () => {
      // Placeholder - implement when queries are ready
      setDbData({});
      setLoading(false);
    };

    fetchData();
  }, []);

  return {
    loading,
    data: dbData
  };
}
