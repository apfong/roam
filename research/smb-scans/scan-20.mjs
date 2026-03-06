/**
 * Scan 20 real SMB websites for accessibility issues using axe-core + puppeteer.
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// Use puppeteer from fixally's node_modules
const puppeteer = require("/home/frigidaire/roam/fixally/node_modules/puppeteer");
import fs from "fs";
import path from "path";

const axeSource = fs.readFileSync(
  path.join("/home/frigidaire/roam/fixally/node_modules", "axe-core", "axe.min.js"),
  "utf-8"
);

const SMB_SITES = [
  { name: "Joe's Pizza NYC", url: "https://www.joespizzanyc.com", type: "restaurant" },
  { name: "Mama's Fish House", url: "https://www.mamasfishhouse.com", type: "restaurant" },
  { name: "The Spotted Pig", url: "https://www.thespottedpig.com", type: "restaurant" },
  { name: "Bouchon Bakery", url: "https://www.bouchonbakery.com", type: "bakery" },
  { name: "Aspen Dental", url: "https://www.aspendental.com", type: "dentist" },
  { name: "Gentle Dental", url: "https://www.gentledental.com", type: "dentist" },
  { name: "Roto-Rooter", url: "https://www.rotorooter.com", type: "plumber" },
  { name: "Mr. Rooter Plumbing", url: "https://www.mrrooter.com", type: "plumber" },
  { name: "Two Men and a Truck", url: "https://www.twomenandatruck.com", type: "moving" },
  { name: "Meineke", url: "https://www.meineke.com", type: "auto repair" },
  { name: "Jiffy Lube", url: "https://www.jiffylube.com", type: "auto repair" },
  { name: "Sport Clips", url: "https://www.sportclips.com", type: "hair salon" },
  { name: "Great Clips", url: "https://www.greatclips.com", type: "hair salon" },
  { name: "PetSuites", url: "https://www.petsuites.com", type: "pet care" },
  { name: "Kumon", url: "https://www.kumon.com", type: "tutoring" },
  { name: "Mathnasium", url: "https://www.mathnasium.com", type: "tutoring" },
  { name: "Anytime Fitness", url: "https://www.anytimefitness.com", type: "gym" },
  { name: "European Wax Center", url: "https://www.waxcenter.com", type: "beauty" },
  { name: "Batteries Plus", url: "https://www.batteriesplus.com", type: "retail" },
  { name: "Ace Hardware", url: "https://www.acehardware.com", type: "hardware store" },
];

async function scanUrl(url, timeout = 30000) {
  let browser;
  const start = Date.now();
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.goto(url, { waitUntil: "networkidle2", timeout });
    await page.evaluate(axeSource);
    const results = await page.evaluate(() => {
      return window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
      });
    });
    const duration = Date.now() - start;
    return {
      url, duration,
      violations: results.violations.map(v => ({
        id: v.id, impact: v.impact, help: v.help,
        description: v.description,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
        tags: v.tags,
      })),
      summary: {
        critical: results.violations.filter(v => v.impact === "critical").length,
        serious: results.violations.filter(v => v.impact === "serious").length,
        moderate: results.violations.filter(v => v.impact === "moderate").length,
        minor: results.violations.filter(v => v.impact === "minor").length,
        total: results.violations.length,
        totalElements: results.violations.reduce((s, v) => s + v.nodes.length, 0),
      },
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

const allResults = [];

for (const site of SMB_SITES) {
  console.log(`🔍 Scanning: ${site.name} (${site.url})`);
  try {
    const result = await scanUrl(site.url);
    const entry = { ...site, ...result };
    allResults.push(entry);
    console.log(`   ✅ ${result.summary.total} violations (${result.summary.critical} critical, ${result.summary.serious} serious) affecting ${result.summary.totalElements} elements in ${(result.duration/1000).toFixed(1)}s`);
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    allResults.push({ ...site, error: err.message, violations: [], summary: { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0, totalElements: 0 } });
  }
}

// Save results
fs.writeFileSync(
  path.join("/home/frigidaire/roam/research/smb-scans", "results.json"),
  JSON.stringify(allResults, null, 2)
);

// Save markdown summary
let md = "# SMB Accessibility Scan Results\n\nScanned on " + new Date().toISOString().split("T")[0] + "\n\n";
md += "| # | Business | Type | Critical | Serious | Moderate | Minor | Total Issues | Elements |\n";
md += "|---|----------|------|----------|---------|----------|-------|-------------|----------|\n";
allResults.forEach((r, i) => {
  if (r.error) {
    md += `| ${i+1} | ${r.name} | ${r.type} | ERROR | - | - | - | ${r.error} | - |\n`;
  } else {
    md += `| ${i+1} | ${r.name} | ${r.type} | ${r.summary.critical} | ${r.summary.serious} | ${r.summary.moderate} | ${r.summary.minor} | ${r.summary.total} | ${r.summary.totalElements} |\n`;
  }
});

md += "\n## Detailed Violations\n\n";
allResults.forEach((r, i) => {
  if (r.error) return;
  md += `### ${i+1}. ${r.name} (${r.url})\n\n`;
  if (r.violations.length === 0) {
    md += "No violations found.\n\n";
    return;
  }
  r.violations.sort((a, b) => {
    const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
    return (order[a.impact] ?? 4) - (order[b.impact] ?? 4);
  });
  r.violations.forEach(v => {
    md += `- **${v.impact.toUpperCase()}** \`${v.id}\` — ${v.help} (${v.nodes} elements)\n`;
  });
  md += "\n";
});

fs.writeFileSync(
  path.join("/home/frigidaire/roam/research/smb-scans", "results.md"),
  md
);

console.log("\n✅ All scans complete. Results saved to research/smb-scans/");
