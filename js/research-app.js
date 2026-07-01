/**
 * Fonora research notebook app.
 *
 * Path-routed (for SEO) public laboratory notebook:
 *   /research                -> notebook index (notes grouped by act)
 *   /research#open           -> open questions (live research frontier)
 *   /research/timeline       -> visual dependency graph + chronological spine
 *   /research/notes/<slug>   -> a single research note (markdown + cross-links)
 *
 * Note prose lives in docs/research/<slug>.md; structured metadata lives in
 * js/research-notes.js. This module renders both and injects per-note SEO tags.
 */

import { escapeHtml, errorMessage } from './utils.js';
import { initUniversalNav, setActiveTab, setNavSelectHandlers } from './universal-nav.js';
import { refreshAuth, signOut, handleAuthUrlErrors } from './auth-session.js';
import { renderMarkdown, extractMarkdownTitle } from './markdown-render.js';
import { renderMermaidIn } from './mermaid-render.js';
import { SITE_ORIGIN } from './fonora-config.js';
import {
  docViewerHref,
  githubDocUrl,
  researchHref,
  researchNoteRepoPath,
  researchCanonical,
  parseResearchLocation,
} from './doc-urls.js';
import {
  RESEARCH_ACTS,
  RESEARCH_NOTES,
  getResearchNote,
  getNoteNeighbors,
  getOpenNotes,
  notesByAct,
} from './research-notes.js';

const ROOT_ID = 'research-root';
let loadToken = 0;

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

/* ------------------------------ index view ------------------------------ */

function renderIndex() {
  const el = root();
  if (!el) return;

  const acts = notesByAct()
    .map(
      ({ act, notes }) => `
      <section class="research-act" aria-labelledby="${escapeHtml(act.id)}-h">
        <header class="research-act__header">
          <h2 id="${escapeHtml(act.id)}-h" class="research-act__title">${escapeHtml(act.label)}</h2>
          <p class="research-act__blurb">${escapeHtml(act.blurb)}</p>
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
      ${acts}
    </article>`;

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
      hasPart: RESEARCH_NOTES.map((n) => ({
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

      <section class="research-act" aria-label="Open research notes">
        <h2 class="research-act__title">Open research notes</h2>
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
  const nid = (slug) => noteId(slug);
  const clean = (s) => String(s).replace(/"/g, '');
  const lines = ['flowchart TB'];
  RESEARCH_ACTS.forEach((act, ai) => {
    lines.push(`  subgraph act_${ai} ["${clean(act.label)}"]`);
    RESEARCH_NOTES.filter((n) => n.act === act.id).forEach((n) => {
      lines.push(`    ${nid(n.slug)}["${clean(n.code)}: ${clean(n.title)}"]`);
    });
    lines.push('  end');
  });
  for (let i = 0; i < RESEARCH_NOTES.length - 1; i += 1) {
    lines.push(`  ${nid(RESEARCH_NOTES[i].slug)} --> ${nid(RESEARCH_NOTES[i + 1].slug)}`);
  }
  lines.push(`  ${nid('dda-coordinates')} -. "demoted by" .-> ${nid('the-constitution')}`);
  lines.push(`  ${nid('huffman-roots')} -. "demoted by" .-> ${nid('the-constitution')}`);
  return lines.join('\n');
}

function renderSpine() {
  return notesByAct()
    .map(
      ({ act, notes }) => `
      <section class="research-spine__act">
        <h3 class="research-spine__act-title">${escapeHtml(act.label)}</h3>
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
        ${renderMarkdown(diagramMarkdown, { docPath: 'docs/research/timeline.md' })}
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

function linkGroup(label, links) {
  if (!links || !links.length) return '';
  const items = links
    .map(
      (l) =>
        `<li><a href="${escapeHtml(l.href)}"${l.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(l.label)}</a></li>`,
    )
    .join('');
  return `
    <div class="research-thread__group">
      <h3 class="research-thread__group-title">${escapeHtml(label)}</h3>
      <ul class="research-thread__links">${items}</ul>
    </div>`;
}

function continueThread(note) {
  const { prev, next } = getNoteNeighbors(note.slug);

  const related = (note.related || [])
    .map((slug) => getResearchNote(slug))
    .filter(Boolean)
    .map((n) => ({ label: `${n.code} · ${n.title}`, href: researchHref(n.slug) }));
  const relatedWithNeighbors = [];
  if (prev) relatedWithNeighbors.push({ label: `← ${prev.code} · ${prev.title}`, href: researchHref(prev.slug) });
  if (next) relatedWithNeighbors.push({ label: `${next.code} · ${next.title} →`, href: researchHref(next.slug) });
  relatedWithNeighbors.push(...related);

  const docs = (note.docs || []).map((d) => ({ label: d.label, href: docViewerHref(d.path) }));
  const tools = (note.tools || []).map((t) => ({ label: t.label, href: t.href }));
  const source = (note.source || []).map((s) => ({
    label: s.label,
    href: githubDocUrl(s.path),
    external: true,
  }));

  return `
    <footer class="research-thread" aria-label="Continue the thread">
      <h2 class="research-thread__title">Continue the thread</h2>
      <div class="research-thread__groups">
        ${linkGroup('Related research', relatedWithNeighbors)}
        ${linkGroup('Reference docs', docs)}
        ${linkGroup('Try it', tools)}
        ${linkGroup('Source', source)}
      </div>
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

  const repoPath = researchNoteRepoPath(slug);
  el.innerHTML = '<p class="research-loading">Loading note…</p>';

  let bodyHtml = '';
  let pageTitle = note.title;
  try {
    const res = await fetch(`/${repoPath}`);
    if (!res.ok) throw new Error(`Could not load ${repoPath} (HTTP ${res.status})`);
    const markdown = await res.text();
    if (token !== loadToken) return;
    pageTitle = extractMarkdownTitle(markdown) || note.title;
    bodyHtml = renderMarkdown(markdown, { docPath: repoPath, skipTitle: true });
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
      articleSection: (RESEARCH_ACTS.find((a) => a.id === note.act) || {}).label || 'Research',
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
