import { NextRequest, NextResponse } from 'next/server';
import { generateFixes } from '@/lib/fix-generator/rule-engine';
import { ViolationContext } from '@/lib/fix-generator/types';
import { getVisibleFixes } from '@/lib/billing/gating';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { violations, isPaid } = body as {
      violations: ViolationContext[];
      isPaid?: boolean;
    };

    if (!violations || !Array.isArray(violations)) {
      return NextResponse.json({ error: 'violations array required' }, { status: 400 });
    }

    const allFixes = generateFixes(violations);
    const gated = getVisibleFixes(allFixes, isPaid ?? false);

    return NextResponse.json({
      fixes: gated.visible,
      lockedCount: gated.lockedCount,
      totalFixes: allFixes.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
