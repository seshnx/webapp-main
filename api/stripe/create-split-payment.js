import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { totalAmount, description, transfers } = req.body;

    if (!totalAmount || !transfers || !Array.isArray(transfers) || transfers.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Payment Intent with application fee for the first recipient
    const primaryTransfer = transfers[0];
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      description,
      application_fee_amount: Math.round(totalAmount * 100 * 0.1), // 10% platform fee
      transfer_data: {
        destination: primaryTransfer.recipientId,
      },
      metadata: {
        sessionName: description,
        recipientCount: transfers.length.toString(),
      },
    });

    // Create transfers for additional recipients (if any)
    if (transfers.length > 1) {
      const transferPromises = transfers.slice(1).map(transfer =>
        stripe.transfers.create({
          amount: Math.round(transfer.amount * 100),
          currency: 'usd',
          destination: transfer.recipientId,
          metadata: {
            role: transfer.role || 'Creative',
          },
        })
      );

      await Promise.all(transferPromises);
    }

    return res.status(200).json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Split payment error:', error);
    return res.status(500).json({ error: error.message });
  }
}

