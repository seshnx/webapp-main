import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { app } from '../config/firebase'; 
import { STRIPE_PUBLIC_KEY } from '../config/constants';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

/**
 * Initiates a token purchase flow using Stripe Payment Intents.
 * @param {Object} pack - The token package object { id, price, tokens }
 * @param {string} userId - The current user's ID
 * @returns {Promise<void>}
 */
export const handleTokenPurchase = async (pack, userId) => {
  if (!userId) throw new Error("User not authenticated.");
  
  try {
    const functions = getFunctions(app);
    const createIntent = httpsCallable(functions, 'createTokenPurchaseIntent');
    const { data } = await createIntent({ packId: pack.id });

    if (!data || !data.clientSecret) {
      throw new Error("Failed to initialize payment intent.");
    }

    return data.clientSecret;

  } catch (error) {
    console.error("Token purchase error:", error);
    throw error;
  }
};

/**
 * Initiates the Stripe Connect onboarding flow for talent.
 */
export const handleConnectOnboarding = async () => {
  try {
    const functions = getFunctions(app);
    const createAccount = httpsCallable(functions, 'createConnectAccount');
    const { data } = await createAccount();
    
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No onboarding URL returned.");
    }
  } catch (error) {
    console.error("Connect onboarding error:", error);
    throw error;
  }
};

/**
 * Triggers a payout of available funds to the connected Stripe account/Bank.
 * @param {number} amount - Amount to cash out
 */
export const handlePayout = async (amount) => {
    if (amount <= 0) throw new Error("No funds available to cash out.");
    
    try {
        const functions = getFunctions(app);
        const payoutFunc = httpsCallable(functions, 'initiatePayout');
        const { data } = await payoutFunc({ amount });
        return data;
    } catch (error) {
        console.error("Payout failed:", error);
        if (error.message.includes('not found')) {
            throw new Error("Payout system is currently in maintenance mode. Please try again later.");
        }
        throw error;
    }
};
