import { useState, useEffect } from 'react';

/**
 * Software item interface
 */
export interface SoftwareItem {
  id: string;
  name: string;
  brand?: string;
  version?: string;
  category: string;
  subCategory: string;
  description?: string;
  [key: string]: any;
}

/**
 * Software database structure
 */
export interface SoftwareDatabase {
  [category: string]: {
    [subcategory: string]: SoftwareItem[];
  };
}

/**
 * Software database hook return value
 */
export interface UseSoftwareDatabaseReturn {
  loading: boolean;
  data: SoftwareDatabase;
}

/**
 * Hook to fetch software database
 * TODO: Migrate to Neon software_database table queries
 * Currently returns empty data to prevent app crashes
 *
 * @returns Software database data and loading state
 */
export function useSoftwareDatabase(): UseSoftwareDatabaseReturn {
  const [dbData, setDbData] = useState<SoftwareDatabase>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // TODO: Implement Neon query for software_database table
    // Example SQL needed:
    // SELECT * FROM software_database WHERE verified = true ORDER BY category, subcategory, brand, name

    setLoading(false);
    setDbData({});
  }, []);

  return {
    loading,
    data: dbData
  };
}
