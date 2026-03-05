import { IntakeForm, US_STATES } from '../types';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/** Build targeted search queries from intake data */
export function buildSearchQueries(intake: IntakeForm): string[] {
  const stateName = US_STATES[intake.state] ?? intake.state;
  const queries: string[] = [];

  queries.push(`${stateName} ${intake.businessType.replace(/_/g, ' ')} license requirements`);
  queries.push(`${intake.city} ${stateName} business permit requirements`);
  queries.push(`${intake.city} business license application`);

  if (intake.employeeCount !== '0') {
    queries.push(`${stateName} employer registration requirements`);
  }

  // Activity-specific queries
  for (const activity of intake.businessActivities.slice(0, 3)) {
    queries.push(`${stateName} ${activity.replace(/_/g, ' ')} permit license`);
  }

  // Industry-specific
  if (intake.businessType === 'restaurant') {
    queries.push(`${intake.city} food service permit health department`);
    if (intake.businessActivities.includes('serve_alcohol')) {
      queries.push(`${stateName} liquor license restaurant`);
    }
  } else if (intake.businessType === 'salon') {
    queries.push(`${stateName} cosmetology salon license`);
  } else if (intake.businessType === 'construction') {
    queries.push(`${stateName} contractor license requirements`);
  }

  return queries.slice(0, 8); // Cap at 8 queries
}

/** Search using Brave API (or mock for testing) */
export async function searchWeb(
  query: string,
  options: { apiKey?: string; maxResults?: number } = {}
): Promise<SearchResult[]> {
  const apiKey = options.apiKey ?? process.env.BRAVE_API_KEY;
  if (!apiKey) {
    throw new Error('BRAVE_API_KEY is required for web search');
  }

  const maxResults = options.maxResults ?? 10;
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;

  const response = await fetchWithRetry(url, {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Brave search failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as BraveSearchResponse;

  return (data.web?.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.description,
  }));
}

interface BraveSearchResponse {
  web?: {
    results: Array<{
      title: string;
      url: string;
      description: string;
    }>;
  };
}

/** Fetch with retry logic */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.status === 429) {
        // Rate limited — wait and retry
        const waitMs = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError ?? new Error('Fetch failed after retries');
}

/** Filter search results to prioritize .gov sources */
export function prioritizeGovResults(results: SearchResult[]): SearchResult[] {
  const gov = results.filter((r) => r.url.includes('.gov'));
  const nonGov = results.filter((r) => !r.url.includes('.gov'));
  return [...gov, ...nonGov];
}
