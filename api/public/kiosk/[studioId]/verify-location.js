/**
 * POST /api/public/kiosk/:studioId/verify-location
 *
 * Enhanced kiosk security using multiple verification methods:
 * 1. IP-based network verification (existing)
 * 2. Geolocation verification (NEW - verifies physical location)
 * 3. Time-based PIN verification (NEW - for manual unlock)
 *
 * Note: Browsers cannot read SSID directly for security reasons.
 * This API uses geolocation as a proxy for physical presence.
 */
import { query } from '../../../../_config/neon.js';
import { isIPInCIDR } from '../../../../../src/hooks/useKioskSecurity.js';

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Generate a time-based PIN that changes every hour
 */
function generateTimeBasedPIN(studioId) {
  const now = new Date();
  const hourSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + now.getHours();

  // Simple hash of studioId + hourSeed
  const hash = Math.abs(
    (studioId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) *
      hourSeed) %
      1000000
  );

  return String(hash).padStart(6, '0');
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studioId } = req.query;
  const { ip, latitude, longitude, pin } = req.body;

  if (!studioId) {
    return res.status(400).json({ error: 'Studio ID is required' });
  }

  if (!ip) {
    return res.status(400).json({ error: 'IP address is required' });
  }

  try {
    // Get studio's settings
    const studioResult = await query(
      `
      SELECT
        authorized_networks,
        network_name,
        city,
        state,
        lat,
        lng,
        kiosk_mode_enabled,
        kiosk_verification_methods,
        kiosk_location_radius
      FROM profiles
      WHERE id = $1 AND is_studio = true
    `,
      [studioId]
    );

    if (studioResult.length === 0) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const studio = studioResult[0];

    // Check if kiosk mode is enabled
    if (!studio.kiosk_mode_enabled) {
      return res.status(403).json({ error: 'Kiosk mode is not enabled' });
    }

    // Parse verification methods
    let verificationMethods = ['network']; // Default
    try {
      verificationMethods = studio.kiosk_verification_methods
        ? JSON.parse(studio.kiosk_verification_methods)
        : ['network'];
    } catch (e) {
      console.error('Error parsing verification_methods:', e);
    }

    let authorizedByNetwork = false;
    let authorizedByLocation = false;
    let authorizedByPIN = false;

    // Method 1: IP-based network verification
    if (verificationMethods.includes('network')) {
      let authorizedNetworks = [];
      try {
        authorizedNetworks = studio.authorized_networks
          ? JSON.parse(studio.authorized_networks)
          : [];
      } catch (e) {
        console.error('Error parsing authorized_networks:', e);
      }

      // If no networks configured, allow access
      if (!authorizedNetworks || authorizedNetworks.length === 0) {
        authorizedByNetwork = true;
      } else {
        // Check if IP is in authorized range
        authorizedByNetwork = authorizedNetworks.some((network) => {
          if (network.includes('/')) {
            return isIPInCIDR(ip, network);
          }
          return ip === network;
        });
      }
    } else {
      authorizedByNetwork = true; // Skip network check if not enabled
    }

    // Method 2: Geolocation verification
    if (verificationMethods.includes('location') && latitude && longitude) {
      const radius = studio.kiosk_location_radius || 0.1; // Default 0.1 miles
      const distance = calculateDistance(
        latitude,
        longitude,
        studio.lat || 0,
        studio.lng || 0
      );

      authorizedByLocation = distance <= radius;
    } else if (!verificationMethods.includes('location')) {
      authorizedByLocation = true; // Skip location check if not enabled
    }

    // Method 3: Time-based PIN verification
    if (verificationMethods.includes('pin') && pin) {
      const expectedPIN = generateTimeBasedPIN(studioId);
      authorizedByPIN = pin === expectedPIN;
    } else if (!verificationMethods.includes('pin')) {
      authorizedByPIN = true; // Skip PIN check if not enabled
    }

    // Overall authorization (all enabled methods must pass)
    const isAuthorized =
      authorizedByNetwork && authorizedByLocation && authorizedByPIN;

    return res.status(200).json({
      authorized: isAuthorized,
      networkName: isAuthorized ? studio.network_name : null,
      location: studio.city && studio.state ? `${studio.city}, ${studio.state}` : null,
      verification: {
        network: authorizedByNetwork,
        location: authorizedByLocation,
        pin: authorizedByPIN,
      },
      // Include current hour PIN for display (for studio owner reference)
      currentPIN: verificationMethods.includes('pin')
        ? generateTimeBasedPIN(studioId)
        : null,
      // PIN explanation
      pinInfo: verificationMethods.includes('pin')
        ? {
            expiresAt: new Date(
              new Date().setHours(new Date().getHours() + 1, 0, 0, 0)
            ).toISOString(),
            note: 'PIN changes every hour. Contact studio owner for current PIN.',
          }
        : null,
    });
  } catch (error) {
    console.error('Location verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
