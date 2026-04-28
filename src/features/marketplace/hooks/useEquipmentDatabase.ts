import { useState, useEffect } from 'react';

/**
 * Equipment item interface
 */
export interface EquipmentItem {
  id: string;
  name: string;
  brand: string;
  model?: string;
  category: string;
  subCategory: string;
  description?: string;
  specifications?: Record<string, any>;
  searchTokens: string[];
  original: any;
}

/**
 * Equipment database structure (category -> subcategory -> items)
 */
export interface EquipmentDatabase {
  [category: string]: {
    [subcategory: string]: EquipmentItem[];
  };
}

/**
 * Equipment database hook return value
 */
export interface UseEquipmentDatabaseReturn {
  loading: boolean;
  data: EquipmentDatabase;
}

/**
 * Hook to fetch equipment database from Neon
 * Returns all equipment items grouped by category for use in autocomplete/search
 *
 * @returns Equipment database data and loading state
 *
 * @example
 * function EquipmentSearch() {
 *   const { loading, data } = useEquipmentDatabase();
 *
 *   if (loading) return <div>Loading equipment...</div>;
 *
 *   return (
 *     <select>
 *       {Object.entries(data).map(([category, subcategories]) => (
 *         <optgroup key={category} label={category}>
 *           {Object.entries(subcategories).map(([subcategory, items]) =>
 *             items.map(item => (
 *               <option key={item.id} value={item.id}>
 *                 {item.brand} {item.name} ({item.model})
 *               </option>
 *             ))
 *           )}
 *         </optgroup>
 *       ))}
 *     </select>
 *   );
 * }
 */
export function useEquipmentDatabase(): UseEquipmentDatabaseReturn {
  const [dbData, setDbData] = useState<EquipmentDatabase>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // TODO: Fetch from Neon when query is implemented
        // const grouped = await getEquipmentGrouped();

        // For now, return empty structure
        const transformed: EquipmentDatabase = {};

        setDbData(transformed);
      } catch (error) {
        console.error("Failed to load equipment database:", error);
        setDbData({});
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return {
    loading,
    data: dbData
  };
}
