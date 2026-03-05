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

    return NextResponse.json({
      id: result.id,
      status: result.status,
      permitCount: result.permits.length,
    });
  } catch (err) {
    console.error('Research API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
