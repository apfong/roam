import { describe, it, expect } from 'vitest';
import { resolveUrl, rewriteUrls } from '@/lib/preview/url-rewriter';

describe('resolveUrl', () => {
  it('resolves relative URLs', () => {
    expect(resolveUrl('/images/logo.png', 'https://example.com/page')).toBe('https://example.com/images/logo.png');
  });

  it('preserves absolute URLs', () => {
    expect(resolveUrl('https://cdn.example.com/style.css', 'https://example.com')).toBe('https://cdn.example.com/style.css');
  });

  it('preserves data URIs', () => {
    expect(resolveUrl('data:image/png;base64,abc', 'https://example.com')).toBe('data:image/png;base64,abc');
  });

  it('preserves hash links', () => {
    expect(resolveUrl('#section', 'https://example.com')).toBe('#section');
  });

  it('preserves mailto links', () => {
    expect(resolveUrl('mailto:test@test.com', 'https://example.com')).toBe('mailto:test@test.com');
  });
});

describe('rewriteUrls', () => {
  it('rewrites img src', () => {
    const html = '<img src="/logo.png">';
    const result = rewriteUrls(html, 'https://example.com');
    expect(result).toContain('src="https://example.com/logo.png"');
  });

  it('rewrites link href', () => {
    const html = '<link rel="stylesheet" href="/style.css">';
    const result = rewriteUrls(html, 'https://example.com');
    expect(result).toContain('href="https://example.com/style.css"');
  });

  it('rewrites script src', () => {
    const html = '<script src="/app.js"></script>';
    const result = rewriteUrls(html, 'https://example.com');
    expect(result).toContain('src="https://example.com/app.js"');
  });

  it('handles srcset', () => {
    const html = '<img srcset="/small.jpg 300w, /large.jpg 800w">';
    const result = rewriteUrls(html, 'https://example.com');
    expect(result).toContain('https://example.com/small.jpg');
    expect(result).toContain('https://example.com/large.jpg');
  });
});
