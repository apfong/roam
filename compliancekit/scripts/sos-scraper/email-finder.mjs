#!/usr/bin/env node
/**
 * Email finder for SOS leads
 * 
 * Strategy (in order):
 * 1. Derive domain from business name → check if domain exists → try common patterns
 * 2. Hunter.io API (if key provided) — 50 free/mo
 * 3. Fall back to "no email found" — these go into the SEO/retarget bucket
 * 
 * Usage: node scripts/sos-scraper/email-finder.mjs <leads-file.json>
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve as dnsResolve } from 'dns/promises';

const HUNTER_API_KEY = process.env.HUNTER_API_KEY || '';

// Common email patterns
const EMAIL_PATTERNS = [
  (first, last, domain) => `${first}@${domain}`,
  (first, last, domain) => `${first}.${last}@${domain}`,
  (first, last, domain) => `${first[0]}${last}@${domain}`,
  (first, last, domain) => `info@${domain}`,
  (first, last, domain) => `contact@${domain}`,
  (first, last, domain) => `hello@${domain}`,
];

function businessNameToDomain(name) {
  // "ACME SOLUTIONS LLC" → "acmesolutions.com"
  return name
    .toLowerCase()
    .replace(/,?\s*(llc|inc|corp|ltd|co|llp|lp|pllc|pa|dba)\.?$/i, '')
    .replace(/[^a-z0-9]/g, '')
    + '.com';
}

function parseOfficerName(raw) {
  // FL format: "LASTNAME            FIRSTNAME     MI"
  const parts = raw.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { first: parts[1].toLowerCase(), last: parts[0].toLowerCase() };
  }
  return null;
}

async function checkDomain(domain) {
  try {
    await dnsResolve(domain, 'A');
    return true;
  } catch {
    try {
      await dnsResolve(domain, 'MX');
      return true;
    } catch {
      return false;
    }
  }
}

async function hunterLookup(domain, firstName, lastName) {
  if (!HUNTER_API_KEY) return null;
  try {
    const url = `https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${firstName}&last_name=${lastName}&api_key=${HUNTER_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.data?.email && data.data?.score > 50) {
      return { email: data.data.email, score: data.data.score, source: 'hunter' };
    }
  } catch {}
  return null;
}

async function findEmail(lead) {
  const domain = businessNameToDomain(lead.corpName);
  const officer = parseOfficerName(lead.officer);
  
  // Step 1: Check if domain exists
  const domainExists = await checkDomain(domain);
  
  if (domainExists && officer) {
    // Step 2: Try Hunter.io if available
    const hunterResult = await hunterLookup(domain, officer.first, officer.last);
    if (hunterResult) return { ...hunterResult, domain };
    
    // Step 3: Return best-guess pattern
    return {
      email: `${officer.first}@${domain}`,
      score: 30,
      source: 'guess',
      domain,
      alternatives: EMAIL_PATTERNS.map(p => p(officer.first, officer.last, domain)),
    };
  }
  
  if (domainExists) {
    return {
      email: `info@${domain}`,
      score: 20,
      source: 'guess',
      domain,
    };
  }
  
  return { email: null, score: 0, source: 'none', domain, domainExists: false };
}

// Main
const leadsFile = process.argv[2];
if (!leadsFile) {
  console.error('Usage: node email-finder.mjs <leads-file.json>');
  process.exit(1);
}

const leads = JSON.parse(readFileSync(leadsFile, 'utf-8'));
console.log(`Processing ${leads.length} leads...\n`);

// Process in batches to avoid DNS flooding
const BATCH_SIZE = 20;
const results = [];
let found = 0, guessed = 0, notFound = 0;

for (let i = 0; i < leads.length; i += BATCH_SIZE) {
  const batch = leads.slice(i, i + BATCH_SIZE);
  const batchResults = await Promise.all(batch.map(async (lead) => {
    const emailResult = await findEmail(lead);
    return { ...lead, emailResult };
  }));
  results.push(...batchResults);
  
  for (const r of batchResults) {
    if (r.emailResult.source === 'hunter') found++;
    else if (r.emailResult.email) guessed++;
    else notFound++;
  }
  
  if ((i + BATCH_SIZE) % 200 === 0) {
    console.log(`  Processed ${Math.min(i + BATCH_SIZE, leads.length)}/${leads.length}...`);
  }
}

// Summary
console.log(`\n--- Email Lookup Results ---`);
console.log(`  Hunter verified: ${found}`);
console.log(`  Domain guess: ${guessed}`);
console.log(`  No email: ${notFound}`);
console.log(`  Total with email: ${found + guessed} (${((found + guessed) / leads.length * 100).toFixed(1)}%)`);

// Save enriched leads
const outPath = leadsFile.replace('.json', '-enriched.json');
writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nSaved to ${outPath}`);

// Save email-ready leads (only those with emails)
const emailReady = results.filter(r => r.emailResult.email);
const emailPath = leadsFile.replace('.json', '-email-ready.json');
writeFileSync(emailPath, JSON.stringify(emailReady, null, 2));
console.log(`Email-ready leads: ${emailReady.length} → ${emailPath}`);
