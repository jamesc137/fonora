/**
 * Interpretive layer: map English surface forms to nearest Fonoran concept ids.
 * See docs/fonoran-interpretive-translator.md
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RULES_PATH = join(ROOT, 'data/fonoran-interpretation-rules.json');

/** @type {object | null} */
let rulesCache = null;

const ARTICLES = new Set(['a', 'an', 'the']);

/** English futurate markers before an infinitive (to is stripped earlier as a particle). */
const FUTURE_INTENT_MARKERS = new Set(['will', 'going', 'go', 'goes', 'shall']);

export async function loadInterpretationRules() {
  if (rulesCache) return rulesCache;
  try {
    rulesCache = JSON.parse(await readFile(RULES_PATH, 'utf8'));
  } catch {
    rulesCache = { version: '1.0', spatial_path: {}, classes: {}, phrase_patterns: [] };
  }
  return rulesCache;
}

/** Reset cached rules (tests). */
export function resetInterpretationCache() {
  rulesCache = null;
}

function lemmatizeForInterpret(word) {
  const w = String(word ?? '').toLowerCase();
  if (w.endsWith('ies') && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith('ied') && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith('ing') && w.length > 5) {
    const base = w.slice(0, -3);
    if (base.endsWith(base.at(-1)) && !base.endsWith('ing')) return base.slice(0, -1);
    return base;
  }
  if (w.endsWith('ed') && w.length > 4) {
    if (w.endsWith('ted') || w.endsWith('ded')) return w.slice(0, -2);
    const base = w.slice(0, -2);
    if (base.length >= 2 && base.at(-1) === base.at(-2)) return base.slice(0, -1);
    return base;
  }
  if (w.endsWith('s') && w.length > 3 && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

function buildClassIndex(rules) {
  const byWord = new Map();
  for (const [classId, spec] of Object.entries(rules.classes ?? {})) {
    for (const word of spec.words ?? []) {
      const key = word.toLowerCase();
      if (!byWord.has(key)) {
        byWord.set(key, {
          concept_id: spec.concept_id,
          reason: spec.reason,
          class: classId,
        });
      }
    }
  }
  return byWord;
}

export function irregularPastLemma(word, rules) {
  const w = String(word ?? '').trim().toLowerCase();
  if (!w || !rules?.irregular_past) return null;
  return rules.irregular_past[w] ?? null;
}

export function isIrregularPastForm(word, rules) {
  return Boolean(irregularPastLemma(word, rules));
}

/**
 * @param {string} english
 * @param {string} [role]
 * @param {object} [rules]
 * @returns {{ concept_id: string, reason: string, class?: string } | null}
 */
export function interpretToConcept(english, role, rules) {
  const raw = String(english ?? '').trim().toLowerCase();
  if (!raw || !rules) return null;

  const spatial = rules.spatial_path?.[raw];
  if (spatial && (role === 'path' || role === 'modifier' || role === 'object')) {
    return { concept_id: spatial.concept_id, reason: spatial.reason, class: 'spatial_path' };
  }

  const classIndex = buildClassIndex(rules);
  const candidates = [raw, lemmatizeForInterpret(raw)];
  for (const key of candidates) {
    const hit = classIndex.get(key);
    if (hit && (role === 'event' || role === 'concept' || !role)) return hit;
  }

  return null;
}

/**
 * Detect VERB + spatial prep + (article) + landmark from content words.
 * @param {string[]} content — tokens after articles/aux skipped
 * @param {object} rules
 */
export function matchVerbSpatialLandmark(content, rules) {
  if (!content?.length || content.length < 3) return null;

  const spatialPreps = new Set(
    (rules.phrase_patterns ?? [])
      .flatMap(p => p.spatial_preps ?? [])
      .map(p => p.toLowerCase()),
  );
  for (const key of Object.keys(rules.spatial_path ?? {})) spatialPreps.add(key);

  const verb = content[0];
  const prep = content[1]?.toLowerCase();
  if (!spatialPreps.has(prep)) return null;

  let i = 2;
  while (i < content.length && ARTICLES.has(content[i])) i += 1;
  const landmarkParts = content.slice(i);
  if (!landmarkParts.length) return null;

  const pathSpec = rules.spatial_path?.[prep];
  return {
    event: { english: verb, role: 'event' },
    path: {
      english: prep,
      role: 'path',
      concept_hint: pathSpec?.concept_id ?? null,
      interpret_reason: pathSpec?.reason ?? 'spatial path',
    },
    object: { english: landmarkParts.join(' '), role: 'object' },
  };
}

/**
 * Strip leading articles from a landmark phrase for lookup.
 * @param {string} phrase
 */
export function landmarkPhrase(phrase) {
  const parts = String(phrase ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  while (parts.length && ARTICLES.has(parts[0])) parts.shift();
  return parts.join(' ');
}

/**
 * Peel “going to jump”, “will jump”, “goes to jump” → future intent + main verb phrase.
 * @param {string[]} content
 * @returns {{ before: string[], after: string[] } | null}
 */
export function peelFutureIntent(content) {
  if (!content?.length) return null;
  for (let i = 0; i < content.length; i += 1) {
    if (FUTURE_INTENT_MARKERS.has(content[i]) && i + 1 < content.length) {
      return {
        before: content.slice(0, i),
        after: content.slice(i + 1),
      };
    }
  }
  return null;
}
