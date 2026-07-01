# Making invented words memorable (Gen 3.1)

> **TL;DR.** Gen 3.1 was a learnability layer bolted onto Gen 3. It left the DDA coordinates — the *meaning* — completely untouched, and only adjusted how roots were realized as sound, spreading vowels within native pools so words stopped rhyming with each other. Memorability jumped from 70 to 85 and every example parsed uniquely, at the cost of rewriting about a third of the grid assignments.

## The question

[Gen 3](/research/notes/dda-coordinates) produced semantically principled roots that were hard to distinguish by ear. Could learnability improve **without changing the coordinates** that give each root its meaning?

## The hypothesis

Distinctiveness is a phonetic property, separable from semantics. If we let the realized vowel *spread* within a Fonora-native pool — preferring phonetic spread before falling back to grid repair — words in the same semantic neighborhood stop sounding alike, while their coordinates stay fixed.

## The constraints

- At most **3 CV roots per vowel class**, and at most **3 per rhyme key**.
- Prefer phonetic-only spread; use grid repair only when necessary.
- Still **no** Indo-European repair.

## What we built

[`tools/fonoran-gen3-1.js`](https://github.com/jamesc137/fonora/blob/main/tools/fonoran-gen3-1.js) and a distinctiveness scorer, documented in the [Gen 3.1 phonetic layer](../fonoran-gen3-1.md). The scoring code outlived the experiment and is still reused for readability checks today.

## What happened

The 2026-06-22 run measured the payoff: memorability rose from 70 to 85, pronounceability hit 96, and 100% of example compounds parsed uniquely. The cost was a 31% grid-repair rate — roughly a third of roots had to move off their first-choice cell to break up rhyme clusters.

## The question that followed

Gen 3 and 3.1 had made the words principled and memorable. But a nagging doubt remained: do people actually *communicate* by decoding coordinates in their heads? Maybe optimizing the generator was solving the wrong problem.
