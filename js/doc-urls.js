/** GitHub blob URLs and in-app docs viewer routing. */

export const GITHUB_BLOB_BASE = 'https://github.com/jamesc137/fonora/blob/main/';

const ALLOWED_EXACT = new Set(['CONTRIBUTING.md', 'README.md']);
const ALLOWED_PREFIX = 'docs/';

/** Curated doc list for the viewer sidebar. */
export const DOC_CATALOG = [
  { path: 'docs/README.md', label: 'Documentation index' },
  { path: 'docs/language-rules.md', label: 'Language rules' },
  { path: 'docs/open-problems.md', label: 'Open problems' },
  { path: 'docs/multilingual-support.md', label: 'Multilingual support' },
  { path: 'docs/ipa-normalize.md', label: 'IPA normalization' },
  { path: 'docs/pronunciation-validation.md', label: 'Pronunciation validation' },
  { path: 'docs/espeak-integration.md', label: 'eSpeak integration' },
  { path: 'docs/IPA-PIPELINE-REPORT.md', label: 'IPA pipeline report' },
  { path: 'docs/FONORA_COLLISION_AUDIT.md', label: 'Collision audit' },
  { path: 'docs/IPA_VOWEL_NORMALIZATION_AUDIT.md', label: 'Vowel normalization audit' },
  { path: 'docs/FONORA_VOWEL_DECISION_REPORT.md', label: 'Vowel decision report (v2)' },
  { path: 'docs/FONORA_CLEANUP_AUDIT.md', label: 'Cleanup audit' },
  { path: 'docs/deploy.md', label: 'Deploy' },
  { path: 'CONTRIBUTING.md', label: 'Contributing' },
  { path: 'README.md', label: 'Project README' },
];

/**
 * @param {string} repoPath e.g. docs/language-rules.md
 */
export function normalizeDocPath(repoPath) {
  const clean = String(repoPath || '')
    .replace(/^\//, '')
    .split(/[?#]/)[0];
  if (!clean || clean.includes('..')) {
    throw new Error('Invalid document path');
  }
  if (ALLOWED_EXACT.has(clean) || clean.startsWith(ALLOWED_PREFIX)) {
    return clean;
  }
  throw new Error('Document path not allowed');
}

export function githubDocUrl(repoPath) {
  const { path } = splitDocRef(repoPath);
  return `${GITHUB_BLOB_BASE}${path}`;
}

/**
 * @param {string} repoPath e.g. docs/language-rules.md or docs/foo.md#section
 */
export function splitDocRef(repoPath) {
  const raw = String(repoPath || '').replace(/^\//, '');
  const hashIdx = raw.indexOf('#');
  const pathPart = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
  const anchor = hashIdx >= 0 ? raw.slice(hashIdx + 1) : '';
  return { path: normalizeDocPath(pathPart), anchor };
}

export function docViewerHref(repoPath) {
  const { path, anchor } = splitDocRef(repoPath);
  const anchorParam = anchor ? `&anchor=${encodeURIComponent(anchor)}` : '';
  return `?path=${encodeURIComponent(path)}${anchorParam}#docs`;
}

/**
 * Resolve a markdown link relative to the current doc.
 * @param {string} href
 * @param {string} docPath
 */
export function resolveMarkdownHref(href, docPath) {
  if (!href || href.startsWith('#') || /^https?:\/\//i.test(href) || href.startsWith('mailto:')) {
    return href;
  }
  if (!href.includes('.md')) {
    return href;
  }
  const baseDir = docPath.includes('/') ? docPath.replace(/\/[^/]+$/, '/') : '';
  const joined = href.startsWith('/') ? href.slice(1) : `${baseDir}/${href}`.replace(/\/+/g, '/');
  try {
    return docViewerHref(joined);
  } catch {
    return href;
  }
}

export function openDocViewer(repoPath) {
  const { path, anchor } = splitDocRef(repoPath);
  const anchorParam = anchor ? `&anchor=${encodeURIComponent(anchor)}` : '';
  const url = `${window.location.pathname}?path=${encodeURIComponent(path)}${anchorParam}#docs`;
  history.pushState(null, '', url);
  if (typeof window.showTab === 'function') {
    window.showTab('docs');
  }
  return path;
}
