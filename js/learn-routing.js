/**
 * Learn section routing — ESM wrapper around learn-routing-data.js constants.
 */

const R = window.FONORA_LEARN_ROUTING;

if (!R) {
  throw new Error('learn-routing-data.js must load before learn-routing.js');
}

export const LEARN_HUB_TAB = R.LEARN_HUB_TAB;
export const LEARN_SKILL_IDS = new Set(R.LEARN_SKILL_IDS);
export const LEARN_PANEL_MAP = R.LEARN_PANEL_MAP;
export const LEGACY_LEARN_HASH = R.LEGACY_LEARN_HASH;
export const LEARN_REDIRECT_HASHES = R.LEARN_REDIRECT_HASHES;
export const LEARN_DEFAULT_TAB = R.LEARN_DEFAULT_TAB;
export const LEARN_SKILL_ORDER = R.LEARN_SKILL_IDS;

/** @param {string} tabId */
export function resolveLearnNavTab(tabId) {
  if (tabId === LEARN_HUB_TAB) return LEARN_HUB_TAB;
  if (LEARN_SKILL_IDS.has(tabId)) return tabId;
  if (LEGACY_LEARN_HASH[tabId]) return LEGACY_LEARN_HASH[tabId];
  return LEARN_DEFAULT_TAB;
}

/** @param {string} tabId */
export function resolveLearnPanelId(tabId) {
  const navTab = resolveLearnNavTab(tabId);
  return LEARN_PANEL_MAP[navTab] ?? LEARN_PANEL_MAP[LEARN_DEFAULT_TAB];
}

/** @param {string} tabId */
export function normalizeLearnTab(tabId) {
  const navTab = resolveLearnNavTab(tabId);
  return { navTab, panelId: LEARN_PANEL_MAP[navTab] ?? LEARN_PANEL_MAP[LEARN_DEFAULT_TAB] };
}

/** @param {string} hash */
export function learnHashToNavTab(hash) {
  if (!hash) return LEARN_DEFAULT_TAB;
  if (hash === LEARN_HUB_TAB) return LEARN_HUB_TAB;
  if (LEARN_SKILL_IDS.has(hash)) return hash;
  if (LEGACY_LEARN_HASH[hash]) return LEGACY_LEARN_HASH[hash];
  return LEARN_DEFAULT_TAB;
}

/** @param {string} navTab */
export function learnNavTabToHash(navTab) {
  if (navTab === LEARN_DEFAULT_TAB) return '';
  return `#${navTab}`;
}
