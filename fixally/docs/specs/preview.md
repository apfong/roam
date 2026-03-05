# Preview System Spec

## Overview
Fetches original HTML, applies fixes via Cheerio, serves modified version with rewritten URLs.

## Components
- `proxy.ts` — Fetch HTML, apply FixResult[] via Cheerio, return modified HTML
- `url-rewriter.ts` — Convert relative URLs to absolute (src, href, action, srcset)

## API
- `POST /api/preview` — Body: `{ url: string, fixes: FixResult[] }` → Returns modified HTML
- Preview served in iframe on frontend

## Edge Cases
- CSP headers: strip Content-Security-Policy from proxied response
- Relative paths: rewrite all src/href to absolute using base URL
- Encoding: handle UTF-8, ISO-8859-1
- Large pages: 5MB limit
