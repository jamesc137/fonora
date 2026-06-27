# Interpretive Translator

> **Status**: Active specification. The translator compiles English into the **nearest approved Fonoran concepts**, not literal word-for-word glosses.

## Philosophy

Fonoran is a language of **concepts**. English surface forms (verbs, prepositions, idioms) are inputs to a **semantic compiler** that:

1. Parses English into a **grammar frame** (roles, not parts of speech)
2. Maps each slot to the **closest concept** in the approved inventory
3. Emits **roman + particles** in Fonoran order

```example
the man jumps over the moon

↓ interpret

person · move · up · moon

↓ surface

ba che nam settelmes
```

Present has **no time particle**. The English words *jumps* and *over* compile to **move** and **up** because those are the nearest primitive concepts that preserve the meaning.

## Three layers

```text
English text
    ↓  Layer 1: Frame parser (phrase-aware)
Semantic frame (subject, time, event, path, object, modifiers)
    ↓  Layer 2: Interpretation (nearest concept)
Concept ids + spellings from approved roots / lab / legacy compounds
    ↓  Layer 3: Surface builder
Roman line + pronunciation + script
```

### Layer 1: Frame parser

Tokenizes English, skips articles and auxiliaries, assigns **grammar slots** per [fonoran-grammar.md](fonoran-grammar.md):

| Slot | Role |
| --- | --- |
| Subject | Who or what the sentence is about |
| Time | Tense particle. **Omitted for present** (default). `ta` past. `na` future |
| Event | What happens (action concept) |
| Path | Spatial relation (above, through, toward…) |
| Object | Landmark or patient |
| Modifiers | Extra concepts |

**Phrase patterns** run before naive word-order slotting. Example:

```text
SUBJECT + VERB + over + (the) + NOUN
→ subject=SUBJECT, event=VERB, path=over, object=NOUN
```

`"the man jumped over the moon"` is parsed as:

- subject: `man`
- time: `past` (`ta`, from *jumped*)
- event: `jumped` → `move`
- path: `over` → `up`
- object: `moon`

**Present is the default.** No time particle appears on the surface line.

**Future intent** (`going to`, `will`, `goes to`) peels the auxiliary and parses the following verb phrase:

```text
the man is going to jump over the moon
→ person · future · move · up · moon
→ ba na che nam settelmes
```

### Layer 2: Interpretation

When a direct alias lookup fails, the interpreter maps English to a **target concept id** using rules in `data/fonoran-interpretation-rules.json`:

| English | Interpreted concept | Reason |
| --- | --- | --- |
| jumped, ran, flew… | `move` | locomotion verb |
| over, above | `up` | spatial path above |
| under, below | `down` | spatial path below |
| across, through, toward | `path` | spatial path |

Resolution order for each slot:

1. **Direct alias** — concept inventory, lab sounds, legacy vocabulary
2. **Phrase hint** — e.g. path slot knows `over` → `up` before class lookup
3. **Class rule** — locomotion verbs → `move`, etc.
4. **Irregular past** — `ate` → `eat`, `ran` → `run`, … (`irregular_past` in rules JSON)
5. **Unresolved** — `[english]` placeholder; language still needs to grow

Interpretation **never invents new roots**. It only selects from existing spellings in the lookup index.

### Layer 3: Surface

Walks resolved tokens in slot order and joins Fonoran spellings. Grammar particles (`mi`, `ta`, `na`, …) are emitted as-is. **Present omits the time slot entirely.** Unresolved slots show `[english]` in the roman line.

## Data files

| File | Purpose |
| --- | --- |
| `data/fonoran-interpretation-rules.json` | Spatial preps, verb classes, phrase pattern metadata |
| `data/fonoran-root-candidates.json` | Concept inventory + default spellings |
| `data/fonoran-approved-roots.json` | Human-approved spellings (override candidates) |
| `data/fonoran-primitive-roots.json` | Legacy compounds + vocabulary (e.g. `moon` → `settelmes`) |
| `tools/fonoran-concepts.js` | Concept aliases (`man` → `person`, `group` → `collective`) |

## API response

`POST /api/fonoran/translate` returns:

```json
{
  "surface": { "roman": "ba ta che nam settelmes" },
  "semantic": {
    "skeleton": "Subject · Time · Event · Path · Object · Modifiers",
    "slots": { "subject": [...], "path": [...] }
  },
  "interpretations": [
    { "english": "jumped", "concept_id": "move", "reason": "locomotion verb", "role": "event" },
    { "english": "over", "concept_id": "up", "reason": "spatial path above", "role": "path" }
  ],
  "tokens": [ ... ],
  "unresolved": []
}
```

The Translator UI shows interpretation traces on each token when the English surface differs from the resolved concept.

## Extending rules

### Add a verb class

Edit `data/fonoran-interpretation-rules.json`:

```json
"classes": {
  "locomotion": {
    "concept_id": "move",
    "reason": "locomotion verb",
    "words": ["jump", "jumped", "..."]
  }
}
```

### Add a spatial preposition

```json
"spatial_path": {
  "beyond": { "concept_id": "far", "reason": "spatial path beyond" }
}
```

### Add a concept alias (preferred for exact English words)

Edit `EXTRA_ALIASES` in `tools/fonoran-concepts.js` when the English word should always map to one concept without a class rule.

## Future work

- **Compound assembly** from approved roots only (after ~100 roots reviewed)
- **Embedding similarity** on glosses for unknown words (constrained to approved inventory)
- **Prefer approved roots** over legacy vocabulary when both exist for the same concept
- More phrase patterns: `VERB + to + NP`, `be + ADJ`, causal clauses

## Implementation

| Module | Role |
| --- | --- |
| `tools/fonoran-interpretation.js` | Rules loader, class index, phrase matcher |
| `tools/fonoran-translator.js` | Frame compiler, lookup, surface builder |
| `fonoran/fonoran-app.js` | Translator UI with interpretation trace |
