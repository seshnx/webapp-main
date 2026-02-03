// src/hooks/useSafeZoneVerification.ts
import { useState, useCallback } from 'react';

/**
 * GPS position interface
 */
export interface GPSPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

/**
 * Safe zone interface
 */
export interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  [key: string]: any;
}

/**
 * Safe zone verification hook return value
 */
export interface UseSafeZoneVerificationReturn {
  currentPosition: GPSPosition | null;
  locationError: string | null;
  isInSafeZone: boolean;
  nearestSafeZone: SafeZone | null;
  safeZones: SafeZone[];
  otherPartyPosition: GPSPosition | null;
  proximityToOther: number | null;
  isWithinProximity: boolean;
  getCurrentPosition: () => GPSPosition | null;
  verifySafeZone: () => Promise<boolean>;
  verifyProximity: () => number | null;
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns Distance in meters
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Hook for managing safe zone verification during high-value exchanges
 * TODO: Migrate safe zone queries to Neon
 * Currently provides basic distance calculation without database queries
 *
 * @param transactionId - Transaction ID
 * @param userId - User ID
 * @returns Safe zone verification state and functions
 *
 * @example
 * function SafeZoneCheck({ transactionId, userId }) {
 *   const {
 *     currentPosition,
 *     isInSafeZone,
 *     getCurrentPosition,
 *     verifySafeZone
 *   } = useSafeZoneVerification(transactionId, userId);
 *
 *   return (
 *     <div>
 *       <button onClick={getCurrentPosition}>Get Location</button>
 *       <button onClick={verifySafeZone}>Verify Safe Zone</button>
 *       {isInSafeZone ? <div>✓ In Safe Zone</div> : <div>⚠ Not in Safe Zone</div>}
 *     </div>
 *   );
 * }
 */
export function useSafeZoneVerification(
  transactionId: string | null,
  userId: string | null
): UseSafeZoneVerificationReturn {
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isInSafeZone, setIsInSafeZone] = useState<boolean>(false);
  const [nearestSafeZone, setNearestSafeZone] = useState<SafeZone | null>(null);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [otherPartyPosition, setOtherPartyPosition] = useState<GPSPosition | null>(null);
  const [proximityToOther, setProximityToOther] = useState<number | null>(null);
  const [isWithinProximity, setIsWithinProximity] = useState<boolean>(false);

  /**
   * Get current GPS position
   */
  const getCurrentPosition = useCallback((): GPSPosition | null => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return null;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos: GPSPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setCurrentPosition(pos);
        return pos;
      },
      (error) => {
        setLocationError(error.message);
        return null;
      }
    );
    return null;
  }, []);

  /**
   * Verify if user is in safe zone
   * TODO: Implement Neon query for safe_zones table
   */
  const verifySafeZone = useCallback(async (): Promise<boolean> => {
    if (!currentPosition) return false;

    // TODO: Query safe_zones from Neon database
    console.warn('Safe zone verification not yet implemented with Neon');
    return false;
  }, [currentPosition]);

  /**
   * Verify proximity to other party
   */
  const verifyProximity = useCallback((): number | null => {
    if (!currentPosition || !otherPartyPosition) return null;

        const distance = calculateDistance(
            currentPosition.lat,
            currentPosition.lng,
            otherPartyPosition.lat,
            otherPartyPosition.lng
        );

        setProximityToOther(distance);
        setIsWithinProximity(distance <= 100); // 100m threshold
        return distance;
  }, [currentPosition, otherPartyPosition]);

  return {
    currentPosition,
    locationError,
    isInSafeZone,
    nearestSafeZone,
    safeZones,
    otherPartyPosition,
    proximityToOther,
    isWithinProximity,
    getCurrentPosition,
    verifySafeZone,
    verifyProximity
  };
}
