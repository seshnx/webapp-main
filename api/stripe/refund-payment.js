import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Refund a payment for a cancelled booking
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if payment was actually charged
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: `Payment intent is in ${paymentIntent.status} state and cannot be refunded`
      });
    }

    // Get the charge ID from the payment intent
    const chargeId = paymentIntent.latest_charge;
    if (!chargeId) {
      return res.status(400).json({ error: 'No charge found for this payment intent' });
    }

    // Create refund
    const refundParams = {
      charge: chargeId,
      reason,
    };

    // If partial refund amount specified
    if (amount && amount > 0) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);

    return res.status(200).json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100, // Convert back to dollars
      status: refund.status
    });

  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({ error: error.message });
  }
}

