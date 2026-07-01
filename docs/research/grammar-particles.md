# Grammar as particles, not words

> **TL;DR.** A recurring failure of earlier generators was letting grammar leak into the lexicon — `because` as a root, `with` competing as a word. This experiment drew a hard line: tense, logic, deixis, and pronouns are a closed class of *particles*, never roots. Present tense gets no particle at all. With grammar factored out, the translator reached 100% coverage on its test corpus.

## The question

Which relationships belong in the sentence skeleton — the grammatical machinery — versus the open-ended lexicon of roots?

## The hypothesis

Pronouns, tense, logical connectives (because/therefore), relational modifiers, deixis, and interrogatives are **particles**: a small, closed class that lives outside the root vocabulary. Some relations need no marker at all — present tense is simply unmarked.

## The constraints

- Reserved particle forms are **blocked** in the collision scoring so roots never collide with grammar.
- Particles are emitted in a fixed clause order: Subject · Time · Event · Object · Modifiers.
- The closed class stays small and stable.

## What we built

[`data/fonoran-grammar-particles.json`](https://github.com/jamesc137/fonora/blob/main/data/fonoran-grammar-particles.json) and [`tools/fonoran-particles.js`](https://github.com/jamesc137/fonora/blob/main/tools/fonoran-particles.js), with the rules written into the living [grammar specification](../fonoran-grammar.md) (also browsable in-app at [Grammar](/language#grammar)).

## What happened

Causation moved out of the lexicon entirely: `because` and `therefore` became grammatical particles rather than competing roots. Pulling grammar into its own closed class let the translator reach 100% coverage on the test corpus — the earlier mistake of `with`, `before`, and `no` fighting for lexical space was designed away.

## The question that followed

We now had roots *and* a particle grammar. Could a machine take ordinary English and compile it into frames that use these particles and roots correctly — without faking words it doesn't have?
