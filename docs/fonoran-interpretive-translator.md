# Interpretive Translator

> **Status**: Active. Compiles English into **nearest approved Fonoran concepts** — not word-for-word glosses.

## Philosophy

Fonoran is a language of **concepts**. English is input to a **semantic compiler**:

1. Parse into a **grammar frame** (roles, not parts of speech)
2. Map each slot to the **closest approved concept**
3. Emit **roman + particles** in Fonoran order

```example
all men are created equal

↓ frame

person · make · equal

↓ surface

ba no mal
```

Present has **no time particle**. Past uses **ta**, future **na**.

## Three layers

```text
English text
    ↓  Frame parser (phrase-aware, multi-sentence)
Semantic frame (subject, time, event, path, object, modifiers)
    ↓  Resolution (shared with Word Generator)
Concept ids + spellings
    ↓  Surface builder
Roman line + pronunciation + script
```

### Layer 1: Frame parser

Tokenizes English, skips articles/auxiliaries/conjunctions, assigns **grammar slots** per [fonoran-grammar.md](fonoran-grammar.md).

| Slot | Role |
| --- | --- |
| Subject | Who or what the sentence is about |
| Time | Tense particle or time phrase (`every morning`). **Omitted for present** |
| Event | What happens |
| Path | Spatial relation |
| Object | Landmark or patient |
| Modifiers | Adjectives, predicates, extra concepts |

**Before naive word-order fallback**, the parser tries:

| Pattern | Example |
| --- | --- |
| Sentence split | Paragraphs on `.` / `!` / `?` → `discourse` mode |
| Clause split | `and` + `the` / pronoun / verb → coordinated clauses |
| Time adverbial | `every morning`, `each day` → time slot |
| Idiom | `at war` → `conflict` |
| Be + participle / adjective | `are created equal`, `is quiet` |
| Linking verb + predicate | `air feels cool` → event `feel`, modifier `cool` |
| Phrasal verb | `wake up`, `wakes up` |
| Spatial phrase | `jumped over the moon` → event + path + object |
| Future peel | `going to`, `will` → `na` + main verb phrase |

**Pronouns:** `I` / `me` → particle **mi** (any slot). Other pronouns map to nearest concept hints (`we` → `collective`, etc.).

### Layer 2: Resolution

Shared module: `tools/fonoran-english-resolve.js` (also used by Word Generator).

**Tiers** (best → worst):

| Tier | Meaning | UI |
| --- | --- | --- |
| `direct` | Alias or lab match | default |
| `interpreted` | Rules, class, idiom, frame hint | yellow |
| `semantic` | WordNet synonym / hypernym | orange |
| `guessed` | Ephemeral compound suggestion | orange |
| `unknown` | No approved spelling | **red** `[english]` |

Resolution order per token:

1. Frame **concept hint** (linking verbs, idioms, path slots)
2. Direct alias — inventory, `data/localizations/en.json`, lab sounds/compounds
3. Class / irregular past — `data/fonoran-interpretation-rules.json`
4. WordNet (semantic tier), then compound guess
5. Unresolved — never silently dropped

**Locale aliases beat lab gloss aliases** for the same concept id. Interpretation never mints new roots.

### Layer 3: Surface

Walks resolved tokens in slot order. Grammar particles (`mi`, `ta`, `na`) emit as-is. Unresolved slots stay **red** in the UI.

## UI

Translator tab: `language/index.html` + `language/fonoran-app.js`.

- Color tiers on tokens (interpreted / semantic / unknown)
- Click unresolved tokens → Word Generator deep link
- Example chips use sentences that resolve cleanly (e.g. *All men are created equal*)

## Data files

| File | Purpose |
| --- | --- |
| `data/fonoran-interpretation-rules.json` | Idioms, verb classes, spatial preps, irregular past |
| `data/localizations/en.json` | English aliases per concept (`feel` ≠ `touch`) |
| `data/fonoran-approved-roots.json` | Approved spellings |
| `tools/fonoran-concepts.js` | Runtime inventory + alias index |
| `tools/fonoran-interpretation.js` | Phrase matchers, clause/time helpers |
| `tools/fonoran-english-resolve.js` | Unified resolution pipeline |

## API

`POST /api/fonoran/translate` returns `surface`, `semantic.slots`, `tokens` (with `resolution_kind`), `interpretations`, and `unresolved`.

## Extending

**Verb class** — add to `classes` in `fonoran-interpretation-rules.json`.

**Spatial prep** — add to `spatial_path` in the same file.

**Exact English word** — add alias under the concept in `data/localizations/en.json` (preferred over class rules).

**Idiom** — add multi-word entry to `idioms` in rules JSON.

## Formal / legal English

Long formal prose (declarations, statutes) will surface **many red tokens** until matching roots exist — that is intentional. The compiler should still:

- Split `be + participle` predicates into separate slots (`born` → event, adjectives as modifiers)
- Carry subject across coordinated clauses (`They … and should act …`)
- Omit modals (`should`, `must`, …) until obligation grammar exists
- Block bogus WordNet mappings (`reason` ≠ earth, `spirit` ≠ feel)

Example acceptance target (UDHR Article 1, today’s lexicon):

```text
ba me [free] mal [dignity] [rights] · fi tu pa [conscience] che mam sam [spirit] [brotherhood]
```

## Implementation

| Module | Role |
| --- | --- |
| `tools/fonoran-interpretation.js` | Rules, phrase/clause matchers |
| `tools/fonoran-english-resolve.js` | Alias lookup, tiers, WordNet |
| `tools/fonoran-translator.js` | Frame compiler, discourse merge, surface |
| `language/fonoran-app.js` | Translator UI |

## Future work

- Compound assembly from approved roots only (transparent paths)
- More coordinated-clause patterns (shared subject across `and` chains)
- Prefer approved lab spellings over legacy vocabulary when both exist
