import { query } from '../../../../src/config/neon.js';

/**
 * Label Roster API
 * GET /api/studio-ops/roster/[labelId] - Get roster for a label/agent
 */

export default async function handler(req, res) {
    const { labelId } = req.query;

    if (!labelId) {
        return res.status(400).json({ error: 'Missing label ID' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return getRoster(req, res, labelId);
}

async function getRoster(req, res, labelId) {
    try {
        const sql = `
            SELECT
                id,
                artist_id,
                name,
                photo_url
            FROM label_roster
            WHERE label_id = $1
            ORDER BY name ASC
        `;

        const result = await query(sql, [labelId]);

        return res.status(200).json({
            success: true,
            data: result.map(r => ({
                id: r.id,
                artistId: r.artist_id,
                name: r.name,
                photoURL: r.photo_url
            }))
        });
    } catch (error) {
        console.error('Error fetching roster:', error);
        return res.status(500).json({
            error: 'Failed to fetch roster',
            message: error.message
        });
    }
}
