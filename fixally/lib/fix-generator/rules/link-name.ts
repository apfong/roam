import { RuleFixFn } from '../types';

export const fixLinkName: RuleFixFn = (context) => {
  const html = context.html;
  if (!/<a\b/i.test(html)) return null;

  const hasAriaLabel = /\baria-label\s*=/i.test(html);
  if (hasAriaLabel) return null;

  // Try to infer purpose from href
  const hrefMatch = /\bhref\s*=\s*["']([^"']*)["']/i.exec(html);
  const href = hrefMatch?.[1] || '';

  let label = 'Link';
  if (href) {
    try {
      const url = new URL(href, 'https://example.com');
      label = url.pathname === '/' ? 'Home' : url.pathname.split('/').pop()?.replace(/[-_]/g, ' ') || 'Link';
    } catch {
      label = 'Link';
    }
  }

  const fixedHTML = html.replace(/<a\b/i, `<a aria-label="${label}"`);

  return {
    selector: context.target[0] || 'a',
    currentHTML: html,
    fixedHTML,
    explanation: `Added aria-label="${label}" to link. Replace with a more descriptive label that explains the link's purpose.`,
    wcagRule: 'WCAG 2.4.4',
    confidence: 'medium',
  };
};
