import { RuleFixFn } from '../types';

export const fixDocumentTitle: RuleFixFn = (context) => {
  return {
    selector: 'head',
    currentHTML: context.html,
    fixedHTML: '<title>Page Title</title>',
    explanation: 'Add a <title> element inside <head>. Replace "Page Title" with a descriptive title for the page.',
    wcagRule: 'WCAG 2.4.2',
    confidence: 'high',
  };
};
