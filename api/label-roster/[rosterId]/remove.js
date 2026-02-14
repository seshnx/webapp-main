import { authenticateUser } from '../../../src/utils/apiAuth.ts';
import { deleteRosterEntry } from '../../../src/config/neonQueries.ts';

/**
 * Remove Artist from Label Roster API
 * DELETE /api/label-roster/[rosterId]/remove
 *
 * Removes an artist from a label's roster
 */

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user with Clerk
    const user = await authenticateUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { rosterId } = req.query;
    const labelId = user.id;

    if (!rosterId) {
      return res.status(400).json({ error: 'Roster ID is required' });
    }

    if (!labelId) {
      return res.status(400).json({ error: 'Label ID is required' });
    }

    // Remove artist from roster using Neon (includes verification)
    await deleteRosterEntry(rosterId, labelId);

    return res.status(200).json({
      success: true,
      message: 'Artist removed from roster successfully'
    });
  } catch (error) {
    console.error('Remove artist error:', error);

    // Handle specific errors
    if (error.message === 'Roster entry not found or access denied') {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
}