# Hunting ambiguity in the script

> **TL;DR.** Before trusting the script, we tried to break it. An automated audit enumerated every encodable key and every concatenation, looking for collisions and greedy-decoder hazards. The good news: zero exact symbol collisions. The open news: real homograph hazards remain that require human design decisions, not code fixes — which is why this note is still marked *Open*.

## The question

A composable script can be ambiguous in ways its designers never notice. Where does combining Fonora symbols produce two readings of the same string — and where does a greedy decoder take the wrong path?

## The hypothesis

Ambiguity is discoverable by brute force. An exhaustive inventory of encodable keys, plus a systematic analysis of how they concatenate, can surface every class of collision so a human can judge it.

## The constraints

- **Do not invent new symbols** to "fix" a collision without explicit design approval.
- Separate genuine *language-design* ambiguities from mere *code* bugs.
- The audit must be reproducible, so it can run in CI.

## What we built

[`js/collision-audit.js`](https://github.com/jamesc137/fonora/blob/main/js/collision-audit.js) generates the [collision audit](../FONORA_COLLISION_AUDIT.md), and a companion [cleanup audit](../FONORA_CLEANUP_AUDIT.md) reviewed the wider system. Both are read-only reports — they diagnose, they do not change mappings.

## What happened

The audit found **zero exact symbol collisions**, but flagged real hazards: vowel+glide sequences that read like diphthongs, derived-order collisions like `th+t` versus `t+s`, and greedy-decoder pitfalls. Each one is a *design* question — for example, should `o+r` and `oy` be allowed to look alike? — that the audit deliberately left for a human to decide.

## The question that followed

With the script audited and stable, attention turned upward. We had a reliable way to *write* sounds. What *language* should sit on top of it — and could its vocabulary be generated rather than borrowed?
