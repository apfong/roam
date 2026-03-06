import { describe, it, expect, beforeEach } from 'vitest';
import { runResearchAgent } from '@/lib/research/agent';
import { clearCache } from '@/lib/research/cache';
import type { IntakeForm } from '@/lib/types';

// Golden test cases from compliance-accuracy-test.md

const testCases: { name: string; intake: IntakeForm; minPermits: number; requiredPermits: string[] }[] = [
  {
    name: 'Restaurant - Austin, TX',
    intake: {
      businessType: 'restaurant',
      businessActivities: ['serve_food'],
      state: 'TX',
      city: 'Austin',
      entityType: 'llc',
      homeBased: false,
      employeeCount: '6-50',
    },
    minPermits: 8,
    requiredPermits: ['EIN', 'LLC', 'Sales Tax', 'Food', 'Fire', 'Franchise Tax'],
  },
  {
    name: 'Restaurant - Portland, OR',
    intake: {
      businessType: 'restaurant',
      businessActivities: ['serve_food'],
      state: 'OR',
      city: 'Portland',
      entityType: 'llc',
      homeBased: false,
      employeeCount: '6-50',
    },
    minPermits: 7,
    requiredPermits: ['EIN', 'LLC', 'Restaurant License', 'Food Handler'],
  },
  {
    name: 'Restaurant - Miami, FL',
    intake: {
      businessType: 'restaurant',
      businessActivities: ['serve_food'],
      state: 'FL',
      city: 'Miami',
      entityType: 'llc',
      homeBased: false,
      employeeCount: '1-5',
    },
    minPermits: 7,
    requiredPermits: ['EIN', 'LLC', 'Sales Tax', 'Food Service'],
  },
  {
    name: 'Hair Salon - Austin, TX',
    intake: {
      businessType: 'salon',
      businessActivities: ['cut_hair'],
      state: 'TX',
      city: 'Austin',
      entityType: 'llc',
      homeBased: false,
      employeeCount: '1-5',
    },
    minPermits: 6,
    requiredPermits: ['EIN', 'LLC', 'Cosmetology', 'Sales Tax'],
  },
  {
    name: 'Hair Salon - Portland, OR',
    intake: {
      businessType: 'salon',
      businessActivities: ['cut_hair'],
      state: 'OR',
      city: 'Portland',
      entityType: 'llc',
      homeBased: false,
      employeeCount: '1-5',
    },
    minPermits: 5,
    requiredPermits: ['EIN', 'LLC', 'Cosmetology'],
  },
  {
    name: 'Hair Salon - Miami, FL',
    intake: {
      businessType: 'salon',
      businessActivities: ['cut_hair'],
      state: 'FL',
      city: 'Miami',
      entityType: 'llc',
      homeBased: false,
      employeeCount: '1-5',
    },
    minPermits: 5,
    requiredPermits: ['EIN', 'LLC', 'Cosmetology', 'Sales Tax'],
  },
  {
    name: 'Home Consulting - Austin, TX',
    intake: {
      businessType: 'consulting',
      businessActivities: [],
      state: 'TX',
      city: 'Austin',
      entityType: 'llc',
      homeBased: true,
      employeeCount: '0',
    },
    minPermits: 3,
    requiredPermits: ['EIN', 'LLC'],
  },
  {
    name: 'Home Consulting - Portland, OR',
    intake: {
      businessType: 'consulting',
      businessActivities: [],
      state: 'OR',
      city: 'Portland',
      entityType: 'llc',
      homeBased: true,
      employeeCount: '0',
    },
    minPermits: 2,
    requiredPermits: ['EIN', 'LLC'],
  },
  {
    name: 'Home Consulting - Miami, FL',
    intake: {
      businessType: 'consulting',
      businessActivities: [],
      state: 'FL',
      city: 'Miami',
      entityType: 'llc',
      homeBased: true,
      employeeCount: '0',
    },
    minPermits: 3,
    requiredPermits: ['EIN', 'LLC', 'Sales Tax'],
  },
];

describe('Research Agent (template-only mode)', () => {
  beforeEach(() => clearCache());

  for (const tc of testCases) {
    describe(tc.name, () => {
      it(`finds at least ${tc.minPermits} permits`, async () => {
        const result = await runResearchAgent(tc.intake, { skipSearch: true });
        expect(result.status).toBe('complete');
        expect(result.permits.length).toBeGreaterThanOrEqual(tc.minPermits);
      });

      it('includes all required permits', async () => {
        const result = await runResearchAgent(tc.intake, { skipSearch: true });
        for (const required of tc.requiredPermits) {
          const found = result.permits.some((p) =>
            p.name.toLowerCase().includes(required.toLowerCase())
          );
          expect(found, `Missing required permit: ${required}`).toBe(true);
        }
      });

      it('all permits have high confidence (template-only)', async () => {
        const result = await runResearchAgent(tc.intake, { skipSearch: true });
        for (const p of result.permits) {
          expect(p.confidence).toBe('high');
        }
      });

      it('returns a valid cache key', async () => {
        const result = await runResearchAgent(tc.intake, { skipSearch: true });
        expect(result.cacheKey).toMatch(/^[a-f0-9]{16}$/);
      });
    });
  }

  it('caches results on second call', async () => {
    const intake = testCases[0].intake;
    const result1 = await runResearchAgent(intake, { skipSearch: true });
    const result2 = await runResearchAgent(intake, { skipSearch: true });
    expect(result1.id).toBe(result2.id); // Same cached result
  });
});
