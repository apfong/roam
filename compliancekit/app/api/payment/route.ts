import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/billing/stripe';

export async function POST(request: NextRequest) {
  try {
    const { reportId, tier = 'standard', businessType, state, city } = await request.json();

    if (!reportId || !businessType || !state || !city) {
      return NextResponse.json({ error: 'reportId, businessType, state, city are required' }, { status: 400 });
    }

    const origin = request.headers.get('origin') ?? 'http://localhost:3000';
    const checkoutUrl = await createCheckoutSession({
      reportId,
      businessType,
      state,
      city,
      tier,
      successUrl: `${origin}/report/${reportId}?paid=true`,
      cancelUrl: `${origin}/report/${reportId}`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error('Payment API error:', err);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
