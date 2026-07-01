# One script for every language

> **TL;DR.** A universal script has to handle more than English. Fonora reused the same IPA pipeline with a `lang` parameter — but discovered, via a broken Spanish word, that English-specific vowel rules were corrupting other languages. The fix was to scope the English vowel overlay to English only. Non-Latin scripts remain an open gap.

## The question

The articulation grid is language-agnostic in principle. Could a single IPA pipeline encode many languages — Spanish, French, German — without a bespoke ruleset for each?

## The hypothesis

Keep one pipeline, parameterized by language. A shared consonant map plus a thin per-language layer should generalize the English work to other languages with minimal new code.

## The constraints

- English vowel engineering must **not** leak into other languages.
- Per-language behavior should be **opt-in**, not the default.
- Audio playback needs sensible voice mappings per locale.

## What we built

The pipeline gained a `lang` parameter, Reader voices per locale, and a multilingual [Samples](/learn#listening) page rendering UDHR Article 1 across languages. The behavior and its limits are documented in [multilingual-support.md](../multilingual-support.md).

## What happened

A bug exposed the core lesson: the Spanish word *perro* came out wrong because the English vowel overlay was being applied universally. Scoping that overlay to `en` fixed Spanish without regressing English. The experiment confirmed the pipeline generalizes — but only for languages close to the Latin/IPA assumptions baked in. CJK and Arabic remain unhandled gaps.

## The question that followed

Supporting more sounds and more languages multiplies the ways symbols can be combined. Where, exactly, does the symbol system start producing ambiguity — and how would we even know?
