import { Permit } from '../types';

/** Deduplicate permits by name similarity and URL */
export function deduplicatePermits(permits: Permit[]): Permit[] {
  const seen = new Map<string, Permit>();

  for (const permit of permits) {
    const key = normalizePermitKey(permit);
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, permit);
    } else {
      // Keep the one with higher confidence
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      if (confidenceOrder[permit.confidence] > confidenceOrder[existing.confidence]) {
        seen.set(key, mergePermits(existing, permit));
      } else {
        seen.set(key, mergePermits(permit, existing));
      }
    }
  }

  return Array.from(seen.values());
}

/** Create a normalized key for dedup comparison */
function normalizePermitKey(permit: Permit): string {
  const name = permit.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(permit|license|certificate|registration)/g, '');

  // Also consider URL domain for uniqueness
  let domain = '';
  try {
    domain = new URL(permit.url).hostname;
  } catch {
    domain = '';
  }

  return `${name}:${permit.jurisdiction}:${domain}`;
}

/** Merge two permits, preferring the higher-confidence one but filling gaps */
function mergePermits(lower: Permit, higher: Permit): Permit {
  return {
    ...higher,
    estimatedCost: higher.estimatedCost !== 'Varies' ? higher.estimatedCost : lower.estimatedCost,
    processingTime: higher.processingTime !== 'Varies' ? higher.processingTime : lower.processingTime,
    renewalPeriod: higher.renewalPeriod !== 'Varies' ? higher.renewalPeriod : lower.renewalPeriod,
    prerequisites: higher.prerequisites.length > 0 ? higher.prerequisites : lower.prerequisites,
    url: higher.url || lower.url,
  };
}

/** Score and sort permits by priority */
export function scoreAndSortPermits(permits: Permit[]): Permit[] {
  return [...permits].sort((a, b) => {
    // 1. Confidence (high first)
    const confOrder = { high: 3, medium: 2, low: 1 };
    const confDiff = confOrder[b.confidence] - confOrder[a.confidence];
    if (confDiff !== 0) return confDiff;

    // 2. Jurisdiction order: federal → state → county → city
    const jurOrder = { federal: 1, state: 2, county: 3, city: 4 };
    const jurDiff = jurOrder[a.jurisdiction] - jurOrder[b.jurisdiction];
    if (jurDiff !== 0) return jurDiff;

    // 3. Category priority
    const catOrder: Record<string, number> = {
      registration: 1,
      tax: 2,
      employment: 3,
      professional: 4,
      health_safety: 5,
      zoning: 6,
      industry: 7,
    };
    return (catOrder[a.category] ?? 99) - (catOrder[b.category] ?? 99);
  });
}

/** Get category breakdown counts */
export function getCategoryBreakdown(permits: Permit[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of permits) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  return counts;
}

/** Get jurisdiction breakdown counts */
export function getJurisdictionBreakdown(permits: Permit[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of permits) {
    counts[p.jurisdiction] = (counts[p.jurisdiction] ?? 0) + 1;
  }
  return counts;
}

/** Calculate total estimated cost range */
export function estimateTotalCost(permits: Permit[]): { low: number; high: number } {
  let low = 0;
  let high = 0;

  for (const p of permits) {
    const costs = parseCostRange(p.estimatedCost);
    low += costs.low;
    high += costs.high;
  }

  return { low, high };
}

/** Parse cost strings like "$300", "$100-500", "~$50", "Free", "Varies" */
function parseCostRange(cost: string): { low: number; high: number } {
  if (!cost || cost.toLowerCase() === 'free') return { low: 0, high: 0 };
  if (cost.toLowerCase() === 'varies') return { low: 0, high: 0 };

  const numbers = cost.match(/\d[\d,]*/g);
  if (!numbers || numbers.length === 0) return { low: 0, high: 0 };

  const parsed = numbers.map((n) => parseInt(n.replace(/,/g, ''), 10));
  if (parsed.length === 1) return { low: parsed[0], high: parsed[0] };
  return { low: Math.min(...parsed), high: Math.max(...parsed) };
}
