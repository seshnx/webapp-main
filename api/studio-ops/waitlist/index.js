import { query } from '../../src/config/neon.js';

/**
 * Booking Waitlist API
 * GET /api/studio-ops/waitlist - List waitlist entries for a studio
 * POST /api/studio-ops/waitlist - Join waitlist
 */

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getWaitlist(req, res);
    } else if (req.method === 'POST') {
        return joinWaitlist(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/waitlist
 * Get waitlist entries for a studio
 *
 * Query params:
 * - studioId: Studio UUID (required)
 * - status: Filter by status (optional)
 * - bookingId: Filter by booking ID (optional)
 */
async function getWaitlist(req, res) {
    try {
        const { studioId, status, bookingId } = req.query;

        if (!studioId) {
            return res.status(400).json({ error: 'Missing required parameter: studioId' });
        }

        let sql = `
            SELECT
                bw.id,
                bw.booking_id,
                bw.client_id,
                bw.studio_id,
                bw.requested_date,
                bw.requested_room_id,
                bw.priority,
                bw.status,
                bw.expires_at,
                bw.created_at,
                -- Get client details
                sc.name as client_name,
                sc.email as client_email,
                sc.phone as client_phone,
                sc.client_type,
                -- Get booking details if available
                b.date as booking_date,
                b.start_time as booking_start_time,
                b.end_time as booking_end_time,
                b.type as booking_type,
                v.name as room_name
            FROM booking_waitlist bw
            LEFT JOIN studio_clients sc ON sc.client_id::text = bw.client_id::text
            LEFT JOIN bookings b ON b.id = bw.booking_id
            LEFT JOIN venues v ON v.id = bw.requested_room_id
            WHERE bw.studio_id = $1
        `;
        const params = [studioId];

        // Filter by status
        if (status) {
            sql += ` AND bw.status = $2`;
            params.push(status);
        }

        // Filter by booking ID
        if (bookingId) {
            const paramIndex = status ? 3 : 2;
            sql += ` AND bw.booking_id = $${paramIndex}`;
            params.push(bookingId);
        }

        // Order by priority (highest first), then created date (earlier first)
        sql += ` ORDER BY bw.priority DESC, bw.created_at ASC`;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error('Error fetching waitlist:', error);
        return res.status(500).json({
            error: 'Failed to fetch waitlist',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/waitlist
 * Join waitlist for a booking
 *
 * Body:
 * - studioId: Studio UUID (required)
 * - clientId: Client UUID (required)
 * - bookingId: Associated booking ID (optional)
 * - requestedDate: Requested date/time (required)
 * - requestedRoomId: Room preference (optional)
 * - priority: Priority level 0-100 (optional, default: 0)
 * - expiresAt: Expiration date for waitlist entry (optional)
 */
async function joinWaitlist(req, res) {
    try {
        const {
            studioId,
            clientId,
            bookingId,
            requestedDate,
            requestedRoomId,
            priority,
            expiresAt
        } = req.body;

        // Validation
        if (!studioId || !clientId || !requestedDate) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studioId', 'clientId', 'requestedDate']
            });
        }

        // Check if client already has an active waitlist entry for this date
        const existingEntry = await query(
            `SELECT id FROM booking_waitlist
             WHERE client_id = $1
             AND studio_id = $2
             AND DATE(requested_date) = DATE($3)
             AND status = 'pending'`,
            [clientId, studioId, requestedDate]
        );

        if (existingEntry.length > 0) {
            return res.status(409).json({
                error: 'Already on waitlist',
                message: 'You already have an active waitlist entry for this date'
            });
        }

        // Set expiration to 7 days from now if not provided
        const expiration = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Insert waitlist entry
        const sql = `
            INSERT INTO booking_waitlist (
                booking_id,
                client_id,
                studio_id,
                requested_date,
                requested_room_id,
                priority,
                status,
                expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const params = [
            bookingId || null,
            clientId,
            studioId,
            requestedDate,
            requestedRoomId || null,
            priority !== undefined ? parseInt(priority) : 0,
            'pending',
            expiration
        ];

        const result = await query(sql, params);

        return res.status(201).json({
            success: true,
            data: result[0],
            message: 'Added to waitlist successfully'
        });
    } catch (error) {
        console.error('Error joining waitlist:', error);
        return res.status(500).json({
            error: 'Failed to join waitlist',
            message: error.message
        });
    }
}
