import { query } from '../../../src/config/neon.ts';
import { syncBookingToConvex, removeBookingFromConvex } from '../../../src/utils/convexSync.ts';

/**
 * Individual Booking API
 * GET /api/studio-ops/bookings/[id] - Get booking by ID
 * PUT /api/studio-ops/bookings/[id] - Update booking
 * DELETE /api/studio-ops/bookings/[id] - Delete booking
 */

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing booking ID' });
    }

    if (req.method === 'GET') {
        return getBooking(req, res, id);
    } else if (req.method === 'PUT') {
        return updateBooking(req, res, id);
    } else if (req.method === 'DELETE') {
        return deleteBooking(req, res, id);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/bookings/[id]
 * Get booking by ID
 */
async function getBooking(req, res, bookingId) {
    try {
        const sql = `
            SELECT
                b.*,
                p_sender.username as client_username,
                p_sender.display_name as client_name,
                p_sender.email as client_email,
                v.name as venue_name
            FROM bookings b
            LEFT JOIN profiles p_sender ON p_sender.id = b.sender_id
            LEFT JOIN venues v ON v.id = b.venue_id
            WHERE b.id = $1
        `;

        const result = await query(sql, [bookingId]);

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Booking not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                ...result[0],
                date: result[0].date ? new Date(result[0].date) : null,
                created_at: result[0].created_at ? new Date(result[0].created_at) : null
            }
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return res.status(500).json({
            error: 'Failed to fetch booking',
            message: error.message
        });
    }
}

/**
 * PUT /api/studio-ops/bookings/[id]
 * Update booking
 */
async function updateBooking(req, res, bookingId) {
    try {
        const { status, notes, venueId, date, startTime, endTime } = req.body;

        // Check if booking exists
        const existingBooking = await query(
            'SELECT id FROM bookings WHERE id = $1',
            [bookingId]
        );

        if (existingBooking.length === 0) {
            return res.status(404).json({
                error: 'Booking not found'
            });
        }

        // Build dynamic update query
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            params.push(status);
        }
        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex++}`);
            params.push(notes);
        }
        if (venueId !== undefined) {
            updates.push(`venue_id = $${paramIndex++}`);
            params.push(venueId);
        }
        if (date !== undefined) {
            updates.push(`date = $${paramIndex++}`);
            params.push(date);
        }
        if (startTime !== undefined) {
            updates.push(`start_time = $${paramIndex++}`);
            params.push(startTime);
        }
        if (endTime !== undefined) {
            updates.push(`end_time = $${paramIndex++}`);
            params.push(endTime);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }

        updates.push(`updated_at = NOW()`);
        params.push(bookingId);

        const sql = `
            UPDATE bookings
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);

        // Sync to Convex for real-time updates
        if (result && result[0]) {
            syncBookingToConvex(result[0]).catch(err =>
                console.error('Failed to sync booking to Convex:', err)
            );
        }

        return res.status(200).json({
            success: true,
            data: result[0],
            message: 'Booking updated successfully'
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({
            error: 'Failed to update booking',
            message: error.message
        });
    }
}

/**
 * DELETE /api/studio-ops/bookings/[id]
 * Delete booking
 */
async function deleteBooking(req, res, bookingId) {
    try {
        // Check if booking exists
        const existingBooking = await query(
            'SELECT id FROM bookings WHERE id = $1',
            [bookingId]
        );

        if (existingBooking.length === 0) {
            return res.status(404).json({
                error: 'Booking not found'
            });
        }

        // Delete booking
        await query('DELETE FROM bookings WHERE id = $1', [bookingId]);

        // Remove from Convex
        removeBookingFromConvex(bookingId).catch(err =>
            console.error('Failed to remove booking from Convex:', err)
        );

        return res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return res.status(500).json({
            error: 'Failed to delete booking',
            message: error.message
        });
    }
}
