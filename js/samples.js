import { translateIpaPhrase } from './ipa-pipeline.js';
import { escapeHtml } from './utils.js';
import { speakFonoraPhrase, cancelSpeech, setReaderWordSources } from './fonora-tts.js';
import { initEspeak, getEspeakInitError } from './ipa.js';
import { primeAudioContext } from './espeak-audio.js';
import { DEFAULT_ENGLISH_VOICE } from './language-preferences.js';

/** Public-domain excerpts — Universal Declaration of Human Rights, Article 1. */
const SAMPLES = [
  {
    id: 'en',
    language: 'English',
    lang: 'en',
    experimental: false,
    audio: true,
    source: 'Universal Declaration of Human Rights, Article 1',
    text:
      'All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.',
  },
  {
    id: 'es',
    language: 'Spanish',
    lang: 'es',
    experimental: true,
    audio: false,
    source: 'Declaración Universal de los Derechos Humanos, Artículo 1',
    text:
      'Todas las personas nacen libres e iguales en dignidad y derechos y, dotadas como están de razón y conciencia, deben comportarse fraternalmente los unos con los otros.',
  },
  {
    id: 'fr',
    language: 'French',
    lang: 'fr',
    experimental: true,
    audio: false,
    source: 'Déclaration universelle des droits de l’homme, Article 1',
    text:
      'Tous les êtres humains naissent libres et égaux en dignité et en droits. Ils sont doués de raison et de conscience et doivent agir les uns envers les autres dans un esprit de fraternité.',
  },
  {
    id: 'de',
    language: 'German',
    lang: 'de',
    experimental: true,
    audio: false,
    source: 'Allgemeine Erklärung der Menschenrechte, Artikel 1',
    text:
      'Alle Menschen sind frei und gleich an Würde und Rechten geboren. Sie sind mit Vernunft und Gewissen begabt und sollen einander im Geist der Brüderlichkeit begegnen.',
  },
  {
    id: 'ja',
    language: 'Japanese',
    lang: 'ja',
    experimental: true,
    audio: false,
    source: '世界人権宣言、第1条',
    text:
      'すべての人間は、生まれながらにして自由であり、かつ、尊厳と権利とについて平等である。人間は、理性と良心とを授けられており、互いに同胞の精神をもって行動しなければならない。',
  },
  {
    id: 'ar',
    language: 'Arabic',
    lang: 'ar',
    experimental: true,
    audio: false,
    dir: 'rtl',
    source: 'الإعلان العالمي لحقوق الإنسان، المادة 1',
    text:
      'يولد جميع الناس أحرارًا متساوين في الكرامة والحقوق. وقد وهبوا عقلاً وضميرًا، وعليهم أن يعامل بعضهم بعضًا بروح الإخاء.',
  },
  {
    id: 'zh',
    language: 'Mandarin',
    lang: 'zh',
    experimental: true,
    audio: false,
    source: '《世界人权宣言》第一条',
    text: '人人生而自由，在尊严和权利上一律平等。他们赋有理性和良心，并应以兄弟关系的精神相对待。',
  },
];

/** @type {Map<string, { symbols: string, words: object[] }>} */
const sampleResults = new Map();

let rulesRef = null;
let loadPromise = null;
let loadedForRules = null;
let playingId = null;
let cancelPlayback = false;
let samplesUiReady = false;

function bindSamplesUi(listEl) {
  if (samplesUiReady) return;
  samplesUiReady = true;

  listEl.addEventListener('click', (event) => {
    const playBtn = event.target.closest('[data-sample-play]');
    if (!playBtn || playBtn.disabled) return;
    if (playingId === playBtn.dataset.samplePlay) {
      stopSamplePlayback();
      return;
    }
    playSample(playBtn.dataset.samplePlay);
  });
}

function renderSampleCards(listEl) {
  listEl.innerHTML = SAMPLES.map(renderSampleCard).join('');
}

function renderSampleCard(sample) {
  const dirAttr = sample.dir ? ` dir="${sample.dir}"` : '';
  const renderingLabel = sample.experimental
    ? 'Experimental phonetic rendering'
    : 'Fonora phonetic rendering';

  const audioBtn = sample.audio
    ? `<button type="button" class="btn btn--primary sample-audio-btn" data-sample-play="${escapeHtml(sample.id)}" disabled aria-label="Listen to English sample">▶ Listen</button>`
    : `<button type="button" class="btn sample-audio-btn sample-audio-btn--disabled" disabled aria-disabled="true">Audio coming soon</button>`;

  return `
    <article class="sample-card" id="sample-${escapeHtml(sample.id)}" aria-labelledby="sample-${escapeHtml(sample.id)}-lang">
      <header class="sample-card__header">
        <h3 class="sample-card__lang" id="sample-${escapeHtml(sample.id)}-lang">${escapeHtml(sample.language)}</h3>
        <p class="sample-card__source">${escapeHtml(sample.source)}</p>
      </header>

      <div class="sample-card__block">
        <h4 class="sample-card__label">Original text</h4>
        <p class="sample-card__original"${dirAttr}>${escapeHtml(sample.text)}</p>
      </div>

      <div class="sample-card__block">
        <h4 class="sample-card__label">${escapeHtml(renderingLabel)}</h4>
        <div class="sample-card__fonora symbol-text" id="sample-${escapeHtml(sample.id)}-fonora" aria-live="polite">
          <span class="sample-loading">Generating Fonora rendering…</span>
        </div>
        <p class="sample-card__meta" id="sample-${escapeHtml(sample.id)}-meta" hidden></p>
      </div>

      <div class="sample-card__audio">
        ${audioBtn}
        <span class="sample-audio-status" id="sample-${escapeHtml(sample.id)}-status" hidden role="status"></span>
      </div>
    </article>`;
}

function setFonoraOutput(sampleId, html, meta = '') {
  const fonoraEl = document.getElementById(`sample-${sampleId}-fonora`);
  const metaEl = document.getElementById(`sample-${sampleId}-meta`);
  if (fonoraEl) fonoraEl.innerHTML = html;
  if (metaEl) {
    if (meta) {
      metaEl.hidden = false;
      metaEl.textContent = meta;
    } else {
      metaEl.hidden = true;
      metaEl.textContent = '';
    }
  }
}

function resetPlayButtons() {
  document.querySelectorAll('[data-sample-play]').forEach((btn) => {
    const ready = sampleResults.has(btn.dataset.samplePlay);
    btn.disabled = !ready;
    btn.textContent = '▶ Listen';
  });
}

function setPlayButtonsLocked(locked, activeId = null) {
  document.querySelectorAll('[data-sample-play]').forEach((btn) => {
    const isActive = btn.dataset.samplePlay === activeId;
    if (locked && isActive) {
      btn.disabled = false;
      return;
    }
    btn.disabled = locked || !sampleResults.has(btn.dataset.samplePlay);
  });
}

function setAudioStatus(sampleId, message, { isError = false } = {}) {
  const el = document.getElementById(`sample-${sampleId}-status`);
  if (!el) return;
  if (!message) {
    el.hidden = true;
    el.textContent = '';
    el.className = 'sample-audio-status';
    return;
  }
  el.hidden = false;
  el.textContent = message;
  el.className = `sample-audio-status${isError ? ' sample-audio-status--error' : ''}`;
}

async function renderSampleFonora(sample, rules) {
  try {
    const result = await translateIpaPhrase(sample.text, rules, sample.lang, {
      englishDialect: DEFAULT_ENGLISH_VOICE,
    });

    if (!result?.symbols) {
      setFonoraOutput(sample.id, '<span class="sample-error">No Fonora output generated.</span>');
      return;
    }

    sampleResults.set(sample.id, { symbols: result.symbols, words: result.words || [] });

    const hasFallback = result.source === 'fallback' || (result.warnings?.length ?? 0) > 0;
    const metaParts = [];
    if (sample.experimental) {
      metaParts.push('Non-English mappings are experimental and may change.');
    }
    if (hasFallback) {
      metaParts.push('Some sounds could not be mapped and appear as fallback symbols.');
    }

    setFonoraOutput(sample.id, escapeHtml(result.symbols), metaParts.join(' '));

    if (sample.audio) {
      const playBtn = document.querySelector(`[data-sample-play="${sample.id}"]`);
      if (playBtn) playBtn.disabled = false;
    }
  } catch (err) {
    setFonoraOutput(
      sample.id,
      `<span class="sample-error">${escapeHtml(err.message || 'Fonora rendering failed.')}</span>`,
    );
  }
}

async function loadAllSamples(rules) {
  const espeak = await initEspeak();
  if (!espeak.ok) {
    const message = getEspeakInitError() || espeak.error || 'IPA pipeline unavailable.';
    for (const sample of SAMPLES) {
      setFonoraOutput(sample.id, `<span class="sample-error">${escapeHtml(message)}</span>`);
    }
    return;
  }

  for (const sample of SAMPLES) {
    await renderSampleFonora(sample, rules);
  }
}

async function playSample(sampleId) {
  if (!rulesRef || playingId) return;

  const data = sampleResults.get(sampleId);
  if (!data?.symbols) return;

  const playBtn = document.querySelector(`[data-sample-play="${sampleId}"]`);

  playingId = sampleId;
  cancelPlayback = false;
  setPlayButtonsLocked(true, sampleId);
  if (playBtn) playBtn.textContent = 'Loading…';
  setAudioStatus(sampleId, '');

  try {
    await primeAudioContext();
    setReaderWordSources(data.words);
    if (playBtn) playBtn.textContent = '■ Stop';
    await speakFonoraPhrase(data.symbols, rulesRef, {
      shouldCancel: () => cancelPlayback,
      onPrepare: (message) => setAudioStatus(sampleId, message),
    });
    if (!cancelPlayback) {
      setAudioStatus(sampleId, 'Playback complete.');
    }
  } catch (err) {
    setAudioStatus(sampleId, err.message || 'Playback failed.', { isError: true });
  } finally {
    playingId = null;
    cancelPlayback = false;
    resetPlayButtons();
  }
}

function stopSamplePlayback() {
  if (!playingId) return;
  const id = playingId;
  cancelPlayback = true;
  cancelSpeech();
  setAudioStatus(id, '');
  playingId = null;
  resetPlayButtons();
}

export function ensureSamplesLoaded() {
  if (!rulesRef) return Promise.resolve();
  if (loadPromise && loadedForRules === rulesRef) return loadPromise;
  loadedForRules = rulesRef;
  loadPromise = loadAllSamples(rulesRef);
  return loadPromise;
}

export function setupSamples(rules) {
  rulesRef = rules;
  const listEl = document.getElementById('samples-list');
  if (!listEl) return;

  renderSampleCards(listEl);
  bindSamplesUi(listEl);
  loadPromise = null;
  loadedForRules = null;
  sampleResults.clear();

  if (window.location.hash === '#samples') {
    ensureSamplesLoaded();
  }
}
