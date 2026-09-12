import Stripe from 'stripe';
import { verifyToken } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    console.error('Split payment auth error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  try {
    const { totalAmount, description, transfers } = req.body;

    if (!totalAmount || typeof totalAmount !== 'number' || totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    if (!transfers || !Array.isArray(transfers) || transfers.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid transfers array' });
    }

    // Validate each transfer
    let transfersSum = 0;
    for (const t of transfers) {
      if (!t.recipientId || typeof t.recipientId !== 'string' || !t.recipientId.startsWith('acct_')) {
        return res.status(400).json({ error: `Invalid recipient account ID: ${t.recipientId}` });
      }
      if (!t.amount || typeof t.amount !== 'number' || t.amount <= 0) {
        return res.status(400).json({ error: `Invalid transfer amount for recipient: ${t.recipientId}` });
      }
      transfersSum += t.amount;
    }

    if (transfersSum > totalAmount) {
      return res.status(400).json({ error: 'Sum of transfers exceeds total amount' });
    }

    // Create Payment Intent with application fee for the primary recipient
    const primaryTransfer = transfers[0];
    const secondaryTransfers = transfers.slice(1);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      description: description || 'Studio Session Split Payment',
      application_fee_amount: Math.round(totalAmount * 100 * 0.1), // 10% platform fee
      transfer_data: {
        destination: primaryTransfer.recipientId,
      },
      metadata: {
        payerUserId: verifiedUserId,
        sessionName: description || '',
        recipientCount: transfers.length.toString(),
        // Encode secondary transfers to be executed ONLY after payment succeeds via webhook
        secondaryTransfers: secondaryTransfers.length > 0 ? JSON.stringify(secondaryTransfers) : '',
      },
    });

    return res.status(200).json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Split payment error:', error);
    return res.status(500).json({ error: error.message });
  }
}

