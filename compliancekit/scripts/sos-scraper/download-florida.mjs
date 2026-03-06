#!/usr/bin/env node
/**
 * Download Florida SOS daily filing data via SFTP using ssh2
 * Usage: node scripts/sos-scraper/download-florida.mjs [YYYYMMDD]
 */

import { Client } from 'ssh2';
import { createWriteStream, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data/sos-filings');

function getDateStr(arg) {
  if (arg) return arg;
  // Default to yesterday (today's file may not be ready)
  const d = new Date();
  d.setDate(d.getDate() - 1);
  // Skip weekends
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

async function download(dateStr) {
  mkdirSync(DATA_DIR, { recursive: true });
  const filename = `${dateStr}c.txt`;
  const localPath = join(DATA_DIR, filename);

  if (existsSync(localPath) && readFileSync(localPath).length > 100) {
    console.log(`Cached: ${localPath} (${(readFileSync(localPath).length / 1024).toFixed(0)}KB)`);
    return localPath;
  }

  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log('Connected to sftp.floridados.gov');
      conn.sftp((err, sftp) => {
        if (err) { conn.end(); return reject(err); }
        
        const remotePath = `/Public/doc/cor/${filename}`;
        console.log(`Downloading ${remotePath}...`);
        
        sftp.fastGet(remotePath, localPath, (err) => {
          conn.end();
          if (err) {
            console.error(`Failed: ${err.message}`);
            // Try listing what's available
            sftp.readdir('/Public/doc/cor/', (err2, list) => {
              if (!err2 && list) {
                const recent = list
                  .filter(f => f.filename.endsWith('c.txt'))
                  .sort((a, b) => b.filename.localeCompare(a.filename))
                  .slice(0, 5);
                console.log('Recent available files:', recent.map(f => f.filename));
              }
              reject(err);
            });
            return;
          }
          const size = readFileSync(localPath).length;
          console.log(`Downloaded: ${localPath} (${(size / 1024).toFixed(0)}KB)`);
          resolve(localPath);
        });
      });
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err.message);
      reject(err);
    });

    conn.connect({
      host: 'sftp.floridados.gov',
      port: 22,
      username: 'Public',
      password: 'PubAccess1845!',
      algorithms: {
        kex: ['diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1', 'diffie-hellman-group-exchange-sha1'],
      },
      readyTimeout: 20000,
    });
  });
}

// Also export for use as module
export { download };

// CLI mode
const dateStr = getDateStr(process.argv[2]);
console.log(`Florida SOS daily filings — target date: ${dateStr}\n`);

try {
  const path = await download(dateStr);
  console.log(`\nReady: ${path}`);
} catch (err) {
  console.error('\nFailed to download. The file may not exist for this date.');
  console.error('Try a recent weekday: node scripts/sos-scraper/download-florida.mjs 20260304');
  process.exit(1);
}
