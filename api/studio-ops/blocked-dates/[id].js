import { query } from '../../../../src/config/neon.js';

/**
 * Blocked Dates Delete API
 * DELETE /api/studio-ops/blocked-dates/[id] - Remove a blocked date
 */

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing blocked date ID' });
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check if blocked date exists
        const existing = await query(
            'SELECT id FROM blocked_dates WHERE id = $1',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Blocked date not found'
            });
        }

        // Delete blocked date
        await query('DELETE FROM blocked_dates WHERE id = $1', [id]);

        return res.status(200).json({
            success: true,
            message: 'Blocked date removed successfully'
        });
    } catch (error) {
        console.error('Error deleting blocked date:', error);
        return res.status(500).json({
            error: 'Failed to remove blocked date',
            message: error.message
        });
    }
}
