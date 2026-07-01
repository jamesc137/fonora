# The campfire test: communication over correctness

> **TL;DR.** This is the pivot that reframed everything. The Fonoran Constitution declared the project an experiment in *cross-lingual communication*, not a perfect ontology or a deterministic generator. Success means **recoverable meaning** — would another root-knower probably understand you? — not identical words. Automated scores were demoted to advisors; human guess-the-meaning playtests became the real judge.

## The question

Can two strangers who share only a small set of roots — and no native language — *invent* expressions that the other can reasonably understand, without first agreeing on one canonical compound for every idea?

## The hypothesis

Fonoran is a communication experiment. The measure of any root, compound, or rule is a single question: **if someone only knew the shared roots, would they probably recover the intended meaning?** Communication, not perfect decomposition, is the goal.

## The constraints

- **The campfire test:** would two stranded strangers plausibly need this root in their first week together?
- A **tiered language**: a ~50-root communicative core, a ~100-root extended core, then an open-ended complete language.
- Compounds are **meaning-attempts**; the dictionary keeps a preferred form *and* understandable alternates.
- Automated heuristics **rank only**; human playtests win ties.

## What we built

The authoritative [Fonoran Constitution](../fonoran-constitution.md), which also defines the **puzzle-conversation** protocol for testing recoverability. It explicitly demotes the [DDA](/research/notes/dda-coordinates) track and the [Huffman](/research/notes/huffman-roots) run.

## What happened

Every downstream tool was reframed: generators *propose*, humans *approve*. "Optimal" stopped meaning "lowest phonetic cost" and started meaning "most recoverable." The earlier experiments were not deleted — they became the evidence that led here.

## The question that followed

A philosophy is not a pipeline. How do we operationalize it — turning concepts into sounds into compounds into a human review queue — without sliding back into auto-generation?
