# How few vowels can English tolerate?

> **TL;DR.** The v2 vowel system tried to be maximally compact: thirteen vowel keys, four of which deliberately merged several lexical sets. Round-trip tests passed at 100%, which made the design look finished — until we measured *readability* and found that bed and bird were spelled identically. The report this note is based on recommended deferring a fix until someone decided what mattered most.

## The question

English distinguishes far more vowels than a small symbol set can hold. If we have to merge some, *which* merges are tolerable, and how compact can the inventory get before distinct words collapse into the same spelling?

## The hypothesis

A compact phonemic shorthand can merge lexical sets *within* a single key as long as the contrasts *between* keys (TRAP vs LOT vs STRUT) stay clean. Thirteen keys, with four (`e`, `a`, `o`, `ow`) absorbing multiple Wells lexical families, should be enough.

## The constraints

- Minimize the symbol count — fewer keys are easier to learn.
- The test suite validated **cross-key** distinction, not **within-key** fidelity, which quietly shaped what "passing" meant.
- The double-vowel marker `⚬⚬` signalled a vowel slot.

## What we built

The v2 rules drove a runtime vowel map, backed by collision and readability suites (see [`js/vowel-readability-suite.js`](https://github.com/jamesc137/fonora/blob/main/js/vowel-readability-suite.js)). The full analysis is preserved in the [vowel decision report](../FONORA_VOWEL_DECISION_REPORT.md).

## What happened

The pipeline round-tripped perfectly, but readability told a different story. Four "multi-family" keys produced high-impact homographs: **bed** and **bird** both became `⚬⚬∩`; **hot**, **caught**, **father**, and **car** all collapsed onto `⚬⚬∪`. The report deliberately made no change — it laid out a decision matrix (minimal inventory vs learner readability vs lexical-set fidelity) and waited for a priority call.

## The question that followed

We could split the worst merges, but that risked exploding the symbol count and creating new concatenation hazards. Could a different *structure* for vowels fix readability without simply adding symbols?
