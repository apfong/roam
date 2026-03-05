# Fix Generator Spec

## Overview
Maps axe-core violation IDs to deterministic fix functions. Falls back to LLM for complex cases.

## Data Types
```typescript
interface FixResult {
  selector: string;
  currentHTML: string;
  fixedHTML: string;
  explanation: string;
  wcagRule: string;
  confidence: 'high' | 'medium' | 'low';
}

interface ViolationContext {
  ruleId: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  html: string;
  target: string[];
  failureSummary: string;
  pageUrl: string;
}
```

## Rule Engine
- `ruleEngine.getFixer(ruleId)` returns a fix function or null
- `ruleEngine.generateFix(context)` tries deterministic fix, falls back to LLM
- Each rule: `(context: ViolationContext) => FixResult | null`

## Top 10 Rules
1. **image-alt** — Add alt="" to decorative images, placeholder alt for meaningful
2. **label** — Wrap input with label or add aria-label
3. **color-contrast** — Report issue, suggest contrast ratio fix (CSS-level)
4. **link-name** — Add aria-label to empty links
5. **button-name** — Add aria-label to empty buttons
6. **html-has-lang** — Add lang="en" to html element
7. **document-title** — Add <title> element
8. **heading-order** — Report incorrect heading level, suggest correct level
9. **landmark-one-main** — Wrap content in <main> or add role="main"
10. **meta-viewport** — Fix/remove maximum-scale, user-scalable=no

## LLM Fallback
- Used for: image alt text (needs vision), complex ARIA patterns
- Retry: 3 attempts with exponential backoff
- Rate limit: max 10 LLM calls per scan
