/**
 * Editorial collision scoring for Fonoran root candidates.
 *
 * Loads a locale-specific collision profile (default: English) and scores a
 * candidate syllable against it. Blocked forms are never assigned; discouraged
 * forms carry a strong penalty; homophones and particle near-misses raise
 * warnings the reviewer sees in the UI.
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROFILE_DIR = join(ROOT, 'data/fonoran-collision-profiles');

const DEFAULT_PENALTIES = {
  blocked: null,
  discouraged: 2000,
  homophone: 500,
  particle_near_miss: 800,
};

const cache = new Map();

function indexForms(list) {
  const map = new Map();
  for (const item of list ?? []) {
    const form = String(item.form ?? '').toLowerCase();
    if (form) map.set(form, item);
  }
  return map;
}

function normalizeProfile(body, profileId) {
  const b = body ?? {};
  return {
    profile_id: b.profile_id ?? profileId,
    locale: b.locale ?? profileId,
    blocked: indexForms(b.blocked_forms),
    discouraged: indexForms(b.discouraged_forms),
    homophones: indexForms(b.homophone_warnings),
    particles: indexForms(b.particle_near_miss),
    penalties: { ...DEFAULT_PENALTIES, ...(b.penalties ?? {}) },
  };
}

/** Load and cache an editorial collision profile by id (e.g. 'en'). */
export async function loadCollisionProfile(profileId = 'en') {
  const id = profileId || 'en';
  if (cache.has(id)) return cache.get(id);
  let body = null;
  try {
    body = JSON.parse(await readFile(join(PROFILE_DIR, `${id}.json`), 'utf8'));
  } catch {
    body = null;
  }
  const profile = normalizeProfile(body, id);
  cache.set(id, profile);
  return profile;
}

export function clearCollisionProfileCache() {
  cache.clear();
}

/**
 * Score a candidate syllable form against an editorial collision profile.
 * @returns {{ blocked: boolean, penalty: number, warnings: Array }}
 */
export function scoreEditorialCollision(form, profile) {
  const f = String(form ?? '').toLowerCase();
  const warnings = [];
  if (!f || !profile) return { blocked: false, penalty: 0, warnings };

  const p = profile.penalties;

  const blk = profile.blocked.get(f);
  if (blk) {
    return {
      blocked: true,
      penalty: Infinity,
      warnings: [{
        form: f,
        type: 'blocked',
        category: blk.category ?? 'blocked',
        message: blk.reason ?? 'Blocked form.',
      }],
    };
  }

  let penalty = 0;

  const dis = profile.discouraged.get(f);
  if (dis) {
    penalty += p.discouraged;
    warnings.push({
      form: f,
      type: 'discouraged',
      category: dis.category ?? 'common_word',
      message: dis.reason ?? 'Discouraged form.',
    });
  }

  const hom = profile.homophones.get(f);
  if (hom) {
    penalty += p.homophone;
    warnings.push({
      form: f,
      type: 'homophone',
      category: 'homophone',
      message: hom.reason ?? `Sounds like "${hom.hears_as ?? ''}".`,
    });
  }

  const par = profile.particles.get(f);
  if (par) {
    penalty += p.particle_near_miss;
    warnings.push({
      form: f,
      type: 'particle_near_miss',
      category: 'particle',
      message: par.reason ?? `Close to grammar particle "${par.particle ?? ''}".`,
    });
  }

  return { blocked: false, penalty, warnings };
}

/** Map a collision penalty to a 0-100 safety score (higher = safer). */
export function collisionSafetyScore(penalty, blocked) {
  if (blocked) return 0;
  if (!penalty) return 100;
  return Math.max(0, Math.round(100 - penalty / 25));
}
