/**
 * Research notebook index: the authoritative metadata for every research note.
 *
 * Each note's prose lives in `docs/research/<slug>.md`; this module holds the
 * structured metadata (status, act, ordering, and the cross-links that form the
 * "Continue the thread" block and the timeline graph). Keeping it in one place
 * lets the notebook index, the timeline, the per-note SEO tags, and sitemap
 * generation share a single source of truth.
 */

/** Display order + labels for the three eras the notebook is organized into. */
export const RESEARCH_ACTS = [
  {
    id: 'act-1',
    label: 'Act I — Writing sound, not spelling',
    blurb: 'Fonora the script: encoding how speech is produced instead of how it is spelled.',
  },
  {
    id: 'act-2',
    label: 'Act II — Inventing a language from first principles',
    blurb: 'Fonoran the language: six generations of trying to grow a vocabulary from a grid.',
  },
  {
    id: 'act-3',
    label: 'Act III — A language people can actually use',
    blurb: 'The pivot from algorithmic correctness to recoverable, human communication.',
  },
];

/**
 * @typedef {Object} ResearchLink
 * @property {string} label
 * @property {string} [path] Repo path (for docs / source links)
 * @property {string} [href] Absolute href (for tool links)
 */

/**
 * @typedef {Object} ResearchNote
 * @property {string} slug
 * @property {string} code Short notebook code, e.g. RN-01
 * @property {string} title
 * @property {string} status Foundational | Active | Superseded | Open
 * @property {string} act Act id
 * @property {string} date ISO date
 * @property {string} description Meta description (SEO)
 * @property {string} abstract One-line summary for the notebook index
 * @property {string[]} related Slugs of thematically linked notes
 * @property {ResearchLink[]} docs Reference docs this note links to
 * @property {ResearchLink[]} tools Interactive tools this note links to
 * @property {ResearchLink[]} source Source files on GitHub
 */

/** @type {ResearchNote[]} Ordered chronologically; prev/next derive from this order. */
export const RESEARCH_NOTES = [
  {
    slug: 'articulation-grid',
    code: 'RN-01',
    title: 'Writing sound instead of spelling',
    status: 'Foundational',
    act: 'act-1',
    date: '2026-06-20',
    description:
      'How Fonora began: a writing system that encodes where and how a sound is produced — a composable grid of place and manner — instead of inheriting an alphabet.',
    abstract:
      'The founding question — can a script encode articulation (place x manner + a vowel marker) rather than orthography?',
    related: ['ipa-pipeline', 'vowel-grammar-v3'],
    docs: [{ label: 'Encoding rules (language-rules.md)', path: 'docs/language-rules.md' }],
    tools: [
      { label: 'Sound Grid', href: '/script#grid' },
      { label: 'Alphabet', href: '/script#alphabet' },
    ],
    source: [
      { label: 'js/rules.js', path: 'js/rules.js' },
      { label: 'js/encode.js', path: 'js/encode.js' },
    ],
  },
  {
    slug: 'ipa-pipeline',
    code: 'RN-02',
    title: 'Teaching the machine to hear',
    status: 'Active',
    act: 'act-1',
    date: '2026-06-21',
    description:
      'Turning arbitrary text into Fonora symbols with a phonetic pipeline: Text -> eSpeak NG -> IPA -> normalize -> encode -> decode, and the source-of-truth debt it created.',
    abstract:
      'A phonetic pipeline (eSpeak -> IPA -> normalize -> encode) beats spelling rules — but leaves a split source of truth.',
    related: ['articulation-grid', 'vowel-mergers-v2', 'multilingual-script'],
    docs: [
      { label: 'IPA pipeline report', path: 'docs/IPA-PIPELINE-REPORT.md' },
      { label: 'IPA normalization', path: 'docs/ipa-normalize.md' },
      { label: 'eSpeak integration', path: 'docs/espeak-integration.md' },
    ],
    tools: [
      { label: 'Transliterate', href: '/script#translator' },
      { label: 'Pronunciation Validation', href: '/tools#pronunciation-validation' },
    ],
    source: [{ label: 'js/ipa-normalize.js', path: 'js/ipa-normalize.js' }],
  },
  {
    slug: 'vowel-mergers-v2',
    code: 'RN-03',
    title: 'How few vowels can English tolerate?',
    status: 'Superseded',
    act: 'act-1',
    date: '2026-06-21',
    description:
      'The v2 double-vowel experiment: how a compact vowel inventory that merged lexical sets within a key produced 100% round-trips but high-impact homographs like bed/bird.',
    abstract:
      'A compact 13-key vowel inventory merged lexical sets within keys — round-trips passed, but bed/bird collided.',
    related: ['vowel-grammar-v3', 'collision-audit', 'ipa-pipeline'],
    docs: [{ label: 'Vowel decision report (v2)', path: 'docs/FONORA_VOWEL_DECISION_REPORT.md' }],
    tools: [{ label: 'Sound Grid', href: '/script#grid' }],
    source: [{ label: 'js/vowel-readability-suite.js', path: 'js/vowel-readability-suite.js' }],
  },
  {
    slug: 'vowel-grammar-v3',
    code: 'RN-04',
    title: 'Vowels as grammar: the v3 rebuild',
    status: 'Active',
    act: 'act-1',
    date: '2026-06-22',
    description:
      'Replacing merged double-vowels with a fixed symbol grammar (simple vowel = two symbols, diphthong = four) that resolves the worst v2 homographs without exploding the symbol count.',
    abstract:
      'Vowels become a fixed symbol grammar instead of merged keys, splitting MOUTH from GOAT and retiring the v2 marker.',
    related: ['vowel-mergers-v2', 'multilingual-script', 'collision-audit'],
    docs: [{ label: 'Encoding rules (language-rules.md)', path: 'docs/language-rules.md' }],
    tools: [{ label: 'Sound Grid', href: '/script#grid' }],
    source: [
      { label: 'js/vowel-architecture-validation.js', path: 'js/vowel-architecture-validation.js' },
    ],
  },
  {
    slug: 'multilingual-script',
    code: 'RN-05',
    title: 'One script for every language',
    status: 'Active',
    act: 'act-1',
    date: '2026-06-23',
    description:
      'Encoding many languages from a shared IPA pipeline, and the Spanish "perro" vowel bug that proved English vowel rules must be scoped per language.',
    abstract:
      'A shared pipeline plus an English-only vowel overlay — discovered by fixing a Spanish vowel bug.',
    related: ['ipa-pipeline', 'collision-audit'],
    docs: [{ label: 'Multilingual support', path: 'docs/multilingual-support.md' }],
    tools: [
      { label: 'Samples', href: '/learn#listening' },
      { label: 'Transliterate', href: '/script#translator' },
    ],
    source: [{ label: 'js/ipa-normalize.js', path: 'js/ipa-normalize.js' }],
  },
  {
    slug: 'collision-audit',
    code: 'RN-06',
    title: 'Hunting ambiguity in the script',
    status: 'Open',
    act: 'act-1',
    date: '2026-06-22',
    description:
      'An exhaustive audit of where Fonora symbol composition produces collisions and greedy-decoder hazards — and the design decisions it surfaced but did not make.',
    abstract:
      'Exhaustive inventory + concatenation analysis: zero exact collisions, but real homograph hazards await design calls.',
    related: ['vowel-mergers-v2', 'vowel-grammar-v3'],
    docs: [
      { label: 'Collision audit', path: 'docs/FONORA_COLLISION_AUDIT.md' },
      { label: 'Cleanup audit (2026)', path: 'docs/FONORA_CLEANUP_AUDIT.md' },
    ],
    tools: [{ label: 'Pronunciation Validation', href: '/tools#pronunciation-validation' }],
    source: [{ label: 'js/collision-audit.js', path: 'js/collision-audit.js' }],
  },
  {
    slug: 'roots-from-grammar',
    code: 'RN-07',
    title: 'Can words grow from a grid? (Gen 1 and Gen 2)',
    status: 'Superseded',
    act: 'act-2',
    date: '2026-06-24',
    description:
      'The first two generations of Fonoran vocabulary: hand roots with grammar-vowel inflection, then coordinate-driven roots with Indo-European collision repair.',
    abstract:
      'Gen 1 grew word families from grammar-vowels; Gen 2 added collision repair — both stayed concept-first and English-adjacent.',
    related: ['dda-coordinates', 'huffman-roots'],
    docs: [{ label: 'Generator archive', path: 'docs/fonoran-generator-archive.md' }],
    tools: [{ label: 'Dictionary', href: '/language#dictionary' }],
    source: [{ label: 'docs/fonoran-generator-archive.md', path: 'docs/fonoran-generator-archive.md' }],
  },
  {
    slug: 'dda-coordinates',
    code: 'RN-08',
    title: 'Meaning from coordinates: the Gen 3 DDA experiment',
    status: 'Superseded',
    act: 'act-2',
    date: '2026-06-24',
    description:
      'Gen 3 inverted the problem: meaning as a position in <Depth, Mode, Aspect>, with familiar concepts like "river" appearing only as derivations, never primitives.',
    abstract:
      'Gen 3 treated meaning as a coordinate in the articulation grid — river = flow + path = "xaeli".',
    related: ['roots-from-grammar', 'distinctiveness-gen31', 'the-constitution'],
    docs: [{ label: 'DDA Gen 3 (archive)', path: 'docs/fonoran-gen3.md' }],
    tools: [{ label: 'Dictionary', href: '/language#dictionary' }],
    source: [{ label: 'tools/fonoran-gen3.js', path: 'tools/fonoran-gen3.js' }],
  },
  {
    slug: 'distinctiveness-gen31',
    code: 'RN-09',
    title: 'Making invented words memorable (Gen 3.1)',
    status: 'Superseded',
    act: 'act-2',
    date: '2026-06-25',
    description:
      'Gen 3.1 improved learnability while leaving DDA coordinates unchanged, spreading phonetic vowels within native pools to raise memorability from 70 to 85.',
    abstract:
      'A distinctiveness layer over Gen 3: memorability 70 -> 85 and 100% parseable, at a 31% grid-repair cost.',
    related: ['dda-coordinates', 'huffman-roots'],
    docs: [{ label: 'Gen 3.1 phonetic layer', path: 'docs/fonoran-gen3-1.md' }],
    tools: [{ label: 'Dictionary', href: '/language#dictionary' }],
    source: [{ label: 'tools/fonoran-gen3-1.js', path: 'tools/fonoran-gen3-1.js' }],
  },
  {
    slug: 'huffman-roots',
    code: 'RN-10',
    title: 'Optimal sounds, wrong premise',
    status: 'Superseded',
    act: 'act-2',
    date: '2026-06-27',
    description:
      'A Huffman-like allocation gave ~200 ranked human primitives optimal syllables — and revealed that optimizing sound before agreeing on meaning was the wrong order.',
    abstract:
      '200 primitives got phonetically optimal syllables, but grammar leaked into roots and compounds were flat and unteachable.',
    related: ['distinctiveness-gen31', 'semantic-foundation'],
    docs: [{ label: 'Primitive roots report', path: 'docs/fonoran-primitive-roots-report.md' }],
    tools: [{ label: 'Dictionary', href: '/language#dictionary' }],
    source: [{ label: 'tools/fonoran-primitive-roots.js', path: 'tools/fonoran-primitive-roots.js' }],
  },
  {
    slug: 'semantic-foundation',
    code: 'RN-11',
    title: 'The irreducible dimensions of meaning',
    status: 'Active',
    act: 'act-3',
    date: '2026-06-28',
    description:
      'Asking what ~100 dimensions of reality (not English words) let compounds write themselves, using the "fundamental experience test" and deferring phonetics entirely.',
    abstract:
      'Meaning first: ~99 primitive dimensions chosen by a fundamental-experience test, with sounds deliberately deferred.',
    related: ['huffman-roots', 'the-constitution', 'grammar-particles'],
    docs: [
      { label: 'Semantic foundation', path: 'docs/fonoran-semantic-foundation.md' },
      { label: 'Fonoran grammar', path: 'docs/fonoran-grammar.md' },
    ],
    tools: [{ label: 'Concept Editor', href: '/language#concepts' }],
    source: [
      { label: 'data/fonoran-semantic-primitives.json', path: 'data/fonoran-semantic-primitives.json' },
    ],
  },
  {
    slug: 'the-constitution',
    code: 'RN-12',
    title: 'The campfire test: communication over correctness',
    status: 'Foundational',
    act: 'act-3',
    date: '2026-06-30',
    description:
      'The pivot that reframed everything: Fonoran as a cross-lingual communication experiment where success is recoverable meaning, judged by the campfire test and human playtests.',
    abstract:
      'Fonoran is an experiment in recoverable meaning, not a perfect ontology — generators propose, humans approve.',
    related: ['semantic-foundation', 'editorial-pipeline', 'puzzle-conversation'],
    docs: [{ label: 'The Fonoran Constitution', path: 'docs/fonoran-constitution.md' }],
    tools: [{ label: 'Puzzle Conversation', href: '/language#puzzle' }],
    source: [{ label: 'docs/fonoran-constitution.md', path: 'docs/fonoran-constitution.md' }],
  },
  {
    slug: 'editorial-pipeline',
    code: 'RN-13',
    title: 'Concepts are canonical, sounds are editorial proposals',
    status: 'Active',
    act: 'act-3',
    date: '2026-06-28',
    description:
      'The converged CV/CVC pipeline: priority-driven sound assignment with collision and boundary scoring as aids, human review as the gate, and approved roots locked through every rebuild.',
    abstract:
      'A converged concept -> root -> compound -> lab pipeline where scoring advises and humans decide; all 118 roots approved.',
    related: ['the-constitution', 'grammar-particles', 'interpretive-translator'],
    docs: [{ label: 'Fonoran guide (pipeline)', path: 'docs/fonoran.md' }],
    tools: [
      { label: 'Root Creator', href: '/language#roots' },
      { label: 'Review', href: '/language#review' },
      { label: 'Concept Editor', href: '/language#concepts' },
    ],
    source: [
      { label: 'tools/fonoran-root-sound-assign.js', path: 'tools/fonoran-root-sound-assign.js' },
      { label: 'tools/fonoran-build.js', path: 'tools/fonoran-build.js' },
    ],
  },
  {
    slug: 'grammar-particles',
    code: 'RN-14',
    title: 'Grammar as particles, not words',
    status: 'Active',
    act: 'act-3',
    date: '2026-06-29',
    description:
      'Deciding which relationships — tense, logic, deixis, pronouns — belong in a closed grammatical class rather than the root lexicon, and reaching 100% translation coverage.',
    abstract:
      'Tense, logic, and deixis become closed-class particles, not roots — moving causation out of the lexicon.',
    related: ['semantic-foundation', 'editorial-pipeline', 'interpretive-translator'],
    docs: [{ label: 'Fonoran grammar', path: 'docs/fonoran-grammar.md' }],
    tools: [{ label: 'Grammar', href: '/language#grammar' }],
    source: [{ label: 'tools/fonoran-particles.js', path: 'tools/fonoran-particles.js' }],
  },
  {
    slug: 'interpretive-translator',
    code: 'RN-15',
    title: 'Compiling English into meaning',
    status: 'Active',
    act: 'act-3',
    date: '2026-06-28',
    description:
      'An English -> Fonoran compiler that resolves to the nearest approved concepts rather than word-for-word glosses, with a resolution cascade and honest red tokens for gaps.',
    abstract:
      'A three-layer compiler resolves English to the nearest approved concepts and shows unresolved words honestly in red.',
    related: ['grammar-particles', 'editorial-pipeline', 'typing-and-keyboard'],
    docs: [{ label: 'Interpretive translator', path: 'docs/fonoran-interpretive-translator.md' }],
    tools: [{ label: 'Translator', href: '/language#translator' }],
    source: [{ label: 'tools/fonoran-translator.js', path: 'tools/fonoran-translator.js' }],
  },
  {
    slug: 'typing-and-keyboard',
    code: 'RN-16',
    title: 'Typing an invented script',
    status: 'Active',
    act: 'act-3',
    date: '2026-06-30',
    description:
      'Closing the read-write loop with a visual QWERTY IME, keyboard testing, and spelling practice so learners can physically produce Fonora symbols.',
    abstract:
      'A visual QWERTY IME plus spelling and typing practice let learners produce — not just read — the script.',
    related: ['interpretive-translator', 'puzzle-conversation'],
    docs: [],
    tools: [
      { label: 'Keyboard Testing', href: '/tools#keyboard' },
      { label: 'Spelling Practice', href: '/learn#writing' },
    ],
    source: [{ label: 'js/fonora-keyboard-ui.js', path: 'js/fonora-keyboard-ui.js' }],
  },
  {
    slug: 'puzzle-conversation',
    code: 'RN-17',
    title: 'Can strangers recover meaning?',
    status: 'Open',
    act: 'act-3',
    date: '2026-06-30',
    description:
      'The current frontier: a puzzle-conversation protocol and playtests that measure recoverable meaning between two root-knowers better than any automated score.',
    abstract:
      'The live edge of the notebook — testing whether two root-knowers can recover each other\u2019s intended meaning.',
    related: ['the-constitution', 'typing-and-keyboard'],
    docs: [{ label: 'The Fonoran Constitution', path: 'docs/fonoran-constitution.md' }],
    tools: [{ label: 'Puzzle Conversation', href: '/language#puzzle' }],
    source: [{ label: 'data/fonoran-playtests.json', path: 'data/fonoran-playtests.json' }],
  },
];

const NOTE_BY_SLUG = new Map(RESEARCH_NOTES.map((n) => [n.slug, n]));

/** @param {string} slug */
export function getResearchNote(slug) {
  return NOTE_BY_SLUG.get(slug) ?? null;
}

/**
 * Previous/next notes in chronological reading order.
 * @param {string} slug
 */
export function getNoteNeighbors(slug) {
  const idx = RESEARCH_NOTES.findIndex((n) => n.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? RESEARCH_NOTES[idx - 1] : null,
    next: idx < RESEARCH_NOTES.length - 1 ? RESEARCH_NOTES[idx + 1] : null,
  };
}

/** Notes with status Open (drives the Open Questions view). */
export function getOpenNotes() {
  return RESEARCH_NOTES.filter((n) => n.status === 'Open');
}

/** Notes grouped by act, preserving act + chronological order. */
export function notesByAct() {
  return RESEARCH_ACTS.map((act) => ({
    act,
    notes: RESEARCH_NOTES.filter((n) => n.act === act.id),
  }));
}
