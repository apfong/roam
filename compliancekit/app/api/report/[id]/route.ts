import { NextRequest, NextResponse } from 'next/server';
import { getResearchRequest } from '@/lib/db/client';
import { getCategoryBreakdown, getJurisdictionBreakdown, estimateTotalCost } from '@/lib/research/synthesizer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = await getResearchRequest(params.id);
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const categories = getCategoryBreakdown(report.permits);
  const jurisdictions = getJurisdictionBreakdown(report.permits);
  const totalCost = estimateTotalCost(report.permits);

  if (report.paid) {
    // Full report
    return NextResponse.json({
      id: report.id,
      status: report.status,
      intake: report.intake,
      permits: report.permits,
      categories,
      jurisdictions,
      totalCost,
      paid: true,
    });
  }

  // Free view: only 2 sample permits
  const samplePermits = report.permits
    .filter((p) => p.confidence === 'high')
    .slice(0, 2);

  return NextResponse.json({
    id: report.id,
    status: report.status,
    intake: report.intake,
    permitCount: report.permits.length,
    categories,
    jurisdictions,
    totalCost,
    samplePermits,
    paid: false,
  });
}
