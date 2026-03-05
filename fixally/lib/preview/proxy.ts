import * as cheerio from 'cheerio';
import { FixResult } from '../fix-generator/types';
import { rewriteUrls } from './url-rewriter';

const MAX_HTML_SIZE = 5 * 1024 * 1024; // 5MB

export interface ProxyResult {
  html: string;
  appliedFixes: number;
  errors: string[];
}

export async function fetchAndPatch(
  url: string,
  fixes: FixResult[]
): Promise<ProxyResult> {
  const errors: string[] = [];

  // Fetch original HTML
  let html: string;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FixA11y/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_HTML_SIZE) {
      throw new Error('Page too large (>5MB)');
    }

    html = await response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch';
    return { html: '', appliedFixes: 0, errors: [message] };
  }

  // Apply fixes
  const $ = cheerio.load(html);
  let appliedFixes = 0;

  for (const fix of fixes) {
    try {
      if (fix.currentHTML === fix.fixedHTML) continue;

      // Try to find and replace the HTML snippet
      const currentHtml = $.html();
      if (currentHtml.includes(fix.currentHTML)) {
        const newHtml = currentHtml.replace(fix.currentHTML, fix.fixedHTML);
        const $new = cheerio.load(newHtml);
        // Reload with patched content
        $.root().html($new.root().html() || '');
        appliedFixes++;
      }
    } catch (err) {
      errors.push(`Failed to apply fix for ${fix.selector}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  // Rewrite URLs to absolute
  const patchedHtml = rewriteUrls($.html(), url);

  // Strip CSP headers can't be done in HTML, but we can remove meta CSP
  const $final = cheerio.load(patchedHtml);
  $final('meta[http-equiv="Content-Security-Policy"]').remove();

  return {
    html: $final.html(),
    appliedFixes,
    errors,
  };
}
