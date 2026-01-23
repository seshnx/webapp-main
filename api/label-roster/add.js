import { authenticateUser } from '../../src/utils/apiAuth.js';
import { addArtistToRoster, isArtistOnRoster } from '../../src/config/neonQueries.js';

/**
 * Add Artist to Label Roster API
 * POST /api/label-roster/add
 *
 * Adds an artist to a label's roster
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user with Clerk
    const user = await authenticateUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { artistId, firstName, lastName, email, photoURL } = req.body;

    if (!artistId || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Artist ID, first name, last name, and email are required' });
    }

    const labelId = user.id;

    if (!labelId) {
      return res.status(400).json({ error: 'Label ID is required' });
    }

    // Check if artist is already on roster
    const existingArtist = await isArtistOnRoster(labelId, artistId);

    if (existingArtist) {
      return res.status(400).json({ error: 'Artist is already on your roster' });
    }

    // Add artist to roster using Neon
    const data = await addArtistToRoster(labelId, {
      artist_id: artistId,
      name: `${firstName} ${lastName}`.trim(),
      email: email || 'N/A',
      photo_url: photoURL || null,
      role: 'Artist',
      status: 'active',
      signed_date: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      data,
      message: `Artist ${firstName} ${lastName} signed to roster successfully`
    });
  } catch (error) {
    console.error('Add artist error:', error);
    return res.status(500).json({ error: error.message });
  }
}