import { describe, it, expect, beforeEach } from 'vitest';
import { generateCacheKey, getCachedResult, setCachedResult, clearCache, getCacheSize } from '@/lib/research/cache';
import type { IntakeForm, ResearchRequest } from '@/lib/types';

const intake1: IntakeForm = {
  businessType: 'restaurant',
  businessActivities: ['serve_food', 'serve_alcohol'],
  state: 'TX',
  city: 'Austin',
  entityType: 'llc',
  homeBased: false,
  employeeCount: '6-50',
};

const intake2: IntakeForm = {
  ...intake1,
  city: 'Houston',
};

describe('generateCacheKey', () => {
  it('produces consistent keys for same input', () => {
    const key1 = generateCacheKey(intake1);
    const key2 = generateCacheKey(intake1);
    expect(key1).toBe(key2);
  });

  it('produces different keys for different inputs', () => {
    const key1 = generateCacheKey(intake1);
    const key2 = generateCacheKey(intake2);
    expect(key1).not.toBe(key2);
  });

  it('is case-insensitive for city', () => {
    const key1 = generateCacheKey(intake1);
    const key2 = generateCacheKey({ ...intake1, city: 'AUSTIN' });
    expect(key1).toBe(key2);
  });

  it('sorts activities for consistent keys', () => {
    const key1 = generateCacheKey({ ...intake1, businessActivities: ['a', 'b'] });
    const key2 = generateCacheKey({ ...intake1, businessActivities: ['b', 'a'] });
    expect(key1).toBe(key2);
  });

  it('returns a 16-char hex string', () => {
    const key = generateCacheKey(intake1);
    expect(key).toMatch(/^[a-f0-9]{16}$/);
  });
});

describe('cache get/set', () => {
  beforeEach(() => clearCache());

  it('returns null for missing key', () => {
    expect(getCachedResult('nonexistent')).toBeNull();
  });

  it('stores and retrieves a result', () => {
    const request: ResearchRequest = {
      id: 'test-id',
      intake: intake1,
      status: 'complete',
      permits: [],
      createdAt: new Date().toISOString(),
      paid: false,
      cacheKey: 'test-key',
    };

    setCachedResult('test-key', request);
    const result = getCachedResult('test-key');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('test-id');
  });

  it('clearCache empties the cache', () => {
    setCachedResult('k1', { id: '1' } as ResearchRequest);
    setCachedResult('k2', { id: '2' } as ResearchRequest);
    expect(getCacheSize()).toBe(2);
    clearCache();
    expect(getCacheSize()).toBe(0);
  });
});
