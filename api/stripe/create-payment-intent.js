import Stripe from 'stripe';
import { verifyToken } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Canonical server-side pricing for token packages (in cents USD)
const TOKEN_PACK_PRICES = {
  'tkn_25': 299,    // $2.99
  'tkn_50': 499,    // $4.99
  'tkn_100': 899,   // $8.99
  'tkn_200': 1699,  // $16.99
  'tkn_500': 3999,  // $39.99
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify caller authentication
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const sessionToken = authHeader?.replace('Bearer ', '');

  let verifiedUserId = null;
  const clerkSecret = process.env.CLERK_SECRET_KEY;

  if (sessionToken && clerkSecret) {
    try {
      const verified = await verifyToken(sessionToken, { secretKey: clerkSecret });
      verifiedUserId = verified?.sub;
    } catch (authErr) {
      console.warn('Payment intent token verification failed:', authErr.message);
    }
  }

  try {
    const { packId, userId, currency = 'usd' } = req.body;

    if (!packId || !TOKEN_PACK_PRICES[packId]) {
      return res.status(400).json({ error: 'Invalid or missing token package' });
    }

    const effectiveUserId = verifiedUserId || userId;
    if (!effectiveUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Server-side authoritative price resolution (ignoring client amount)
    const amountInCents = TOKEN_PACK_PRICES[packId];

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        packId,
        userId: effectiveUserId,
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return res.status(500).json({ error: error.message });
  }
}

