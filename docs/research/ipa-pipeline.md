# Teaching the machine to hear

> **TL;DR.** Spelling lies about pronunciation, so Fonora stopped reading letters and started listening. A pipeline routes text through a speech engine to get IPA, normalizes it, then encodes it onto the articulation grid. It works — and it created one piece of technical debt we still live with: a split source of truth for consonants.

## The question

The [articulation grid](/research/notes/articulation-grid) encodes sounds, but users type *spelling*. English spelling is famously unreliable. How do we turn arbitrary text into the right Fonora symbols without hand-writing rules for every word?

## The hypothesis

Don't parse letters — get phonemes. If we send text through a speech synthesizer to obtain its International Phonetic Alphabet (IPA) transcription, then map IPA to the grid, we sidestep spelling entirely:

```
Text -> eSpeak NG -> IPA -> normalize -> encode -> decode
```

## The constraints

- Everything has to run in the browser, which means a **WASM** build of the speech engine and its size/performance budget (see [espeak-integration.md](../espeak-integration.md)).
- Unmapped IPA tokens must **degrade honestly** rather than guess.
- There should be a single source of truth for how sounds map to symbols.

## What we built

The pipeline lives in [`js/ipa-normalize.js`](https://github.com/jamesc137/fonora/blob/main/js/ipa-normalize.js) and the encode/decode stages, with eSpeak NG compiled to WASM. The work is documented in the [IPA pipeline report](../IPA-PIPELINE-REPORT.md) and [ipa-normalize.md](../ipa-normalize.md). You can watch it run in [Transliterate](/script#translator).

## What happened

Round-tripping worked: text became IPA, IPA became symbols, and symbols decoded back to recognizable pronunciation. But the pipeline revealed a wrinkle we documented rather than hid — the consonant mapping ended up split between the markdown rules file and a supplemental engineering map, a *split source of truth* that still needs reconciling.

## The question that followed

Consonants behaved. Vowels did not. English has far more vowel qualities than the grid had marker slots, and naive mapping produced homographs. How few vowel symbols can English actually tolerate before meaning is lost?
