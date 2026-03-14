/**
 * GET /api/public/kiosk/:studioId
 *
 * Public endpoint for studio kiosk displays
 * Returns studio info, rooms, floorplan, and current bookings
 *
 * Rate limited: 100 requests/minute per IP
 * No authentication required (public endpoint)
 */
import { query } from '../../../../_config/neon.js';

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Get or create rate limit entry for this IP
  let entry = rateLimitMap.get(ip);

  if (!entry || entry.windowStart < windowStart) {
    // Create new window
    entry = {
      count: 0,
      windowStart: now,
    };
    rateLimitMap.set(ip, entry);
  }

  // Increment request count
  entry.count++;

  // Clean up old entries
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.windowStart < windowStart) {
        rateLimitMap.delete(key);
      }
    }
  }

  // Check if rate limit exceeded
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + RATE_LIMIT_WINDOW,
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetAt: entry.windowStart + RATE_LIMIT_WINDOW,
  };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studioId } = req.query;

  if (!studioId) {
    return res.status(400).json({ error: 'Studio ID is required' });
  }

  // Rate limiting check
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return res
      .status(429)
      .json({
        error: 'Too many requests',
        resetAt: new Date(rateLimit.resetAt).toISOString(),
      });
  }

  // Add rate limit info to response headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetAt).toISOString());

  try {
    // Fetch studio data
    const studioResult = await query(
      `
      SELECT
        id,
        display_name,
        city,
        state,
        studio_description,
        logo_url,
        floorplan_walls,
        floorplan_structures,
        rooms,
        email,
        phone_cell,
        website,
        kiosk_mode_enabled,
        kiosk_edu_mode,
        kiosk_authorized_networks,
        kiosk_network_name
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
      return res.status(403).json({ error: 'Kiosk mode is not enabled for this studio' });
    }

    // Parse JSON fields
    let floorplanWalls = [];
    let floorplanStructures = [];
    let rooms = [];
    let authorizedNetworks = [];

    try {
      floorplanWalls = studio.floorplan_walls ? JSON.parse(studio.floorplan_walls) : [];
      floorplanStructures = studio.floorplan_structures ? JSON.parse(studio.floorplan_structures) : [];
      rooms = studio.rooms ? JSON.parse(studio.rooms) : [];
      authorizedNetworks = studio.kiosk_authorized_networks
        ? JSON.parse(studio.kiosk_authorized_networks)
        : [];
    } catch (e) {
      console.error('Error parsing JSON fields:', e);
    }

    // Fetch today's bookings
    const bookingsResult = await query(
      `
      SELECT
        id,
        room_id,
        room_name,
        start_time,
        end_time,
        status,
        service_type,
        is_class_booking,
        class_name,
        professor_name,
        lesson_plan
      FROM bookings
      WHERE studio_id = $1
        AND DATE(start_time) = CURRENT_DATE
      ORDER BY start_time
    `,
      [studioId]
    );

    return res.status(200).json({
      studio: {
        id: studio.id,
        name: studio.display_name,
        location: {
          city: studio.city,
          state: studio.state,
        },
        description: studio.studio_description,
        logo: studio.logo_url,
        contact: {
          email: studio.email,
          phone: studio.phone_cell,
          website: studio.website,
        },
        kiosk: {
          eduMode: studio.kiosk_edu_mode || false,
          networkName: studio.kiosk_network_name,
        },
      },
      rooms: rooms,
      floorplan: {
        walls: floorplanWalls,
        structures: floorplanStructures,
      },
      bookings: bookingsResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Kiosk API error:', error);
    return res.status(500).json({ error: 'Failed to fetch kiosk data' });
  }
}
