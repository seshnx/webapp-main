import { useState, useMemo } from 'react';
import { useEquipmentDatabase } from './useEquipmentDatabase';

/**
 * Hook for searching equipment database
 * Provides search functionality for the EquipmentAutocomplete component
 */
export const useEquipmentSearch = () => {
    const { data: equipData, loading } = useEquipmentDatabase();
    const [results, setResults] = useState([]);
    
    // Flatten the database into a single searchable list
    const allItems = useMemo(() => {
        if (loading || !equipData) return [];
        let flattened = [];
        
        try {
            // Iterate through categories
            Object.keys(equipData).forEach(categoryKey => {
                const categoryData = equipData[categoryKey];
                if (!categoryData || typeof categoryData !== 'object') return;

                // Iterate through subcategories
                Object.entries(categoryData).forEach(([subcategoryKey, subcategoryItems]) => {
                    if (!Array.isArray(subcategoryItems)) return;

                    // Process each item in the subcategory
                    subcategoryItems.forEach(item => {
                        if (!item || typeof item !== 'object') return;

                        // Extract data
                        const brand = item.brand || 'Unknown';
                        const name = item.name || item.model || 'Unknown Item';
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
                            searchString: searchString,
                            original: item.original || item
                        });
                    });
                });
            });
        } catch (err) {
            console.warn("Error processing equipment data:", err);
        }

        return flattened;
    }, [equipData, loading]);

    const searchEquipment = (searchTerm) => {
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

    return { searchEquipment, results, loading };
};
