# Fonoran root workflow

> **Status:** active · Words first, semantics follow · Root Review is the primary development workflow

## Philosophy

Fonoran is designed the way a real language evolves:

1. **Words come first** — phonetic roots with meanings humans can say and remember.
2. **The semantic network evolves afterward** — compounds and trees grow from approved roots.
3. **Human judgment is canonical** — AI proposes; you approve, reject, or edit.

The previous workflow tried to freeze the entire semantic hierarchy before assigning sounds. **That is superseded.** Semantic refinement can happen continuously; what must be stable first is the **root vocabulary**.

## Workflow

```text
Generate ~100 candidates → Root Review → Canonical roots → Compounds (later)
```

| Step | What happens |
| --- | --- |
| 1. Generate | `npm run fonoran:root-candidates` assigns spellings + IPA to ~99 concepts |
| 2. Review | Open **Root Review** at `/fonoran/#root-review` |
| 3. Decide | Approve, reject, edit spelling/meaning/pronunciation, or regenerate |
| 4. Canonical | Approved roots → `data/fonoran-approved-roots.json` + lab dictionary |
| 5. Compounds | Only after ~100 roots stabilize — build words from canonical roots |

## Unified concepts

All naming tools read from **`data/fonoran-root-candidates.json`** via `GET /api/fonoran/concepts` and `GET /api/fonoran/lexicon`:

| Tool | Uses concepts |
| --- | --- |
| Root Review | Candidate spellings + gloss definitions |
| Word Matcher | Same concepts + proposed spellings; hides matched pairs |
| Root Creator | Concept picker (domains + glosses) |
| Translator | Alias index + interpretive rules ([fonoran-interpretive-translator.md](fonoran-interpretive-translator.md)) |
| Word Review | Root Review card layout + concept lookup |

Approved roots store `concept_id` on lab sounds so meaning stays the full gloss while English aliases resolve in translation.


Each proposed root includes:

| Field | Example |
| --- | --- |
| Fonoran spelling | `ba` |
| IPA | `/bʌ/` |
| English concept | a sentient being; someone |
| Domain | being |
| Why primitive | Fundamental being concept… |
| Pronunciation ease | very easy (1–5) |
| Semantic usefulness | very high (1–5) |

Sound assignment optimizes for:

- Shortest, easiest syllables on highest-leverage concepts
- Pleasant compounds and cross-language accessibility
- Avoiding awkward syllables (`pi`, `pee`, `po`, `poo`) unless deliberately added later

## Files

| File | Role |
| --- | --- |
| [`data/fonoran-semantic-primitives.json`](../data/fonoran-semantic-primitives.json) | Concept inventory (no phonetics) |
| [`data/fonoran-root-candidates.json`](../data/fonoran-root-candidates.json) | Proposed roots awaiting review |
| [`data/fonoran-approved-roots.json`](../data/fonoran-approved-roots.json) | Human-approved canonical roots |
| [`tools/fonoran-root-candidates.js`](../tools/fonoran-root-candidates.js) | Generator |
| [`tools/fonoran-root-store.js`](../tools/fonoran-root-store.js) | Review API persistence |

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/fonoran/roots/candidates` | List candidates (`?status=pending`) |
| GET | `/api/fonoran/roots/candidates/:id` | One candidate |
| PATCH | `/api/fonoran/roots/candidates/:id` | `{ action: approve\|reject\|edit\|reopen, … }` |
| POST | `/api/fonoran/roots/candidates/:id/regenerate` | New spelling for one concept |
| POST | `/api/fonoran/roots/generate` | Regenerate all (preserves approved/rejected) |
| GET | `/api/fonoran/roots/canonical` | Approved root inventory |

## Superseded approaches

| Old | Why replaced |
| --- | --- |
| Semantic-first, phonetics deferred | Roots need to feel speakable before theory freezes |
| Bulk `fonoran-primitive-roots` import | Machine output skipped human review |
| Gen3 canonical registry (36 DDA primitives) | Different experiment; root review is the new path |

The semantic foundation docs remain useful **reference material** for compound design later — they are not a gate before phonetics.

## Commands

```bash
npm run fonoran:root-candidates   # generate / refresh candidates
npm start                         # open /fonoran/#root-review
```

*Related: [fonoran-grammar.md](fonoran-grammar.md) · [fonoran-semantic-foundation.md](fonoran-semantic-foundation.md) (reference)*
