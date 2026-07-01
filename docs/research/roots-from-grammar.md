# Can words grow from a grid? (Gen 1 and Gen 2)

> **TL;DR.** The first two generations of Fonoran vocabulary tried to *grow* words rather than borrow them. Gen 1 used hand-picked roots with grammar-vowel suffixes to spawn word families; Gen 2 generated roots from semantic coordinates and repaired accidental Indo-European look-alikes. Both worked for demos but stayed quietly English-adjacent — and Gen 1's grammar vowels turned out to be incompatible with the invariant-word language Fonoran later became.

## The question

Fonora gave us a script. Could it carry a *language* whose vocabulary was systematic and discoverable — words that belong to visible families — rather than a pile of memorized, unrelated forms?

## The hypothesis

- **Gen 1:** A one-syllable CV/CVC root plus a grammar-vowel suffix yields a whole family. From `lum` you derive luma / lume / lumi / lumo / lumu — object, action, quality, abstract, collective.
- **Gen 2:** Map a concept's semantic coordinates onto place and manner, then rotate the coordinates whenever the generated form collides too closely with English, Latin, Greek, Germanic, or Romance vocabulary.

## The constraints

- Roots carried coordinates but had **no fixed phonological form** until generation.
- English/Latin cognates were tolerated for rapid prototyping.
- Gen 2 used a collision score against several language families to avoid accidental borrowing.

## What we built

A succession of generators and data files, all since removed but recoverable from git and chronicled in the [generator archive](../fonoran-generator-archive.md). The output seeded the early [Dictionary](/language#dictionary).

## What happened

The families were tidy, but the roots were too English-adjacent for genuine "language archaeology" (`wa` = water, `man` = person). Worse, Gen 1's grammar vowels — which inflected a root's word class — clashed head-on with the later principle that Fonoran words are *invariant*. Both generations were archived.

## The question that followed

Both approaches were concept-first: pick a meaning, then assign a sound. What if we inverted the whole thing — and let meaning *emerge* from the articulation grid instead of being assigned to it?
