import { RuleFixFn } from '../types';

export const fixHeadingOrder: RuleFixFn = (context) => {
  const html = context.html;
  const match = /<h([1-6])\b/i.exec(html);
  if (!match) return null;

  const currentLevel = parseInt(match[1], 10);
  // We can't know the correct level without page context, so we report it
  return {
    selector: context.target[0] || `h${currentLevel}`,
    currentHTML: html,
    fixedHTML: html, // Can't auto-fix without knowing surrounding heading structure
    explanation: `Heading level <h${currentLevel}> may be out of order. Headings should follow a logical hierarchy (h1 → h2 → h3) without skipping levels.`,
    wcagRule: 'WCAG 1.3.1',
    confidence: 'low',
  };
};
