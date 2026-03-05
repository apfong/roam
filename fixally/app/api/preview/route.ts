import { NextRequest, NextResponse } from 'next/server';
import { fetchAndPatch } from '@/lib/preview/proxy';
import { FixResult } from '@/lib/fix-generator/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, fixes } = body as { url: string; fixes: FixResult[] };

    if (!url || !fixes) {
      return NextResponse.json({ error: 'url and fixes required' }, { status: 400 });
    }

    const result = await fetchAndPatch(url, fixes);

    if (result.errors.length > 0 && result.appliedFixes === 0) {
      return NextResponse.json({ error: result.errors.join('; ') }, { status: 502 });
    }

    return new NextResponse(result.html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Fixes-Applied': String(result.appliedFixes),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
