import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Capture a payment intent for a booking confirmation
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // If already succeeded, return success
    if (paymentIntent.status === 'succeeded') {
      return res.status(200).json({
        success: true,
        status: 'succeeded',
        message: 'Payment already captured'
      });
    }

    // If requires capture, capture it
    if (paymentIntent.status === 'requires_capture') {
      const captured = await stripe.paymentIntents.capture(paymentIntentId);
      return res.status(200).json({
        success: true,
        status: captured.status,
        paymentIntent: captured
      });
    }

    // If already captured or in wrong state
    return res.status(400).json({
      error: `Payment intent is in ${paymentIntent.status} state and cannot be captured`
    });

  } catch (error) {
    console.error('Capture payment error:', error);
    return res.status(500).json({ error: error.message });
  }
}

