# Vowels as grammar: the v3 rebuild

> **TL;DR.** Instead of adding more vowel keys, v3 changed the *grammar* of how vowels are written. A simple vowel is always exactly two symbols; a diphthong is always four. By anchoring vowels on manner and place — and routing the GOAT diphthong to its own key — v3 resolved the worst v2 homographs without inflating the symbol set, and retired the old double-vowel marker for good.

## The question

[v2](/research/notes/vowel-mergers-v2) showed that compact merges create homographs. Could vowels be expressed as a fixed, predictable *symbol grammar* — rather than a flat list of keys — so that fidelity improves without the inventory ballooning?

## The hypothesis

If vowels are anchored on the same manner/place axes as consonants, the system gains structure for free. A fixed shape — `⚬X` for a simple vowel, `⚬XᵔY` for a diphthong — makes vowels parseable by rule, and the troublesome GOAT diphthong (`oʊ`) can be routed to its own `oh` key, splitting it cleanly from MOUTH.

## The constraints

- A simple vowel must be **exactly two symbols**; a diphthong **exactly four**.
- The legacy `⚬⚬` marker is **forbidden**, enforced by [`js/vowel-architecture-validation.js`](https://github.com/jamesc137/fonora/blob/main/js/vowel-architecture-validation.js).
- Some intentional, low-harm merges (STRUT/schwa, LOT/THOUGHT/PALM) are acceptable to keep the system small.

## What we built

The v3 tables live in the authoritative [language-rules.md](../language-rules.md) (`fonora_version: v3`), with validation that rejects any output using the retired marker. The [Sound Grid](/script#grid) renders the new vowel grammar directly from those rules.

## What happened

The worst v2 cases — most notably MOUTH versus the GOAT diphthong — were resolved, and composition became rule-driven instead of ad hoc. The earlier [vowel decision report](../FONORA_VOWEL_DECISION_REPORT.md) was explicitly marked superseded. v3 is the vowel system the script still uses.

## The question that followed

The script now handled English vowels well. But Fonora's ambition was a *universal* phonetic script. Would these rules survive contact with languages whose vowels English never taught us about?
