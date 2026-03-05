/**
 * FixA11y Core Scanner
 * Uses Puppeteer + axe-core to scan a URL for WCAG accessibility violations.
 */

import puppeteer, { Browser } from "puppeteer";
import * as fs from "fs";
import * as path from "path";

export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface Violation {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  help: string;
  helpUrl: string;
  wcagTags: string[];
  nodes: ViolationNode[];
}

export interface ScanResult {
  url: string;
  scannedAt: string;
  duration: number;
  violations: Violation[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  error?: string;
}

const SCAN_TIMEOUT = 30_000;

// Read axe-core source once
const axeSource = fs.readFileSync(
  path.join(process.cwd(), "node_modules", "axe-core", "axe.min.js"),
  "utf-8"
);

export async function scanUrl(url: string): Promise<ScanResult> {
  const start = Date.now();
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: SCAN_TIMEOUT,
    });

    // Inject axe-core
    await page.evaluate(axeSource);

    // Run axe analysis
    const axeResults = await page.evaluate(() => {
      return new Promise<any>((resolve, reject) => {
        // @ts-ignore - axe is injected globally
        (window as any).axe
          .run(document, {
            runOnly: {
              type: "tag",
              values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
            },
          })
          .then(resolve)
          .catch(reject);
      });
    });

    const violations: Violation[] = axeResults.violations.map((v: any) => ({
      id: v.id,
      impact: v.impact || "minor",
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      wcagTags: v.tags.filter(
        (t: string) =>
          t.startsWith("wcag") || t === "best-practice"
      ),
      nodes: v.nodes.map((n: any) => ({
        html: n.html,
        target: n.target,
        failureSummary: n.failureSummary || "",
      })),
    }));

    const summary = {
      critical: violations.filter((v) => v.impact === "critical").length,
      serious: violations.filter((v) => v.impact === "serious").length,
      moderate: violations.filter((v) => v.impact === "moderate").length,
      minor: violations.filter((v) => v.impact === "minor").length,
      total: violations.length,
    };

    return {
      url,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - start,
      violations,
      summary,
    };
  } catch (err: any) {
    return {
      url,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - start,
      violations: [],
      summary: { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 },
      error: err.message || "Unknown error during scan",
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
