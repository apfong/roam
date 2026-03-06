import { RuleFixFn } from '../types';

function parseColorsFromSummary(summary: string): { fg?: string; bg?: string } {
  // axe failureSummary contains patterns like "foreground color: #aabbcc, background color: #ddeeff"
  const fgMatch = summary.match(/foreground\s*(?:color)?[:\s]+([#\w]+(?:\([^)]*\))?)/i);
  const bgMatch = summary.match(/background\s*(?:color)?[:\s]+([#\w]+(?:\([^)]*\))?)/i);
  return { fg: fgMatch?.[1], bg: bgMatch?.[1] };
}

function darkenColor(hex: string): string {
  // Rough darken: reduce each RGB channel by 40% to improve contrast on light bg
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#000000';
  const r = Math.max(0, Math.round(parseInt(clean.slice(0, 2), 16) * 0.5));
  const g = Math.max(0, Math.round(parseInt(clean.slice(2, 4), 16) * 0.5));
  const b = Math.max(0, Math.round(parseInt(clean.slice(4, 6), 16) * 0.5));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export const fixColorContrast: RuleFixFn = (context) => {
  const { fg, bg } = parseColorsFromSummary(context.failureSummary || '');
  const currentHTML = context.html || '';

  let fixedHTML = currentHTML;
  if (fg) {
    const betterColor = darkenColor(fg);
    // Insert or replace inline style with improved color
    if (currentHTML.includes('style="')) {
      fixedHTML = currentHTML.replace(/style="([^"]*)"/, `style="$1; color: ${betterColor}"`);
    } else {
      // Add style to the first tag
      fixedHTML = currentHTML.replace(/<(\w+)/, `<$1 style="color: ${betterColor}"`);
    }
  } else {
    // No color info parsed — still show a meaningful diff
    if (currentHTML.includes('style="')) {
      fixedHTML = currentHTML.replace(/style="([^"]*)"/, 'style="$1; color: /* use darker color for 4.5:1 ratio */"');
    } else {
      fixedHTML = currentHTML.replace(/<(\w+)/, '<$1 style="color: /* use darker color for 4.5:1 ratio */"');
    }
  }

  return {
    selector: context.target[0] || '',
    currentHTML,
    fixedHTML,
    explanation: `Color contrast is insufficient. ${context.failureSummary || 'Foreground and background colors do not meet WCAG AA ratio'}. Adjust foreground/background colors to meet WCAG AA ratio (4.5:1 for normal text, 3:1 for large text).`,
    wcagRule: 'WCAG 1.4.3',
    confidence: 'low',
  };
};
