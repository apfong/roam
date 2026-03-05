import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is required');
    stripeInstance = new Stripe(key, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion });
  }
  return stripeInstance;
}

export interface CreateCheckoutParams {
  reportId: string;
  businessType: string;
  state: string;
  city: string;
  tier: 'standard' | 'premium';
  successUrl: string;
  cancelUrl: string;
}

const PRICES: Record<string, number> = {
  standard: 9900, // $99.00 in cents
  premium: 14900, // $149.00 in cents
};

const TIER_NAMES: Record<string, string> = {
  standard: 'ComplianceKit Standard Report',
  premium: 'ComplianceKit Premium Report',
};

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: TIER_NAMES[params.tier] ?? 'ComplianceKit Report',
            description: `Permit & license report for ${params.businessType} in ${params.city}, ${params.state}`,
          },
          unit_amount: PRICES[params.tier] ?? 9900,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      reportId: params.reportId,
      businessType: params.businessType,
      state: params.state,
      city: params.city,
      tier: params.tier,
    },
  });

  if (!session.url) throw new Error('Failed to create checkout session');
  return session.url;
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is required');

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}
