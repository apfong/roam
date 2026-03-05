import { RuleFixFn } from '../types';

export const fixLabel: RuleFixFn = (context) => {
  const html = context.html;

  // Check for input/select/textarea without label
  const inputMatch = /(<(?:input|select|textarea)\b[^>]*>)/i.exec(html);
  if (!inputMatch) return null;

  const element = inputMatch[1];
  const hasAriaLabel = /\baria-label\s*=/i.test(element);
  const hasAriaLabelledBy = /\baria-labelledby\s*=/i.test(element);

  if (hasAriaLabel || hasAriaLabelledBy) return null;

  // Extract type and name/id for a reasonable label
  const typeMatch = /\btype\s*=\s*["']([^"']*)["']/i.exec(element);
  const nameMatch = /\bname\s*=\s*["']([^"']*)["']/i.exec(element);
  const idMatch = /\bid\s*=\s*["']([^"']*)["']/i.exec(element);
  const placeholderMatch = /\bplaceholder\s*=\s*["']([^"']*)["']/i.exec(element);

  const labelText = placeholderMatch?.[1] || nameMatch?.[1] || idMatch?.[1] || typeMatch?.[1] || 'Input field';

  const fixedHTML = element.replace(
    /(<(?:input|select|textarea)\b)/i,
    `$1 aria-label="${labelText}"`
  );

  return {
    selector: context.target[0] || 'input',
    currentHTML: html,
    fixedHTML: html.replace(element, fixedHTML),
    explanation: `Added aria-label="${labelText}" to form element. For better accessibility, use a visible <label> element instead.`,
    wcagRule: 'WCAG 1.3.1',
    confidence: 'medium',
  };
};
