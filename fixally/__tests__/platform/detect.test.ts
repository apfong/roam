import { describe, it, expect } from 'vitest';
import { detectPlatform, getPlatformInstructions } from '@/lib/platform/detect';

describe('detectPlatform', () => {
  it('detects WordPress', () => {
    const html = '<link rel="stylesheet" href="/wp-content/themes/theme/style.css"><meta name="generator" content="WordPress 6.4">';
    const result = detectPlatform(html);
    expect(result.platform).toBe('wordpress');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('detects Shopify', () => {
    const html = '<script src="https://cdn.shopify.com/s/files/1/assets/theme.js"></script>';
    const result = detectPlatform(html);
    expect(result.platform).toBe('shopify');
  });

  it('detects Squarespace', () => {
    const html = '<script src="https://static.squarespace.com/universal/scripts/main.js"></script>';
    const result = detectPlatform(html);
    expect(result.platform).toBe('squarespace');
  });

  it('detects Framer', () => {
    const html = '<div data-framer-component="true"><script src="https://framer.com/m/script.js"></script></div>';
    const result = detectPlatform(html);
    expect(result.platform).toBe('framer');
  });

  it('detects Webflow', () => {
    const html = '<div class="w-container"><script src="https://assets.website-files.com/app.js"></script>';
    const result = detectPlatform(html);
    expect(result.platform).toBe('webflow');
  });

  it('returns null for unknown platforms', () => {
    const html = '<html><body><p>Just a plain page</p></body></html>';
    const result = detectPlatform(html);
    expect(result.platform).toBeNull();
    expect(result.confidence).toBe(0);
  });
});

describe('getPlatformInstructions', () => {
  it('returns instructions for known platforms', () => {
    expect(getPlatformInstructions('wordpress')).toContain('WP Accessibility');
    expect(getPlatformInstructions('shopify')).toContain('theme');
  });

  it('returns generic instructions for unknown platforms', () => {
    expect(getPlatformInstructions('unknown')).toContain('HTML source code');
  });
});
