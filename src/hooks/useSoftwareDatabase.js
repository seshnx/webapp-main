import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook to fetch software database from Supabase
 * Returns all software items grouped by category for use in autocomplete/search
 */
export const useSoftwareDatabase = () => {
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
                // Fetch all verified software items
                const { data, error } = await supabase
                    .from('software_database')
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
                        website_url: item.website_url,
                        searchTokens: item.search_tokens || [],
                        original: item
                    });
                });
                
                setDbData(grouped);
            } catch (error) {
                console.error("Failed to load software database:", error);
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

