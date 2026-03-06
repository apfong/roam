import { describe, it, expect } from 'vitest';
import { MOCK_SCANS, MOCK_SUBSCRIPTION } from '@/lib/mock-data';

describe('Mock data', () => {
  it('has valid scan entries', () => {
    expect(MOCK_SCANS.length).toBeGreaterThan(0);
    for (const scan of MOCK_SCANS) {
      expect(scan.id).toBeTruthy();
      expect(scan.url).toMatch(/^https?:\/\//);
      expect(scan.scannedAt).toBeTruthy();
      expect(typeof scan.violationCount).toBe('number');
      expect(['completed', 'failed', 'in-progress']).toContain(scan.status);
    }
  });

  it('has valid subscription info', () => {
    expect(['free', 'starter', 'pro']).toContain(MOCK_SUBSCRIPTION.tier);
    expect(['active', 'inactive', 'canceled', 'past_due']).toContain(MOCK_SUBSCRIPTION.status);
  });
});
