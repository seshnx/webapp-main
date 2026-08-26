import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import pkg from '../../convex/_generated/api.js';
const { api } = pkg;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const convexUrl = process.env.VITE_CONVEX_URL;

// Initialize Convex Client for Node side
const httpClient = new ConvexHttpClient(convexUrl);

// Constant mapping of product IDs to token counts (should match useDynamicConfig)
const TOKEN_PACKS = {
  'tkn_25': 25,
  'tkn_50': 50,
  'tkn_100': 100,
  'tkn_200': 200,
  'tkn_500': 500,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // To support local testing with Stripe CLI, verify sign-off
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const { userId, packId } = pi.metadata;

        if (userId && packId) {
          const tokenAmount = TOKEN_PACKS[packId] || 0;
          console.log(`Processing top-up for ${userId}: ${tokenAmount} tokens`);

          // Call Convex to record the payment and top up balance
          await httpClient.mutation(api.wallets.topUpBalance, {
            clerkId: userId,
            amount: tokenAmount,
            stripePaymentIntentId: pi.id,
            description: `Purchased ${packId} package`
          });
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, packId, mode } = session.metadata;

        // If it was a subscription (membership plan)
        if (session.mode === 'subscription' && userId && packId) {
          console.log(`Subscription ${packId} completed for user: ${userId}`);
          // Call Convex to update user tier
          await httpClient.mutation(api.users.updateUserTier, {
            clerkId: userId,
            tier: packId, // Assuming packId is the tier name like 'PRO' or 'STUDIO'
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper to buffer the raw request body (needed for Stripe webhook verification)
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

