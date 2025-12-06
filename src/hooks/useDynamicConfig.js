import { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

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
        // --- CRITICAL FIX: Explicitly define 6 segments for valid Firestore Document References ---
        
        // Segment 1: Collection 'artifacts'
        // Segment 2: Document appId
        // Segment 3: Collection 'public'
        // Segment 4: Document 'config'
        // Segment 5: Collection 'subscriptions'
        // Segment 6: Document 'tier_config' (or 'token_packages')

        const tierRef = doc(db, 'artifacts', appId, 'public', 'config', 'subscriptions', 'tier_config');
        
        const unsubTier = onSnapshot(tierRef, (docSnap) => {
            let fetchedData = docSnap.exists() ? docSnap.data() : {};
            const mergedData = Object.keys(DEFAULT_TIER_DATA).reduce((acc, key) => {
                acc[key] = { ...DEFAULT_TIER_DATA[key], ...fetchedData[key] };
                return acc;
            }, {});
            setConfig(prev => ({ ...prev, tierData: mergedData }));
        });

        const tokensRef = doc(db, 'artifacts', appId, 'public', 'config', 'subscriptions', 'token_packages');
        
        const unsubTokens = onSnapshot(tokensRef, (docSnap) => {
            let fetchedTokens = docSnap.exists() ? Object.values(docSnap.data()) : FALLBACK_TOKEN_PACKAGES;
            // Ensure the data structure is an array of objects
            if (!Array.isArray(fetchedTokens) || fetchedTokens.length === 0) {
                 fetchedTokens = FALLBACK_TOKEN_PACKAGES;
            }
            setConfig(prev => ({ ...prev, tokenPackages: fetchedTokens }));
        });
        
        // Initial setup check
        setLoading(false);

        return () => { 
            unsubTier(); 
            unsubTokens();
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
