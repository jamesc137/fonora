/**
 * Batch DDA inference — invisible semantic infrastructure.
 */

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSyllable } from './fonoran-pronunciation.js';
import {
  emptyDda,
  partsToComponents,
  atomicRoots,
  REUSABLE_WORD_STATES,
} from './fonoran-derivation.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = join(ROOT, 'data/fonoran-gen3-1-config.json');
const GEN31_PATH = join(ROOT, 'data/fonoran-gen3-1-roots.json');
const CONCEPTS_PATH = join(ROOT, 'data/fonoran-stress-test-concepts.json');

let configCache = null;
let glossIndexCache = null;

async function loadConfig() {
  if (!configCache) configCache = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
  return configCache;
}

async function loadGlossIndex() {
  if (glossIndexCache) return glossIndexCache;
  const index = new Map();
  try {
    const gen31 = JSON.parse(await readFile(GEN31_PATH, 'utf8'));
    for (const item of gen31.inventory ?? []) {
      const gloss = item.gloss?.split(';')[0]?.trim().toLowerCase();
      if (gloss) index.set(gloss, { D: item.coordinates?.D, M: item.coordinates?.M, A: item.coordinates?.A });
      index.set(item.id?.toLowerCase(), { D: item.coordinates?.D, M: item.coordinates?.M, A: item.coordinates?.A });
    }
  } catch { /* optional */ }
  try {
    const concepts = JSON.parse(await readFile(CONCEPTS_PATH, 'utf8'));
    for (const c of concepts.concepts ?? []) {
      const gloss = c.gloss?.toLowerCase();
      if (gloss) index.set(gloss, { D: 'interface', M: 'packet', A: 'focal' });
    }
  } catch { /* optional */ }
  glossIndexCache = index;
  return index;
}

const ONSET_PLACE = {
  p: '1', b: '1', m: '1', w: '1', f: '1',
  t: '2', d: '2', n: '2', l: '2', r: '2', y: '2', ñ: '2',
  c: '3', j: '3', s: '3', x: '3', ch: '3', sh: '3',
  k: '4', g: '4', ng: '4', gh: '4', kh: '4',
  h: '5',
};

const ONSET_MANNER = {
  p: 'plain', t: 'plain', k: 'plain', b: 'voice', d: 'voice', g: 'voice',
  f: 'friction', s: 'friction', sh: 'friction', x: 'friction', ch: 'friction',
  m: 'nasal', n: 'nasal', ng: 'nasal',
  w: 'glide', y: 'glide', l: 'glide', r: 'glide',
  h: 'plain', j: 'voice',
};

const VOWEL_ASPECT = {
  a: 'contact', e: 'focal', i: 'focal', o: 'field', u: 'field',
  ee: 'focal', ae: 'contact', oh: 'field',
};

function inferFromPhonetic(spelling) {
  const syl = parseSyllable(spelling);
  if (!syl || syl.unparsed) return null;
  const onset = syl.onset || 'h';
  const place = ONSET_PLACE[onset] ?? '3';
  const manner = ONSET_MANNER[onset] ?? 'plain';
  const aspect = VOWEL_ASPECT[syl.vowel] ?? 'focal';
  const depthNames = { 1: 'interface', 2: 'index', 3: 'junction', 4: 'emanation', 5: 'origin' };
  const mannerNames = { plain: 'packet', voice: 'live', friction: 'flux', nasal: 'hollow', glide: 'passage' };
  return {
    D: depthNames[place],
    M: mannerNames[manner],
    A: aspect,
    coordinates: { place, manner, A: aspect },
    sources: ['phonetic'],
    confidence: 0.55,
  };
}

async function inferFromMeaning(meaning) {
  if (!meaning?.trim()) return null;
  const index = await loadGlossIndex();
  const key = meaning.trim().toLowerCase();
  if (index.has(key)) {
    const c = index.get(key);
    return {
      D: c.D,
      M: c.M,
      A: c.A,
      coordinates: { D: c.D, M: c.M, A: c.A },
      sources: ['meaning'],
      confidence: 0.75,
    };
  }
  for (const [gloss, coords] of index) {
    if (key.includes(gloss) || gloss.includes(key)) {
      return {
        D: coords.D,
        M: coords.M,
        A: coords.A,
        coordinates: { D: coords.D, M: coords.M, A: coords.A },
        sources: ['meaning_partial'],
        confidence: 0.5,
      };
    }
  }
  return null;
}

function blendDda(parts) {
  const valid = parts.filter(Boolean);
  if (!valid.length) return null;
  if (valid.length === 1) return { ...valid[0], confidence: valid[0].confidence ?? 0.5 };

  const D = valid.map(v => v.D).find(Boolean) ?? 'junction';
  const M = valid.length > 1 ? 'packet' : (valid[0].M ?? 'packet');
  const A = valid[0].A ?? 'focal';
  const confidence = valid.reduce((a, v) => a + (v.confidence ?? 0.4), 0) / valid.length;
  return {
    D,
    M,
    A,
    coordinates: { D, M, A, composition: valid.map(v => v.D) },
    sources: ['compound_blend', ...valid.flatMap(v => v.sources ?? [])],
    confidence: Math.min(0.95, confidence + 0.05),
  };
}

function applyDda(item, result) {
  if (!result) {
    item.dda = { ...emptyDda(), status: 'failed', error: 'Could not infer', updated_at: new Date().toISOString() };
    return 'failed';
  }
  const confirmed = result.confidence >= 0.8;
  item.dda = {
    status: confirmed ? 'confirmed' : 'inferred',
    confidence: Math.round(result.confidence * 100) / 100,
    updated_at: new Date().toISOString(),
    D: result.D,
    M: result.M,
    A: result.A,
    coordinates: result.coordinates,
    sources: [...new Set(result.sources ?? [])],
    error: null,
  };
  return item.dda.status;
}

export async function inferSoundDda(sound) {
  const phon = inferFromPhonetic(sound.spelling);
  const sem = await inferFromMeaning(sound.meaning);
  const blended = blendDda([phon, sem].filter(Boolean));
  return applyDda(sound, blended ?? phon ?? sem);
}

export async function inferCompoundDda(compound, bucket) {
  const comps = compound.components ?? partsToComponents(compound.parts);
  const partDdas = [];

  for (const comp of comps) {
    if (comp.type === 'root') {
      const s = bucket.sounds.find(x => x.spelling === comp.ref);
      if (s?.dda?.status === 'inferred' || s?.dda?.status === 'confirmed') {
        partDdas.push({
          D: s.dda.D, M: s.dda.M, A: s.dda.A,
          coordinates: s.dda.coordinates,
          sources: ['ancestor'],
          confidence: s.dda.confidence ?? 0.6,
        });
      } else if (s) {
        const phon = inferFromPhonetic(s.spelling);
        const sem = await inferFromMeaning(s.meaning);
        partDdas.push(blendDda([phon, sem].filter(Boolean)));
      }
    } else {
      const w = bucket.compounds.find(c => c.id === comp.ref || c.spelling === comp.ref);
      if (w?.dda?.D) {
        partDdas.push({
          D: w.dda.D, M: w.dda.M, A: w.dda.A,
          coordinates: w.dda.coordinates,
          sources: ['ancestor_word'],
          confidence: w.dda.confidence ?? 0.65,
        });
      }
    }
  }

  const sem = await inferFromMeaning(compound.meaning);
  const blended = blendDda([...partDdas.filter(Boolean), sem].filter(Boolean));
  return applyDda(compound, blended);
}

export async function runDdaBatch(bucket, { scope = 'pending' } = {}) {
  const shouldRun = (item) => {
    const st = item.dda?.status ?? 'pending';
    if (scope === 'all') return true;
    if (scope === 'stale') return st === 'stale';
    return st === 'pending' || st === 'stale' || !item.dda;
  };

  const result = { processed: 0, inferred: 0, confirmed: 0, failed: 0, skipped: 0 };

  for (const s of bucket.sounds) {
    if (effectiveState(s) === 'rejected') { result.skipped++; continue; }
    if (!shouldRun(s)) { result.skipped++; continue; }
    const status = await inferSoundDda(s);
    result.processed++;
    if (status === 'confirmed') result.confirmed++;
    else if (status === 'inferred') result.inferred++;
    else result.failed++;
  }

  for (const c of bucket.compounds) {
    if (effectiveState(c) === 'rejected') { result.skipped++; continue; }
    if (!shouldRun(c)) { result.skipped++; continue; }
    const status = await inferCompoundDda(c, bucket);
    result.processed++;
    if (status === 'confirmed') result.confirmed++;
    else if (status === 'inferred') result.inferred++;
    else result.failed++;
  }

  return result;
}

function effectiveState(item) {
  const states = ['draft', 'needs_review', 'approved', 'rejected', 'revised'];
  if (item?.state && states.includes(item.state)) return item.state;
  return item?.meaning?.trim() ? 'needs_review' : 'draft';
}

export function ddaSummary(bucket) {
  let pending = 0; let stale = 0; let inferred = 0; let confirmed = 0; let failed = 0;
  for (const item of [...(bucket.sounds ?? []), ...(bucket.compounds ?? [])]) {
    const st = item.dda?.status ?? 'pending';
    if (st === 'pending') pending++;
    else if (st === 'stale') stale++;
    else if (st === 'inferred') inferred++;
    else if (st === 'confirmed') confirmed++;
    else if (st === 'failed') failed++;
  }
  return { pending, stale, inferred, confirmed, failed };
}

export { atomicRoots };
