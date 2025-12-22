import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from '../config/constants';

let stripePromise;

export const getStripe = () => {
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
 * In development, uses localhost. In production, uses Vercel deployment URL.
 */
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  // In production, Vercel automatically provides the deployment URL
  return '/api';
};

/**
 * Initiates a token purchase flow using Stripe Payment Intents.
 * Uses Vercel API route for payment processing.
 * @param {Object} pack - The token package object { id, price, tokens }
 * @param {string} userId - The current user's ID
 * @returns {Promise<string>} Client secret for payment intent
 */
export const handleTokenPurchase = async (pack, userId) => {
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
    
    const data = await response.json();
    
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
 * @param {string} userId - The current user's ID
 * @returns {Promise<string>} Onboarding URL
 */
export const handleConnectOnboarding = async (userId) => {
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
    
    const data = await response.json();
    
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
 * @param {number} amount - Amount to cash out
 * @param {string} userId - The current user's ID
 * @returns {Promise<Object>} Payout result
 */
export const handlePayout = async (amount, userId) => {
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
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Payout failed:", error);
        throw error;
    }
};
