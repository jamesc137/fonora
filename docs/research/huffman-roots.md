# Optimal sounds, wrong premise

> **TL;DR.** This experiment gave roughly 200 ranked human concepts phonetically *optimal* syllables, using a Huffman-like scheme where the most fundamental concepts earn the shortest, cheapest sounds. The math was elegant and the correlation was clean — yet it quietly proved the premise was wrong. Assigning sounds before agreeing on meaning, mixing grammar into the lexicon, and chaining roots into flat unteachable compounds were all symptoms of optimizing the wrong thing.

## The question

If concepts have a natural priority — *person* and *water* matter more than *kawa* — can we allocate syllables optimally, giving the most fundamental concepts the cheapest, shortest sounds?

## The hypothesis

Treat it as a coding problem. Sort ~200 primitives by curated priority, map priority to a target phonetic cost (a Huffman-like allocation), and score candidate syllables with the [Gen 3.1](/research/notes/distinctiveness-gen31) distinctiveness measure plus particle- and compound-flow heuristics.

## The constraints

- CV / CVC / CV-CV templates, with CVC penalized for high-priority concepts.
- Reserved grammar particles (`mi`, `ta`, `na`) and blocked syllables held out of the pool.
- A 407-syllable pool ranked by phonetic cost.

## What we built

[`tools/fonoran-primitive-roots.js`](https://github.com/jamesc137/fonora/blob/main/tools/fonoran-primitive-roots.js) produced 200 primitives plus 81 compounds, written up in the dated [primitive roots report](../fonoran-primitive-roots-report.md).

## What happened

The numbers behaved beautifully — top-decile concepts averaged a phonetic cost of 9.7 versus 68 for the bottom decile. But the *premise* failed in three ways: grammar leaked into the lexicon (`because` became a root; `with`/`without` competed as words), compounds were flat and unteachable (collective + person + conflict mashed into **lobawi**), and — most tellingly — every sound had been assigned *before* anyone approved the underlying meanings. It was never adopted as canonical.

## The question that followed

The recurring mistake was ordering: we kept optimizing phonetics before settling semantics. What if meaning came first — a deliberate, human-approved inventory of concepts — and sound assignment waited its turn?
