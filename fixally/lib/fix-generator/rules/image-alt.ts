import { RuleFixFn } from '../types';

export const fixImageAlt: RuleFixFn = (context) => {
  const html = context.html;
  if (!html.includes('<img')) return null;

  // Check if alt attribute exists but is missing
  const hasAlt = /\balt\s*=/i.test(html);

  let fixedHTML: string;
  let explanation: string;

  if (!hasAlt) {
    // Add alt="" for decorative, or placeholder for likely meaningful images
    const hasSrc = /\bsrc\s*=\s*["']([^"']*)["']/i.exec(html);
    const srcValue = hasSrc?.[1] || '';
    const isLikelyDecorative = /spacer|divider|border|bg|background|pixel/i.test(srcValue);

    if (isLikelyDecorative) {
      fixedHTML = html.replace(/<img/i, '<img alt=""');
      explanation = 'Added empty alt="" for decorative image. Screen readers will skip this image.';
    } else {
      fixedHTML = html.replace(/<img/i, '<img alt="[Descriptive alt text needed]"');
      explanation = 'Added placeholder alt text. Replace with a meaningful description of the image content.';
    }
  } else {
    // alt exists but might be problematic (e.g., alt="image", alt="photo")
    fixedHTML = html;
    explanation = 'Image has an alt attribute but it may not be descriptive enough. Review the alt text.';
    return {
      selector: context.target[0] || 'img',
      currentHTML: html,
      fixedHTML,
      explanation,
      wcagRule: 'WCAG 1.1.1',
      confidence: 'low',
    };
  }

  return {
    selector: context.target[0] || 'img',
    currentHTML: html,
    fixedHTML,
    explanation,
    wcagRule: 'WCAG 1.1.1',
    confidence: hasAlt ? 'low' : 'high',
  };
};
