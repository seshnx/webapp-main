import { query } from '../../../src/config/neon.js';

/**
 * Studio Bookings API
 * GET /api/studio-ops/bookings - List bookings for a studio
 * POST /api/studio-ops/bookings - Create a booking
 */

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getBookings(req, res);
    } else if (req.method === 'POST') {
        return createBooking(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/bookings
 * Get bookings for a studio
 *
 * Query params:
 * - studioId: Studio UUID (required)
 * - clientId: Filter by client UUID (optional)
 * - status: Filter by status (optional)
 * - limit: Max number of results (optional)
 */
async function getBookings(req, res) {
    try {
        const { studioId, clientId, status, limit } = req.query;

        if (!studioId) {
            return res.status(400).json({
                error: 'Missing required parameter: studioId'
            });
        }

        let sql = `
            SELECT
                b.id,
                b.sender_id,
                b.studio_owner_id,
                b.type,
                b.date,
                b.start_time,
                b.end_time,
                b.duration_hours,
                b.offer_amount,
                b.status,
                b.notes,
                b.venue_id,
                b.created_at,
                b.updated_at,
                p_sender.username as client_username,
                p_sender.display_name as client_name,
                p_sender.email as client_email,
                v.name as venue_name,
                v.room_type
            FROM bookings b
            LEFT JOIN profiles p_sender ON p_sender.id = b.sender_id
            LEFT JOIN venues v ON v.id = b.venue_id
            WHERE b.studio_owner_id = $1
        `;
        const params = [studioId];

        // Filter by client
        if (clientId) {
            sql += ` AND b.sender_id = $${params.length + 1}`;
            params.push(clientId);
        }

        // Filter by status
        if (status) {
            sql += ` AND b.status = $${params.length + 1}`;
            params.push(status);
        }

        sql += ` ORDER BY b.date DESC, b.start_time DESC`;

        if (limit) {
            sql += ` LIMIT $${params.length + 1}`;
            params.push(parseInt(limit));
        }

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result.map(b => ({
                ...b,
                date: b.date ? new Date(b.date) : null,
                created_at: b.created_at ? new Date(b.created_at) : null,
                updated_at: b.updated_at ? new Date(b.updated_at) : null,
                startTime: b.start_time,
                endTime: b.end_time,
                duration: b.duration_hours,
                totalPrice: b.offer_amount,
                roomName: b.venue_name,
                clientName: b.client_name || b.client_username
            }))
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({
            error: 'Failed to fetch bookings',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/bookings
 * Create a new booking
 *
 * Body:
 * - studioId: Studio UUID (required)
 * - senderId: Client UUID (required)
 * - type: Booking type (required)
 * - date: Booking date (required)
 * - startTime: Start time (required)
 * - endTime: End time (required)
 * - venueId: Room UUID (optional)
 * - offerAmount: Price (optional)
 * - notes: Notes (optional)
 */
async function createBooking(req, res) {
    try {
        const {
            studioId,
            senderId,
            type,
            date,
            startTime,
            endTime,
            venueId,
            offerAmount,
            notes
        } = req.body;

        // Validation
        if (!studioId || !senderId || !type || !date || !startTime || !endTime) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studioId', 'senderId', 'type', 'date', 'startTime', 'endTime']
            });
        }

        // Calculate duration
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
        const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);

        const sql = `
            INSERT INTO bookings (
                sender_id,
                studio_owner_id,
                type,
                date,
                start_time,
                end_time,
                duration_hours,
                venue_id,
                offer_amount,
                status,
                notes,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', $10, NOW())
            RETURNING *
        `;

        const params = [
            senderId,
            studioId,
            type,
            date,
            startTime,
            endTime,
            durationHours,
            venueId || null,
            offerAmount || null,
            notes || null
        ];

        const result = await query(sql, params);

        return res.status(201).json({
            success: true,
            data: result[0],
            message: 'Booking created successfully'
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        return res.status(500).json({
            error: 'Failed to create booking',
            message: error.message
        });
    }
}
