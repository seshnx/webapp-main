import Stripe from 'stripe';
import { verifyToken } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const ALLOWED_HOSTS = new Set([
  'seshnx.com',
  'www.seshnx.com',
  'app.seshnx.com',
  'localhost',
  '127.0.0.1',
]);

function getSafeBaseUrl(originHeader) {
  const fallback = process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://app.seshnx.com');

  if (!originHeader || typeof originHeader !== 'string') {
    return fallback;
  }

  try {
    const parsed = new URL(originHeader.trim());
    const hostname = parsed.hostname.toLowerCase();
    const isAllowed = ALLOWED_HOSTS.has(hostname) ||
      (hostname.endsWith('.vercel.app') && (hostname.includes('seshnx') || hostname.includes('amalia')));
    if (isAllowed) {
      return parsed.origin;
    }
  } catch {}

  return fallback;
}

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
    console.warn('Connect onboarding token verification failed:', authErr.message);
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    if (!callerUserId || callerUserId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only onboard your own account' });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email || undefined,
      metadata: {
        userId,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Safe base URL validation against domain whitelist to prevent open redirect
    const safeBase = getSafeBaseUrl(req.headers.origin);

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${safeBase}/payments?refresh=true`,
      return_url: `${safeBase}/payments?success=true`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ 
      url: accountLink.url,
      accountId: account.id,
    });
  } catch (error) {
    console.error('Connect onboarding error:', error);
    return res.status(500).json({ error: error.message });
  }
}

