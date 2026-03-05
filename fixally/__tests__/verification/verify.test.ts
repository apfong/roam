import { describe, it, expect } from 'vitest';
import { computeVerification, formatVerification } from '@/lib/verification/verify';
import { Violation } from '@/lib/scanner';

function makeViolation(id: string): Violation {
  return {
    id,
    impact: 'serious',
    description: `${id} violation`,
    help: `Fix ${id}`,
    helpUrl: `https://dequeuniversity.com/rules/axe/${id}`,
    wcagTags: ['wcag2a'],
    nodes: [{ html: '<div></div>', target: ['div'], failureSummary: '' }],
  };
}

describe('computeVerification', () => {
  it('computes when all violations fixed', () => {
    const original = [makeViolation('image-alt'), makeViolation('label')];
    const postFix: Violation[] = [];
    const result = computeVerification(original, postFix);
    expect(result.originalCount).toBe(2);
    expect(result.fixedCount).toBe(2);
    expect(result.remainingCount).toBe(0);
  });

  it('computes when some violations remain', () => {
    const original = [makeViolation('image-alt'), makeViolation('label'), makeViolation('color-contrast')];
    const postFix = [makeViolation('color-contrast')];
    const result = computeVerification(original, postFix);
    expect(result.originalCount).toBe(3);
    expect(result.fixedCount).toBe(2);
    expect(result.remainingCount).toBe(1);
  });

  it('computes when no violations fixed', () => {
    const original = [makeViolation('color-contrast')];
    const postFix = [makeViolation('color-contrast')];
    const result = computeVerification(original, postFix);
    expect(result.fixedCount).toBe(0);
    expect(result.remainingCount).toBe(1);
  });
});

describe('formatVerification', () => {
  it('formats correctly', () => {
    const formatted = formatVerification({
      originalCount: 47,
      fixedCount: 35,
      remainingCount: 12,
      remainingViolations: [],
    });
    expect(formatted).toBe('47 issues found → 35 auto-fixed → 12 need manual review');
  });
});
