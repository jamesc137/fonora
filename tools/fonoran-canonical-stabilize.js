#!/usr/bin/env node
/** Initialize or refresh canonical registry from Gen 3.1 audit. */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  buildCanonicalRegistry,
  generateCanonicalRootsMarkdown,
  registryToRootsJson,
} from './fonoran-canonical-stabilization.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_PATH = join(ROOT, 'data/fonoran-canonical-registry.json');
const CONSTITUTION_PATH = join(ROOT, 'reports/fonoran-canonical-roots.md');
const CANONICAL_ROOTS_PATH = join(ROOT, 'data/fonoran-canonical-roots.json');

async function loadExistingRegistry() {
  try {
    return JSON.parse(await readFile(REGISTRY_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function mergeApprovals(fresh, existing) {
  if (!existing?.primitives) return fresh;
  const byId = Object.fromEntries(existing.primitives.map(p => [p.id, p]));
  for (const p of fresh.primitives) {
    const prev = byId[p.id];
    if (!prev) continue;
    if (prev.status === 'approved' && prev.canonical_root) {
      p.canonical_root = prev.canonical_root;
      p.status = 'approved';
      p.approved_at = prev.approved_at;
      p.approval_source = prev.approval_source ?? 'human_review';
      p.candidates = [];
    } else if (prev.status === 'pending_review' && (prev.rejection_reason || prev.candidates?.length)) {
      p.status = 'pending_review';
      p.canonical_root = null;
      p.candidates = prev.candidates ?? p.candidates;
      p.rejected_root = prev.rejected_root;
      p.rejection_reason = prev.rejection_reason;
      p.review_note = prev.review_note ?? p.review_note;
    }
  }
  const pending = fresh.primitives.filter(p => p.status === 'pending_review');
  fresh.status = pending.length ? 'draft' : 'stabilized';
  fresh.summary.approved_count = fresh.primitives.filter(p => p.status === 'approved').length;
  fresh.summary.pending_review_count = pending.length;
  fresh.pending_review_ids = pending.map(p => p.id);
  return fresh;
}

async function main() {
  const gen31 = JSON.parse(await readFile(join(ROOT, 'data/fonoran-gen3-1-roots.json'), 'utf8'));
  const gen3 = JSON.parse(await readFile(join(ROOT, 'data/fonoran-gen3-roots.json'), 'utf8'));
  const config = JSON.parse(await readFile(join(ROOT, 'data/fonoran-gen3-1-config.json'), 'utf8'));

  let registry = buildCanonicalRegistry(gen31, gen3, config);
  const existing = await loadExistingRegistry();
  registry = mergeApprovals(registry, existing);

  await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');
  await mkdir(join(ROOT, 'reports'), { recursive: true });
  await writeFile(CONSTITUTION_PATH, generateCanonicalRootsMarkdown(registry) + '\n');
  await writeFile(CANONICAL_ROOTS_PATH, JSON.stringify(registryToRootsJson(registry), null, 2) + '\n');

  console.log(`Registry: ${REGISTRY_PATH}`);
  console.log(`Constitution: ${CONSTITUTION_PATH}`);
  console.log(`Approved: ${registry.summary.approved_count}/${registry.summary.primitive_count}`);
  console.log(`Pending review: ${registry.summary.pending_review_count}`);
  if (registry.pending_review_ids.length) {
    console.log(`  → ${registry.pending_review_ids.join(', ')}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
