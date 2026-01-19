import { query } from '../../../src/config/neon.js';

/**
 * Individual Payment API
 * GET /api/studio-ops/booking-payments/[id] - Get payment by ID
 * PUT /api/studio-ops/booking-payments/[id] - Update payment
 * DELETE /api/studio-ops/booking-payments/[id] - Delete payment
 * POST /api/studio-ops/booking-payments/[id]/confirm - Confirm payment received
 */

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing payment ID' });
    }

    if (req.method === 'GET') {
        return getPayment(req, res, id);
    } else if (req.method === 'PUT') {
        return updatePayment(req, res, id);
    } else if (req.method === 'DELETE') {
        return deletePayment(req, res, id);
    } else if (req.method === 'POST' && req.url.endsWith('/confirm')) {
        return confirmPayment(req, res, id);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/booking-payments/[id]
 * Get payment by ID
 */
async function getPayment(req, res, paymentId) {
    try {
        const sql = `
            SELECT
                bp.*,
                b.date as booking_date,
                b.start_time as booking_start_time,
                b.offer_amount as booking_total,
                sc.name as client_name,
                sc.email as client_email
            FROM booking_payments bp
            LEFT JOIN bookings b ON b.id = bp.booking_id
            LEFT JOIN studio_clients sc ON sc.client_id::text = b.sender_id::text
            WHERE bp.id = $1
        `;

        const result = await query(sql, [paymentId]);

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Payment not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        return res.status(500).json({
            error: 'Failed to fetch payment',
            message: error.message
        });
    }
}

/**
 * PUT /api/studio-ops/booking-payments/[id]
 * Update payment
 */
async function updatePayment(req, res, paymentId) {
    try {
        const { amount, dueDate, status, paymentIntentId } = req.body;

        // Check if payment exists
        const existingPayment = await query(
            'SELECT id FROM booking_payments WHERE id = $1',
            [paymentId]
        );

        if (existingPayment.length === 0) {
            return res.status(404).json({
                error: 'Payment not found'
            });
        }

        // Build dynamic update query
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (amount !== undefined) {
            updates.push(`amount = $${paramIndex++}`);
            params.push(parseFloat(amount));
        }
        if (dueDate !== undefined) {
            updates.push(`due_date = $${paramIndex++}`);
            params.push(dueDate);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            params.push(status);
        }
        if (paymentIntentId !== undefined) {
            updates.push(`payment_intent_id = $${paramIndex++}`);
            params.push(paymentIntentId);
        }

        // If status is changing to completed, set paid_at
        if (status === 'completed') {
            updates.push(`paid_at = $${paramIndex++}`);
            params.push(new Date());
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }

        params.push(paymentId);

        const sql = `
            UPDATE booking_payments
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result[0],
            message: 'Payment updated successfully'
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        return res.status(500).json({
            error: 'Failed to update payment',
            message: error.message
        });
    }
}

/**
 * DELETE /api/studio-ops/booking-payments/[id]
 * Delete payment
 */
async function deletePayment(req, res, paymentId) {
    try {
        // Check if payment exists
        const existingPayment = await query(
            'SELECT id, amount FROM booking_payments WHERE id = $1',
            [paymentId]
        );

        if (existingPayment.length === 0) {
            return res.status(404).json({
                error: 'Payment not found'
            });
        }

        // Don't allow deleting completed payments
        if (existingPayment[0].status === 'completed') {
            return res.status(409).json({
                error: 'Cannot delete completed payment',
                message: 'Completed payments cannot be deleted. Please create a refund instead.'
            });
        }

        // Delete payment
        await query('DELETE FROM booking_payments WHERE id = $1', [paymentId]);

        return res.status(200).json({
            success: true,
            message: 'Payment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting payment:', error);
        return res.status(500).json({
            error: 'Failed to delete payment',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/booking-payments/[id]/confirm
 * Confirm payment received
 */
async function confirmPayment(req, res, paymentId) {
    try {
        // Get payment details
        const paymentResult = await query(
            `SELECT bp.*, b.offer_amount as booking_total
             FROM booking_payments bp
             LEFT JOIN bookings b ON b.id = bp.booking_id
             WHERE bp.id = $1`,
            [paymentId]
        );

        if (paymentResult.length === 0) {
            return res.status(404).json({
                error: 'Payment not found'
            });
        }

        const payment = paymentResult[0];

        // Update payment status to completed
        const updateResult = await query(
            `UPDATE booking_payments
             SET status = 'completed', paid_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [paymentId]
        );

        // Check if all payments for this booking are now complete
        const allPaymentsResult = await query(
            `SELECT
                COUNT(*) as total_payments,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_payments,
                SUM(amount) FILTER (WHERE status = 'completed') as total_paid
             FROM booking_payments
             WHERE booking_id = $1`,
            [payment.booking_id]
        );

        const paymentStats = allPaymentsResult[0];
        const isFullyPaid = parseFloat(paymentStats.total_paid || 0) >= parseFloat(payment.booking_total || 0);

        // If fully paid, update booking status
        if (isFullyPaid) {
            await query(
                `UPDATE bookings SET status = 'Confirmed' WHERE id = $1`,
                [payment.booking_id]
            );
        }

        return res.status(200).json({
            success: true,
            data: {
                payment: updateResult[0],
                isFullyPaid,
                paymentStats: {
                    total: parseInt(paymentStats.total_payments),
                    completed: parseInt(paymentStats.completed_payments),
                    totalPaid: parseFloat(paymentStats.total_paid || 0)
                }
            },
            message: isFullyPaid
                ? 'Payment confirmed! Booking is now fully paid.'
                : 'Payment confirmed successfully.'
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        return res.status(500).json({
            error: 'Failed to confirm payment',
            message: error.message
        });
    }
}
