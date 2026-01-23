import { query } from '../../../../src/config/neon.js';

/**
 * Sub-Profiles API
 * GET /api/user/sub-profiles/[userId] - Get user's sub-profiles
 */

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Missing user ID' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return getSubProfiles(req, res, userId);
}

async function getSubProfiles(req, res, userId) {
    try {
        const sql = `
            SELECT * FROM sub_profiles
            WHERE user_id = $1
        `;

        const result = await query(sql, [userId]);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching sub-profiles:', error);
        return res.status(500).json({
            error: 'Failed to fetch sub-profiles',
            message: error.message
        });
    }
}
