#!/usr/bin/env node
/**
 * Cold email sender for ComplianceKit SOS leads
 * Uses Resend API (100 free emails/day on free tier, $20/mo for 50K)
 * 
 * Usage: 
 *   RESEND_API_KEY=re_xxx node send-emails.mjs <email-ready-leads.json> [--dry-run] [--limit 10]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SENT_LOG = join(__dirname, '../../data/sos-leads/sent-log.json');
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'hello@compliancekit.co'; // Need to set up domain in Resend

function titleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function generateEmail(lead) {
  const officerParts = lead.officer?.trim().split(/\s+/) || [];
  const firstName = officerParts.length >= 2 ? titleCase(officerParts[1]) : 'there';
  const bizName = titleCase(lead.corpName.replace(/,?\s*(LLC|INC|CORP)\.?$/i, ''));
  const city = titleCase(lead.city);
  const typeLabel = lead.filingType === 'FLAL' ? 'LLC' : 'corporation';

  return {
    subject: `${bizName} — permits you might need in ${city}`,
    html: `
<p>Hi ${firstName},</p>

<p>Congrats on registering <strong>${lead.corpName}</strong> in Florida!</p>

<p>Beyond your state filing, most ${typeLabel}s in ${city} need several additional permits — local business tax receipts, industry-specific licenses, federal registrations, and more.</p>

<p>We built a free tool that shows you exactly what you need:</p>

<p><a href="${lead.reportUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Find My Permits →</a></p>

<p>It takes 60 seconds and shows how many permits you need (most businesses in ${city} need 8-15). Full details with application links and costs available in the report.</p>

<p>Best,<br>ComplianceKit</p>

<p style="color:#9ca3af;font-size:12px;">This is an automated tool — we're not lawyers, but our AI research agent has been verified against .gov sources. <a href="{{{unsubscribe_url}}}">Unsubscribe</a></p>
    `.trim(),
    text: `Hi ${firstName},

Congrats on registering ${lead.corpName} in Florida!

Beyond your state filing, most ${typeLabel}s in ${city} need several additional permits — local business tax receipts, industry-specific licenses, federal registrations, and more.

We built a free tool that shows you exactly what you need:
${lead.reportUrl}

It takes 60 seconds and shows how many permits you need (most businesses in ${city} need 8-15).

Best,
ComplianceKit`
  };
}

async function sendEmail(to, email) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY required');
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${res.status} ${err}`);
  }
  return res.json();
}

// Main
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : Infinity;
const leadsFile = args.find(a => a.endsWith('.json'));

if (!leadsFile) {
  console.error('Usage: node send-emails.mjs <leads.json> [--dry-run] [--limit N]');
  process.exit(1);
}

// Load sent log to avoid duplicates
const sentLog = existsSync(SENT_LOG) ? JSON.parse(readFileSync(SENT_LOG, 'utf-8')) : {};

const leads = JSON.parse(readFileSync(leadsFile, 'utf-8'));
const toSend = leads
  .filter(l => l.emailResult?.email && !sentLog[l.corpNumber])
  .slice(0, limit);

console.log(`Leads: ${leads.length} | With email: ${leads.filter(l => l.emailResult?.email).length} | New to send: ${toSend.length}`);
if (dryRun) console.log('🏜️  DRY RUN — no emails will be sent\n');

let sent = 0, failed = 0;
for (const lead of toSend) {
  const email = generateEmail(lead);
  const to = lead.emailResult.email;
  
  if (dryRun) {
    console.log(`[DRY] To: ${to} | Subject: ${email.subject}`);
    sent++;
    continue;
  }

  try {
    if (!RESEND_API_KEY) {
      console.log(`[SKIP] No API key — To: ${to} | Subject: ${email.subject}`);
      sent++;
      continue;
    }
    const result = await sendEmail(to, email);
    sentLog[lead.corpNumber] = { email: to, sentAt: new Date().toISOString(), resendId: result.id };
    sent++;
    console.log(`[SENT] ${to} — ${email.subject}`);
    
    // Rate limit: ~2/sec to stay under Resend limits
    await new Promise(r => setTimeout(r, 500));
  } catch (err) {
    console.error(`[FAIL] ${to} — ${err.message}`);
    failed++;
  }
}

// Save sent log
writeFileSync(SENT_LOG, JSON.stringify(sentLog, null, 2));
console.log(`\nDone: ${sent} sent, ${failed} failed`);
