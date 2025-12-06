import { useState } from 'react';
import { collectionGroup, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useEquipmentSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchEquipment = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search across all 'items' subcollections in the equipment database
      // Note: This requires a collectionGroup index on 'searchTokens' in Firestore
      const q = query(
        collectionGroup(db, 'items'),
        where('searchTokens', 'array-contains', searchTerm.toLowerCase()),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResults(items);
    } catch (err) {
      console.error("Equipment search failed:", err);
      
      // FIX: Explicitly handle the missing index error to guide the developer
      // The Firebase SDK provides a direct link in the error message to create the index.
      if (err.code === 'failed-precondition') {
          const msg = "MISSING INDEX: This search requires a Firestore Collection Group Index. Open your browser console and click the link provided by the Firebase SDK to create it automatically.";
          console.warn(msg);
          setError({ ...err, message: msg }); // Surface meaningful message to UI
      } else {
          setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return { searchEquipment, results, loading, error };
};
