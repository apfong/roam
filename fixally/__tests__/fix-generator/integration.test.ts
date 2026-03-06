import { describe, it, expect } from 'vitest';
import { generateFixes, getSupportedRules } from '@/lib/fix-generator/rule-engine';
import { ViolationContext } from '@/lib/fix-generator/types';
import { getVisibleFixes, FREE_FIX_LIMIT } from '@/lib/billing/gating';
import { detectPlatform, getPlatformInstructions } from '@/lib/platform/detect';

describe('Fix generator integration', () => {
  const violations: ViolationContext[] = [
    {
      ruleId: 'image-alt',
      impact: 'critical',
      html: '<img src="hero.jpg">',
      target: ['img'],
      failureSummary: 'Image missing alt text',
      pageUrl: 'https://example.com',
    },
    {
      ruleId: 'html-has-lang',
      impact: 'serious',
      html: '<html>',
      target: ['html'],
      failureSummary: 'Missing lang attribute',
      pageUrl: 'https://example.com',
    },
    {
      ruleId: 'link-name',
      impact: 'serious',
      html: '<a href="/about"></a>',
      target: ['a'],
      failureSummary: 'Link has no text',
      pageUrl: 'https://example.com',
    },
    {
      ruleId: 'button-name',
      impact: 'critical',
      html: '<button></button>',
      target: ['button'],
      failureSummary: 'Button has no text',
      pageUrl: 'https://example.com',
    },
    {
      ruleId: 'label',
      impact: 'critical',
      html: '<input type="text" name="email" placeholder="Email">',
      target: ['input'],
      failureSummary: 'Form element has no label',
      pageUrl: 'https://example.com',
    },
  ];

  it('generates fixes for all known violations', () => {
    const fixes = generateFixes(violations);
    expect(fixes.length).toBeGreaterThanOrEqual(4);
  });

  it('gates fixes for free users', () => {
    const fixes = generateFixes(violations);
    const gated = getVisibleFixes(fixes, false);
    expect(gated.visible.length).toBeLessThanOrEqual(FREE_FIX_LIMIT);
    expect(gated.lockedCount).toBe(Math.max(0, fixes.length - FREE_FIX_LIMIT));
  });

  it('shows all fixes for paid users', () => {
    const fixes = generateFixes(violations);
    const gated = getVisibleFixes(fixes, true);
    expect(gated.visible.length).toBe(fixes.length);
    expect(gated.lockedCount).toBe(0);
  });

  it('detects WordPress platform', () => {
    const html = '<link rel="stylesheet" href="/wp-content/themes/x/style.css"><meta name="generator" content="WordPress 6.4">';
    const result = detectPlatform(html);
    expect(result.platform).toBe('wordpress');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('provides platform instructions', () => {
    const instructions = getPlatformInstructions('wordpress');
    expect(instructions).toContain('Accessibility');
    expect(instructions.length).toBeGreaterThan(10);
  });

  it('returns generic instructions for unknown platforms', () => {
    const instructions = getPlatformInstructions('unknown');
    expect(instructions).toContain('HTML');
  });

  it('lists supported rules', () => {
    const rules = getSupportedRules();
    expect(rules).toContain('image-alt');
    expect(rules).toContain('html-has-lang');
    expect(rules).toContain('label');
    expect(rules.length).toBeGreaterThanOrEqual(10);
  });
});
