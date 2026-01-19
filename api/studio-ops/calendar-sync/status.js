import { query } from '../../../src/config/neon.js';

/**
 * Get Google Calendar Sync Status
 * GET /api/studio-ops/calendar-sync/status?studioId={studioId}
 *
 * Returns connection status and sync information
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { studioId } = req.query;

        // Validation
        if (!studioId) {
            return res.status(400).json({
                error: 'Missing required parameter: studioId'
            });
        }

        // Get sync status
        const result = await query(
            `SELECT
                id,
                studio_id,
                calendar_id,
                calendar_name,
                is_connected,
                last_synced_at,
                sync_settings,
                created_at,
                updated_at
             FROM google_calendar_sync
             WHERE studio_id = $1`,
            [studioId]
        );

        if (result.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    isConnected: false,
                    message: 'Google Calendar not connected'
                }
            });
        }

        const syncData = result[0];

        return res.status(200).json({
            success: true,
            data: {
                isConnected: syncData.is_connected,
                calendarId: syncData.calendar_id,
                calendarName: syncData.calendar_name,
                lastSyncedAt: syncData.last_synced_at,
                syncSettings: syncData.sync_settings,
                connectedAt: syncData.created_at
            }
        });
    } catch (error) {
        console.error('Error fetching Google Calendar sync status:', error);
        return res.status(500).json({
            error: 'Failed to fetch sync status',
            message: error.message
        });
    }
}
