import { useState, useEffect, useMemo } from 'react';

/**
 * Tier limits interface
 */
export interface TierLimits {
  broadcastsPerMonth: number;
  sessionsPerWeek: number;
  canListMarket: boolean;
  monthlyTokens: number;
}

/**
 * Tier data interface
 */
export interface TierData {
  name: string;
  price: number;
  feeMultiplier: number;
  features: string[];
  limits: TierLimits;
}

/**
 * Token package interface
 */
export interface TokenPackage {
  id: string;
  amount: number;
  price: number;
}

/**
 * Config state interface
 */
export interface ConfigState {
  tierData: Record<string, TierData> | null;
  tokenPackages: TokenPackage[] | null;
}

/**
 * Dynamic config hook return value
 */
export interface UseDynamicConfigReturn {
  config: ConfigState;
  loading: boolean;
  getTierData: (tierName: string) => TierData | undefined;
  getTokenPackage: (packageId: string) => TokenPackage | undefined;
  refetch: () => void;
}

/**
 * Fetches dynamic configuration data (tier rules, token packages)
 * TODO: Migrate to Neon queries
 * Currently uses fallback configuration data
 *
 * @returns Config state and helper functions
 *
 * @example
 * function PricingPage() {
 *   const { config, loading, getTierData } = useDynamicConfig();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <h2>Tiers</h2>
 *       {Object.entries(config.tierData || {}).map(([key, tier]) => (
 *         <TierCard key={key} tier={tier} />
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useDynamicConfig(): UseDynamicConfigReturn {
  const [config, setConfig] = useState<ConfigState>({
    tierData: null,
    tokenPackages: null,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // --- Memoized Stable Fallback Data ---
  const { DEFAULT_TIER_DATA, FALLBACK_TOKEN_PACKAGES } = useMemo(() => {
    const DEFAULT_TIER_DATA_DEF: Record<string, TierData> = {
      'FREE': {
        name: 'Free',
        price: 0,
        feeMultiplier: 1.20,
        features: ["1 Broadcast Request / month", "Cannot list on SeshFx Market"],
        limits: {
          broadcastsPerMonth: 1,
          sessionsPerWeek: 2,
          canListMarket: false,
          monthlyTokens: 0
        }
      },
      'BASIC': {
        name: 'Basic',
        price: 4.99,
        feeMultiplier: 1.10,
        features: [
          "3 Broadcast Requests / month",
          "10 Booked Sessions / week",
          "Can list on SeshFx Market (5 items)"
        ],
        limits: {
          broadcastsPerMonth: 3,
          sessionsPerWeek: 10,
          canListMarket: true,
          monthlyTokens: 25
        }
      },
      'PRO': {
        name: 'Pro Creative',
        price: 14.99,
        feeMultiplier: 1.02,
        features: [
          "15 Broadcast Requests / month",
          "Unlimited Booked Sessions",
          "Profile Search Boost"
        ],
        limits: {
          broadcastsPerMonth: 15,
          sessionsPerWeek: 999,
          canListMarket: true,
          monthlyTokens: 100
        }
      },
      'STUDIO': {
        name: 'Studio Business',
        price: 29.99,
        feeMultiplier: 1.00,
        features: [
          "Studio Manager Component Access",
          "Unlimited Broadcast Requests",
          "0% Session Fees"
        ],
        limits: {
          broadcastsPerMonth: 999,
          sessionsPerWeek: 999,
          canListMarket: true,
          monthlyTokens: 100
        }
      }
    };

    const FALLBACK_TOKEN_PACKAGES_DEF: TokenPackage[] = [
      { id: 'tkn_25', amount: 25, price: 2.99 },
      { id: 'tkn_50', amount: 50, price: 4.99 },
      { id: 'tkn_100', amount: 100, price: 8.99 },
      { id: 'tkn_200', amount: 200, price: 16.99 },
      { id: 'tkn_500', amount: 500, price: 39.99 },
    ];

    return {
      DEFAULT_TIER_DATA: DEFAULT_TIER_DATA_DEF,
      FALLBACK_TOKEN_PACKAGES: FALLBACK_TOKEN_PACKAGES_DEF
    };
  }, []);

  // Load config from database or use fallback
  useEffect(() => {
    const loadConfig = async () => {
      // TODO: Implement Neon query for dynamic config
      // For now, use fallback data
      setConfig({
        tierData: DEFAULT_TIER_DATA,
        tokenPackages: FALLBACK_TOKEN_PACKAGES,
      });
      setLoading(false);
    };

    loadConfig();
  }, [DEFAULT_TIER_DATA, FALLBACK_TOKEN_PACKAGES]);

  const getTierData = (tierName: string): TierData | undefined => {
    return config.tierData?.[tierName] || DEFAULT_TIER_DATA[tierName];
  };

  const getTokenPackage = (packageId: string): TokenPackage | undefined => {
    return config.tokenPackages?.find(pkg => pkg.id === packageId);
  };

  return {
    config,
    loading,
    getTierData,
    getTokenPackage,
    refetch: () => {}
  };
}
