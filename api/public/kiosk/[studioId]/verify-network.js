/**
 * POST /api/public/kiosk/:studioId/verify-network
 *
 * Verifies if client IP is on authorized network
 * Used for WAP/SSID locking in kiosk mode
 */
import { query } from '../../../../_config/neon.js';
import { isIPInCIDR } from '../../../../../src/hooks/useKioskSecurity.js';

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
  const { ip } = req.body;

  if (!studioId) {
    return res.status(400).json({ error: 'Studio ID is required' });
  }

  if (!ip) {
    return res.status(400).json({ error: 'IP address is required' });
  }

  try {
    // Get studio's authorized networks
    const studioResult = await query(
      `
      SELECT
        authorized_networks,
        network_name
      FROM profiles
      WHERE id = $1 AND is_studio = true
    `,
      [studioId]
    );

    if (studioResult.length === 0) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const { authorized_networks, network_name } = studioResult[0];

    // Parse authorized networks
    let authorizedNetworks = [];
    try {
      authorizedNetworks = authorized_networks
        ? JSON.parse(authorized_networks)
        : [];
    } catch (e) {
      console.error('Error parsing authorized_networks:', e);
    }

    // If no networks configured, allow access
    if (!authorizedNetworks || authorizedNetworks.length === 0) {
      return res.status(200).json({
        authorized: true,
        networkName: network_name || null,
      });
    }

    // Check if IP is in authorized range
    const isAuthorized = authorizedNetworks.some((network) => {
      if (network.includes('/')) {
        // CIDR notation
        return isIPInCIDR(ip, network);
      }
      // Exact match
      return ip === network;
    });

    return res.status(200).json({
      authorized: isAuthorized,
      networkName: isAuthorized ? network_name : null,
    });
  } catch (error) {
    console.error('Network verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
