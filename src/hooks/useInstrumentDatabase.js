import { useState, useEffect } from 'react';
import {
    getInstrumentsGrouped,
    getInstrumentsByCategory,
    getInstrumentsBySubcategory,
    getInstrumentsByBrand,
    searchInstruments,
    getInstrumentsBySeries,
    getInstrumentById
} from '../config/neonQueries';

/**
 * Hook to fetch instrument database from Neon
 * Returns all instrument items grouped by category for use in autocomplete/search
 */
export const useInstrumentDatabase = () => {
    const [dbData, setDbData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                // Fetch all verified instrument items grouped by category
                const grouped = await getInstrumentsGrouped();

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
                            type: item.type,
                            series: item.series,
                            size: item.size,
                            description: item.description,
                            specifications: item.specifications,
                            searchTokens: [],
                            original: item
                        }));
                    }
                }

                setDbData(transformed);
            } catch (error) {
                console.error("Failed to load instrument database:", error);
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

/**
 * Hook to fetch instruments by category
 */
export const useInstrumentsByCategory = (category) => {
    const [instruments, setInstruments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!category) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await getInstrumentsByCategory(category);
                setInstruments(data);
            } catch (err) {
                setError(err.message);
                setInstruments([]);
            }

            setLoading(false);
        };

        fetchData();
    }, [category]);

    return { instruments, loading, error };
};

/**
 * Hook to fetch instruments by subcategory
 */
export const useInstrumentsBySubcategory = (category, subcategory) => {
    const [instruments, setInstruments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!category || !subcategory) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await getInstrumentsBySubcategory(category, subcategory);
                setInstruments(data);
            } catch (err) {
                setError(err.message);
                setInstruments([]);
            }

            setLoading(false);
        };

        fetchData();
    }, [category, subcategory]);

    return { instruments, loading, error };
};

/**
 * Hook to fetch instruments by brand
 */
export const useInstrumentsByBrand = (brand) => {
    const [instruments, setInstruments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!brand) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await getInstrumentsByBrand(brand);
                setInstruments(data);
            } catch (err) {
                setError(err.message);
                setInstruments([]);
            }

            setLoading(false);
        };

        fetchData();
    }, [brand]);

    return { instruments, loading, error };
};

/**
 * Hook to search instruments
 */
export const useInstrumentSearch = (searchTerm, limit = 50) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!searchTerm || searchTerm.length < 2) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await searchInstruments(searchTerm, limit);
                setResults(data);
            } catch (err) {
                setError(err.message);
                setResults([]);
            }

            setLoading(false);
        };

        fetchData();
    }, [searchTerm, limit]);

    return { results, loading, error };
};

/**
 * Hook to fetch instruments by series (for cymbals and other nested categories)
 */
export const useInstrumentsBySeries = (category, subcategory, brand, series) => {
    const [instruments, setInstruments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!category || !subcategory || !brand || !series) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await getInstrumentsBySeries(category, subcategory, brand, series);
                setInstruments(data);
            } catch (err) {
                setError(err.message);
                setInstruments([]);
            }

            setLoading(false);
        };

        fetchData();
    }, [category, subcategory, brand, series]);

    return { instruments, loading, error };
};

/**
 * Hook to fetch instrument by ID
 */
export const useInstrumentById = (instrumentId) => {
    const [instrument, setInstrument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!instrumentId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await getInstrumentById(instrumentId);
                setInstrument(data);
            } catch (err) {
                setError(err.message);
                setInstrument(null);
            }

            setLoading(false);
        };

        fetchData();
    }, [instrumentId]);

    return { instrument, loading, error };
};

export default useInstrumentDatabase;
