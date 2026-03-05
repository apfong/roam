import { describe, it, expect } from 'vitest';
import { getVisibleFixes, isWithinFreeLimit, FREE_FIX_LIMIT } from '@/lib/billing/gating';
import { FixResult } from '@/lib/fix-generator/types';

function makeFix(overrides: Partial<FixResult> = {}): FixResult {
  return {
    selector: '#el',
    currentHTML: '<div>old</div>',
    fixedHTML: '<div>new</div>',
    explanation: 'Fixed it',
    wcagRule: 'WCAG 1.1.1',
    confidence: 'high',
    ...overrides,
  };
}

describe('gating', () => {
  it('shows all fixes for paid users', () => {
    const fixes = Array.from({ length: 10 }, () => makeFix());
    const result = getVisibleFixes(fixes, true);
    expect(result.visible.length).toBe(10);
    expect(result.lockedCount).toBe(0);
    expect(result.isPaid).toBe(true);
  });

  it('limits free users to FREE_FIX_LIMIT fixes', () => {
    const fixes = Array.from({ length: 10 }, () => makeFix());
    const result = getVisibleFixes(fixes, false);
    expect(result.visible.length).toBe(FREE_FIX_LIMIT);
    expect(result.lockedCount).toBe(7);
    expect(result.isPaid).toBe(false);
  });

  it('sorts by confidence (high first) for free users', () => {
    const fixes = [
      makeFix({ confidence: 'low' }),
      makeFix({ confidence: 'high' }),
      makeFix({ confidence: 'medium' }),
      makeFix({ confidence: 'high' }),
    ];
    const result = getVisibleFixes(fixes, false);
    expect(result.visible[0].confidence).toBe('high');
    expect(result.visible[1].confidence).toBe('high');
  });

  it('handles fewer fixes than limit', () => {
    const fixes = [makeFix(), makeFix()];
    const result = getVisibleFixes(fixes, false);
    expect(result.visible.length).toBe(2);
    expect(result.lockedCount).toBe(0);
  });

  it('isWithinFreeLimit works correctly', () => {
    expect(isWithinFreeLimit(3)).toBe(true);
    expect(isWithinFreeLimit(4)).toBe(false);
    expect(isWithinFreeLimit(0)).toBe(true);
  });
});
