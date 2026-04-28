import { useState, useMemo } from 'react';
import { useSoftwareDatabase, type SoftwareDatabase } from './useSoftwareDatabase';

/**
 * Search result item interface
 */
export interface SoftwareSearchResult {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  subCategory: string;
  website_url?: string;
  searchString: string;
  original: any;
}

/**
 * Software search hook return value
 */
export interface UseSoftwareSearchReturn {
  searchSoftware: (searchTerm: string) => void;
  results: SoftwareSearchResult[];
  loading: boolean;
}

/**
 * Hook for searching software database
 * Provides search functionality for software autocomplete/search components
 *
 * @returns Software search function and results
 *
 * @example
 * function SoftwareSearch() {
 *   const { searchSoftware, results, loading } = useSoftwareSearch();
 *
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         placeholder="Search software..."
 *         onChange={(e) => searchSoftware(e.target.value)}
 *       />
 *       {loading && <div>Loading...</div>}
 *       <ul>
 *         {results.map(item => (
 *           <li key={item.id}>
 *             {item.brand} {item.name} ({item.category})
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
export function useSoftwareSearch(): UseSoftwareSearchReturn {
  const { data: softwareData, loading } = useSoftwareDatabase();
  const [results, setResults] = useState<SoftwareSearchResult[]>([]);

  // Flatten the database into a single searchable list
  const allItems = useMemo<SoftwareSearchResult[]>(() => {
    if (loading || !softwareData) return [];
    const flattened: SoftwareSearchResult[] = [];

    try {
      // Iterate through categories
      (Object.keys(softwareData) as Array<keyof SoftwareDatabase>).forEach(categoryKey => {
        const categoryData = softwareData[categoryKey];
        if (!categoryData || typeof categoryData !== 'object') return;

        // Iterate through subcategories
        Object.entries(categoryData).forEach(([subcategoryKey, subcategoryItems]) => {
          if (!Array.isArray(subcategoryItems)) return;

          // Process each item in the subcategory
          subcategoryItems.forEach(item => {
            if (!item || typeof item !== 'object') return;

            // Extract data
            const brand = item.brand || 'Unknown';
            const name = item.name || item.model || 'Unknown Software';
            const subCategory = item.subCategory || subcategoryKey;

            // Build search string from name, brand, model, and search tokens
            const searchTokens = item.searchTokens || [];
            const searchString = [
              name,
              brand,
              item.model,
              ...searchTokens
            ].filter(Boolean).join(' ').toLowerCase();

            flattened.push({
              id: item.id,
              name: name,
              brand: brand,
              model: item.model || name,
              category: item.category || String(categoryKey),
              subCategory: subCategory,
              website_url: item.website_url,
              searchString: searchString,
              original: item.original || item
            });
          });
        });
      });
    } catch (err) {
      console.warn("Error processing software data:", err);
    }

    return flattened;
  }, [softwareData, loading]);

  const searchSoftware = (searchTerm: string): void => {
    if (!searchTerm || searchTerm.trim().length < 1) {
      setResults([]);
      return;
    }

    // Split user query into individual terms
    const queryTerms = searchTerm.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);

    if (queryTerms.length === 0) {
      setResults([]);
      return;
    }

    // Filter: Item must match ALL terms
    const filteredResults = allItems.filter(item => {
      // Check if all query terms are found in the search string
      return queryTerms.every(term => item.searchString.includes(term));
    })
    .slice(0, 50); // Limit results for performance

    setResults(filteredResults);
  };

  return { searchSoftware, results, loading };
}
