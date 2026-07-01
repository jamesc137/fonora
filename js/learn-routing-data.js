/**
 * Learn section routing constants (classic script — loaded before nav-boot.js).
 * ESM consumers: import from ./learn-routing.js
 */
(function () {
  const LEARN_HUB_TAB = 'learn-home';

  const LEARN_SKILL_IDS = ['writing', 'reading', 'breakdown', 'listening'];

  const LEARN_PANEL_MAP = {
    [LEARN_HUB_TAB]: LEARN_HUB_TAB,
    writing: 'spelling-practice',
    reading: 'quiz',
    breakdown: 'breakdown',
    listening: 'samples',
  };

  /** @type {Record<string, string>} legacy hash → current nav tab id */
  const LEGACY_LEARN_HASH = {
    'learn-home': LEARN_HUB_TAB,
    quiz: 'reading',
    'spelling-practice': 'writing',
    samples: 'listening',
    breakdown: 'breakdown',
    speaking: 'breakdown',
  };

  const LEARN_LEGACY_HASHES = Object.keys(LEGACY_LEARN_HASH);

  const LEARN_REDIRECT_HASHES = [...LEARN_LEGACY_HASHES, ...LEARN_SKILL_IDS, LEARN_HUB_TAB];

  window.FONORA_LEARN_ROUTING = {
    LEARN_HUB_TAB,
    LEARN_SKILL_IDS,
    LEARN_PANEL_MAP,
    LEGACY_LEARN_HASH,
    LEARN_LEGACY_HASHES,
    LEARN_REDIRECT_HASHES,
    LEARN_DEFAULT_TAB: LEARN_HUB_TAB,
  };
})();
