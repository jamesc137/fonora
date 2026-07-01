/**
 * Fonora research notebook app.
 *
 * Path-routed (for SEO) public laboratory notebook:
 *   /research                -> notebook index (notes grouped by phase)
 *   /research#open           -> open questions (live research frontier)
 *   /research/timeline       -> visual dependency graph + chronological spine
 *   /research/notes/<slug>   -> a single research note (markdown + cross-links)
 *
 * Published notes are loaded from /api/research/notes.
 */

import { escapeHtml, errorMessage } from './utils.js';
import { initUniversalNav, setActiveTab, setNavSelectHandlers } from './universal-nav.js';
import { refreshAuth, signOut, handleAuthUrlErrors } from './auth-session.js';
import { renderMarkdown } from './markdown-render.js';
import { resolveResearchNoteTitle } from './research-note-meta.js';
import { renderMermaidIn } from './mermaid-render.js';
import { SITE_ORIGIN } from './fonora-config.js';
import {
  docViewerHref,
  githubBlobUrl,
  githubCommitUrl,
  researchHref,
  researchCanonical,
  parseResearchLocation,
  setResearchDocEntries,
} from './doc-urls.js';
import { mountSiteFooter } from './site-footer.js';
import { RESEARCH_PHASES, resolveNotePhase } from './research-notes.js';
import {
  getPublishedNotes,
  getResearchNote,
  getNoteNeighbors,
  getOpenNotes,
  loadPublishedNoteBody,
  loadPublishedNotesFromApi,
  notesByPhase,
} from './research-notes-client.js';

const ROOT_ID = 'research-root';
let loadToken = 0;
let notesLoaded = false;
let notesLoadError = null;

/* --------------------------------- SEO ---------------------------------- */

function setJsonLd(data) {
  const el = document.getElementById('research-jsonld');
  if (!el) return;
  el.textContent = data ? JSON.stringify(data) : '';
}

function setMetaProp(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

/**
 * @param {{ title: string, description: string, slug?: string, type?: string, jsonLd?: object|null }} opts
 */
function setMeta({ title, description, slug, type = 'website', jsonLd = null }) {
  const canonical = researchCanonical(slug, SITE_ORIGIN);
  document.title = title;
  setMetaProp('research-meta-description', 'content', description);
  setMetaProp('research-og-title', 'content', title);
  setMetaProp('research-og-description', 'content', description);
  setMetaProp('research-og-type', 'content', type);
  setMetaProp('research-og-url', 'content', canonical);
  setMetaProp('research-canonical', 'href', canonical);
  setJsonLd(jsonLd);
}

/* ------------------------------- helpers -------------------------------- */

function statusClass(status) {
  return `research-badge research-badge--${String(status).toLowerCase()}`;
}

function noteId(slug) {
  return `n_${slug.replace(/-/g, '_')}`;
}

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function noteCard(note) {
  return `
    <a class="research-card" href="${escapeHtml(researchHref(note.slug))}">
      <div class="research-card__top">
        <span class="research-card__code">${escapeHtml(note.code)}</span>
        <span class="${statusClass(note.status)}">${escapeHtml(note.status)}</span>
      </div>
      <h3 class="research-card__title">${escapeHtml(note.title)}</h3>
      <p class="research-card__abstract">${escapeHtml(note.abstract)}</p>
      <p class="research-card__date">${escapeHtml(formatDate(note.date))}</p>
    </a>`;
}

function root() {
  return document.getElementById(ROOT_ID);
}

function renderLoadError() {
  const el = root();
  if (!el) return;
  el.innerHTML = `
    <article class="research-page content-page">
      <header class="research-hero research-hero--compact">
        <h1 class="research-hero__title">Research notebook unavailable</h1>
        <p class="research-hero__lead">${escapeHtml(notesLoadError || 'Could not load research notes.')}</p>
      </header>
    </article>`;
  setMeta({
    title: 'Fonora Research | Unavailable',
    description: 'The research notebook could not be loaded.',
    slug: undefined,
    jsonLd: null,
  });
}

async function ensureNotesLoaded() {
  if (notesLoaded) return true;
  try {
    await loadPublishedNotesFromApi();
    setResearchDocEntries(
      getPublishedNotes().map((note) => ({
        path: `research/${note.slug}`,
        label: `${note.code} · ${note.title}`,
        layer: 'research',
      })),
    );
    notesLoaded = true;
    notesLoadError = null;
    return true;
  } catch (err) {
    notesLoadError = errorMessage(err);
    notesLoaded = false;
    return false;
  }
}

/* ------------------------------ index view ------------------------------ */

function renderIndex() {
  const el = root();
  if (!el) return;

  const phases = notesByPhase(RESEARCH_PHASES)
    .map(
      ({ phase, notes }) => `
      <section class="research-phase" aria-labelledby="${escapeHtml(phase.id)}-h">
        <header class="research-phase__header">
          <h2 id="${escapeHtml(phase.id)}-h" class="research-phase__title">${escapeHtml(phase.label)}</h2>
          <p class="research-phase__blurb">${escapeHtml(phase.blurb)}</p>
        </header>
        <div class="research-card-grid">${notes.map(noteCard).join('')}</div>
      </section>`,
    )
    .join('');

  el.innerHTML = `
    <article class="research-page content-page">
      <header class="research-hero">
        <p class="research-hero__tag">Public laboratory notebook</p>
        <h1 class="research-hero__title">Fonora Research</h1>
        <p class="research-hero__lead">
          Fonora is an open research project exploring written and spoken language through
          open-source experiments. This is the lab notebook: each note records one experiment:
          the question we asked, what we expected, the constraints, what we built, what happened,
          and the question that followed. Dead ends are kept, not hidden.
        </p>
        <div class="research-hero__actions">
          <a class="btn btn--primary" href="/research/timeline">See the timeline</a>
          <a class="btn" href="/research#open">Open questions</a>
        </div>
      </header>
      ${phases}
    </article>`;

  const published = getPublishedNotes();
  setMeta({
    title: 'Fonora | Research Notebook',
    description:
      'A public laboratory notebook tracing how Fonora\u2019s phonetic script and the Fonoran language evolved through open-source experiments, one research note at a time.',
    slug: undefined,
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Fonora Research Notebook',
      url: researchCanonical(undefined, SITE_ORIGIN),
      hasPart: published.map((n) => ({
        '@type': 'Article',
        headline: n.title,
        url: researchCanonical(n.slug, SITE_ORIGIN),
        datePublished: n.date,
      })),
    },
  });
}

/* ------------------------------- open view ------------------------------ */

function renderOpen() {
  const el = root();
  if (!el) return;

  const open = getOpenNotes();
  const cards = open.length
    ? `<div class="research-card-grid">${open.map(noteCard).join('')}</div>`
    : '<p>No open questions are currently tracked.</p>';

  el.innerHTML = `
    <article class="research-page content-page">
      <header class="research-hero research-hero--compact">
        <p class="research-hero__tag">Live research frontier</p>
        <h1 class="research-hero__title">Open Questions</h1>
        <p class="research-hero__lead">
          The experiments that are still in progress, plus the loose threads scattered across the
          notebook and reference docs that we would pick up next.
        </p>
      </header>

      <section class="research-phase" aria-label="Open research notes">
        <h2 class="research-phase__title">Open research notes</h2>
        ${cards}
      </section>

      <section class="research-open-threads" aria-label="Outstanding threads">
        <h2 class="research-open-threads__title">Outstanding threads</h2>
        <ul class="research-thread-list">
          <li><strong>Script collisions awaiting a design call</strong> — vowel+glide vs diphthong homographs and greedy-decoder hazards (<a href="${escapeHtml(researchHref('collision-audit'))}">RN-06</a>, <a href="${escapeHtml(docViewerHref('docs/FONORA_COLLISION_AUDIT.md'))}">collision audit</a>).</li>
          <li><strong>Two reserved throat grid slots</strong> — nasal+throat and glide+throat remain open in the encoding rules (<a href="${escapeHtml(docViewerHref('docs/language-rules.md'))}">language-rules.md</a>).</li>
          <li><strong>Per-language vowel and consonant tables</strong> — non-English vowels still ride an English overlay (<a href="${escapeHtml(researchHref('multilingual-script'))}">RN-05</a>, <a href="${escapeHtml(docViewerHref('docs/multilingual-support.md'))}">multilingual support</a>).</li>
          <li><strong>Translator compound assembly</strong> — assembling new compounds from approved roots and more coordinated-clause patterns (<a href="${escapeHtml(researchHref('interpretive-translator'))}">RN-15</a>).</li>
          <li><strong>Grammar future work</strong> — pronouns, aspect, negation, questions, comparatives, conditionals, relative clauses (<a href="${escapeHtml(docViewerHref('docs/fonoran-grammar.md'))}">grammar spec</a>).</li>
          <li><strong>Recoverable-meaning playtests</strong> — does the whole system pass its own campfire test? (<a href="${escapeHtml(researchHref('puzzle-conversation'))}">RN-17</a>).</li>
        </ul>
      </section>
    </article>`;

  setMeta({
    title: 'Fonora Research | Open Questions',
    description:
      'The live frontier of the Fonora research project: open experiments and unresolved threads across the script, the language, the translator, and the grammar.',
    slug: 'open',
    type: 'website',
    jsonLd: null,
  });
}

/* ----------------------------- timeline view ---------------------------- */

function timelineMermaidSource() {
  const notes = getPublishedNotes();
  const nid = (slug) => noteId(slug);
  const clean = (s) => String(s).replace(/"/g, '');
  const lines = ['flowchart TB'];
  RESEARCH_PHASES.forEach((phase, pi) => {
    lines.push(`  subgraph phase_${pi} ["${clean(phase.label)}"]`);
    notes.filter((n) => resolveNotePhase(n) === phase.id).forEach((n) => {
      lines.push(`    ${nid(n.slug)}["${clean(n.code)}: ${clean(n.title)}"]`);
    });
    lines.push('  end');
  });
  for (let i = 0; i < notes.length - 1; i += 1) {
    lines.push(`  ${nid(notes[i].slug)} --> ${nid(notes[i + 1].slug)}`);
  }
  lines.push(`  ${nid('dda-coordinates')} -. "demoted by" .-> ${nid('the-constitution')}`);
  lines.push(`  ${nid('huffman-roots')} -. "demoted by" .-> ${nid('the-constitution')}`);
  return lines.join('\n');
}

function renderSpine() {
  return notesByPhase(RESEARCH_PHASES)
    .map(
      ({ phase, notes }) => `
      <section class="research-spine__phase">
        <h3 class="research-spine__phase-title">${escapeHtml(phase.label)}</h3>
        <ol class="research-spine__list">
          ${notes
            .map(
              (n) => `
            <li class="research-spine__item">
              <span class="research-spine__dot research-spine__dot--${escapeHtml(String(n.status).toLowerCase())}" aria-hidden="true"></span>
              <a class="research-spine__link" href="${escapeHtml(researchHref(n.slug))}">
                <span class="research-spine__code">${escapeHtml(n.code)}</span>
                <span class="research-spine__name">${escapeHtml(n.title)}</span>
                <span class="${statusClass(n.status)}">${escapeHtml(n.status)}</span>
                <span class="research-spine__date">${escapeHtml(formatDate(n.date))}</span>
              </a>
            </li>`,
            )
            .join('')}
        </ol>
      </section>`,
    )
    .join('');
}

async function renderTimeline() {
  const el = root();
  if (!el) return;
  const token = ++loadToken;

  const diagramMarkdown = ['```mermaid', timelineMermaidSource(), '```'].join('\n');

  el.innerHTML = `
    <article class="research-page content-page">
      <header class="research-hero research-hero--compact">
        <p class="research-hero__tag">How one experiment led to the next</p>
        <h1 class="research-hero__title">Research Timeline</h1>
        <p class="research-hero__lead">
          Read it as a laboratory notebook, not a changelog. The graph shows how each experiment
          raised the next question; dashed arrows mark tracks that a later decision demoted. The
          spine below the diagram is the same story in chronological order — every entry is clickable.
        </p>
      </header>

      <section class="research-graph" aria-label="Research dependency graph">
        ${renderMarkdown(diagramMarkdown, { docPath: 'research/timeline' })}
      </section>

      <section class="research-spine" aria-label="Chronological research spine">
        ${renderSpine()}
      </section>
    </article>`;

  await renderMermaidIn(el);
  if (token !== loadToken) return;

  setMeta({
    title: 'Fonora Research | Timeline',
    description:
      'A visual timeline of the Fonora research project: how the phonetic script and the Fonoran language evolved across three eras of open-source experiments.',
    slug: 'timeline',
    type: 'website',
    jsonLd: null,
  });
}

/* ------------------------------- note view ------------------------------ */

function footerSection(label, links) {
  if (!links || !links.length) return '';
  const items = links
    .map(
      (l) =>
        `<li><a href="${escapeHtml(l.href)}"${l.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(l.label)}</a></li>`,
    )
    .join('');
  return `
    <section class="research-note-footer__section">
      <h3 class="research-note-footer__section-title">${escapeHtml(label)}</h3>
      <ul class="research-note-footer__list">${items}</ul>
    </section>`;
}

function pagerCell(note, direction) {
  if (!note) {
    return `<div class="research-note-footer__pager-cell research-note-footer__pager-cell--empty" aria-hidden="true"></div>`;
  }
  const isPrev = direction === 'prev';
  const href = researchHref(note.slug);
  return `
    <a class="research-note-footer__pager-cell research-note-footer__pager-link research-note-footer__pager-link--${direction}" href="${escapeHtml(href)}">
      <span class="research-note-footer__pager-label">${isPrev ? 'Previous' : 'Next'}</span>
      <span class="research-note-footer__pager-title">${escapeHtml(note.code)} · ${escapeHtml(note.title)}</span>
    </a>`;
}

function notePager(prev, next) {
  if (!prev && !next) return '';
  return `
    <nav class="research-note-footer__pager" aria-label="Note navigation">
      ${pagerCell(prev, 'prev')}
      ${pagerCell(next, 'next')}
    </nav>`;
}

function continueThread(note) {
  const { prev, next } = getNoteNeighbors(note.slug);
  const ref = note.git_commit || 'main';

  const related = (note.related || [])
    .map((slug) => getResearchNote(slug))
    .filter(Boolean)
    .map((n) => ({ label: `${n.code} · ${n.title}`, href: researchHref(n.slug) }));

  const docs = (note.docs || []).map((d) => ({ label: d.label, href: docViewerHref(d.path) }));
  const tools = (note.tools || []).map((t) => ({ label: t.label, href: t.href }));
  const source = (note.source || []).map((s) => ({
    label: s.label,
    href: githubBlobUrl(s.path, ref),
    external: true,
  }));

  const commitLink = note.git_commit
    ? [
        {
          label: `Commit ${note.git_commit.slice(0, 7)}`,
          href: githubCommitUrl(note.git_commit),
          external: true,
        },
      ]
    : [];

  const sections = [
    footerSection('Related research', related),
    footerSection('Reference docs', docs),
    footerSection('Try it', tools),
    footerSection('Source', source),
    footerSection('Repository', commitLink),
  ]
    .filter(Boolean)
    .join('');

  const meta = sections
    ? `<div class="research-note-footer__meta">${sections}</div>`
    : '';

  const pager = notePager(prev, next);
  if (!pager && !meta) return '';

  return `
    <footer class="research-note-footer">
      ${pager}
      ${meta}
    </footer>`;
}

async function renderNote(slug) {
  const el = root();
  if (!el) return;
  const token = ++loadToken;

  const note = getResearchNote(slug);
  if (!note) {
    el.innerHTML = `
      <article class="research-page content-page">
        <header class="research-hero research-hero--compact">
          <h1 class="research-hero__title">Note not found</h1>
          <p class="research-hero__lead">There is no research note at this address.</p>
          <div class="research-hero__actions"><a class="btn btn--primary" href="/research">Back to the notebook</a></div>
        </header>
      </article>`;
    setMeta({
      title: 'Fonora Research | Not found',
      description: 'This research note could not be found.',
      slug,
      type: 'article',
      jsonLd: null,
    });
    return;
  }

  el.innerHTML = '<p class="research-loading">Loading note…</p>';

  let bodyHtml = '';
  let pageTitle = note.title;
  try {
    const payload = await loadPublishedNoteBody(slug);
    if (token !== loadToken) return;
    const markdown = payload.body || '';
    const meta = payload.metadata || note;
    pageTitle = resolveResearchNoteTitle(markdown, meta.title);
    bodyHtml = renderMarkdown(markdown, { docPath: `research/${slug}`, skipTitle: true });
  } catch (err) {
    if (token !== loadToken) return;
    bodyHtml = `<p class="research-error">${escapeHtml(errorMessage(err))}</p>`;
  }

  el.innerHTML = `
    <article class="research-page research-note content-page">
      <nav class="research-breadcrumb" aria-label="Breadcrumb">
        <a href="/research">Research</a> <span aria-hidden="true">/</span> <span>${escapeHtml(note.code)}</span>
      </nav>
      <header class="research-note__header">
        <div class="research-note__meta">
          <span class="research-note__code">${escapeHtml(note.code)}</span>
          <span class="${statusClass(note.status)}">${escapeHtml(note.status)}</span>
          <span class="research-note__date">${escapeHtml(formatDate(note.date))}</span>
        </div>
        <h1 class="research-note__title">${escapeHtml(pageTitle)}</h1>
      </header>
      <div class="research-note__body markdown-body">${bodyHtml}</div>
      ${continueThread(note)}
    </article>`;

  await renderMermaidIn(el);
  if (token !== loadToken) return;

  setMeta({
    title: `${note.title} | Fonora Research`,
    description: note.description,
    slug: note.slug,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: note.title,
      description: note.description,
      url: researchCanonical(note.slug, SITE_ORIGIN),
      datePublished: note.date,
      dateModified: note.date,
      articleSection:
        (RESEARCH_PHASES.find((p) => p.id === resolveNotePhase(note)) || {}).label ||
        'Research',
      author: { '@type': 'Person', name: 'James Calhoun' },
      publisher: { '@type': 'Organization', name: 'Fonora', url: SITE_ORIGIN },
      isPartOf: {
        '@type': 'CollectionPage',
        name: 'Fonora Research Notebook',
        url: researchCanonical(undefined, SITE_ORIGIN),
      },
    },
  });
}

/* -------------------------------- router -------------------------------- */

function currentTab(view) {
  if (view === 'timeline') return 'timeline';
  if (view === 'open') return 'open';
  return 'research';
}

async function route() {
  const ok = await ensureNotesLoaded();
  if (!ok) {
    renderLoadError();
    return;
  }

  const parsed = parseResearchLocation() || { view: 'index' };
  setActiveTab(currentTab(parsed.view));

  if (parsed.view === 'note') {
    await renderNote(parsed.slug);
  } else if (parsed.view === 'timeline') {
    await renderTimeline();
  } else if (parsed.view === 'open') {
    renderOpen();
  } else {
    renderIndex();
  }
}

function isInternalResearchHref(href) {
  return href === '/research' || href.startsWith('/research/') || href === '/research#open';
}

function navigateTo(href) {
  if (`${window.location.pathname}${window.location.hash}` === href) {
    route();
    return;
  }
  history.pushState(null, '', href);
  window.scrollTo(0, 0);
  route();
}

function onDocumentClick(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const link = event.target.closest('a[href]');
  if (!link) return;
  if (link.target === '_blank') return;
  const href = link.getAttribute('href');
  if (!href || !isInternalResearchHref(href)) return;
  event.preventDefault();
  navigateTo(href);
}

function boot() {
  mountSiteFooter();
  const parsed = parseResearchLocation() || { view: 'index' };
  setNavSelectHandlers({
    onSignOut: () => {
      signOut();
    },
  });
  initUniversalNav({ context: 'platform', activeTab: currentTab(parsed.view) });
  refreshAuth();
  handleAuthUrlErrors();

  document.addEventListener('click', onDocumentClick);
  window.addEventListener('popstate', () => route());

  route();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
