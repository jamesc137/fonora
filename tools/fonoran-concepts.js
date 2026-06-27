/**
 * Unified Fonoran concept inventory.
 * Concepts (not English words) are the semantic authority across UI and translator.
 * English is one localization stored in data/localizations/en.json — not the canonical meaning.
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { romanToIpa } from './fonoran-pronunciation.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES_PATH = join(ROOT, 'data/fonoran-root-candidates.json');
const APPROVED_PATH = join(ROOT, 'data/fonoran-approved-roots.json');
const SEMANTIC_PATH = join(ROOT, 'data/fonoran-concept-inventory.json');
const LOCALIZATIONS_DIR = join(ROOT, 'data/localizations');

const STOP = new Set([
  'a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'for', 'and', 'or', 'is', 'are', 'be', 'with',
  'any', 'all', 'one', 'not', 'that', 'this', 'from', 'into', 'by', 'as', 'it', 'its',
]);

/** Cache: locale code → entries object from localization JSON. */
const localizationCache = new Map();

/**
 * Load the localization file for a given locale (e.g. 'en').
 * Returns an object keyed by concept id: { label, aliases }.
 * Caches the result in memory until clearLocalizationCache() is called.
 */
export async function loadLocalization(locale = 'en') {
  if (localizationCache.has(locale)) return localizationCache.get(locale);
  try {
    const data = JSON.parse(await readFile(join(LOCALIZATIONS_DIR, `${locale}.json`), 'utf8'));
    const entries = data.entries ?? {};
    localizationCache.set(locale, entries);
    return entries;
  } catch {
    localizationCache.set(locale, {});
    return {};
  }
}

/** Invalidate the in-memory cache for a locale after a write. */
export function clearLocalizationCache(locale = 'en') {
  localizationCache.delete(locale);
}

/** Return the English-localized aliases for a concept id. */
export function extraAliasesForLocale(id, locData) {
  return [...(locData[id]?.aliases ?? [])];
}

function glossTokens(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[;,.]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/[^a-z]/g, ''))
    .filter(w => w.length >= 3 && !STOP.has(w));
}

/**
 * Build the full alias list for a concept.
 * locData: the entries object from loadLocalization(locale).
 * Falls back gracefully to an empty set when locData is omitted.
 */
export function aliasesForConcept(candidate, locData = {}) {
  const out = new Set();
  const id = candidate.id;
  out.add(id);
  out.add(id.replace(/_/g, ' '));

  const display = String(candidate.concept ?? candidate.description ?? candidate.gloss ?? '').split(';')[0].trim().toLowerCase();
  if (display) out.add(display);

  for (const w of glossTokens(candidate.concept ?? candidate.description ?? candidate.gloss)) out.add(w);

  const stored = candidate.aliases ?? candidate.stored_aliases;
  if (Array.isArray(stored) && stored.length) {
    for (const a of stored) out.add(String(a).toLowerCase());
  } else {
    for (const a of locData[id]?.aliases ?? []) out.add(a.toLowerCase());
  }

  return [...out].filter(Boolean);
}

export function conceptRecord(candidate, approvedRoot = null, primitive = null, locData = {}) {
  const description = primitive?.description ?? primitive?.gloss ?? candidate.concept;
  const domain = primitive?.domain ?? candidate.domain;
  const spelling = approvedRoot?.spelling ?? candidate.spelling;
  // Aliases stored directly on the primitive (legacy) take precedence; otherwise use locale data.
  const storedAliases = primitive?.aliases ?? locData[candidate.id]?.aliases ?? null;
  return {
    id: candidate.id,
    concept: description,
    domain,
    spelling,
    ipa: approvedRoot?.ipa ?? candidate.ipa ?? romanToIpa(spelling),
    aliases: aliasesForConcept({ id: candidate.id, concept: description, aliases: storedAliases }, locData),
    stored_aliases: storedAliases,
    status: candidate.status,
    reason: candidate.reason ?? null,
    pronunciation_ease: candidate.pronunciation_ease ?? null,
    semantic_usefulness: candidate.semantic_usefulness ?? null,
  };
}

export async function loadConceptInventory(locale = 'en') {
  const locData = await loadLocalization(locale);

  let candidatesFile;
  try {
    candidatesFile = JSON.parse(await readFile(CANDIDATES_PATH, 'utf8'));
  } catch {
    return { version: '1.0-concepts', concepts: [], concept_count: 0 };
  }

  let approved = { roots: [] };
  try {
    approved = JSON.parse(await readFile(APPROVED_PATH, 'utf8'));
  } catch {
    approved = { roots: [] };
  }

  const approvedById = Object.fromEntries((approved.roots ?? []).map(r => [r.id, r]));

  let primitiveById = {};
  try {
    const semantic = JSON.parse(await readFile(SEMANTIC_PATH, 'utf8'));
    primitiveById = Object.fromEntries((semantic.primitives ?? []).map(p => [p.id, p]));
  } catch {
    primitiveById = {};
  }

  const candidates = candidatesFile.candidates ?? [];

  // After a blank-slate reset the review queue is empty, but the semantic
  // inventory still lists concepts — just without assigned sounds yet.
  if (!candidates.length && Object.keys(primitiveById).length) {
    const concepts = Object.values(primitiveById).map(p => conceptRecord({
      id: p.id,
      concept: p.description ?? p.gloss,
      domain: p.domain,
      status: 'pending',
      spelling: '',
      aliases: p.aliases,
    }, null, p, locData));
    return {
      version: '1.0-concepts',
      source: SEMANTIC_PATH,
      generated_at: candidatesFile.generated_at ?? null,
      concept_count: concepts.length,
      concepts,
    };
  }

  const concepts = candidates.map(c => conceptRecord(c, approvedById[c.id], primitiveById[c.id], locData));

  return {
    version: '1.0-concepts',
    source: 'data/fonoran-root-candidates.json',
    generated_at: candidatesFile.generated_at,
    concept_count: concepts.length,
    concepts,
  };
}

/** Build translator lookup: alias → concept entry with fonoran spelling. */
export function buildConceptAliasIndex(concepts, lab = null, locData = {}) {
  const index = new Map();

  const register = (alias, entry) => {
    const key = String(alias ?? '').trim().toLowerCase();
    if (!key || index.has(key)) return;
    index.set(key, entry);
  };

  const baseFor = (c) => ({
    english: c.id,
    concept_id: c.id,
    gloss: c.concept,
    fonoran: c.spelling,
    kind: 'primitive',
    parts: [c.spelling],
    source: 'concept',
    domain: c.domain,
  });

  // Strong aliases claim keys first so an incidental description token can never
  // shadow the real concept (e.g. "time" inside before's description).
  const strongAliases = (c) => {
    const out = [c.id, c.id.replace(/_/g, ' ')];
    const stored = c.stored_aliases;
    if (Array.isArray(stored) && stored.length) {
      out.push(...stored.map(a => String(a).toLowerCase()));
    } else {
      out.push(...(locData[c.id]?.aliases ?? []).map(a => a.toLowerCase()));
    }
    return out;
  };
  // Weak aliases derived from the description text: only fill gaps left by strong ones.
  const weakAliases = (c) => {
    const lead = String(c.concept ?? '').split(';')[0].trim().toLowerCase();
    return [lead, ...glossTokens(c.concept)];
  };

  for (const c of concepts) {
    const base = baseFor(c);
    for (const alias of strongAliases(c)) register(alias, { ...base, matched_alias: alias });
  }
  for (const c of concepts) {
    const base = baseFor(c);
    for (const alias of weakAliases(c)) register(alias, { ...base, matched_alias: alias });
  }

  for (const sound of lab?.sounds ?? []) {
    const meaning = String(sound.meaning ?? '').trim().toLowerCase();
    if (!meaning || !sound.spelling) continue;
    const hit = concepts.find(c => c.id === sound.concept_id)
      || concepts.find(c => c.concept.toLowerCase() === meaning)
      || concepts.find(c => c.id === meaning);
    register(meaning, {
      english: hit?.id ?? meaning,
      concept_id: sound.concept_id ?? hit?.id ?? null,
      gloss: sound.meaning,
      fonoran: sound.spelling,
      kind: 'primitive',
      parts: [sound.spelling],
      source: 'lab',
      state: sound.state,
    });
    if (sound.concept_id) {
      for (const alias of hit?.aliases ?? [sound.concept_id]) {
        register(alias, {
          english: sound.concept_id,
          concept_id: sound.concept_id,
          gloss: sound.meaning,
          fonoran: sound.spelling,
          kind: 'primitive',
          parts: [sound.spelling],
          source: 'lab',
          state: sound.state,
        });
      }
    }
  }

  return index;
}

export function isConceptMatchedInLab(concept, lab) {
  if (!lab?.sounds?.length) return concept.status === 'approved';
  const display = concept.concept?.trim().toLowerCase();
  const id = concept.id?.toLowerCase();
  return lab.sounds.some(s => {
    if (s.state === 'rejected') return false;
    if (!s.meaning?.trim()) return false;
    if (s.concept_id === concept.id) return true;
    if (s.spelling === concept.spelling) return true;
    const m = s.meaning.trim().toLowerCase();
    return m === display || m === id;
  }) || concept.status === 'approved';
}

export function isSpellingMatchedInLab(spelling, lab) {
  const s = lab?.sounds?.find(x => x.spelling === spelling && x.state !== 'rejected');
  return Boolean(s?.meaning?.trim());
}
