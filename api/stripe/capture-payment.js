import Stripe from 'stripe';
import { verifyToken } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Capture a payment intent for a booking confirmation (Secured)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify caller authentication
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const sessionToken = authHeader?.replace('Bearer ', '');

  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (!sessionToken || !clerkSecret) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let callerUserId = null;
  try {
    const verified = await verifyToken(sessionToken, { secretKey: clerkSecret });
    callerUserId = verified?.sub;
  } catch (authErr) {
    console.warn('Payment capture token verification failed:', authErr.message);
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  if (!callerUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // 2. Retrieve the payment intent to check its status and metadata
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 3. Verify caller authorization: caller must be merchant/owner, customer, or admin
    const metadata = paymentIntent.metadata || {};
    const isAuthorized =
      callerUserId === metadata.userId ||
      callerUserId === metadata.merchantId ||
      callerUserId === metadata.studioOwnerId ||
      callerUserId === metadata.talentId ||
      callerUserId === metadata.engineerId;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to capture this payment' });
    }

    // If already succeeded, return success
    if (paymentIntent.status === 'succeeded') {
      return res.status(200).json({
        success: true,
        status: 'succeeded',
        message: 'Payment already captured',
      });
    }

    // If requires capture, capture it
    if (paymentIntent.status === 'requires_capture') {
      const captured = await stripe.paymentIntents.capture(paymentIntentId);
      return res.status(200).json({
        success: true,
        status: captured.status,
        paymentIntent: captured,
      });
    }

    // If already captured or in wrong state
    return res.status(400).json({
      error: `Payment intent is in ${paymentIntent.status} state and cannot be captured`,
    });
  } catch (error) {
    console.error('Capture payment error:', error);
    return res.status(500).json({ error: error.message });
  }
}

