import { describe, it, expect } from 'vitest';
import { getFixer, generateFix, generateFixes, getSupportedRules } from '@/lib/fix-generator/rule-engine';
import { ViolationContext } from '@/lib/fix-generator/types';

describe('rule-engine', () => {
  it('returns fixer for supported rules', () => {
    expect(getFixer('image-alt')).not.toBeNull();
    expect(getFixer('label')).not.toBeNull();
    expect(getFixer('html-has-lang')).not.toBeNull();
  });

  it('returns null for unsupported rules', () => {
    expect(getFixer('unknown-rule-xyz')).toBeNull();
  });

  it('getSupportedRules returns all 10 rules', () => {
    const rules = getSupportedRules();
    expect(rules.length).toBe(10);
    expect(rules).toContain('image-alt');
    expect(rules).toContain('meta-viewport');
  });

  it('generateFix produces a result for known rules', () => {
    const ctx: ViolationContext = {
      ruleId: 'html-has-lang',
      impact: 'serious',
      html: '<html>',
      target: ['html'],
      failureSummary: 'Missing lang',
      pageUrl: 'https://example.com',
    };
    const fix = generateFix(ctx);
    expect(fix).not.toBeNull();
    expect(fix!.fixedHTML).toContain('lang="en"');
  });

  it('generateFix returns null for unknown rules', () => {
    const ctx: ViolationContext = {
      ruleId: 'nonexistent',
      impact: 'minor',
      html: '<div>test</div>',
      target: ['div'],
      failureSummary: '',
      pageUrl: 'https://example.com',
    };
    expect(generateFix(ctx)).toBeNull();
  });

  it('generateFixes processes multiple contexts', () => {
    const contexts: ViolationContext[] = [
      { ruleId: 'html-has-lang', impact: 'serious', html: '<html>', target: ['html'], failureSummary: '', pageUrl: 'https://example.com' },
      { ruleId: 'image-alt', impact: 'critical', html: '<img src="/photo.jpg">', target: ['img'], failureSummary: '', pageUrl: 'https://example.com' },
      { ruleId: 'unknown', impact: 'minor', html: '<div></div>', target: ['div'], failureSummary: '', pageUrl: 'https://example.com' },
    ];
    const fixes = generateFixes(contexts);
    expect(fixes.length).toBe(2);
  });
});
