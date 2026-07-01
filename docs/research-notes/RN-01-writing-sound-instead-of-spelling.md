# RN-01 — Writing sound instead of spelling

**Date:** Jun 20, 2026
**Stage:** Foundational
**Project:** Fonora Script
**Status:** Complete

---

## Research Question

Can a writing system encode *how* a sound is physically produced — where in the vocal tract it is made and how the airstream is shaped — instead of encoding a word's historical spelling?

This question matters because almost every writing system in common use today is a record of etymology, not of articulation. English `c` can be /k/ or /s/ depending on accident of borrowing; `gh` is silent in "night" and a fricative in Scots "loch." Learners memorize thousands of spelling-to-sound exceptions because the *shape* of a Latin letter carries no information about where the tongue or lips go. The letter is a historical artifact, and pronunciation is reconstructed from it only through years of exposure, not by reading the symbol itself.

Fonora's starting premise, at the moment of the very first commit ("Fonora phonetic symbol research tool," Jun 20, 2026), was to ask whether the symbol *itself* could carry articulatory information — so that seeing the symbol tells you something true about the mouth, rather than something true about fifteenth-century French orthography.

## Hypothesis

The working hypothesis was that speech could be described as a small, composable grid rather than an open-ended alphabet. If **place of articulation** (lips, front tongue, middle tongue, back tongue, throat) and **manner of articulation** (plain, voiced, frictive, nasal, glide) are treated as two independent axes, then any consonant is just a coordinate on that grid, and its symbol can be *assembled* from a place glyph plus a manner glyph rather than memorized as an arbitrary shape. A separate marker could then be reused to build vowels out of the same primitive set, keeping the whole system compact.

This was framed explicitly as a hypothesis to test, not a settled design. The original `language-rules.md` marks entire sections — the vowel table, several derived sounds — as "experimental," "draft," or "provisional," and states plainly that undefined grid cells are "intentional research gaps," not defects to be papered over. The stated goal at this stage was to see whether pronunciation could become *more intuitive and less a matter of rote memorization* if the symbol described the mouth instead of the word's history. It was not claimed, at the time or since, that this would be proven correct — only that it was worth building enough of the system to find out.

## Approach

Articulation was chosen as the foundation because it is the one property of a sound that is true across languages and independent of any particular writing tradition: /p/ is made with the lips whether you spell it with a Latin *p*, a Cyrillic п, or a Japanese ぱ. Building from place and manner meant the script wasn't tied to English orthography or to any single language's phoneme inventory — a decision that ended up mattering directly once Fonora had to handle Spanish, French, German, Japanese, Arabic, and Mandarin (documented separately, see the pipeline work referenced below).

The compositional idea was concrete from the start: a **manner** glyph combined with a **place** glyph produces a consonant symbol, written tightly with no space (`modifier + place`, e.g. voiced lips = ⌔○). The initial grid defined 5 places × 4 manners plus a plain (no-modifier) row — 9 core primitive shapes generating up to 25 consonant cells, most of which were filled at once, some deliberately left open.

Fonora intentionally did not adapt the Latin alphabet. The nine primitives were abstract geometric glyphs (○, ∩, ⌒, ∪, ⊐ for places; ⌔, ⌕, ⌙, ⌓ for manners) rather than modified Latin letters. Reusing Latin shapes would have carried the very baggage the project was trying to escape — a reader's existing letter-to-sound associations from their native spelling system. A fresh glyph set had no competing history to unlearn.

Two early design principles show up directly in the source: undefined grid cells are gaps, not errors, and the system should not silently invent symbols to fill them; and symbol composition should render as a single visual unit rather than as separated characters, since the whole point was for a *shape* to be legible as a sound, not as a sequence of independent marks. The throat place row is a good example of both principles at once — it had no defined standalone consonant in the first version, and its main early job was repurposed for constructing vowels instead (throat symbol + place symbol, e.g. ⊐+∩ for /e/), rather than being force-filled with an invented throat consonant.

## Evaluation

There was no formal user study at this stage — the project was one developer testing an idea against a small set of concrete, answerable questions, using the tools that shipped in the same first commit: a symbol keyboard, a live decode panel, a reverse sound-to-symbol lookup, and a simple decode/construct quiz.

The questions the prototype was actually built to answer were narrower than "does this work," and more like:

- **Coverage:** does the place × manner grid reach every consonant category the project cared about at this stage? Twenty of twenty-five grid cells were filled immediately; the remaining five (all in the throat column) were marked as open gaps rather than forced.
- **Inferability:** if you decompose a symbol into its place and manner parts, can you recover the sound without having memorized the whole word first? The decode quiz and reverse lookup existed specifically to exercise this in both directions — from symbol to sound and from sound to symbol.
- **Visual consistency:** does a composed symbol read as one unit? This produced an explicit rule that combinations must render tightly, with no space between the manner glyph and the place glyph, and that the app should normalize away accidental spacing on decode.
- **Compactness:** does composition stay small as more sounds are added, or does it explode? The vowel experiment states this directly as a design constraint — "all vowel representations should remain two symbols long" — prioritizing a fixed, predictable length over phonetic completeness.

## Findings

The articulatory grid held up as a foundation. Composing a manner glyph with a place glyph reliably produced legible, distinct consonants for stops, fricatives, nasals, and glides across all four non-throat places — the core hypothesis, that a sound could be described rather than memorized, was at least usable enough to build the rest of the app on top of.

The limitations were documented alongside the successes, not discovered later. The throat column could not hold a full parallel set of consonants the way the other four places could; it was left with open research gaps from day one. The vowel system was the weakest part of the initial design and was labeled as such throughout — vowels were built by reusing the throat symbol as a marker plus a place glyph, long and short vowels were deliberately collapsed into the same two symbols ("long vowels are not currently distinguished"), and the whole section carried a disclaimer that it was provisional and existed to test *readability*, not to be phonetically precise.

Simplicity was chosen over completeness even at this early stage, and that trade-off was explicit rather than accidental: the two-symbol vowel constraint and the collapsed long/short distinction were both stated as intentional simplifications to evaluate legibility first. It was also already clear, even in the first commit, that a pure spelling-to-symbol path (the "Legacy Encoder," working directly from English orthography) was a dead end for anything beyond comparison — the same commit already treated a phonetic pipeline as the preferred direction, ahead of spelling-based rules. That realization — that spelling itself would have to be bypassed to reach real pronunciation — became the seed of the next research note.

## What Changed

The core composition principle survived essentially intact: Fonora's current encoding rules still describe five places and four manner modifiers composing at load time as `modifier + place`, generated from a single markdown source of truth rather than hardcoded — the same idea present in the original `language-rules.md`.

What evolved is mostly at the edges the first version flagged as unfinished. The vowel marker was originally the throat consonant symbol doing double duty; it has since become a dedicated vowel indicator (⚬), decoupled from any consonant place, removing an early ambiguity between "throat as a place of articulation" and "throat as a vowel prefix." Three of the five throat-column gaps identified in the first version (plain, voiced, and fricative) were later filled with real glottal, velar-fricative, and uvular-fricative sounds; two — nasal+throat and glide+throat — remain open research gaps in the current rules, unchanged from the original grid.

Later notes trace what this foundation made possible and where it had to be rebuilt:

- RN-02 — Teaching the machine to hear (the phonetic pipeline that replaced spelling-based rules)
- RN-03 — How few vowels can English tolerate? (the first attempt to formalize the vowel experiment)
- RN-04 — Vowels as grammar: the v3 rebuild (replacing the collapsed vowel markers with a fixed symbol grammar)
- RN-06 — Hunting ambiguity in the script (auditing whether composed symbols ever collide)

## Open Questions

This first version answered enough to justify continuing, but it left several questions unresolved that shaped everything that came after:

- How should arbitrary text — any word, in any language, from any speaker — be reliably mapped onto this grid, given that spelling itself is not a trustworthy guide to pronunciation?
- Can the two-symbol vowel constraint survive contact with a language that has many more vowel qualities than the grid has marker slots, without producing homographs?
- Should the throat column's remaining gaps ever be filled, or are they more honest left open?
- Is collapsing long and short vowels into one symbol an acceptable simplification once real words are tested at scale, or does it lose meaning that matters?

## References

- Related commits: `63b79cf` — initial commit introducing the articulatory grid, encoder, and decode quiz
- Documentation: [`docs/language-rules.md`](../language-rules.md) (current v3 rules), original `language-rules.md` and `encoder-rules.md` from the initial commit
- Interactive demo: Sound Grid (`/#grid`) and Alphabet (`/#alphabet`) views
- Future research notes: RN-02 (phonetic pipeline), RN-03 (vowel mergers v2), RN-04 (vowel grammar v3), RN-06 (collision audit)
