import { useState, useEffect } from 'react';

interface VerificationResult {
  authorized: boolean;
  networkName: string | null;
  location: string | null;
  verification: {
    network: boolean;
    location: boolean;
    pin: boolean;
  };
  currentPIN: string | null;
  pinInfo: {
    expiresAt: string;
    note: string;
  } | null;
}

interface KioskSecurityState {
  isAuthorized: boolean;
  isLocked: boolean;
  networkName: string | null;
  location: string | null;
  lockKiosk: () => void;
  unlockKiosk: (code: string) => Promise<boolean>;
  error: string | null;
  verificationDetails: VerificationResult | null;
  requestGeolocation: () => Promise<void>;
  locationPermission: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

/**
 * Enhanced security hook for kiosk mode
 * Implements multi-layered security:
 * - IP-based network verification (existing)
 * - Geolocation verification (NEW - verifies physical location)
 * - Time-based PIN verification (NEW - for manual unlock)
 *
 * Note: Browsers cannot read Wi-Fi SSID directly for security reasons.
 * Geolocation is used as a proxy for physical presence at the studio.
 */
export function useKioskSecurity(studioId: string): KioskSecurityState {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationDetails, setVerificationDetails] = useState<VerificationResult | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt');

  /**
   * Get user's current geolocation
   */
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationPermission('unsupported');
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission('granted');
          resolve(position);
        },
        (err) => {
          if (err.code === 1) {
            setLocationPermission('denied');
          } else if (err.code === 2) {
            setLocationPermission('unsupported');
          }
          reject(err);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  };

  /**
   * Request geolocation permission and verify location
   */
  const requestGeolocation = async () => {
    try {
      const position = await getCurrentPosition();
      await verifyWithLocation(position.coords.latitude, position.coords.longitude);
    } catch (err) {
      console.error('Geolocation error:', err);
      setError('Unable to get your location. Please enable location access.');
    }
  };

  /**
   * Verify authorization with location data
   */
  const verifyWithLocation = async (lat?: number, lng?: number) => {
    try {
      // Get public IP using a free IP API
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      // Check if IP and location are authorized (backend endpoint)
      const authCheck = await fetch(
        `/api/public/kiosk/${studioId}/verify-location`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ip,
            latitude: lat,
            longitude: lng,
          }),
        }
      );

      if (authCheck.ok) {
        const data: VerificationResult = await authCheck.json();
        setVerificationDetails(data);
        setIsAuthorized(data.authorized);
        setNetworkName(data.networkName);
        setLocation(data.location);

        // Auto-unlock if authorized
        if (data.authorized) {
          setIsLocked(false);
          setError(null);
        } else {
          setIsLocked(true);

          // Show specific error based on what failed
          if (!data.verification.network) {
            setError('Not connected to authorized network');
          } else if (!data.verification.location) {
            setError('Not at studio location');
          } else if (!data.verification.pin) {
            setError('Invalid PIN code');
          }
        }
      } else {
        // Fallback to basic verification
        await verifyBasic(ip);
      }
    } catch (err) {
      console.error('Location verification failed:', err);
      setError('Verification failed. Retrying with basic check...');
      // Fallback to basic verification
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();
        await verifyBasic(ip);
      } catch (fallbackErr) {
        // Allow access if all checks fail (graceful degradation)
        setIsAuthorized(true);
        setIsLocked(false);
        setError(null);
      }
    }
  };

  /**
   * Basic IP-only verification (fallback)
   */
  const verifyBasic = async (ip: string) => {
    try {
      const authCheck = await fetch(
        `/api/public/kiosk/${studioId}/verify-network`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip }),
        }
      );

      if (authCheck.ok) {
        const data = await authCheck.json();
        setIsAuthorized(data.authorized);
        setNetworkName(data.networkName || null);

        if (data.authorized) {
          setIsLocked(false);
          setError(null);
        } else {
          setIsLocked(true);
          setError('Not connected to authorized network');
        }
      } else {
        // Allow access if endpoint fails (graceful degradation)
        setIsAuthorized(true);
        setIsLocked(false);
      }
    } catch (err) {
      console.error('Basic verification failed:', err);
      setIsAuthorized(true);
      setIsLocked(false);
    }
  };

  // Check authorization on mount and periodically
  useEffect(() => {
    const checkAuthorization = async () => {
      // Try to get location, but don't require it
      try {
        const position = await getCurrentPosition();
        await verifyWithLocation(position.coords.latitude, position.coords.longitude);
      } catch (err) {
        // If location fails, fall back to IP-only verification
        console.log('Location not available, using IP verification only');
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const { ip } = await ipResponse.json();
          await verifyBasic(ip);
        } catch (ipErr) {
          // Allow access if everything fails (graceful degradation)
          setIsAuthorized(true);
          setIsLocked(false);
        }
      }
    };

    checkAuthorization();

    // Re-check every 5 minutes
    const interval = setInterval(checkAuthorization, 300000);

    return () => clearInterval(interval);
  }, [studioId]);

  const lockKiosk = () => {
    setIsLocked(true);
  };

  const unlockKiosk = async (code: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/public/kiosk/${studioId}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.unlocked) {
          setIsLocked(false);
          return true;
        } else {
          setError('Invalid unlock code');
          return false;
        }
      } else {
        setError('Failed to verify unlock code');
        return false;
      }
    } catch (err) {
      setError('Failed to connect to unlock service');
      return false;
    }
  };

  return {
    isAuthorized,
    isLocked,
    networkName,
    location,
    lockKiosk,
    unlockKiosk,
    error,
    verificationDetails,
    requestGeolocation,
    locationPermission,
  };
}

/**
 * Simple IP range check for CIDR notation
 * Used for network verification
 */
export function isIPInCIDR(ip: string, cidr: string): boolean {
  const [base, prefix] = cidr.split('/');
  const prefixLength = parseInt(prefix, 10);

  // Convert IP strings to numbers
  const ipNum = ipToNumber(ip);
  const baseNum = ipToNumber(base);

  if (ipNum === null || baseNum === null) return false;

  // Create mask
  const mask = (0xffffffff << (32 - prefixLength)) >>> 0;

  // Check if IP is in range
  return (ipNum & mask) === (baseNum & mask);
}

/**
 * Convert IP string to number
 */
function ipToNumber(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;

  let result = 0;
  for (let i = 0; i < 4; i++) {
    const part = parseInt(parts[i], 10);
    if (isNaN(part) || part < 0 || part > 255) return null;
    result = (result << 8) + part;
  }

  return result >>> 0;
}
