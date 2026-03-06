import { NextRequest, NextResponse } from 'next/server';
import { validateIntakeForm } from '@/lib/validation';
import { runResearchAgent } from '@/lib/research/agent';
import { saveResearchRequest } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateIntakeForm(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const intake = validation.data!;

    // Run research agent (templates only if no API keys configured)
    const skipSearch = !process.env.BRAVE_API_KEY;
    const result = await runResearchAgent(intake, { skipSearch });

    // Save to DB
    await saveResearchRequest(result);

    // Return full report data for client-side storage (smoke test mode)
    const categories: Record<string, number> = {};
    const jurisdictions: Record<string, number> = {};
    let costLow = 0;
    let costHigh = 0;

    for (const p of result.permits) {
      categories[p.category] = (categories[p.category] ?? 0) + 1;
      jurisdictions[p.jurisdiction] = (jurisdictions[p.jurisdiction] ?? 0) + 1;
      const cost = parseInt(String(p.estimatedCost).replace(/[^0-9]/g, '')) || 0;
      costLow += cost;
      costHigh += Math.ceil(cost * 1.3);
    }

    return NextResponse.json({
      id: result.id,
      status: result.status,
      intake: result.intake,
      permitCount: result.permits.length,
      permits: result.permits,
      samplePermits: result.permits.slice(0, 2),
      categories,
      jurisdictions,
      totalCost: { low: costLow, high: costHigh },
      paid: false,
    });
  } catch (err) {
    console.error('Research API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
