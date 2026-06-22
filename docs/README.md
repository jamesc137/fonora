# Fonora documentation

Index of project docs and how they relate to the running app (`index.html` + `js/`).

## Quick reference

| Topic | Document |
| --- | --- |
| Run locally, tests, deploy | [../README.md](../README.md) · [deploy.md](deploy.md) |
| eSpeak NG / WASM | [espeak-integration.md](espeak-integration.md) |
| IPA pipeline architecture | [IPA-PIPELINE-REPORT.md](IPA-PIPELINE-REPORT.md) |
| Consonant IPA normalization | [ipa-normalize.md](ipa-normalize.md) |
| Multilingual encoding & playback | [multilingual-support.md](multilingual-support.md) |
| Pronunciation Validation (automated round-trip) | [pronunciation-validation.md](pronunciation-validation.md) |
| Symbol collision analysis | [FONORA_COLLISION_AUDIT.md](FONORA_COLLISION_AUDIT.md) |
| Open problems / research bounties | [open-problems.md](open-problems.md) · app: More → **Open Problems** |
| Language-system audit (June 2026) | [FONORA_CLEANUP_AUDIT.md](FONORA_CLEANUP_AUDIT.md) |
| Historical v2 vowel analysis | [FONORA_VOWEL_DECISION_REPORT.md](FONORA_VOWEL_DECISION_REPORT.md) — **superseded by v3** |

**Authoritative symbol rules:** [`language-rules.md`](language-rules.md) (`fonora_version: v3`, `ipa_vowel_mode: v3`) — loaded at runtime by the app; edit this file to change symbols, the sound grid, and vowel mappings.

## App sections (UI)

Primary nav: **Home**, **Translator**, **Reader**, **Breakdown**, **Sound Grid**, **Alphabet**.

More menu: **Samples**, **Quiz**, **Keyboard** (symbol input + keyboard mapping table), **Reverse Lookup**, **Pronunciation Testing** (manual review), **Pronunciation Validation** (automated round-trip), **Open Problems** (known limitations + contribution guide), **Docs** (rendered markdown viewer; raw `.md` URLs still serve source for the app pipeline).

Doc links in the app open the **Docs** viewer (`?path=docs/foo.md#docs`). A **View on GitHub ↗** link is available on each page and beside Open Problems doc references.

Multilingual behavior (language selector, vowel overlays, Reader voices): [multilingual-support.md](multilingual-support.md).

Removed from the UI (June 2026 cleanup): Mini Dictionary, Decode panel, separate Keyboard Mapping tab (mapping now lives on Keyboard).

## Tests: CLI vs browser

| Command / entry | What it runs | UI equivalent |
| --- | --- | --- |
| `npm test` | 67 unit/integration assertions (`js/tests-core.js` + integration) | `?test` in URL → console |
| `npm run test:pronunciation-validation` | Batch IPA round-trip report | Pronunciation Validation tab |
| `npm run test:vowels` | Vowel readability report → `reports/` | — |
| `npm run test:minimal-pairs` | Minimal-pair distinctness report | — |
| `npm run test:v2-collisions` | Deprecated alias for `test:minimal-pairs` | — |
| `npm run audit:collisions` | Full collision audit → `docs/FONORA_COLLISION_AUDIT.md` | Warnings inside Validation results |

Pronunciation **Testing** is manual only (Correct / Wrong / Unsure, export JSON/CSV). Pronunciation **Validation** is automated pass/fail on IPA round-trip.

## Known code ↔ markdown gaps

Minor remaining items:

1. **`fonora-config.js`** — `vowelMode` falls back to `'default'` when bundle metadata is missing (markdown always sets `v3`).

Consonant grid/derived IPA is **generated from markdown at load** (`buildConsonantMapFromRules`). Supplemental multilingual variants remain in `SUPPLEMENTAL_CONSONANT_MAP` — see [ipa-normalize.md](ipa-normalize.md).
