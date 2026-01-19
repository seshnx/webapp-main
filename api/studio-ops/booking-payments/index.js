import { query } from '../../src/config/neon.js';

/**
 * Booking Payments API
 * GET /api/studio-ops/booking-payments - List payments for a booking
 * POST /api/studio-ops/booking-payments - Create a payment
 */

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getPayments(req, res);
    } else if (req.method === 'POST') {
        return createPayment(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/booking-payments
 * Get payments for a booking or studio
 *
 * Query params:
 * - bookingId: Booking UUID (optional)
 * - studioId: Studio UUID (optional)
 * - status: Filter by status (optional)
 */
async function getPayments(req, res) {
    try {
        const { bookingId, studioId, status } = req.query;

        if (!bookingId && !studioId) {
            return res.status(400).json({
                error: 'Missing required parameter: bookingId or studioId'
            });
        }

        let sql = `
            SELECT
                bp.id,
                bp.booking_id,
                bp.payment_type,
                bp.amount,
                bp.payment_intent_id,
                bp.status,
                bp.due_date,
                bp.paid_at,
                bp.created_at,
                -- Get booking details
                b.date as booking_date,
                b.start_time as booking_start_time,
                b.offer_amount as booking_total,
                -- Get client info
                sc.name as client_name,
                sc.email as client_email
            FROM booking_payments bp
            LEFT JOIN bookings b ON b.id = bp.booking_id
            LEFT JOIN studio_clients sc ON sc.client_id::text = b.sender_id::text
            WHERE 1=1
        `;
        const params = [];

        // Filter by booking ID
        if (bookingId) {
            sql += ` AND bp.booking_id = $${params.length + 1}`;
            params.push(bookingId);
        }

        // Filter by studio ID
        if (studioId) {
            sql += ` AND b.studio_owner_id = $${params.length + 1}`;
            params.push(studioId);
        }

        // Filter by status
        if (status) {
            sql += ` AND bp.status = $${params.length + 1}`;
            params.push(status);
        }

        // Order by due date, then created date
        sql += ` ORDER BY bp.due_date ASC NULLS LAST, bp.created_at DESC`;

        const result = await query(sql, params);

        // Calculate totals
        const totals = {
            totalAmount: result.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
            paidAmount: result.reduce((sum, p) => sum + (p.status === 'completed' ? parseFloat(p.amount || 0) : 0), 0),
            pendingAmount: result.reduce((sum, p) => sum + (p.status === 'pending' ? parseFloat(p.amount || 0) : 0), 0)
        };

        return res.status(200).json({
            success: true,
            data: result,
            count: result.length,
            totals
        });
    } catch (error) {
        console.error('Error fetching booking payments:', error);
        return res.status(500).json({
            error: 'Failed to fetch booking payments',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/booking-payments
 * Create a new payment
 *
 * Body:
 * - bookingId: Booking UUID (required)
 * - paymentType: Type of payment (deposit, partial, full, refund) (required)
 * - amount: Payment amount (required)
 * - dueDate: When payment is due (optional)
 * - paymentIntentId: Stripe payment intent ID (optional)
 */
async function createPayment(req, res) {
    try {
        const {
            bookingId,
            paymentType,
            amount,
            dueDate,
            paymentIntentId
        } = req.body;

        // Validation
        if (!bookingId || !paymentType || amount === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['bookingId', 'paymentType', 'amount']
            });
        }

        // Validate payment type
        const validPaymentTypes = ['deposit', 'partial', 'full', 'refund'];
        if (!validPaymentTypes.includes(paymentType)) {
            return res.status(400).json({
                error: 'Invalid payment type',
                validTypes: validPaymentTypes
            });
        }

        // Check if booking exists
        const bookingResult = await query(
            'SELECT id, offer_amount, studio_owner_id FROM bookings WHERE id = $1',
            [bookingId]
        );

        if (bookingResult.length === 0) {
            return res.status(404).json({
                error: 'Booking not found'
            });
        }

        const booking = bookingResult[0];

        // Create payment
        const sql = `
            INSERT INTO booking_payments (
                booking_id,
                payment_type,
                amount,
                payment_intent_id,
                status,
                due_date
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const params = [
            bookingId,
            paymentType,
            parseFloat(amount),
            paymentIntentId || null,
            'pending',
            dueDate || null
        ];

        const result = await query(sql, params);

        return res.status(201).json({
            success: true,
            data: result[0],
            message: 'Payment created successfully'
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        return res.status(500).json({
            error: 'Failed to create payment',
            message: error.message
        });
    }
}
