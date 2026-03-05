import { Permit, IntakeForm } from '../types';
import { SearchResult } from './searcher';
import { randomUUID } from 'crypto';

export interface ExtractionResult {
  permits: Permit[];
  sourceUrl: string;
  rawContent: string;
}

/** Fetch a page and extract permit information using LLM */
export async function extractPermitsFromPage(
  result: SearchResult,
  intake: IntakeForm,
  options: { llmApiKey?: string; fetchFn?: typeof fetch } = {}
): Promise<ExtractionResult> {
  const fetchFn = options.fetchFn ?? fetch;

  // Fetch page content
  const pageContent = await fetchPageContent(result.url, fetchFn);
  if (!pageContent) {
    return { permits: [], sourceUrl: result.url, rawContent: '' };
  }

  // Use LLM to extract structured permit data
  const permits = await llmExtractPermits(pageContent, result, intake, options.llmApiKey);

  return {
    permits,
    sourceUrl: result.url,
    rawContent: pageContent.slice(0, 2000),
  };
}

/** Fetch page content with error handling */
async function fetchPageContent(
  url: string,
  fetchFn: typeof fetch
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetchFn(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ComplianceKit/1.0 (permit-research-bot)' },
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return null;
    }

    const text = await response.text();
    return stripHtml(text).slice(0, 50000); // Cap at 50K chars
  } catch {
    return null;
  }
}

/** Simple HTML tag stripper */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract permits using LLM (Claude API) */
async function llmExtractPermits(
  pageContent: string,
  searchResult: SearchResult,
  intake: IntakeForm,
  apiKey?: string
): Promise<Permit[]> {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // Fallback: create a basic permit from search result metadata
    return fallbackExtract(searchResult, intake);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Extract permits and licenses from this government page content. 
Business context: ${intake.businessType} in ${intake.city}, ${intake.state}.

Page URL: ${searchResult.url}
Page content (truncated):
${pageContent.slice(0, 8000)}

Return a JSON array of permits found. Each permit should have:
- name (string)
- issuingAuthority (string)  
- jurisdiction ("federal"|"state"|"county"|"city")
- url (string - direct link if available, otherwise the page URL)
- estimatedCost (string)
- processingTime (string)
- renewalPeriod (string)
- prerequisites (string[])
- category ("registration"|"health_safety"|"zoning"|"professional"|"tax"|"employment"|"industry")
- deadline (string)

Only include permits relevant to a ${intake.businessType} business. Return ONLY valid JSON array, no other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackExtract(searchResult, intake);
    }

    const data = await response.json() as LLMResponse;
    const text = data.content?.[0]?.text ?? '[]';

    // Parse JSON from LLM response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return fallbackExtract(searchResult, intake);

    const parsed = JSON.parse(jsonMatch[0]) as RawPermit[];
    return parsed.map((p) => ({
      id: randomUUID(),
      name: p.name ?? 'Unknown Permit',
      issuingAuthority: p.issuingAuthority ?? 'Unknown',
      jurisdiction: validateJurisdiction(p.jurisdiction),
      url: p.url ?? searchResult.url,
      estimatedCost: p.estimatedCost ?? 'Varies',
      processingTime: p.processingTime ?? 'Varies',
      renewalPeriod: p.renewalPeriod ?? 'Varies',
      prerequisites: Array.isArray(p.prerequisites) ? p.prerequisites : [],
      category: validateCategory(p.category),
      confidence: searchResult.url.includes('.gov') ? 'medium' as const : 'low' as const,
      deadline: p.deadline ?? 'Before operating',
    }));
  } catch {
    return fallbackExtract(searchResult, intake);
  }
}

interface LLMResponse {
  content?: Array<{ text: string }>;
}

interface RawPermit {
  name?: string;
  issuingAuthority?: string;
  jurisdiction?: string;
  url?: string;
  estimatedCost?: string;
  processingTime?: string;
  renewalPeriod?: string;
  prerequisites?: string[];
  category?: string;
  deadline?: string;
}

function validateJurisdiction(j?: string): Permit['jurisdiction'] {
  const valid = ['federal', 'state', 'county', 'city'] as const;
  return valid.includes(j as Permit['jurisdiction']) ? (j as Permit['jurisdiction']) : 'state';
}

function validateCategory(c?: string): Permit['category'] {
  const valid = ['registration', 'health_safety', 'zoning', 'professional', 'tax', 'employment', 'industry'] as const;
  return valid.includes(c as Permit['category']) ? (c as Permit['category']) : 'registration';
}

/** Fallback extraction when LLM is unavailable */
function fallbackExtract(result: SearchResult, intake: IntakeForm): Permit[] {
  // Only create a permit if the search result seems relevant
  const relevantKeywords = ['permit', 'license', 'registration', 'certificate', 'requirement'];
  const isRelevant = relevantKeywords.some(
    (kw) => result.title.toLowerCase().includes(kw) || result.snippet.toLowerCase().includes(kw)
  );

  if (!isRelevant) return [];

  return [
    {
      id: randomUUID(),
      name: result.title.slice(0, 100),
      issuingAuthority: new URL(result.url).hostname.replace('www.', ''),
      jurisdiction: result.url.includes('.gov') ? 'state' : 'city',
      url: result.url,
      estimatedCost: 'Varies',
      processingTime: 'Varies',
      renewalPeriod: 'Varies',
      prerequisites: [],
      category: 'registration',
      confidence: 'low',
      deadline: 'Check source',
    },
  ];
}
