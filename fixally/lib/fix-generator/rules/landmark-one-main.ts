import { RuleFixFn } from '../types';

export const fixLandmarkOneMain: RuleFixFn = (context) => {
  return {
    selector: 'body',
    currentHTML: context.html || '<body>...page content...</body>',
    fixedHTML: '<body>\n  <main role="main">\n    <!-- primary page content goes here -->\n  </main>\n</body>',
    explanation: 'Page is missing a <main> landmark. Wrap your primary content in a <main> element to help screen reader users navigate.',
    wcagRule: 'WCAG 1.3.1',
    confidence: 'medium',
  };
};
