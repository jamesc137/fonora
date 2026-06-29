/**
 * Compound-boundary scoring for Fonoran root candidates.
 *
 * A root rarely stands alone — it is concatenated with partner roots to form
 * compounds. When the trailing consonant of one morpheme matches the leading
 * consonant of the next (bem + mam -> bemmam), the boundary is awkward and the
 * compound is invalid. This module scores how cleanly a candidate spelling
 * joins with its likely compound partners. It only warns; it never mutates
 * approved spellings.
 */

import { checkCompoundBoundary } from './fonoran-gen3-readability.js';

/**
 * Build a map: concept id -> Set of partner concept ids that co-occur with it
 * in any curated compound composition.
 */
export function buildCompoundPartnerMap(compounds) {
  const map = new Map();
  for (const def of compounds ?? []) {
    const parts = def.composition ?? [];
    for (const a of parts) {
      if (!map.has(a)) map.set(a, new Set());
      const set = map.get(a);
      for (const b of parts) {
        if (a !== b) set.add(b);
      }
    }
  }
  return map;
}

/**
 * Score how cleanly a candidate spelling concatenates with its likely partners.
 * @param {string} conceptId
 * @param {string} form               candidate spelling
 * @param {Map<string,Set<string>>} partnerMap
 * @param {Record<string,string>} spellingByConcept  concept id -> current spelling
 * @returns {{ warnings: Array, score: number }}
 */
export function scoreCompoundBoundary(conceptId, form, partnerMap, spellingByConcept) {
  const warnings = [];
  const partners = partnerMap?.get(conceptId);
  if (!form || !partners || !partners.size) {
    return { warnings, score: 100 };
  }

  let checks = 0;
  let violations = 0;
  for (const partnerId of partners) {
    const partnerForm = spellingByConcept?.[partnerId];
    if (!partnerForm) continue;
    for (const [left, right] of [[form, partnerForm], [partnerForm, form]]) {
      checks++;
      const res = checkCompoundBoundary([left, right]);
      if (!res.valid) {
        violations++;
        const v = res.violations[0];
        warnings.push({ left, right, phoneme: v.phoneme, reason: v.reason });
      }
    }
  }

  const score = checks ? Math.round(100 * (1 - violations / checks)) : 100;
  return { warnings, score };
}

/** Map a boundary violation count to a penalty for the syllable scorer. */
export function boundaryPenalty(violationCount) {
  return violationCount * 400;
}
