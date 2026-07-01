/**
 * Synchronous boot flags (head), drives first-paint nav + panel CSS before modules load.
 */
(function () {
  const SCRIPT_TABS = new Set([
    'home',
    'translator',
    'grid',
    'alphabet',
    'breakdown',
    'samples',
    'keyboard',
    'spelling-practice',
    'reverse',
    'quiz',
    'encoder-testing',
    'pronunciation-validation',
    'symbols',
    'docs',
  ]);

  const LEARN_TABS = new Set(['writing', 'reading', 'speaking', 'listening']);
  const LEGACY_LEARN_HASH = {
    'learn-home': 'writing',
    quiz: 'reading',
    'spelling-practice': 'writing',
    samples: 'listening',
    breakdown: 'speaking',
  };

  const TOOLS_TABS = new Set([
    'tools-home',
    'keyboard',
    'reverse',
    'encoder-testing',
    'pronunciation-validation',
    'symbols',
    'research-notes',
  ]);

  const FONORAN_PAGES = new Set([
    'home',
    'root-review',
    'concepts',
    'translator',
    'roots',
    'create',
    'review',
    'dictionary',
    'grammar',
    'health',
    'gaps',
    'progress',
    'advanced',
  ]);

  const html = document.documentElement;
  html.setAttribute('data-fonora-tools-nav', 'hidden');
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const hash = window.location.hash.replace(/^#/, '');
  const hasDocPath = new URLSearchParams(window.location.search).has('path');
  const isDocsRoute = path === '/docs' || path.startsWith('/docs/') || hasDocPath || hash === 'docs';

  if (path === '/language' || path.startsWith('/language/')) {
    const page = hash && FONORAN_PAGES.has(hash) ? hash : 'home';
    const tab = page === 'root-review' ? 'review' : page;
    html.setAttribute('data-fonora-nav', 'language');
    html.setAttribute('data-fonora-tab', tab);
    html.setAttribute('data-fonora-page', page);
    return;
  }

  if (path === '/research' || path.startsWith('/research/')) {
    let tab = 'research';
    if (path === '/research/timeline') tab = 'timeline';
    else if (hash === 'open') tab = 'open';
    html.setAttribute('data-fonora-nav', 'platform');
    html.setAttribute('data-fonora-tab', tab);
    return;
  }

  if (path === '/script' || path.startsWith('/script/')) {
    const tab = hash === 'reader' ? 'translator' : hash && SCRIPT_TABS.has(hash) ? hash : 'home';
    html.setAttribute('data-fonora-nav', 'script');
    html.setAttribute('data-fonora-tab', tab);
    return;
  }

  if (path === '/learn' || path.startsWith('/learn/')) {
    let tab = 'writing';
    if (hash && LEARN_TABS.has(hash)) tab = hash;
    else if (hash && LEGACY_LEARN_HASH[hash]) tab = LEGACY_LEARN_HASH[hash];
    html.setAttribute('data-fonora-nav', 'learn');
    html.setAttribute('data-fonora-tab', tab);
    return;
  }

  if (path === '/tools' || path.startsWith('/tools/')) {
    const learnHashes = [
      'learn-home',
      'quiz',
      'breakdown',
      'samples',
      'spelling-practice',
      'writing',
      'reading',
      'speaking',
      'listening',
    ];
    if (hash && learnHashes.includes(hash)) {
      let tab = 'writing';
      if (LEARN_TABS.has(hash)) tab = hash;
      else if (LEGACY_LEARN_HASH[hash]) tab = LEGACY_LEARN_HASH[hash];
      const nextHash = tab === 'writing' ? '' : `#${tab}`;
      window.location.replace(`/learn${nextHash}${window.location.search}`);
      return;
    }
    const tab = hash && TOOLS_TABS.has(hash) ? hash : 'tools-home';
    html.setAttribute('data-fonora-nav', 'tools');
    html.setAttribute('data-fonora-tab', tab);
    return;
  }

  if (hash === 'about') {
    html.setAttribute('data-fonora-nav', 'platform');
    html.setAttribute('data-fonora-tab', 'platform');
    return;
  }

  if (isDocsRoute) {
    html.setAttribute('data-fonora-nav', 'platform');
    html.setAttribute('data-fonora-tab', 'docs');
    return;
  }

  if (hash === 'home' || (hash && SCRIPT_TABS.has(hash))) {
    html.setAttribute('data-fonora-nav', 'script');
    html.setAttribute('data-fonora-tab', hash === 'home' ? 'home' : hash);
    return;
  }

  html.setAttribute('data-fonora-nav', 'platform');
  html.setAttribute('data-fonora-tab', 'platform');
})();
