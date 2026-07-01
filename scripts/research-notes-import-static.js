#!/usr/bin/env node
/**
 * Import research notes into API storage from static seed + markdown files.
 * Usage: node scripts/research-notes-import-static.js [--dry-run] [--force]
 *
 * Requires docs/research/<slug>.md for each seed entry (one-time migration).
 * After markdown files are removed, use data/research-notes-store.json as backup.
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importPublishedNote, listPublished } from '../tools/research-notes-store.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SEED_PATH = join(ROOT, 'data/research-notes-static-seed.json');
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

async function loadSeed() {
  const raw = await readFile(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data.notes) ? data.notes : [];
}

async function main() {
  const existing = await listPublished();
  if (existing.length && !force) {
    console.log(`Store already has ${existing.length} published notes. Use --force to import anyway.`);
    return;
  }

  const seed = await loadSeed();
  let imported = 0;
  let skipped = 0;

  for (const meta of seed) {
    const mdPath = join(ROOT, 'docs/research', `${meta.slug}.md`);
    let body;
    try {
      body = await readFile(mdPath, 'utf8');
    } catch {
      console.warn(`Missing markdown for ${meta.slug}, skipping`);
      skipped += 1;
      continue;
    }

    if (dryRun) {
      console.log(`Would import ${meta.code} ${meta.slug} (${body.length} chars)`);
      imported += 1;
      continue;
    }

    await importPublishedNote(meta, body, 'import@static');
    console.log(`Imported ${meta.code} ${meta.slug}`);
    imported += 1;
  }

  console.log(`Done: ${imported} imported, ${skipped} skipped${dryRun ? ' (dry run)' : ''}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
