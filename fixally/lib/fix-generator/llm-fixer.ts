import { ViolationContext, FixResult } from './types';

interface LLMFixerConfig {
  apiKey: string;
  maxRetries: number;
  maxCallsPerScan: number;
}

const DEFAULT_CONFIG: LLMFixerConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  maxRetries: 3,
  maxCallsPerScan: 10,
};

async function callClaude(prompt: string, config: LLMFixerConfig): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
      return textBlock?.text || '';
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Exponential backoff
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError || new Error('LLM call failed');
}

export async function llmFix(
  context: ViolationContext,
  config: Partial<LLMFixerConfig> = {}
): Promise<FixResult | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!cfg.apiKey) return null;

  const prompt = `You are an accessibility expert. Fix this HTML accessibility violation.

Rule: ${context.ruleId}
Impact: ${context.impact}
Issue: ${context.failureSummary}
HTML: ${context.html}

Respond with ONLY a JSON object (no markdown):
{
  "fixedHTML": "the corrected HTML",
  "explanation": "brief explanation of the fix",
  "wcagRule": "relevant WCAG criterion"
}`;

  try {
    const response = await callClaude(prompt, cfg);
    const parsed = JSON.parse(response);

    return {
      selector: context.target[0] || '',
      currentHTML: context.html,
      fixedHTML: parsed.fixedHTML || context.html,
      explanation: parsed.explanation || 'Fix suggested by AI',
      wcagRule: parsed.wcagRule || '',
      confidence: 'medium',
    };
  } catch {
    return null;
  }
}
