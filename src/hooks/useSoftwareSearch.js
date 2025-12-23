import { useState, useMemo } from 'react';
import { useSoftwareDatabase } from './useSoftwareDatabase';

/**
 * Hook for searching software database
 * Provides search functionality for software autocomplete/search components
 */
export const useSoftwareSearch = () => {
    const { data: softwareData, loading } = useSoftwareDatabase();
    const [results, setResults] = useState([]);
    
    // Flatten the database into a single searchable list
    const allItems = useMemo(() => {
        if (loading || !softwareData) return [];
        let flattened = [];
        
        try {
            // Iterate through categories
            Object.keys(softwareData).forEach(categoryKey => {
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
                            category: item.category || categoryKey,
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

    const searchSoftware = (searchTerm) => {
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
};

