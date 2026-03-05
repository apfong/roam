/**
 * Quick test: run the scanner on 3 real sites.
 * Usage: node test-scanner.mjs
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const axeSource = fs.readFileSync(
  path.join(process.cwd(), "node_modules", "axe-core", "axe.min.js"),
  "utf-8"
);

async function scanUrl(url) {
  const start = Date.now();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.evaluate(axeSource);
    const results = await page.evaluate(() => {
      return window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
      });
    });
    const duration = Date.now() - start;
    const violations = results.violations;
    const summary = {
      critical: violations.filter(v => v.impact === "critical").length,
      serious: violations.filter(v => v.impact === "serious").length,
      moderate: violations.filter(v => v.impact === "moderate").length,
      minor: violations.filter(v => v.impact === "minor").length,
      total: violations.length,
    };
    return { url, duration, summary, violations: violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })) };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

const testUrls = [
  "https://www.arnoldspestcontrol.com",   // small business
  "https://developer.wordpress.org",       // WordPress site
  "https://www.allbirds.com",              // Shopify store
];

for (const url of testUrls) {
  console.log(`\n🔍 Scanning: ${url}`);
  try {
    const result = await scanUrl(url);
    console.log(`   ⏱  ${(result.duration / 1000).toFixed(1)}s`);
    console.log(`   📊 Summary:`, result.summary);
    console.log(`   Top violations:`);
    result.violations.slice(0, 5).forEach(v => {
      console.log(`      ${v.impact.toUpperCase().padEnd(9)} ${v.id} (${v.nodes} elements) — ${v.help}`);
    });
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
}
