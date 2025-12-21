import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Giphy API key - should be in environment variables
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || 'demo_key';
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';

/**
 * GIF picker component with Giphy integration
 */
export default function GifPicker({ 
    onSelect, 
    onClose,
    position = 'bottom'
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [gifs, setGifs] = useState([]);
    const [trendingGifs, setTrendingGifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('trending'); // 'trending' | 'search'
    const searchTimeoutRef = useRef(null);

    // Load trending GIFs on mount
    useEffect(() => {
        loadTrending();
    }, []);

    // Search with debounce
    useEffect(() => {
        if (searchQuery.trim()) {
            setActiveTab('search');
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
                searchGifs(searchQuery);
            }, 500);
        } else {
            setActiveTab('trending');
            setGifs([]);
        }
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const loadTrending = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=24&rating=g`
            );
            const data = await response.json();
            if (data.data) {
                setTrendingGifs(data.data);
            }
        } catch (error) {
            console.error('Giphy trending error:', error);
        }
        setLoading(false);
    };

    const searchGifs = async (query) => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            const response = await fetch(
                `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=g`
            );
            const data = await response.json();
            if (data.data) {
                setGifs(data.data);
            }
        } catch (error) {
            console.error('Giphy search error:', error);
        }
        setLoading(false);
    };

    const handleGifSelect = (gif) => {
        onSelect?.({
            url: gif.images.fixed_height.url || gif.images.original.url,
            previewUrl: gif.images.preview_gif.url || gif.images.fixed_height_small.url,
            width: gif.images.fixed_height.width,
            height: gif.images.fixed_height.height,
            title: gif.title || 'GIF'
        });
        if (onClose) onClose();
    };

    const displayGifs = activeTab === 'trending' ? trendingGifs : gifs;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                absolute ${position === 'bottom' ? 'bottom-full mb-2' : 'top-full mt-2'} 
                left-0
                w-[380px] bg-white dark:bg-gray-800 
                rounded-2xl shadow-2xl border dark:border-gray-700
                z-50 overflow-hidden
            `}
        >
            {/* Header */}
            <div className="p-3 border-b dark:border-gray-700">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search GIFs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-blue dark:text-white"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* GIF Grid */}
            <div className="h-[320px] overflow-y-auto custom-scrollbar p-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="animate-spin text-brand-blue mb-2" size={24} />
                        <p className="text-sm text-gray-500">Loading GIFs...</p>
                    </div>
                ) : displayGifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <TrendingUp size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">
                            {activeTab === 'search' 
                                ? 'No GIFs found. Try a different search.'
                                : 'Loading trending GIFs...'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {displayGifs.map((gif) => (
                            <motion.div
                                key={gif.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleGifSelect(gif)}
                                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-700 group"
                            >
                                <img
                                    src={gif.images.fixed_height_small.url || gif.images.preview_gif.url}
                                    alt={gif.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center">
                <p className="text-[10px] text-gray-400">
                    Powered by <span className="font-bold">GIPHY</span>
                </p>
            </div>
        </motion.div>
    );
}

