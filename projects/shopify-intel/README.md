# Shopify App Intel

Competitive intelligence newsletter tool that scrapes the Shopify App Store, tracks changes over time, and generates markdown newsletters.

## Quick Start

```bash
npm install

# Scrape all default categories
node scrape.js

# Scrape specific categories
node scrape.js marketing sales

# Compare two snapshots
node diff.js snapshots/snapshot-old.json snapshots/snapshot-new.json

# Generate newsletter from diff
node newsletter.js diffs/diff-file.json
```

## How It Works

1. **`scrape.js`** — Fetches category pages from apps.shopify.com, extracts app data (name, rating, reviews, pricing, description), and saves a timestamped JSON snapshot.

2. **`diff.js`** — Compares two snapshots and detects:
   - 🆕 New apps added to the store
   - ❌ Apps removed from listings
   - 💰 Pricing changes
   - ⭐ Rating changes (>0.1 threshold)
   - 📝 Review count surges (>10% change)

3. **`newsletter.js`** — Converts a diff file into a formatted markdown newsletter.

## Default Categories

- inventory-management
- marketing
- sales
- customer-service
- shipping-and-delivery

## Data Captured Per App

- App name & handle (slug)
- URL on Shopify App Store
- Pricing tier
- Rating (out of 5)
- Review count
- Description snippet
- Categories
- Date first seen

## Project Structure

```
shopify-intel/
├── scrape.js          # Scraper CLI
├── diff.js            # Diff engine CLI
├── newsletter.js      # Newsletter generator CLI
├── snapshots/         # JSON snapshots (one per run)
├── diffs/             # Diff output files
└── newsletters/       # Generated markdown newsletters
```

## Notes

- Respectful scraping: 1.5s delay between requests, descriptive User-Agent
- No paid services or APIs required
- Uses built-in Node.js fetch + cheerio for HTML parsing
