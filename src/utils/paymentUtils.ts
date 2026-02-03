import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from '../config/constants';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> | null => {
  if (!STRIPE_PUBLIC_KEY) {
    console.warn('Stripe public key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in Vercel environment variables.');
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

/**
 * Gets the base API URL for Vercel serverless functions
 */
const getApiUrl = (): string => {
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  return '/api';
};

interface TokenPackage {
  id: string;
  price: number;
  tokens: number;
}

interface CreatePaymentIntentResponse {
  clientSecret?: string;
  error?: string;
}

interface ConnectOnboardingResponse {
  url?: string;
  error?: string;
}

interface PayoutResponse {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

/**
 * Initiates a token purchase flow using Stripe Payment Intents.
 */
export const handleTokenPurchase = async (
  pack: TokenPackage,
  userId: string
): Promise<string> => {
  if (!userId) throw new Error("User not authenticated.");

  try {
    const response = await fetch(`${getApiUrl()}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packId: pack.id,
        userId,
        amount: pack.price,
        currency: 'usd',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Payment processing failed' }));
      throw new Error(error.message || 'Payment processing failed');
    }

    const data: CreatePaymentIntentResponse = await response.json();

    if (data?.clientSecret) {
      return data.clientSecret;
    }

    throw new Error("No client secret returned from payment server.");
  } catch (error) {
    console.error("Token purchase error:", error);
    throw error;
  }
};

/**
 * Initiates the Stripe Connect onboarding flow for talent.
 */
export const handleConnectOnboarding = async (userId: string): Promise<string> => {
  if (!userId) throw new Error("User not authenticated.");

  try {
    const response = await fetch(`${getApiUrl()}/stripe/connect-onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Onboarding failed' }));
      throw new Error(error.message || 'Onboarding failed');
    }

    const data: ConnectOnboardingResponse = await response.json();

    if (data?.url) {
      return data.url;
    }

    throw new Error("No onboarding URL returned from server.");
  } catch (error) {
    console.error("Connect onboarding error:", error);
    throw error;
  }
};

/**
 * Triggers a payout of available funds to the connected Stripe account/Bank.
 */
export const handlePayout = async (
  amount: number,
  userId: string
): Promise<PayoutResponse> => {
  if (amount <= 0) throw new Error("No funds available to cash out.");
  if (!userId) throw new Error("User not authenticated.");

  try {
    const response = await fetch(`${getApiUrl()}/stripe/initiate-payout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, userId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Payout failed' }));
      throw new Error(error.message || 'Payout failed');
    }

    const data: PayoutResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Payout failed:", error);
    throw error;
  }
};
