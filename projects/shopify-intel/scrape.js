#!/usr/bin/env node
/**
 * Shopify App Store Scraper
 * Scrapes app listings by category from apps.shopify.com
 */

import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CATEGORIES = [
  'inventory-management',
  'marketing',
  'sales',
  'customer-service',
  'shipping-and-delivery',
];

const USER_AGENT = 'ShopifyAppIntel/1.0 (competitive-intelligence-newsletter; respectful-scraper)';
const DELAY_MS = 1500; // 1.5s between requests

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parseApps(html, category) {
  const $ = cheerio.load(html);
  const apps = [];

  $('div[data-controller="app-card"]').each((_, el) => {
    const $card = $(el);
    const handle = $card.attr('data-app-card-handle-value');
    const name = $card.attr('data-app-card-name-value');
    const appLink = $card.attr('data-app-card-app-link-value') || '';

    // Rating & reviews from the inner text
    const metaDiv = $card.find('.tw-text-fg-secondary.tw-text-body-xs').first();
    const metaText = metaDiv.text();

    const ratingMatch = metaText.match(/([\d.]+)\s*out of 5 stars/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

    const reviewMatch = metaText.match(/([\d,]+)\s*total reviews/);
    const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : 0;

    // Pricing - look for the pricing span (after the bullet)
    const pricingSpan = metaDiv.find('span.tw-overflow-hidden');
    const pricing = pricingSpan.text().trim() || 'Unknown';

    // Description snippet
    const descDiv = $card.find('.tw-text-fg-secondary.tw-text-body-xs').eq(1);
    const description = descDiv.text().trim() || '';

    // Developer - not directly on category pages, use handle as proxy
    if (handle && name) {
      apps.push({
        handle,
        name: name.trim(),
        url: appLink.replace(/&amp;/g, '&').split('?')[0],
        developer: null, // Would need individual page scrape
        pricing,
        rating,
        reviewCount,
        description,
        category,
      });
    }
  });

  return apps;
}

async function scrapeCategory(category) {
  const url = `https://apps.shopify.com/categories/${category}`;
  console.log(`  Scraping: ${url}`);
  try {
    const html = await fetchPage(url);
    const apps = parseApps(html, category);
    console.log(`  Found ${apps.length} apps in ${category}`);
    return apps;
  } catch (err) {
    console.error(`  Error scraping ${category}: ${err.message}`);
    return [];
  }
}

async function main() {
  const categoriesToScrape = process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : CATEGORIES;

  console.log(`Shopify App Intel — Scraper`);
  console.log(`Categories: ${categoriesToScrape.join(', ')}\n`);

  const allApps = [];
  for (const category of categoriesToScrape) {
    const apps = await scrapeCategory(category);
    allApps.push(...apps);
    if (category !== categoriesToScrape.at(-1)) {
      await sleep(DELAY_MS);
    }
  }

  // Dedupe by handle (app may appear in multiple categories)
  const seen = new Map();
  for (const app of allApps) {
    if (seen.has(app.handle)) {
      // Merge categories
      const existing = seen.get(app.handle);
      if (!existing.categories.includes(app.category)) {
        existing.categories.push(app.category);
      }
    } else {
      seen.set(app.handle, { ...app, categories: [app.category], dateFirstSeen: new Date().toISOString().split('T')[0] });
    }
  }

  const snapshot = {
    timestamp: new Date().toISOString(),
    categories: categoriesToScrape,
    totalApps: seen.size,
    apps: Object.fromEntries(
      [...seen.entries()].map(([handle, app]) => {
        const { category, ...rest } = app;
        return [handle, rest];
      })
    ),
  };

  mkdirSync(join(import.meta.dirname, 'snapshots'), { recursive: true });
  const filename = `snapshot-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
  const filepath = join(import.meta.dirname, 'snapshots', filename);
  writeFileSync(filepath, JSON.stringify(snapshot, null, 2));

  console.log(`\nSnapshot saved: snapshots/${filename}`);
  console.log(`Total unique apps: ${snapshot.totalApps}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
