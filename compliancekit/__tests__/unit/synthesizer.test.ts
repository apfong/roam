import { describe, it, expect } from 'vitest';
import {
  deduplicatePermits,
  scoreAndSortPermits,
  getCategoryBreakdown,
  getJurisdictionBreakdown,
  estimateTotalCost,
} from '@/lib/research/synthesizer';
import type { Permit } from '@/lib/types';

function makePermit(overrides: Partial<Permit> = {}): Permit {
  return {
    id: 'test-' + Math.random().toString(36).slice(2),
    name: 'Test Permit',
    issuingAuthority: 'Test Authority',
    jurisdiction: 'state',
    url: 'https://test.gov/permit',
    estimatedCost: '$100',
    processingTime: '2 weeks',
    renewalPeriod: 'Annual',
    prerequisites: [],
    category: 'registration',
    confidence: 'high',
    deadline: 'Before opening',
    ...overrides,
  };
}

describe('deduplicatePermits', () => {
  it('removes exact duplicates by name', () => {
    const permits = [
      makePermit({ name: 'EIN', id: '1' }),
      makePermit({ name: 'EIN', id: '2' }),
    ];
    const result = deduplicatePermits(permits);
    expect(result.length).toBe(1);
  });

  it('keeps different permits', () => {
    const permits = [
      makePermit({ name: 'EIN', url: 'https://irs.gov' }),
      makePermit({ name: 'LLC Registration', url: 'https://sos.texas.gov' }),
    ];
    const result = deduplicatePermits(permits);
    expect(result.length).toBe(2);
  });

  it('prefers higher confidence when merging', () => {
    const permits = [
      makePermit({ name: 'Test Permit', confidence: 'low', estimatedCost: 'Varies' }),
      makePermit({ name: 'Test Permit', confidence: 'high', estimatedCost: '$50' }),
    ];
    const result = deduplicatePermits(permits);
    expect(result.length).toBe(1);
    expect(result[0].confidence).toBe('high');
    expect(result[0].estimatedCost).toBe('$50');
  });

  it('fills in missing data from lower confidence duplicate', () => {
    const permits = [
      makePermit({ name: 'Test', confidence: 'low', estimatedCost: '$200', processingTime: '3 days' }),
      makePermit({ name: 'Test', confidence: 'high', estimatedCost: 'Varies', processingTime: 'Varies' }),
    ];
    const result = deduplicatePermits(permits);
    expect(result[0].estimatedCost).toBe('$200');
  });
});

describe('scoreAndSortPermits', () => {
  it('sorts high confidence first', () => {
    const permits = [
      makePermit({ confidence: 'low', name: 'A' }),
      makePermit({ confidence: 'high', name: 'B' }),
      makePermit({ confidence: 'medium', name: 'C' }),
    ];
    const sorted = scoreAndSortPermits(permits);
    expect(sorted[0].confidence).toBe('high');
    expect(sorted[1].confidence).toBe('medium');
    expect(sorted[2].confidence).toBe('low');
  });

  it('sorts federal before state before city within same confidence', () => {
    const permits = [
      makePermit({ jurisdiction: 'city', name: 'City' }),
      makePermit({ jurisdiction: 'federal', name: 'Fed' }),
      makePermit({ jurisdiction: 'state', name: 'State' }),
    ];
    const sorted = scoreAndSortPermits(permits);
    expect(sorted[0].jurisdiction).toBe('federal');
    expect(sorted[1].jurisdiction).toBe('state');
    expect(sorted[2].jurisdiction).toBe('city');
  });
});

describe('getCategoryBreakdown', () => {
  it('counts permits by category', () => {
    const permits = [
      makePermit({ category: 'registration' }),
      makePermit({ category: 'registration' }),
      makePermit({ category: 'health_safety' }),
      makePermit({ category: 'tax' }),
    ];
    const breakdown = getCategoryBreakdown(permits);
    expect(breakdown.registration).toBe(2);
    expect(breakdown.health_safety).toBe(1);
    expect(breakdown.tax).toBe(1);
  });
});

describe('getJurisdictionBreakdown', () => {
  it('counts permits by jurisdiction', () => {
    const permits = [
      makePermit({ jurisdiction: 'federal' }),
      makePermit({ jurisdiction: 'state' }),
      makePermit({ jurisdiction: 'state' }),
      makePermit({ jurisdiction: 'city' }),
    ];
    const breakdown = getJurisdictionBreakdown(permits);
    expect(breakdown.federal).toBe(1);
    expect(breakdown.state).toBe(2);
    expect(breakdown.city).toBe(1);
  });
});

describe('estimateTotalCost', () => {
  it('sums cost ranges', () => {
    const permits = [
      makePermit({ estimatedCost: '$100' }),
      makePermit({ estimatedCost: '$200-500' }),
      makePermit({ estimatedCost: 'Free' }),
    ];
    const total = estimateTotalCost(permits);
    expect(total.low).toBe(300);
    expect(total.high).toBe(600);
  });

  it('handles "Varies" as $0', () => {
    const permits = [
      makePermit({ estimatedCost: 'Varies' }),
      makePermit({ estimatedCost: '$50' }),
    ];
    const total = estimateTotalCost(permits);
    expect(total.low).toBe(50);
    expect(total.high).toBe(50);
  });

  it('handles ~$ prefix', () => {
    const permits = [makePermit({ estimatedCost: '~$75' })];
    const total = estimateTotalCost(permits);
    expect(total.low).toBe(75);
  });
});
