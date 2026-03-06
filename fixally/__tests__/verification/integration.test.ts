import { describe, it, expect } from 'vitest';
import { computeVerification, formatVerification } from '@/lib/verification/verify';
import type { Violation } from '@/lib/scanner';

const makeViolation = (id: string, impact: Violation['impact'] = 'serious'): Violation => ({
  id,
  impact,
  description: `${id} description`,
  help: `Fix ${id}`,
  helpUrl: `https://example.com/help/${id}`,
  wcagTags: ['wcag2aa'],
  nodes: [{ html: '<div>', target: ['div'], failureSummary: 'test' }],
});

describe('Verification integration', () => {
  it('computes all fixed when no remaining violations', () => {
    const original = [makeViolation('image-alt'), makeViolation('link-name')];
    const postFix: Violation[] = [];
    const result = computeVerification(original, postFix);
    expect(result.originalCount).toBe(2);
    expect(result.fixedCount).toBe(2);
    expect(result.remainingCount).toBe(0);
  });

  it('computes partial fix', () => {
    const original = [makeViolation('image-alt'), makeViolation('link-name'), makeViolation('label')];
    const postFix = [makeViolation('label')];
    const result = computeVerification(original, postFix);
    expect(result.fixedCount).toBe(2);
    expect(result.remainingCount).toBe(1);
  });

  it('formats verification string', () => {
    const result = { originalCount: 10, fixedCount: 7, remainingCount: 3, remainingViolations: [] };
    const formatted = formatVerification(result);
    expect(formatted).toContain('10');
    expect(formatted).toContain('7');
    expect(formatted).toContain('3');
  });
});
