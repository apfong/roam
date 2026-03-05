interface StripeConfig {
  secretKey: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

function getConfig(): StripeConfig {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    priceId: process.env.STRIPE_PRICE_ID || '',
    successUrl: process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/success` : 'http://localhost:3000/success',
    cancelUrl: process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/pricing` : 'http://localhost:3000/pricing',
  };
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export async function createCheckoutSession(
  customerEmail: string
): Promise<CheckoutSession> {
  const config = getConfig();

  if (!config.secretKey) {
    throw new Error('Stripe secret key not configured');
  }

  const params = new URLSearchParams({
    'mode': 'subscription',
    'success_url': config.successUrl,
    'cancel_url': config.cancelUrl,
    'customer_email': customerEmail,
    'line_items[0][price]': config.priceId,
    'line_items[0][quantity]': '1',
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `Stripe error: ${response.status}`);
      }

      const session = await response.json();
      return { id: session.id, url: session.url };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
    }
  }

  throw lastError || new Error('Failed to create checkout session');
}

export interface WebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
      customer_email?: string;
      subscription?: string;
      status?: string;
    };
  };
}

export function parseWebhookEvent(body: string, signature: string, endpointSecret: string): WebhookEvent {
  // In production, verify the signature using Stripe's library
  // For now, parse the event directly (test mode)
  if (!endpointSecret) {
    throw new Error('Webhook endpoint secret not configured');
  }
  return JSON.parse(body) as WebhookEvent;
}
