import { authenticateUser } from '../../../src/utils/apiAuth.js';
import { query } from '../../../src/config/neon.js';

/**
 * Update Internship Log Status API
 * PUT /api/internship-logs/[logId]/status
 *
 * Updates the status of an internship log
 */

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user with Clerk
    const user = await authenticateUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { logId } = req.query;
    const { status } = req.body;

    if (!logId) {
      return res.status(400).json({ error: 'Log ID is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Update the log status using Neon
    const data = await query(
      `UPDATE internship_logs
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, logId]
    );

    return res.status(200).json({
      success: true,
      data: data[0],
      message: 'Log status updated successfully'
    });
  } catch (error) {
    console.error('Update log status error:', error);
    return res.status(500).json({ error: error.message });
  }
}