import { IntakeForm, Permit, ResearchRequest } from '../types';
import { getTemplatePermits } from './templates';
import { buildSearchQueries, searchWeb, prioritizeGovResults, SearchResult } from './searcher';
import { extractPermitsFromPage } from './extractor';
import { deduplicatePermits, scoreAndSortPermits } from './synthesizer';
import { generateCacheKey, getCachedResult, setCachedResult } from './cache';
import { randomUUID } from 'crypto';

export interface AgentOptions {
  braveApiKey?: string;
  llmApiKey?: string;
  skipSearch?: boolean; // For testing — use templates only
  maxSearchResults?: number;
  maxPagesToFetch?: number;
}

/** Main research agent orchestrator */
export async function runResearchAgent(
  intake: IntakeForm,
  options: AgentOptions = {}
): Promise<ResearchRequest> {
  const cacheKey = generateCacheKey(intake);

  // Check cache first
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }

  const request: ResearchRequest = {
    id: randomUUID(),
    intake,
    status: 'researching',
    permits: [],
    createdAt: new Date().toISOString(),
    paid: false,
    cacheKey,
  };

  try {
    // Step 1: Template-based permits (instant, zero cost)
    const templatePermits = getTemplatePermits(intake);

    // Step 2: Search-based research (if not skipped)
    let searchPermits: Permit[] = [];
    if (!options.skipSearch) {
      searchPermits = await searchAndExtract(intake, options);
    }

    // Step 3: Deduplicate and score
    const allPermits = [...templatePermits, ...searchPermits];
    const deduplicated = deduplicatePermits(allPermits);
    const sorted = scoreAndSortPermits(deduplicated);

    request.permits = sorted;
    request.status = 'complete';
    request.completedAt = new Date().toISOString();

    // Cache the result
    setCachedResult(cacheKey, request);

    return request;
  } catch (err) {
    request.status = 'error';
    request.error = err instanceof Error ? err.message : 'Unknown error';
    return request;
  }
}

/** Search web and extract permits from results */
async function searchAndExtract(
  intake: IntakeForm,
  options: AgentOptions
): Promise<Permit[]> {
  const queries = buildSearchQueries(intake);
  const maxPagesToFetch = options.maxPagesToFetch ?? 5;
  const allPermits: Permit[] = [];

  // Run searches
  const allResults: SearchResult[] = [];
  for (const query of queries) {
    try {
      const results = await searchWeb(query, {
        apiKey: options.braveApiKey,
        maxResults: options.maxSearchResults ?? 5,
      });
      allResults.push(...results);
    } catch {
      // Continue with other queries if one fails
      continue;
    }
  }

  // Prioritize .gov results and deduplicate by URL
  const prioritized = prioritizeGovResults(allResults);
  const uniqueUrls = new Set<string>();
  const uniqueResults: SearchResult[] = [];
  for (const result of prioritized) {
    if (!uniqueUrls.has(result.url) && uniqueResults.length < maxPagesToFetch) {
      uniqueUrls.add(result.url);
      uniqueResults.push(result);
    }
  }

  // Extract permits from each page
  for (const result of uniqueResults) {
    try {
      const extraction = await extractPermitsFromPage(result, intake, {
        llmApiKey: options.llmApiKey,
      });
      allPermits.push(...extraction.permits);
    } catch {
      continue;
    }
  }

  return allPermits;
}
