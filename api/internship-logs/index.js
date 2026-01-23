import { authenticateUser } from '../../src/utils/apiAuth.js';
import { query } from '../../src/config/neon.js';

/**
 * Get Internship Logs API
 * GET /api/internship-logs
 *
 * Fetches internship logs for a school
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

    const { schoolId } = req.query;

    if (!schoolId) {
      return res.status(400).json({ error: 'School ID is required' });
    }

    // Fetch internship logs using Neon
    const logsData = await query(
      `SELECT * FROM internship_logs
       WHERE school_id = $1
       ORDER BY check_in DESC
       LIMIT 100`,
      [schoolId]
    );

    return res.status(200).json({
      success: true,
      data: logsData,
      message: 'Internship logs fetched successfully'
    });
  } catch (error) {
    console.error('Fetch internship logs error:', error);
    return res.status(500).json({ error: error.message });
  }
}