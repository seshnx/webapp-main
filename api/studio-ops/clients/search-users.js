import { query } from '../../../src/config/neon.ts';

/**
 * Search Platform Users API
 * GET /api/studio-ops/clients/search-users
 *
 * Search for platform users to add as clients
 *
 * Query params:
 * - search: Search term for username, email, or display name (required)
 * - studioId: Studio UUID (required) - to exclude existing clients
 * - limit: Number of results (default: 10)
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { search, studioId, limit = 10 } = req.query;

        if (!search) {
            return res.status(400).json({
                error: 'Missing required parameter: search'
            });
        }

        if (!studioId) {
            return res.status(400).json({
                error: 'Missing required parameter: studioId'
            });
        }

        const searchTerm = `%${search}%`;
        const limitNum = Math.min(parseInt(limit), 50); // Max 50 results

        // Search for platform users who are NOT already clients of this studio
        const sql = `
            SELECT DISTINCT
                cu.id as user_id,
                cu.username,
                cu.email,
                p.display_name,
                p.photo_url,
                p.profile_name,
                p.bio,
                p.location,
                p.account_types,
                CASE WHEN sc.id IS NOT NULL THEN true ELSE false END as is_already_client
            FROM clerk_users cu
            LEFT JOIN profiles p ON p.user_id = cu.id
            LEFT JOIN studio_clients sc ON sc.client_id = cu.id AND sc.studio_id = $2
            WHERE (
                cu.username ILIKE $1 OR
                cu.email ILIKE $1 OR
                p.display_name ILIKE $1 OR
                p.profile_name ILIKE $1
            )
            AND sc.id IS NULL
            ORDER BY
                CASE
                    WHEN cu.username ILIKE $1 THEN 1
                    WHEN p.display_name ILIKE $1 THEN 2
                    WHEN cu.email ILIKE $1 THEN 3
                    ELSE 4
                END,
                cu.username ASC
            LIMIT $3
        `;

        const result = await query(sql, [searchTerm, studioId, limitNum]);

        return res.status(200).json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({
            error: 'Failed to search users',
            message: error.message
        });
    }
}
