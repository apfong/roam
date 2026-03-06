#!/usr/bin/env node
/**
 * Parse downloaded Florida SOS filing data and generate leads
 * Usage: node scripts/sos-scraper/parse-florida.mjs [YYYYMMDD]
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data/sos-filings');
const OUTPUT_DIR = join(__dirname, '../../data/sos-leads');

const FILING_TYPES = {
  'DOMP': 'Domestic Profit Corporation',
  'DOMNP': 'Domestic Non-Profit Corporation',
  'FORP': 'Foreign Profit Corporation',
  'FORNP': 'Foreign Non-Profit Corporation',
  'DOMLP': 'Domestic Limited Partnership',
  'FORLP': 'Foreign Limited Partnership',
  'FLAL': 'Florida Limited Liability Company',
  'FORL': 'Foreign Limited Liability Company',
  'NPREG': 'Non-Profit Registration',
  'TRUST': 'Declaration of Trust',
  'AGENT': 'Designation of Registered Agent',
};

function extract(line, start, length) {
  return line.substring(start - 1, start - 1 + length).trim();
}

function parseLine(line) {
  if (line.length < 500) return null;
  
  const filingType = extract(line, 206, 15);
  
  const officers = [];
  const starts = [669, 797, 925, 1053, 1181, 1309];
  for (const pos of starts) {
    if (line.length >= pos + 128) {
      const name = extract(line, pos + 5, 42);
      if (name) {
        officers.push({
          title: extract(line, pos, 4),
          name,
          city: extract(line, pos + 89, 28),
          state: extract(line, pos + 117, 2),
        });
      }
    }
  }

  return {
    corpNumber: extract(line, 1, 12),
    corpName: extract(line, 13, 192),
    status: extract(line, 205, 1),
    filingType: filingType.trim(),
    city: extract(line, 305, 28),
    state: extract(line, 333, 2),
    zip: extract(line, 335, 10),
    fileDate: extract(line, 473, 8),
    registeredAgent: extract(line, 545, 42),
    officers,
  };
}

// Main
const dateStr = process.argv[2] || (() => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
})();

const filePath = join(DATA_DIR, `${dateStr}c.txt`);
console.log(`Parsing ${filePath}...\n`);

const content = readFileSync(filePath, 'latin1');
const lines = content.split('\n').filter(l => l.length > 100);
console.log(`Total lines: ${lines.length}`);

const filings = lines.map(parseLine).filter(Boolean);
console.log(`Parsed filings: ${filings.length}`);

// Filter: new FL businesses only (active, domestic types)
const targetTypes = ['FLAL', 'DOMP', 'DOMLP'];
const newBiz = filings.filter(f => 
  f.status === 'A' && 
  targetTypes.includes(f.filingType)
);
console.log(`New FL businesses (LLC/Corp/LP): ${newBiz.length}`);

// Generate leads
const leads = newBiz.map(f => {
  const bizType = f.filingType === 'FLAL' ? 'llc' : 
                  f.filingType === 'DOMP' ? 'corporation' : 'limited_partnership';
  return {
    corpNumber: f.corpNumber,
    corpName: f.corpName,
    filingType: f.filingType,
    filingTypeLabel: FILING_TYPES[f.filingType] || f.filingType,
    city: f.city,
    state: 'FL',
    zip: f.zip,
    officer: f.officers[0]?.name || '',
    registeredAgent: f.registeredAgent,
    fileDate: f.fileDate,
    reportUrl: `https://compliancekit-one.vercel.app?ref=sos&state=FL&city=${encodeURIComponent(f.city)}&type=${bizType}`,
  };
});

// Save
mkdirSync(OUTPUT_DIR, { recursive: true });
const outPath = join(OUTPUT_DIR, `${dateStr}-fl-leads.json`);
writeFileSync(outPath, JSON.stringify(leads, null, 2));
console.log(`\nSaved ${leads.length} leads to ${outPath}`);

// Stats
console.log('\n--- Filing Type Breakdown ---');
const byType = {};
for (const l of leads) { byType[l.filingTypeLabel] = (byType[l.filingTypeLabel] || 0) + 1; }
for (const [t, c] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t}: ${c}`);
}

console.log('\n--- Top 10 Cities ---');
const byCity = {};
for (const l of leads) { byCity[l.city] = (byCity[l.city] || 0) + 1; }
for (const [c, n] of Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${c}: ${n}`);
}

console.log('\n--- Sample Leads ---');
for (const l of leads.slice(0, 5)) {
  console.log(`  ${l.corpName} (${l.filingTypeLabel})`);
  console.log(`    ${l.city}, FL | Officer: ${l.officer}`);
  console.log(`    ${l.reportUrl}\n`);
}
