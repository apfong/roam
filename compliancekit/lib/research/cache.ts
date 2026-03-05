import { createHash } from 'crypto';
import { IntakeForm, ResearchRequest } from '../types';

/** Generate a deterministic cache key from intake parameters */
export function generateCacheKey(intake: IntakeForm): string {
  const normalized = [
    intake.state.toUpperCase(),
    intake.city.toLowerCase().trim(),
    intake.businessType,
    [...intake.businessActivities].sort().join(','),
    intake.entityType,
    String(intake.homeBased),
    intake.employeeCount,
  ].join(':');

  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

/** In-memory cache (swap for DB/Redis in production) */
const memoryCache = new Map<string, { data: ResearchRequest; expiresAt: number }>();

const CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export function getCachedResult(cacheKey: string): ResearchRequest | null {
  const entry = memoryCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(cacheKey);
    return null;
  }
  return entry.data;
}

export function setCachedResult(cacheKey: string, data: ResearchRequest): void {
  memoryCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function clearCache(): void {
  memoryCache.clear();
}

export function getCacheSize(): number {
  return memoryCache.size;
}
