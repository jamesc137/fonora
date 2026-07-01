# Writing sound instead of spelling

> **TL;DR.** Fonora began by rejecting the alphabet. Instead of inheriting arbitrary letter shapes, it asks whether a script can encode *how a sound is produced* — its place and manner of articulation — as a small grid of composable symbols. That articulatory grid became the substrate everything else in the project is built on.

## The question

Every writing system most people learn is an accident of history: the letter `c` tells you nothing about the sound it makes. Could a script instead be *transparent*, so that the symbol itself explains how the sound is produced — where in the mouth, and in what manner?

## The hypothesis

Speech can be written as a composable grid. If we treat **place of articulation** (where the sound is made) and **manner** (how the airstream is shaped) as independent axes, then a sound is just a coordinate, and a symbol can be assembled from a small set of primitives plus a marker that signals a vowel.

## The constraints

- Five primary places and four manners, plus the `⚬` vowel marker — nine core symbols, not an open-ended alphabet.
- The grid is **derived from a single source of truth**: it composes at load time from [language-rules.md](../language-rules.md), so the script and the code can never silently disagree.
- Two throat cells (nasal+throat and glide+throat) are deliberately left **reserved** — open gaps rather than invented symbols.

## What we built

The first commit shipped the encoder, the interactive [Sound Grid](/script#grid), the [Alphabet](/script#alphabet) view, and a decode quiz. The grid is generated from the rules file, so adding or changing a sound is a documentation edit, not a code change.

## What happened

The articulatory grid worked as a foundation: it gave a compact, learnable symbol set whose shapes carry meaning. More importantly, it turned out to be reusable. The same grid that transliterates English would later become the phonetic canvas on which an entire constructed language was generated.

## The question that followed

A clean grid is easy to admire on paper. But real speech is messy and spelling is a poor guide to pronunciation. How do we map *arbitrary text* — any word, any speaker — onto this grid reliably? That question led directly to the phonetic pipeline.
