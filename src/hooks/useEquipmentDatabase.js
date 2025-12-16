import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

// Main categories matching your Firestore layout
const COLLECTIONS = [
    { id: 'computer_audio_and_interfaces', label: 'Computer Audio & Interfaces' },
    { id: 'microphones_and_input_transducers', label: 'Microphones' },
    { id: 'mixing_consoles_and_control', label: 'Mixing Consoles' },
    { id: 'monitoring_and_playback', label: 'Monitoring & Playback' },
    { id: 'outboard_signal_processing', label: 'Outboard Gear' }
];

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
            const newData = {};

            try {
                // Fetch all equipment items grouped by category
                const { data, error } = await supabase
                    .from('equipment_items')
                    .select('*')
                    .order('category_id')
                    .order('subcategory_id');

                if (error) throw error;

                // Group by category and subcategory to match original structure
                COLLECTIONS.forEach(col => {
                    const categoryItems = (data || []).filter(item => item.category_id === col.id);
                    
                    const colItems = {};
                    categoryItems.forEach(item => {
                        const subcatId = item.subcategory_id || 'default';
                        if (!colItems[subcatId]) {
                            colItems[subcatId] = { Types: [] };
                        }
                        // Store item data in the expected format
                        colItems[subcatId].Types.push({
                            ...item.data,
                            id: item.id,
                            name: item.name,
                            manufacturer: item.manufacturer,
                            model: item.model
                        });
                    });
                    
                    newData[col.id] = colItems;
                });
                
                setDbData(newData);
            } catch (error) {
                console.error("Failed to load equipment database:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    return { 
        loading, 
        data: dbData,
        categories: COLLECTIONS
    };
};
