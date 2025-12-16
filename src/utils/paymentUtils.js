import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../config/supabase';
import { STRIPE_PUBLIC_KEY } from '../config/constants';

let stripePromise;

export const getStripe = () => {
  if (!STRIPE_PUBLIC_KEY) {
    console.warn('Stripe public key not configured');
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

/**
 * Initiates a token purchase flow using Stripe Payment Intents.
 * Uses Supabase Edge Function or direct API call.
 * @param {Object} pack - The token package object { id, price, tokens }
 * @param {string} userId - The current user's ID
 * @returns {Promise<string>} Client secret for payment intent
 */
export const handleTokenPurchase = async (pack, userId) => {
  if (!userId) throw new Error("User not authenticated.");
  if (!supabase) throw new Error("Database not available.");
  
  try {
    // Try Supabase Edge Function first
    const { data, error } = await supabase.functions.invoke('create-token-purchase', {
      body: { packId: pack.id, userId }
    });
    
    if (error) throw error;
    
    if (data?.clientSecret) {
      return data.clientSecret;
    }
    
    // Fallback: If Edge Function doesn't exist, use direct API approach
    // This requires a backend endpoint - for now, show helpful error
    throw new Error("Payment processing requires backend configuration. Please set up Supabase Edge Function 'create-token-purchase' or configure payment API endpoint.");
  } catch (error) {
    console.error("Token purchase error:", error);
    if (error.message?.includes('Function not found') || error.message?.includes('404')) {
      throw new Error("Payment system not configured. Please contact support or configure payment backend.");
    }
    throw error;
  }
};

/**
 * Initiates the Stripe Connect onboarding flow for talent.
 * @returns {Promise<string>} Onboarding URL
 */
export const handleConnectOnboarding = async () => {
  if (!supabase) throw new Error("Database not available.");
  
  try {
    // Try Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('stripe-connect-onboard', {});
    
    if (error) throw error;
    
    if (data?.url) {
      return data.url;
    }
    
    throw new Error("No onboarding URL returned from server.");
  } catch (error) {
    console.error("Connect onboarding error:", error);
    if (error.message?.includes('Function not found') || error.message?.includes('404')) {
      throw new Error("Stripe Connect not configured. Please set up Supabase Edge Function 'stripe-connect-onboard'.");
    }
    throw error;
  }
};

/**
 * Triggers a payout of available funds to the connected Stripe account/Bank.
 * @param {number} amount - Amount to cash out
 * @returns {Promise<Object>} Payout result
 */
export const handlePayout = async (amount) => {
    if (amount <= 0) throw new Error("No funds available to cash out.");
    if (!supabase) throw new Error("Database not available.");
    
    try {
        const { data, error } = await supabase.functions.invoke('initiate-payout', {
          body: { amount }
        });
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error("Payout failed:", error);
        if (error.message?.includes('Function not found') || error.message?.includes('404')) {
            throw new Error("Payout system not configured. Please set up Supabase Edge Function 'initiate-payout'.");
        }
        throw error;
    }
};
