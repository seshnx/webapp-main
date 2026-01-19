import { query } from '../../../src/config/neon.js';

/**
 * Disconnect Google Calendar from Studio
 * POST /api/studio-ops/calendar-sync/disconnect
 *
 * Body:
 * - studioId: Studio UUID (required)
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { studioId } = req.body;

        // Validation
        if (!studioId) {
            return res.status(400).json({
                error: 'Missing required field: studioId'
            });
        }

        // Check if connection exists
        const existingResult = await query(
            'SELECT id FROM google_calendar_sync WHERE studio_id = $1',
            [studioId]
        );

        if (existingResult.length === 0) {
            return res.status(404).json({
                error: 'Google Calendar connection not found'
            });
        }

        // Update connection to disconnected state (keep data for potential reconnection)
        await query(
            `UPDATE google_calendar_sync
             SET is_connected = false, access_token = NULL, refresh_token = NULL, updated_at = NOW()
             WHERE studio_id = $1`,
            [studioId]
        );

        return res.status(200).json({
            success: true,
            message: 'Google Calendar disconnected successfully'
        });
    } catch (error) {
        console.error('Error disconnecting Google Calendar:', error);
        return res.status(500).json({
            error: 'Failed to disconnect Google Calendar',
            message: error.message
        });
    }
}
