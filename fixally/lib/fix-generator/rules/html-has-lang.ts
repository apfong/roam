import { RuleFixFn } from '../types';

export const fixHtmlHasLang: RuleFixFn = (context) => {
  const html = context.html;
  if (!/<html\b/i.test(html)) return null;

  const hasLang = /\blang\s*=/i.test(html);
  if (hasLang) return null;

  const fixedHTML = html.replace(/<html\b/i, '<html lang="en"');

  return {
    selector: 'html',
    currentHTML: html,
    fixedHTML,
    explanation: 'Added lang="en" to <html> element. Change the language code if the page is not in English.',
    wcagRule: 'WCAG 3.1.1',
    confidence: 'high',
  };
};
