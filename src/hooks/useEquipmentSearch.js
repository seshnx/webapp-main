import { useState, useMemo } from 'react';
import { useEquipmentDatabase } from './useEquipmentDatabase';

export const useEquipmentSearch = () => {
    const { data: equipData, loading } = useEquipmentDatabase();
    const [results, setResults] = useState([]);
    
    // Flatten the database into a single searchable list
    const allItems = useMemo(() => {
        if (loading || !equipData) return [];
        let flattened = [];
        
        try {
            // 1. Iterate Categories (e.g., "microphones_and_input_transducers")
            Object.keys(equipData).forEach(categoryKey => {
                const categoryDocs = equipData[categoryKey];
                if (!categoryDocs) return;

                // 2. Iterate Documents (e.g., "shure_sm57")
                // In your structure, each value here is the full Item Object
                Object.entries(categoryDocs).forEach(([docId, item]) => {
                    if (!item || typeof item !== 'object') return;

                    // 3. Extract Metadata
                    // Prefer root fields, fallback to searchTokens logic
                    const brand = item.brand || (item.searchTokens && item.searchTokens[0]) || 'Unknown';
                    const name = item.name || (item.searchTokens && item.searchTokens[1]) || 'Unknown Item';
                    
                    // 4. Build Powerful Search String
                    // Combine explicit name/brand with your robust searchTokens array into one giant string
                    const tokens = item.searchTokens || [];
                    const searchString = [
                        name,
                        brand,
                        ...tokens
                    ].join(' ').toLowerCase();

                    flattened.push({
                        id: docId,
                        name: name,
                        brand: brand,
                        category: item.category || categoryKey,
                        subCategory: item.subCategory || 'General',
                        // Store the search string for filtering
                        searchString: searchString,
                        // Keep original data just in case
                        original: item
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

        // 1. Split user query into individual terms (e.g. "SSL Origin" -> ["ssl", "origin"])
        const queryTerms = searchTerm.toLowerCase().trim().split(/\s+/);
        
        // 2. Filter: Item must match ALL terms
        const filteredResults = allItems.filter(item => {
            // "Every" term in the query must be found somewhere in the item's search string
            return queryTerms.every(term => item.searchString.includes(term));
        }).slice(0, 50); // Limit results for performance

        setResults(filteredResults);
    };

    return { searchEquipment, results, loading };
};
