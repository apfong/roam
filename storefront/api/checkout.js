const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const host = `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'The Autonomous Agent Playbook',
            description: '21 battle-tested patterns for building AI agents that work in production.',
          },
          unit_amount: 3900,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${host}/api/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${host}/`,
    });

    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).send('Checkout error. Please try again.');
  }
};
