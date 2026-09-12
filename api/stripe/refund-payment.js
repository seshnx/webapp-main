import Stripe from 'stripe';
import { createClerkClient, verifyToken } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Refund a payment for a cancelled booking (Admin or authorized party only)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify caller authentication
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const sessionToken = authHeader?.replace('Bearer ', '');

  if (!sessionToken) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (!clerkSecret) {
    console.error('❌ CLERK_SECRET_KEY is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  let verifiedUserId;
  try {
    const verified = await verifyToken(sessionToken, { secretKey: clerkSecret });
    verifiedUserId = verified?.sub;
    if (!verifiedUserId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
  } catch (err) {
    console.error('Refund auth error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify caller authorization: must be customer, merchant/studio, or platform admin
    const isCustomer = paymentIntent.metadata?.userId === verifiedUserId || paymentIntent.metadata?.payerUserId === verifiedUserId;
    const isMerchant = paymentIntent.metadata?.studioOwnerId === verifiedUserId;

    if (!isCustomer && !isMerchant) {
      const clerkClient = createClerkClient({ secretKey: clerkSecret });
      const user = await clerkClient.users.getUser(verifiedUserId);
      const roles = user.publicMetadata?.account_types || [];
      const activeRole = user.publicMetadata?.active_role;
      const isAdmin = activeRole === 'PlatformAdmin' || roles.includes('PlatformAdmin') || user.publicMetadata?.isAdmin === true;

      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to refund this payment' });
      }
    }

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

