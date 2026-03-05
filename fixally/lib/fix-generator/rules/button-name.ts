import { RuleFixFn } from '../types';

export const fixButtonName: RuleFixFn = (context) => {
  const html = context.html;
  if (!/<button\b/i.test(html)) return null;

  const hasAriaLabel = /\baria-label\s*=/i.test(html);
  if (hasAriaLabel) return null;

  // Check for icon-only buttons (common pattern)
  const hasText = /<button[^>]*>([^<]+)</i.exec(html);
  if (hasText && hasText[1].trim().length > 0) return null;

  const fixedHTML = html.replace(/<button\b/i, '<button aria-label="Button"');

  return {
    selector: context.target[0] || 'button',
    currentHTML: html,
    fixedHTML,
    explanation: 'Added aria-label to button. Replace "Button" with a description of what this button does.',
    wcagRule: 'WCAG 4.1.2',
    confidence: 'medium',
  };
};
