import { escapeHtml } from './utils.js';
import {
  ENGLISH_DIALECT_OPTIONS,
  LANGUAGE_OPTIONS,
  loadLanguagePreference,
  loadEnglishDialectPreference,
  saveLanguagePreference,
  saveEnglishDialectPreference,
} from './language-preferences.js';
import { getReaderWordSources } from './fonora-tts.js';
import {
  analyzeBreakdown,
  renderBreakdownHtml,
  renderBreakdownLegendHtml,
} from './breakdown.js';

let rulesRef = null;
let analyzeGeneration = 0;
let uiBound = false;

function populateDialectSelect(selectedCode = 'en-us') {
  const sel = document.getElementById('breakdown-dialect');
  if (!sel) return;
  sel.innerHTML = ENGLISH_DIALECT_OPTIONS.map(
    (item) => `<option value="${escapeHtml(item.code)}"${item.code === selectedCode ? ' selected' : ''}>${escapeHtml(item.label)}</option>`,
  ).join('');
}

function populateLanguageSelect() {
  const sel = document.getElementById('breakdown-lang');
  if (!sel) return;
  const saved = loadLanguagePreference();
  sel.innerHTML = LANGUAGE_OPTIONS.map(
    (item) => `<option value="${escapeHtml(item.code)}"${item.code === saved ? ' selected' : ''}>${escapeHtml(item.label)}</option>`,
  ).join('');
}

function syncDialectVisibility() {
  const langEl = document.getElementById('breakdown-lang');
  const wrap = document.getElementById('breakdown-dialect-wrap');
  if (!langEl || !wrap) return;
  wrap.hidden = langEl.value !== 'en';
}

function englishPipelineOptions() {
  const langEl = document.getElementById('breakdown-lang');
  const dialectEl = document.getElementById('breakdown-dialect');
  if (langEl?.value !== 'en') return {};
  const dialect = dialectEl?.value;
  return dialect ? { englishDialect: dialect } : {};
}

function showStatus(message, { isError = false } = {}) {
  const status = document.getElementById('breakdown-status');
  if (!status) return;
  if (!message) {
    status.hidden = true;
    status.textContent = '';
    status.className = 'tts-status';
    return;
  }
  status.hidden = false;
  status.textContent = message;
  status.className = isError ? 'tts-status tts-status--error' : 'tts-status';
}

function renderLegend() {
  const legend = document.getElementById('breakdown-legend');
  if (!legend || !rulesRef) return;
  legend.innerHTML = renderBreakdownLegendHtml(rulesRef);
}

function renderOutput(analysis) {
  const output = document.getElementById('breakdown-output');
  if (!output) return;
  output.innerHTML = renderBreakdownHtml(analysis, rulesRef);
  bindBreakdownInteractions(output);
}

function clearChunkHighlight(container) {
  container.querySelectorAll('.breakdown-chunk--linked').forEach((el) => {
    el.classList.remove('breakdown-chunk--linked');
  });
}

function highlightChunkPair(container, wordIndex, chunkIndex) {
  clearChunkHighlight(container);
  if (wordIndex == null || chunkIndex == null) return;

  container.querySelectorAll(
    `.breakdown-chunk--interactive[data-word-index="${wordIndex}"][data-chunk-index="${chunkIndex}"]`,
  ).forEach((el) => {
    el.classList.add('breakdown-chunk--linked');
  });
}

function bindBreakdownInteractions(container) {
  if (!container || container.dataset.interactionsBound === 'true') return;
  container.dataset.interactionsBound = 'true';

  let pinnedKey = null;

  function applyHighlight(wordIndex, chunkIndex, pin = false) {
    const key = wordIndex == null ? null : `${wordIndex}:${chunkIndex}`;
    if (pin) {
      pinnedKey = pinnedKey === key ? null : key;
    }
    if (pinnedKey) {
      const [w, c] = pinnedKey.split(':');
      highlightChunkPair(container, w, c);
      return;
    }
    highlightChunkPair(container, wordIndex, chunkIndex);
  }

  container.addEventListener('mouseover', (event) => {
    const el = event.target.closest('.breakdown-chunk--interactive');
    if (!el || !container.contains(el)) return;
    if (pinnedKey) return;
    applyHighlight(el.dataset.wordIndex, el.dataset.chunkIndex);
  });

  container.addEventListener('mouseleave', () => {
    if (!pinnedKey) clearChunkHighlight(container);
  });

  container.addEventListener('focusin', (event) => {
    const el = event.target.closest('.breakdown-chunk--interactive');
    if (!el || !container.contains(el)) return;
    applyHighlight(el.dataset.wordIndex, el.dataset.chunkIndex);
  });

  container.addEventListener('focusout', (event) => {
    if (pinnedKey) return;
    const next = event.relatedTarget;
    if (next && container.contains(next) && next.closest('.breakdown-chunk--interactive')) return;
    clearChunkHighlight(container);
  });

  container.addEventListener('click', (event) => {
    const el = event.target.closest('.breakdown-chunk--interactive');
    if (!el || !container.contains(el)) {
      pinnedKey = null;
      clearChunkHighlight(container);
      return;
    }
    applyHighlight(el.dataset.wordIndex, el.dataset.chunkIndex, true);
  });
}

async function handleAnalyze() {
  if (!rulesRef) return;

  const input = document.getElementById('breakdown-input');
  const text = input?.value.trim() || '';
  const generation = ++analyzeGeneration;

  if (!text) {
    showStatus('Enter text to analyze.', { isError: true });
    renderOutput(null);
    return;
  }

  const lang = document.getElementById('breakdown-lang')?.value || 'en';
  const pipelineOptions = englishPipelineOptions();

  try {
    showStatus('Loading IPA…');
    const analysis = await analyzeBreakdown(text, rulesRef, lang, pipelineOptions);
    if (generation !== analyzeGeneration) return;
    renderOutput(analysis);
    showStatus('');
  } catch (err) {
    if (generation !== analyzeGeneration) return;
    showStatus(err.message || 'IPA pipeline failed.', { isError: true });
  }
}

function refreshControls() {
  const savedDialect = loadEnglishDialectPreference();
  populateLanguageSelect();
  populateDialectSelect(savedDialect);
  syncDialectVisibility();
  renderLegend();
}

function bindUiOnce() {
  if (uiBound) return;
  uiBound = true;

  const langEl = document.getElementById('breakdown-lang');
  const dialectEl = document.getElementById('breakdown-dialect');

  langEl?.addEventListener('change', () => {
    saveLanguagePreference(langEl.value, dialectEl?.value || loadEnglishDialectPreference());
    syncDialectVisibility();
  });

  dialectEl?.addEventListener('change', () => {
    saveEnglishDialectPreference(dialectEl.value);
  });

  document.getElementById('breakdown-analyze')?.addEventListener('click', handleAnalyze);

  document.getElementById('breakdown-input')?.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      handleAnalyze();
    }
  });
}

export function loadBreakdownFromTranslation(text) {
  const input = document.getElementById('breakdown-input');
  if (input && text) {
    input.value = text;
  }
  showStatus('');
}

export function prefillBreakdownFromWordSources() {
  const sources = getReaderWordSources();
  const phrase = sources?.map((word) => word.sourceWord).filter(Boolean).join(' ');
  if (phrase) loadBreakdownFromTranslation(phrase);
}

export function setupBreakdown(rules) {
  rulesRef = rules;
  refreshControls();
  bindUiOnce();

  const output = document.getElementById('breakdown-output');
  if (output && !output.innerHTML.trim()) {
    renderOutput(null);
  }
}
