import { query } from '../../../src/config/neon.js';

/**
 * Market Items API
 * GET /api/marketplace/items - List active market items
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return getMarketItems(req, res);
}

async function getMarketItems(req, res) {
    try {
        const { limit, category } = req.query;

        let sql = `
            SELECT * FROM market_items
            WHERE status = 'active'
        `;
        const params = [];
        let paramIndex = 1;

        // Filter by category
        if (category) {
            sql += ` AND category = $${paramIndex++}`;
            params.push(category);
        }

        sql += ` ORDER BY created_at DESC`;

        // Add limit
        if (limit) {
            sql += ` LIMIT $${paramIndex++}`;
            params.push(parseInt(limit));
        }

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching market items:', error);
        return res.status(500).json({
            error: 'Failed to fetch market items',
            message: error.message
        });
    }
}
