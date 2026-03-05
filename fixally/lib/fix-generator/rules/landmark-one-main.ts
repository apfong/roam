import { RuleFixFn } from '../types';

export const fixLandmarkOneMain: RuleFixFn = (context) => {
  return {
    selector: 'body',
    currentHTML: context.html,
    fixedHTML: context.html,
    explanation: 'Page is missing a <main> landmark. Wrap your primary content in a <main> element to help screen reader users navigate.',
    wcagRule: 'WCAG 1.3.1',
    confidence: 'medium',
  };
};
