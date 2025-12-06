import { useState, useEffect } from 'react';
import { collection, getDocs, doc } from 'firebase/firestore'; 
import { db, appId } from '../config/firebase';

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
            setLoading(true);
            const newData = {};

            try {
                // Base Path: /artifacts/{appId}/public/data/equipment_database
                const basePath = `artifacts/${appId}/public/data/equipment_database`;

                await Promise.all(COLLECTIONS.map(async (col) => {
                    // 1. Reference the Category Document
                    const categoryDocRef = doc(db, basePath, col.id); 
                    
                    // 2. Reference the 'items' Subcollection
                    const itemsCollectionRef = collection(categoryDocRef, 'items'); 

                    const snapshot = await getDocs(itemsCollectionRef);
                    
                    const colItems = {};
                    snapshot.forEach(doc => {
                        // Document ID = SubCategory Name (e.g., "Audio_Interfaces")
                        // Data = { Types: [Items...] } structure
                        colItems[doc.id] = doc.data();
                    });
                    newData[col.id] = colItems;
                }));
                
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
