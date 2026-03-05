import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/billing/stripe';
import { getResearchRequest } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const { reportId, tier = 'standard' } = await request.json();

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 });
    }

    const report = await getResearchRequest(reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (report.paid) {
      return NextResponse.json({ error: 'Report already paid' }, { status: 400 });
    }

    const origin = request.headers.get('origin') ?? 'http://localhost:3000';
    const checkoutUrl = await createCheckoutSession({
      reportId,
      businessType: report.intake.businessType,
      state: report.intake.state,
      city: report.intake.city,
      tier,
      successUrl: `${origin}/report/${reportId}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/report/${reportId}`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error('Payment API error:', err);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
