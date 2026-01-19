import { query } from '../../../src/config/neon.js';

/**
 * Individual Waitlist Entry API
 * GET /api/studio-ops/waitlist/[id] - Get waitlist entry by ID
 * PUT /api/studio-ops/waitlist/[id] - Update waitlist entry
 * DELETE /api/studio-ops/waitlist/[id] - Remove from waitlist
 * POST /api/studio-ops/waitlist/[id]/notify - Notify client of availability
 * POST /api/studio-ops/waitlist/[id]/accept - Client accepts booking
 * POST /api/studio-ops/waitlist/[id]/decline - Client declines booking
 */

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing waitlist entry ID' });
    }

    if (req.method === 'GET') {
        return getWaitlistEntry(req, res, id);
    } else if (req.method === 'PUT') {
        return updateWaitlistEntry(req, res, id);
    } else if (req.method === 'DELETE') {
        return removeWaitlistEntry(req, res, id);
    } else if (req.method === 'POST') {
        if (req.url.endsWith('/notify')) {
            return notifyClient(req, res, id);
        } else if (req.url.endsWith('/accept')) {
            return acceptBooking(req, res, id);
        } else if (req.url.endsWith('/decline')) {
            return declineBooking(req, res, id);
        }
        return res.status(400).json({ error: 'Invalid action' });
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/waitlist/[id]
 * Get waitlist entry by ID
 */
async function getWaitlistEntry(req, res, entryId) {
    try {
        const sql = `
            SELECT
                bw.*,
                sc.name as client_name,
                sc.email as client_email,
                sc.phone as client_phone,
                sc.client_type,
                b.date as booking_date,
                b.start_time as booking_start_time,
                v.name as room_name
            FROM booking_waitlist bw
            LEFT JOIN studio_clients sc ON sc.client_id::text = bw.client_id::text
            LEFT JOIN bookings b ON b.id = bw.booking_id
            LEFT JOIN venues v ON v.id = bw.requested_room_id
            WHERE bw.id = $1
        `;

        const result = await query(sql, [entryId]);

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Waitlist entry not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('Error fetching waitlist entry:', error);
        return res.status(500).json({
            error: 'Failed to fetch waitlist entry',
            message: error.message
        });
    }
}

/**
 * PUT /api/studio-ops/waitlist/[id]
 * Update waitlist entry
 */
async function updateWaitlistEntry(req, res, entryId) {
    try {
        const { priority, requestedDate, requestedRoomId, expiresAt } = req.body;

        // Check if entry exists
        const existingEntry = await query(
            'SELECT id FROM booking_waitlist WHERE id = $1',
            [entryId]
        );

        if (existingEntry.length === 0) {
            return res.status(404).json({
                error: 'Waitlist entry not found'
            });
        }

        // Build dynamic update query
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (priority !== undefined) {
            updates.push(`priority = $${paramIndex++}`);
            params.push(parseInt(priority));
        }
        if (requestedDate !== undefined) {
            updates.push(`requested_date = $${paramIndex++}`);
            params.push(requestedDate);
        }
        if (requestedRoomId !== undefined) {
            updates.push(`requested_room_id = $${paramIndex++}`);
            params.push(requestedRoomId);
        }
        if (expiresAt !== undefined) {
            updates.push(`expires_at = $${paramIndex++}`);
            params.push(expiresAt);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }

        params.push(entryId);

        const sql = `
            UPDATE booking_waitlist
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result[0],
            message: 'Waitlist entry updated successfully'
        });
    } catch (error) {
        console.error('Error updating waitlist entry:', error);
        return res.status(500).json({
            error: 'Failed to update waitlist entry',
            message: error.message
        });
    }
}

/**
 * DELETE /api/studio-ops/waitlist/[id]
 * Remove from waitlist
 */
async function removeWaitlistEntry(req, res, entryId) {
    try {
        // Check if entry exists
        const existingEntry = await query(
            'SELECT id FROM booking_waitlist WHERE id = $1',
            [entryId]
        );

        if (existingEntry.length === 0) {
            return res.status(404).json({
                error: 'Waitlist entry not found'
            });
        }

        // Delete entry
        await query('DELETE FROM booking_waitlist WHERE id = $1', [entryId]);

        return res.status(200).json({
            success: true,
            message: 'Removed from waitlist successfully'
        });
    } catch (error) {
        console.error('Error removing from waitlist:', error);
        return res.status(500).json({
            error: 'Failed to remove from waitlist',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/waitlist/[id]/notify
 * Notify client of availability
 */
async function notifyClient(req, res, entryId) {
    try {
        // Get waitlist entry with client details
        const entryResult = await query(
            `SELECT bw.*, sc.name as client_name, sc.email as client_email
             FROM booking_waitlist bw
             LEFT JOIN studio_clients sc ON sc.client_id::text = bw.client_id::text
             WHERE bw.id = $1`,
            [entryId]
        );

        if (entryResult.length === 0) {
            return res.status(404).json({
                error: 'Waitlist entry not found'
            });
        }

        const entry = entryResult[0];

        // Update status to notified and set expiration to 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await query(
            `UPDATE booking_waitlist
             SET status = 'notified', expires_at = $1
             WHERE id = $2
             RETURNING *`,
            [expiresAt, entryId]
        );

        // TODO: Send actual notification (email/push)
        // For now, just mark as notified

        return res.status(200).json({
            success: true,
            message: `Client notified successfully. They have 24 hours to respond.`
        });
    } catch (error) {
        console.error('Error notifying client:', error);
        return res.status(500).json({
            error: 'Failed to notify client',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/waitlist/[id]/accept
 * Client accepts booking offer
 */
async function acceptBooking(req, res, entryId) {
    try {
        const { bookingDate, startTime, roomId } = req.body;

        if (!bookingDate || !startTime) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['bookingDate', 'startTime']
            });
        }

        // Get waitlist entry
        const entryResult = await query(
            `SELECT * FROM booking_waitlist WHERE id = $1`,
            [entryId]
        );

        if (entryResult.length === 0) {
            return res.status(404).json({
                error: 'Waitlist entry not found'
            });
        }

        const entry = entryResult[0];

        // Calculate end time (assuming 2 hour session)
        const endTime = new Date(`${bookingDate} ${startTime}`);
        endTime.setHours(endTime.getHours() + 2);

        // Create booking
        const bookingResult = await query(
            `INSERT INTO bookings (sender_id, studio_owner_id, type, date, start_time, end_time, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'Confirmed')
             RETURNING *`,
            [entry.client_id, entry.studio_id, 'session', bookingDate, startTime, endTime.toTimeString().slice(0, 5)]
        );

        // Update waitlist entry status
        await query(
            `UPDATE booking_waitlist SET status = 'accepted' WHERE id = $1`,
            [entryId]
        );

        return res.status(200).json({
            success: true,
            data: {
                booking: bookingResult[0]
            },
            message: 'Booking created successfully'
        });
    } catch (error) {
        console.error('Error accepting booking:', error);
        return res.status(500).json({
            error: 'Failed to accept booking',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/waitlist/[id]/decline
 * Client declines booking offer
 */
async function declineBooking(req, res, entryId) {
    try {
        // Update waitlist entry status to cancelled
        await query(
            `UPDATE booking_waitlist SET status = 'cancelled' WHERE id = $1`,
            [entryId]
        );

        return res.status(200).json({
            success: true,
            message: 'Booking declined successfully'
        });
    } catch (error) {
        console.error('Error declining booking:', error);
        return res.status(500).json({
            error: 'Failed to decline booking',
            message: error.message
        });
    }
}
