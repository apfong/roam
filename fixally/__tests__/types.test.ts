import { describe, it, expect } from 'vitest';
import type { FixWithViolation, ScanReport, DashboardScan, SubscriptionTier, SubscriptionInfo } from '@/lib/types';

describe('Type definitions', () => {
  it('FixWithViolation has correct shape', () => {
    const item: FixWithViolation = {
      fix: {
        selector: 'img',
        currentHTML: '<img>',
        fixedHTML: '<img alt="">',
        explanation: 'Added alt',
        wcagRule: 'WCAG 1.1.1',
        confidence: 'high',
      },
      violation: {
        ruleId: 'image-alt',
        impact: 'critical',
        html: '<img>',
        target: ['img'],
        failureSummary: 'Missing alt',
        pageUrl: 'https://example.com',
      },
      locked: false,
    };
    expect(item.fix.confidence).toBe('high');
    expect(item.locked).toBe(false);
  });

  it('ScanReport has correct shape', () => {
    const report: ScanReport = {
      id: '1',
      url: 'https://example.com',
      scannedAt: new Date().toISOString(),
      duration: 1000,
      violations: [],
      fixes: [],
      lockedCount: 0,
      summary: { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 },
    };
    expect(report.id).toBe('1');
  });

  it('DashboardScan has correct shape', () => {
    const scan: DashboardScan = {
      id: '1',
      url: 'https://example.com',
      scannedAt: new Date().toISOString(),
      violationCount: 5,
      status: 'completed',
    };
    expect(scan.status).toBe('completed');
  });

  it('SubscriptionInfo has valid tiers', () => {
    const tiers: SubscriptionTier[] = ['free', 'starter', 'pro'];
    expect(tiers).toHaveLength(3);

    const info: SubscriptionInfo = { tier: 'starter', status: 'active' };
    expect(info.tier).toBe('starter');
  });
});
