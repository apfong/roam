import { RuleFixFn } from '../types';

export const fixMetaViewport: RuleFixFn = (context) => {
  const html = context.html;
  if (!/<meta\b/i.test(html)) return null;

  let fixedHTML = html;

  // Remove user-scalable=no
  fixedHTML = fixedHTML.replace(/,?\s*user-scalable\s*=\s*no/gi, '');
  // Remove maximum-scale=1 (or similar restrictive values)
  fixedHTML = fixedHTML.replace(/,?\s*maximum-scale\s*=\s*1(\.0)?/gi, '');

  // Clean up double commas or trailing commas in content
  fixedHTML = fixedHTML.replace(/content\s*=\s*["']([^"']*)["']/i, (match, content) => {
    const cleaned = content.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '');
    return `content="${cleaned}"`;
  });

  if (fixedHTML === html) return null;

  return {
    selector: context.target[0] || 'meta[name="viewport"]',
    currentHTML: html,
    fixedHTML,
    explanation: 'Removed zoom-blocking properties (user-scalable=no, maximum-scale=1) from viewport meta tag. Users must be able to zoom to 200%.',
    wcagRule: 'WCAG 1.4.4',
    confidence: 'high',
  };
};
