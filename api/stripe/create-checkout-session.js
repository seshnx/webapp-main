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

function validateAndFormatUrl(rawUrl, defaultBase) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  const trimmed = rawUrl.trim();

  // Relative paths starting with / (and not protocol-relative //)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    try {
      const fullUrl = new URL(trimmed, defaultBase);
      return fullUrl.toString();
    } catch {
      return null;
    }
  }

  // Absolute URLs: ensure valid HTTP(S) and permitted domain
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    const hostname = parsed.hostname.toLowerCase();
    
    const isAllowedHost = ALLOWED_HOSTS.has(hostname) ||
      (hostname.endsWith('.vercel.app') && (hostname.includes('seshnx') || hostname.includes('amalia')));

    if (!isAllowedHost) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

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
      console.warn('Checkout session token verification failed:', authErr.message);
    }
  }

  try {
    const { userId, packId, priceId, mode = 'payment', successUrl, cancelUrl } = req.body;

    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const effectiveUserId = verifiedUserId || userId;
    if (!effectiveUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 2. Validate and sanitize redirect URLs to prevent Open Redirect attacks (SEC-13)
    const defaultBase = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://app.seshnx.com');

    const sanitizedSuccessUrl = validateAndFormatUrl(successUrl, defaultBase);
    const sanitizedCancelUrl = validateAndFormatUrl(cancelUrl, defaultBase);

    if (!sanitizedSuccessUrl || !sanitizedCancelUrl) {
      return res.status(400).json({
        error: 'Invalid or unauthorized redirect URL. Redirects must be relative or point to verified platform domains.',
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: effectiveUserId,
        packId: packId || '',
        mode,
      },
      success_url: sanitizedSuccessUrl,
      cancel_url: sanitizedCancelUrl,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return res.status(500).json({ error: error.message });
  }
}

