import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // TODO: Check if user already has a connected account in your database
    // For now, create a new account each time (you should store and reuse)
    
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // Adjust based on your needs
      email: email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // TODO: Save account.id to user profile in Supabase database
    // Example:
    // await supabase
    //   .from('profiles')
    //   .update({ stripe_connect_account_id: account.id })
    //   .eq('id', userId);

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.origin || 'https://your-app.vercel.app'}/payments?refresh=true`,
      return_url: `${req.headers.origin || 'https://your-app.vercel.app'}/payments?success=true`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ 
      url: accountLink.url,
      accountId: account.id, // Return for storage
    });
  } catch (error) {
    console.error('Connect onboarding error:', error);
    return res.status(500).json({ error: error.message });
  }
}

