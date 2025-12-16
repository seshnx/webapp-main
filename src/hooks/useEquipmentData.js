import { useState } from 'react';
import { supabase } from '../config/supabase';

export const useEquipmentSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchEquipment = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    if (!supabase) {
      setError(new Error('Supabase not configured'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchLower = searchTerm.toLowerCase();
      
      // Native Supabase query with array contains - much faster than adapter
      const { data, error: queryError } = await supabase
        .from('equipment_items')
        .select('*')
        .contains('search_tokens', [searchLower])
        .limit(20);

      if (queryError) throw queryError;

      // Transform to match expected format
      const items = (data || []).map(item => ({
        id: item.id,
        ...item.data, // Equipment data stored in jsonb
        name: item.name,
        manufacturer: item.manufacturer,
        model: item.model
      }));

      setResults(items);
    } catch (err) {
      console.error("Equipment search failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { searchEquipment, results, loading, error };
};
