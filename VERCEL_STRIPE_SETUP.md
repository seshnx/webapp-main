# Vercel Stripe Integration Setup Guide

This guide covers setting up Stripe payments using Vercel's native integration and API routes.

## 🚀 Step 1: Add Stripe Integration in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Integrations**
3. Search for **"Stripe"** in the marketplace
4. Click **"Add Integration"**
5. Follow the setup wizard:
   - Connect your Stripe account (or create one at [stripe.com](https://stripe.com))
   - Vercel will automatically set environment variables:
     - `STRIPE_SECRET_KEY` (server-side, for API routes)
     - `VITE_STRIPE_PUBLISHABLE_KEY` (client-side, for Stripe.js)
   - Optionally set webhook secrets for production

**Benefits:**
- ✅ Automatic environment variable management
- ✅ Secure key handling (secret key never exposed to client)
- ✅ Native dashboard integration
- ✅ Automatic webhook handling

---

## 📁 Step 2: Create Vercel API Routes

Create the following API routes in your project:

### Directory Structure
```
api/
  stripe/
    create-payment-intent.js
    create-checkout-session.js
    create-split-payment.js
    connect-onboard.js
    initiate-payout.js
    webhook.js
```

### Example: `api/stripe/create-payment-intent.js`

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { packId, userId, amount, currency = 'usd' } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        packId,
        userId,
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
```

### Example: `api/stripe/create-checkout-session.js`

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, mode = 'payment', successUrl, cancelUrl } = req.body;

    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### Example: `api/stripe/create-split-payment.js`

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { totalAmount, description, transfers } = req.body;

    if (!totalAmount || !transfers || !Array.isArray(transfers)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Payment Intent with application fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      description,
      application_fee_amount: Math.round(totalAmount * 100 * 0.1), // 10% platform fee
      transfer_data: {
        destination: transfers[0].recipientId, // Primary recipient
      },
    });

    // Create transfers for additional recipients
    const transferPromises = transfers.slice(1).map(transfer =>
      stripe.transfers.create({
        amount: Math.round(transfer.amount * 100),
        currency: 'usd',
        destination: transfer.recipientId,
      })
    );

    await Promise.all(transferPromises);

    return res.status(200).json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Split payment error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### Example: `api/stripe/connect-onboard.js`

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Create or retrieve connected account
    let accountId;
    // TODO: Check if user already has a connected account in your database
    
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Adjust based on your needs
        email: req.body.email, // Get from user profile
      });
      accountId = account.id;
      // TODO: Save accountId to user profile in database
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${req.headers.origin}/payments?refresh=true`,
      return_url: `${req.headers.origin}/payments?success=true`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error('Connect onboarding error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### Example: `api/stripe/initiate-payout.js`

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, userId } = req.body;

    if (!amount || !userId || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount or userId' });
    }

    // TODO: Get connected account ID from user profile
    const connectedAccountId = 'acct_...'; // Get from database

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      destination: connectedAccountId,
    });

    // TODO: Update wallet balance in database
    // TODO: Create transaction record

    return res.status(200).json({
      transferId: transfer.id,
      amount: amount,
      status: 'pending',
    });
  } catch (error) {
    console.error('Payout error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### Example: `api/stripe/webhook.js`

```javascript
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
      // TODO: Add tokens to user account
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      // TODO: Handle failed payment
      console.log('PaymentIntent failed:', event.data.object.id);
      break;

    case 'checkout.session.completed':
      const session = event.data.object;
      // TODO: Update subscription or tokens
      console.log('Checkout session completed:', session.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return res.status(200).json({ received: true });
}
```

---

## 📦 Step 3: Install Stripe Package

```bash
npm install stripe
```

---

## 🔧 Step 4: Configure Environment Variables

After adding the Stripe integration in Vercel, these variables will be automatically set:

**Server-side (API routes):**
- `STRIPE_SECRET_KEY` - Automatically set by Vercel integration

**Client-side (React app):**
- `VITE_STRIPE_PUBLISHABLE_KEY` - Automatically set by Vercel integration

**Optional (for webhooks):**
- `STRIPE_WEBHOOK_SECRET` - Set manually in Vercel environment variables

---

## 🔗 Step 5: Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your Vercel deployment URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `transfer.created`
   - `account.updated` (for Connect)
5. Copy the webhook signing secret
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

---

## ✅ Step 6: Verify Setup

1. **Check Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Verify `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` are set

2. **Test Payment Flow:**
   - Use Stripe test mode keys
   - Test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC

3. **Check API Routes:**
   - Deploy to Vercel
   - Test API endpoints with Postman or curl

---

## 🚨 Important Notes

### Development vs Production

- **Development:** API routes run on `http://localhost:3000/api`
- **Production:** API routes run on `https://your-app.vercel.app/api`

The code automatically detects the environment and uses the correct URL.

### Security

- Never expose `STRIPE_SECRET_KEY` to the client
- Always verify webhook signatures
- Use HTTPS in production
- Validate all input data in API routes

### Testing

- Use Stripe test mode keys for development
- Switch to live keys only in production
- Test webhooks using Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## 📚 Additional Resources

- [Vercel Stripe Integration](https://vercel.com/integrations/stripe)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)

---

## 🎯 Next Steps

1. ✅ Add Stripe integration in Vercel
2. ✅ Create API routes (copy examples above)
3. ✅ Install Stripe package
4. ✅ Configure webhooks
5. ✅ Test payment flows
6. ✅ Deploy to production

---

*Last Updated: Based on Vercel Stripe integration best practices*

