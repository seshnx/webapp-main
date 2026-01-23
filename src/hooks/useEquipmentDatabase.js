import { useState, useEffect } from 'react';
import { getEquipmentGrouped } from '../config/neonQueries';

/**
 * Hook to fetch equipment database from Neon
 * Returns all equipment items grouped by category for use in autocomplete/search
 */
export const useEquipmentDatabase = () => {
    const [dbData, setDbData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                // Fetch all verified equipment items grouped by category
                const grouped = await getEquipmentGrouped();

                // Transform data to match expected format
                const transformed = {};
                for (const [category, subcategories] of Object.entries(grouped)) {
                    transformed[category] = {};
                    for (const [subcategory, items] of Object.entries(subcategories)) {
                        transformed[category][subcategory] = items.map(item => ({
                            id: item.id,
                            name: item.name,
                            brand: item.brand || 'Unknown',
                            model: item.model,
                            category: category,
                            subCategory: subcategory,
                            description: item.description,
                            specifications: item.specifications,
                            searchTokens: [],
                            original: item
                        }));
                    }
                }

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
};
