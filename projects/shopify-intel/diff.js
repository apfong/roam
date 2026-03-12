#!/usr/bin/env node
/**
 * Shopify App Intel — Diff Engine
 * Compares two snapshots and detects changes
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

function loadSnapshot(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function computeDiff(oldSnap, newSnap) {
  const oldApps = oldSnap.apps;
  const newApps = newSnap.apps;
  const oldHandles = new Set(Object.keys(oldApps));
  const newHandles = new Set(Object.keys(newApps));

  // New apps
  const added = [...newHandles]
    .filter(h => !oldHandles.has(h))
    .map(h => newApps[h]);

  // Removed apps
  const removed = [...oldHandles]
    .filter(h => !newHandles.has(h))
    .map(h => oldApps[h]);

  // Changes in existing apps
  const changes = [];
  for (const handle of newHandles) {
    if (!oldHandles.has(handle)) continue;
    const oldApp = oldApps[handle];
    const newApp = newApps[handle];
    const appChanges = [];

    // Pricing change
    if (oldApp.pricing !== newApp.pricing) {
      appChanges.push({
        type: 'pricing',
        old: oldApp.pricing,
        new: newApp.pricing,
      });
    }

    // Rating change > 0.1
    if (oldApp.rating != null && newApp.rating != null) {
      const delta = Math.abs(newApp.rating - oldApp.rating);
      if (delta > 0.1) {
        appChanges.push({
          type: 'rating',
          old: oldApp.rating,
          new: newApp.rating,
          delta: +(newApp.rating - oldApp.rating).toFixed(2),
        });
      }
    }

    // Review count change > 10%
    if (oldApp.reviewCount > 0 && newApp.reviewCount > 0) {
      const pctChange = Math.abs(newApp.reviewCount - oldApp.reviewCount) / oldApp.reviewCount;
      if (pctChange > 0.1) {
        appChanges.push({
          type: 'reviewCount',
          old: oldApp.reviewCount,
          new: newApp.reviewCount,
          pctChange: +(pctChange * 100).toFixed(1),
        });
      }
    }

    if (appChanges.length > 0) {
      changes.push({
        handle,
        name: newApp.name,
        changes: appChanges,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    oldSnapshot: oldSnap.timestamp,
    newSnapshot: newSnap.timestamp,
    summary: {
      newApps: added.length,
      removedApps: removed.length,
      appsWithChanges: changes.length,
    },
    added,
    removed,
    changes,
  };
}

function main() {
  const [oldPath, newPath] = process.argv.slice(2);
  if (!oldPath || !newPath) {
    console.error('Usage: node diff.js <old-snapshot.json> <new-snapshot.json>');
    process.exit(1);
  }

  const oldSnap = loadSnapshot(oldPath);
  const newSnap = loadSnapshot(newPath);
  const diff = computeDiff(oldSnap, newSnap);

  mkdirSync(join(import.meta.dirname, 'diffs'), { recursive: true });
  const filename = `diff-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
  const filepath = join(import.meta.dirname, 'diffs', filename);
  writeFileSync(filepath, JSON.stringify(diff, null, 2));

  console.log(`Diff saved: diffs/${filename}`);
  console.log(`  New apps: ${diff.summary.newApps}`);
  console.log(`  Removed apps: ${diff.summary.removedApps}`);
  console.log(`  Apps with changes: ${diff.summary.appsWithChanges}`);
}

main();
