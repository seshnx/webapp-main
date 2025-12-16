import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';

// NOTE: This fallback data structure is now defined inside the hook 
// and memoized to ensure stable references across renders.

/**
 * Fetches dynamic configuration data (tier rules, token packages) from Firestore.
 */
export const useDynamicConfig = () => {
    const [config, setConfig] = useState({
        tierData: null,
        tokenPackages: null,
    });
    const [loading, setLoading] = useState(true);

    // --- Memoized Stable Fallback Data ---
    const { DEFAULT_TIER_DATA, FALLBACK_TOKEN_PACKAGES } = useMemo(() => {
        const DEFAULT_TIER_DATA_DEF = {
            'FREE': { 
                name: 'Free', price: 0, feeMultiplier: 1.20,
                features: ["1 Broadcast Request / month", "Cannot list on SeshFx Market"],
                limits: { broadcastsPerMonth: 1, sessionsPerWeek: 2, canListMarket: false, monthlyTokens: 0 }
            },
            'BASIC': { 
                name: 'Basic', price: 4.99, feeMultiplier: 1.10,
                features: ["3 Broadcast Requests / month", "10 Booked Sessions / week", "Can list on SeshFx Market (5 items)"],
                limits: { broadcastsPerMonth: 3, sessionsPerWeek: 10, canListMarket: true, monthlyTokens: 25 }
            },
            'PRO': { 
                name: 'Pro Creative', price: 14.99, feeMultiplier: 1.02,
                features: ["15 Broadcast Requests / month", "Unlimited Booked Sessions", "Profile Search Boost"],
                limits: { broadcastsPerMonth: 15, sessionsPerWeek: 999, canListMarket: true, monthlyTokens: 100 }
            },
            'STUDIO': { 
                name: 'Studio Business', price: 29.99, feeMultiplier: 1.00,
                features: ["Studio Manager Component Access", "Unlimited Broadcast Requests", "0% Session Fees"],
                limits: { broadcastsPerMonth: 999, sessionsPerWeek: 999, canListMarket: true, monthlyTokens: 100 }
            }
        };

        const FALLBACK_TOKEN_PACKAGES_DEF = [
            { id: 'pack_small', tokens: 100, price: 4.99, label: 'Starter Stash' },
            { id: 'pack_medium', tokens: 550, price: 19.99, label: 'Producer Pack', highlight: true },
            { id: 'pack_large', tokens: 1200, price: 39.99, label: 'Studio Vault' }
        ];

        return { DEFAULT_TIER_DATA: DEFAULT_TIER_DATA_DEF, FALLBACK_TOKEN_PACKAGES: FALLBACK_TOKEN_PACKAGES_DEF };
    }, []);
    // --- End Memoized Stable Fallback Data ---


    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Fetch tier config
        const fetchTierConfig = async () => {
            const { data, error } = await supabase
                .from('app_config')
                .select('config_value')
                .eq('config_key', 'tier_config')
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching tier config:', error);
                setConfig(prev => ({ ...prev, tierData: DEFAULT_TIER_DATA }));
                return;
            }

            const fetchedData = data?.config_value || {};
            const mergedData = Object.keys(DEFAULT_TIER_DATA).reduce((acc, key) => {
                acc[key] = { ...DEFAULT_TIER_DATA[key], ...(fetchedData[key] || {}) };
                return acc;
            }, {});
            setConfig(prev => ({ ...prev, tierData: mergedData }));
        };

        // Fetch token packages
        const fetchTokenPackages = async () => {
            const { data, error } = await supabase
                .from('app_config')
                .select('config_value')
                .eq('config_key', 'token_packages')
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching token packages:', error);
                setConfig(prev => ({ ...prev, tokenPackages: FALLBACK_TOKEN_PACKAGES }));
                return;
            }

            let fetchedTokens = data?.config_value || FALLBACK_TOKEN_PACKAGES;
            if (!Array.isArray(fetchedTokens) || fetchedTokens.length === 0) {
                fetchedTokens = FALLBACK_TOKEN_PACKAGES;
            }
            setConfig(prev => ({ ...prev, tokenPackages: fetchedTokens }));
        };

        // Initial fetch
        Promise.all([fetchTierConfig(), fetchTokenPackages()]).finally(() => {
            setLoading(false);
        });

        // Subscribe to real-time updates
        const tierChannel = supabase
            .channel('app_config_tier')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'app_config', filter: 'config_key=eq.tier_config' },
                () => fetchTierConfig()
            )
            .subscribe();

        const tokensChannel = supabase
            .channel('app_config_tokens')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'app_config', filter: 'config_key=eq.token_packages' },
                () => fetchTokenPackages()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(tierChannel);
            supabase.removeChannel(tokensChannel);
        };
    }, [DEFAULT_TIER_DATA, FALLBACK_TOKEN_PACKAGES]); 


    // Helper function to get the multiplier for a user's current tier
    const getFeeMultiplier = (currentTierId) => {
        const tier = config.tierData?.[currentTierId] || config.tierData?.['FREE'];
        return tier ? tier.feeMultiplier : DEFAULT_TIER_DATA.FREE.feeMultiplier;
    };

    return { 
        tierData: config.tierData || DEFAULT_TIER_DATA, 
        tokenPackages: config.tokenPackages || FALLBACK_TOKEN_PACKAGES,
        loading, 
        getFeeMultiplier
    };
};
