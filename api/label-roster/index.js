import { authenticateUser } from '../../src/utils/apiAuth.js';
import { getLabelRoster } from '../../src/config/neonQueries.js';

/**
 * Get Label Roster API
 * GET /api/label-roster
 *
 * Fetches all artists on a label's roster
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user with Clerk
    const user = await authenticateUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const labelId = user.id;

    if (!labelId) {
      return res.status(400).json({ error: 'Label ID is required' });
    }

    // Fetch label roster using Neon
    const rosterData = await getLabelRoster(labelId);

    const roster = (rosterData || []).map(item => ({
      id: item.id,
      artistId: item.artist_id,
      name: item.name,
      email: item.email,
      photoURL: item.artist_photo_url || item.photo_url,
      status: item.status,
      signedAt: item.signed_date || item.signed_at,
      streams: item.streams,
      earnings: item.earnings
    }));

    return res.status(200).json({
      success: true,
      data: roster,
      message: 'Label roster fetched successfully'
    });
  } catch (error) {
    console.error('Fetch label roster error:', error);
    return res.status(500).json({ error: error.message });
  }
}