import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // TODO: Update database with successful payment
      // TODO: Add tokens to user account based on metadata.packId
      // TODO: Update wallet balance
      console.log('PaymentIntent succeeded:', paymentIntent.id, paymentIntent.metadata);
      break;

    case 'payment_intent.payment_failed':
      // TODO: Handle failed payment
      // TODO: Notify user
      console.log('PaymentIntent failed:', event.data.object.id);
      break;

    case 'checkout.session.completed':
      const session = event.data.object;
      // TODO: Update subscription or tokens based on session.metadata
      // TODO: Update user tier if subscription
      console.log('Checkout session completed:', session.id);
      break;

    case 'transfer.created':
      const transfer = event.data.object;
      // TODO: Update wallet payout balance
      // TODO: Create transaction record
      console.log('Transfer created:', transfer.id);
      break;

    case 'account.updated':
      const account = event.data.object;
      // TODO: Update user's Stripe Connect status
      // TODO: Enable payout features if account is fully onboarded
      console.log('Account updated:', account.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return res.status(200).json({ received: true });
}

