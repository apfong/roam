import { describe, it, expect } from 'vitest';
import { buildSearchQueries, prioritizeGovResults } from '@/lib/research/searcher';
import type { IntakeForm } from '@/lib/types';

const restaurantAustin: IntakeForm = {
  businessType: 'restaurant',
  businessActivities: ['serve_food', 'serve_alcohol'],
  state: 'TX',
  city: 'Austin',
  entityType: 'llc',
  homeBased: false,
  employeeCount: '6-50',
};

describe('buildSearchQueries', () => {
  it('generates queries for restaurant in Austin TX', () => {
    const queries = buildSearchQueries(restaurantAustin);
    expect(queries.length).toBeGreaterThanOrEqual(4);
    expect(queries.length).toBeLessThanOrEqual(8);

    // Should include state + business type
    expect(queries.some((q) => q.includes('Texas') && q.includes('restaurant'))).toBe(true);
    // Should include city
    expect(queries.some((q) => q.includes('Austin'))).toBe(true);
    // Should include employer query (has employees)
    expect(queries.some((q) => q.includes('employer'))).toBe(true);
  });

  it('includes food/alcohol queries for restaurant', () => {
    const queries = buildSearchQueries(restaurantAustin);
    expect(queries.some((q) => q.toLowerCase().includes('food'))).toBe(true);
  });

  it('does not include employer query for 0 employees', () => {
    const consulting: IntakeForm = {
      ...restaurantAustin,
      businessType: 'consulting',
      employeeCount: '0',
      businessActivities: [],
    };
    const queries = buildSearchQueries(consulting);
    expect(queries.some((q) => q.includes('employer'))).toBe(false);
  });

  it('caps at 8 queries', () => {
    const intake: IntakeForm = {
      ...restaurantAustin,
      businessActivities: ['a', 'b', 'c', 'd', 'e', 'f'],
    };
    const queries = buildSearchQueries(intake);
    expect(queries.length).toBeLessThanOrEqual(8);
  });

  it('includes salon-specific query', () => {
    const salon: IntakeForm = {
      ...restaurantAustin,
      businessType: 'salon',
      businessActivities: [],
    };
    const queries = buildSearchQueries(salon);
    expect(queries.some((q) => q.toLowerCase().includes('cosmetology'))).toBe(true);
  });
});

describe('prioritizeGovResults', () => {
  it('puts .gov results first', () => {
    const results = [
      { title: 'Blog', url: 'https://blog.com/permits', snippet: '' },
      { title: 'Gov', url: 'https://www.texas.gov/permits', snippet: '' },
      { title: 'Blog2', url: 'https://example.com', snippet: '' },
    ];
    const sorted = prioritizeGovResults(results);
    expect(sorted[0].url).toContain('.gov');
  });

  it('preserves order within groups', () => {
    const results = [
      { title: 'A', url: 'https://a.gov', snippet: '' },
      { title: 'B', url: 'https://b.gov', snippet: '' },
      { title: 'C', url: 'https://c.com', snippet: '' },
    ];
    const sorted = prioritizeGovResults(results);
    expect(sorted[0].title).toBe('A');
    expect(sorted[1].title).toBe('B');
    expect(sorted[2].title).toBe('C');
  });
});
