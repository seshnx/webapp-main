import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook to fetch equipment database from Supabase
 * Returns all equipment items grouped by category for use in autocomplete/search
 */
export const useEquipmentDatabase = () => {
    const [dbData, setDbData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                // Fetch all verified equipment items
                const { data, error } = await supabase
                    .from('equipment_database')
                    .select('*')
                    .eq('verified', true)
                    .order('category')
                    .order('subcategory')
                    .order('brand')
                    .order('name');

                if (error) throw error;

                // Group by category and subcategory
                const grouped = {};
                
                (data || []).forEach(item => {
                    const category = item.category || 'Other';
                    const subcategory = item.subcategory || 'General';
                    
                    if (!grouped[category]) {
                        grouped[category] = {};
                    }
                    
                    if (!grouped[category][subcategory]) {
                        grouped[category][subcategory] = [];
                    }
                    
                    // Format item for compatibility with existing search
                    grouped[category][subcategory].push({
                        id: item.id,
                        name: item.name || item.model,
                        brand: item.brand || 'Unknown',
                        model: item.model,
                        category: category,
                        subCategory: subcategory,
                        description: item.description,
                        specifications: item.specifications,
                        searchTokens: item.search_tokens || [],
                        original: item
                    });
                });
                
                setDbData(grouped);
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
