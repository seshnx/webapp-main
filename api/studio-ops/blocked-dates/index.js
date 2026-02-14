import { query } from '../../../src/config/neon.ts';

/**
 * Blocked Dates API
 * GET /api/studio-ops/blocked-dates - List blocked dates for a studio
 * POST /api/studio-ops/blocked-dates - Create a blocked date
 */

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getBlockedDates(req, res);
    } else if (req.method === 'POST') {
        return createBlockedDate(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/blocked-dates
 * Get blocked dates for a studio
 *
 * Query params:
 * - studioId: Studio UUID (required)
 */
async function getBlockedDates(req, res) {
    try {
        const { studioId } = req.query;

        if (!studioId) {
            return res.status(400).json({
                error: 'Missing required parameter: studioId'
            });
        }

        const sql = `
            SELECT *
            FROM blocked_dates
            WHERE studio_owner_id = $1
            ORDER BY date ASC
        `;

        const result = await query(sql, [studioId]);

        return res.status(200).json({
            success: true,
            data: result.map(b => ({
                ...b,
                date: b.date ? new Date(b.date) : null,
                created_at: b.created_at ? new Date(b.created_at) : null
            }))
        });
    } catch (error) {
        console.error('Error fetching blocked dates:', error);
        return res.status(500).json({
            error: 'Failed to fetch blocked dates',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/blocked-dates
 * Create a blocked date
 *
 * Body:
 * - studioId: Studio UUID (required)
 * - date: Date to block (required)
 * - reason: Reason for blocking (optional)
 * - timeSlot: Time slot to block (optional)
 * - startTime: Start time for custom slot (optional)
 * - endTime: End time for custom slot (optional)
 */
async function createBlockedDate(req, res) {
    try {
        const {
            studioId,
            date,
            reason,
            timeSlot,
            startTime,
            endTime
        } = req.body;

        // Validation
        if (!studioId || !date) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studioId', 'date']
            });
        }

        const sql = `
            INSERT INTO blocked_dates (
                studio_owner_id,
                date,
                reason,
                time_slot,
                start_time,
                end_time,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *
        `;

        const params = [
            studioId,
            date,
            reason || 'Off-platform booking',
            timeSlot || 'full',
            startTime || null,
            endTime || null
        ];

        const result = await query(sql, params);

        return res.status(201).json({
            success: true,
            data: result[0],
            message: 'Time slot blocked successfully'
        });
    } catch (error) {
        console.error('Error creating blocked date:', error);
        return res.status(500).json({
            error: 'Failed to block time slot',
            message: error.message
        });
    }
}
