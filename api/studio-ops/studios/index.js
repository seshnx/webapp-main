import { query } from '../../../../src/config/neon.js';

/**
 * Studios API
 * GET /api/studio-ops/studios - List studios by account type
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return getStudios(req, res);
}

async function getStudios(req, res) {
    try {
        const { accountType, city, state } = req.query;

        let sql = `
            SELECT
                id,
                display_name,
                location,
                account_types,
                city,
                state,
                profile_name,
                studio_name
            FROM profiles
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Filter by account type (contains Studio)
        if (accountType) {
            sql += ` AND account_types::jsonb ? $${paramIndex++}`;
            params.push(accountType);
        }

        // Filter by city
        if (city) {
            sql += ` AND city ILIKE $${paramIndex++}`;
            params.push(`%${city}%`);
        }

        // Filter by state
        if (state) {
            sql += ` AND state ILIKE $${paramIndex++}`;
            params.push(`%${state}%`);
        }

        sql += ` ORDER BY display_name ASC`;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching studios:', error);
        return res.status(500).json({
            error: 'Failed to fetch studios',
            message: error.message
        });
    }
}
