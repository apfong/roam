import { NextRequest, NextResponse } from 'next/server';
import { parseWebhookEvent } from '@/lib/billing/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!endpointSecret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const event = parseWebhookEvent(body, signature, endpointSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const { customer_email, customer, subscription } = event.data.object;
        console.log(`[Stripe] Checkout completed: ${customer_email}, sub: ${subscription}`);
        // TODO: Create/update user subscription in database
        break;
      }
      case 'customer.subscription.deleted': {
        const { id } = event.data.object;
        console.log(`[Stripe] Subscription deleted: ${id}`);
        // TODO: Mark subscription as canceled in database
        break;
      }
      case 'customer.subscription.updated': {
        const { id, status } = event.data.object;
        console.log(`[Stripe] Subscription updated: ${id}, status: ${status}`);
        // TODO: Update subscription status in database
        break;
      }
      default:
        console.log(`[Stripe] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    console.error('[Stripe Webhook Error]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
