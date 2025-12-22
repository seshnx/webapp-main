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

    // TODO: Get connected account ID from user profile in Supabase
    // Example:
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('stripe_connect_account_id')
    //   .eq('id', userId)
    //   .single();
    // 
    // if (!profile?.stripe_connect_account_id) {
    //   return res.status(400).json({ error: 'User has not completed Stripe Connect onboarding' });
    // }
    // 
    // const connectedAccountId = profile.stripe_connect_account_id;

    // For now, return error - you need to implement the database lookup above
    return res.status(400).json({ error: 'Stripe Connect account not found. Please complete onboarding first.' });

    // Uncomment once you have the connectedAccountId:
    // const transfer = await stripe.transfers.create({
    //   amount: Math.round(amount * 100),
    //   currency: 'usd',
    //   destination: connectedAccountId,
    // });

    // TODO: Update wallet balance in Supabase database
    // TODO: Create transaction record

    // return res.status(200).json({
    //   transferId: transfer.id,
    //   amount: amount,
    //   status: 'pending',
    // });
  } catch (error) {
    console.error('Payout error:', error);
    return res.status(500).json({ error: error.message });
  }
}

