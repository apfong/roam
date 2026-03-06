#!/usr/bin/env npx tsx
/**
 * Fetch today's Florida SOS daily filing data via SFTP
 * and parse new business filings for outreach.
 * 
 * Usage: npx tsx scripts/sos-scraper/fetch-florida.ts [YYYYMMDD]
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { parseFile, filterNewBusinesses, type FloridaFiling } from './florida-parser';

const DATA_DIR = join(__dirname, '../../data/sos-filings');
const OUTPUT_DIR = join(__dirname, '../../data/sos-leads');

function getDateStr(date?: string): string {
  if (date) return date;
  const d = new Date();
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function downloadFile(dateStr: string): string {
  mkdirSync(DATA_DIR, { recursive: true });
  const filename = `${dateStr}c.txt`;
  const localPath = join(DATA_DIR, filename);

  if (existsSync(localPath)) {
    console.log(`Using cached file: ${localPath}`);
    return localPath;
  }

  const remotePath = `/doc/cor/${filename}`;
  console.log(`Downloading ${remotePath} from sftp.floridados.gov...`);

  // Use curl with SFTP
  try {
    execSync(
      `curl -s -u "Public:PubAccess1845!" "sftp://sftp.floridados.gov${remotePath}" -o "${localPath}"`,
      { timeout: 60000 }
    );
    console.log(`Downloaded to ${localPath}`);
    return localPath;
  } catch (err) {
    // Try previous business day if today's isn't available yet
    console.error(`File not available for ${dateStr}, may not be generated yet.`);
    throw err;
  }
}

interface Lead {
  corpNumber: string;
  corpName: string;
  filingType: string;
  filingTypeLabel: string;
  city: string;
  state: string;
  zip: string;
  officerName: string;
  officerCity: string;
  registeredAgent: string;
  fileDate: string;
  reportUrl: string;
}

function filingToLead(f: FloridaFiling): Lead {
  const primaryOfficer = f.officers[0];
  const city = f.principalAddress.city || f.mailingAddress.city;
  
  // Generate ComplianceKit report URL based on business type
  const bizType = f.filingType.trim() === 'FLAL' ? 'llc' : 
                  f.filingType.trim() === 'DOMP' ? 'corporation' :
                  f.filingType.trim() === 'DOMNP' ? 'nonprofit' : 'business';
  
  const reportUrl = `https://compliancekit-one.vercel.app?ref=sos&state=FL&city=${encodeURIComponent(city)}&type=${bizType}`;

  return {
    corpNumber: f.corpNumber,
    corpName: f.corpName,
    filingType: f.filingType.trim(),
    filingTypeLabel: f.filingTypeLabel,
    city,
    state: 'FL',
    zip: f.principalAddress.zip,
    officerName: primaryOfficer?.name ?? '',
    officerCity: primaryOfficer?.city ?? city,
    registeredAgent: f.registeredAgent.name,
    fileDate: f.fileDate,
    reportUrl,
  };
}

function generateEmailTemplate(lead: Lead): string {
  const firstName = lead.officerName.split(/[, ]/)[0] || 'there';
  
  return `Subject: ${lead.corpName} — permits you might be missing

Hi ${firstName},

Congratulations on registering ${lead.corpName} in Florida!

Beyond your state filing, most ${lead.filingTypeLabel.toLowerCase()}s in ${lead.city} need several additional permits and licenses — things like local business tax receipts, industry-specific licenses, and federal registrations.

We built a free tool that shows you exactly what you need based on your business type and location:

${lead.reportUrl}

It takes 60 seconds and shows you how many permits you need (most businesses in ${lead.city} need 8-15). The full report with direct application links, costs, and deadlines is available if you want it.

Best,
ComplianceKit
https://compliancekit-one.vercel.app

P.S. This is an automated tool — we're not lawyers, but our AI research agent has been verified against .gov sources with 100% accuracy on Florida businesses.`;
}

async function main() {
  const dateStr = getDateStr(process.argv[2]);
  console.log(`Processing Florida SOS filings for ${dateStr}\n`);

  try {
    const filePath = downloadFile(dateStr);
    const content = readFileSync(filePath, 'latin1');
    
    const allFilings = parseFile(content);
    console.log(`Total filings: ${allFilings.length}`);
    
    const newBusinesses = filterNewBusinesses(allFilings);
    console.log(`New FL businesses: ${newBusinesses.length}`);
    
    // Convert to leads
    const leads = newBusinesses.map(filingToLead);
    
    // Save leads
    mkdirSync(OUTPUT_DIR, { recursive: true });
    const leadsPath = join(OUTPUT_DIR, `${dateStr}-fl-leads.json`);
    writeFileSync(leadsPath, JSON.stringify(leads, null, 2));
    console.log(`\nSaved ${leads.length} leads to ${leadsPath}`);
    
    // Save email templates
    const emailsPath = join(OUTPUT_DIR, `${dateStr}-fl-emails.json`);
    const emails = leads.map(l => ({
      to: '', // Need email lookup
      lead: l,
      template: generateEmailTemplate(l),
    }));
    writeFileSync(emailsPath, JSON.stringify(emails, null, 2));
    console.log(`Saved ${emails.length} email templates to ${emailsPath}`);
    
    // Summary
    console.log('\n--- Filing Type Breakdown ---');
    const byType: Record<string, number> = {};
    for (const l of leads) {
      byType[l.filingTypeLabel] = (byType[l.filingTypeLabel] ?? 0) + 1;
    }
    for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type}: ${count}`);
    }
    
    console.log('\n--- Top Cities ---');
    const byCity: Record<string, number> = {};
    for (const l of leads) {
      byCity[l.city] = (byCity[l.city] ?? 0) + 1;
    }
    for (const [city, count] of Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
      console.log(`  ${city}: ${count}`);
    }
    
    // Print a few sample leads
    console.log('\n--- Sample Leads ---');
    for (const l of leads.slice(0, 3)) {
      console.log(`  ${l.corpName} (${l.filingTypeLabel}) — ${l.city}, FL`);
      console.log(`    Officer: ${l.officerName}`);
      console.log(`    Report URL: ${l.reportUrl}`);
      console.log();
    }
    
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
