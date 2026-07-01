# Concepts are canonical, sounds are editorial proposals

> **TL;DR.** This is the pipeline that put the Constitution into practice. Concepts are the fixed input; sound assignments are *proposals* that a human approves or rejects. Priority drives the order of assignment, collision and boundary scores advise rather than dictate, rejected spellings are reserved, and approved roots are locked through every rebuild. All 118 root candidates have been approved — the remaining gaps are interface polish, not linguistics.

## The question

How do we assign exactly one Fonora-script spelling per concept while keeping a human firmly in editorial control — never letting an algorithm silently mint vocabulary?

## The hypothesis

**Concepts are canonical; sounds are editorial proposals until approved.** A concept's priority class drives the order in which it gets a sound. Collision, boundary, and distinctiveness scores are *aids* to the editor, not gates that decide on their own.

## The constraints

- **CV/CVC-only**, enforced by a `parseSyllable` gate in [`tools/fonoran-build.js`](https://github.com/jamesc137/fonora/blob/main/tools/fonoran-build.js); CVC is penalized so high-priority concepts get shorter CV forms.
- Only three review states exist: `pending`, `approved`, `rejected`.
- **Rejected spellings are reserved** so they are not re-proposed; **approved roots are locked** through rebuilds.
- Compound-candidate concepts are ineligible for root generation until promoted.

## What we built

The converged path: the concept inventory feeds [`tools/fonoran-root-sound-assign.js`](https://github.com/jamesc137/fonora/blob/main/tools/fonoran-root-sound-assign.js), which proposes candidates into the [Review](/language#review) queue; approved roots flow into curated compounds and the lab runtime via [`fonoran-build.js`](https://github.com/jamesc137/fonora/blob/main/tools/fonoran-build.js). The full pipeline is documented in the [Fonoran guide](../fonoran.md). Editors work in the [Root Creator](/language#roots) and [Concept Editor](/language#concepts).

## What happened

The loop works end to end: all 118 root candidates have been reviewed and approved. The pipeline's remaining rough edges are UX — a split review experience and a misleading "Generated" bucket — rather than anything about the language itself.

## The question that followed

With roots flowing cleanly, the next boundary became grammar. Which relationships belong in the sentence skeleton, and which belong in the lexicon?
