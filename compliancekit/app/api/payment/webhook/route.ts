import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/billing/stripe';
import { markReportPaid, savePayment } from '@/lib/db/client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = await verifyWebhookSignature(payload, signature);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        id: string;
        metadata?: { reportId?: string; tier?: string };
        amount_total?: number;
      };

      const reportId = session.metadata?.reportId;
      if (!reportId) {
        console.error('No reportId in session metadata');
        return NextResponse.json({ error: 'Missing reportId' }, { status: 400 });
      }

      // Save payment record
      await savePayment({
        id: randomUUID(),
        stripeSessionId: session.id,
        reportId,
        amountCents: session.amount_total ?? 0,
        tier: session.metadata?.tier ?? 'standard',
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });

      // Mark report as paid
      await markReportPaid(reportId, session.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
