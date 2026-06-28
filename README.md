# Fonora

**[fonora.org](https://fonora.org)**: an open-source phonetic writing platform.

This repository contains the **Fonora script**, the **Fonoran experimental language**, and the **Language Builder Tools** used to create and evolve Fonoran, plus research documentation and interactive web apps.

See **[docs/platform-overview.md](docs/platform-overview.md)** for the full platform map and architecture diagram.

## Three layers

### 1. Fonora: the script

**Fonora** is a phonetic **writing system** built from nine core symbols that represent where and how speech sounds are produced. It is not a spoken language, it is the script used to write pronunciation.

```
Text → eSpeak NG → IPA → ipa-normalize.js → encodeSounds() → Fonora symbols
```

Rules version: **v3** ([`docs/language-rules.md`](docs/language-rules.md), vowel grammar `⚬X`, diphthong `⚬XᵔY`).

| Script tool | Purpose |
| --- | --- |
| [Sound Grid](https://fonora.org/#grid) | Place × manner reference |
| [Alphabet](https://fonora.org/#alphabet) | Primary symbols + phoneme inventory |
| [Translator](https://fonora.org/#translator) | Text → IPA → Fonora |
| [Reader](https://fonora.org/#reader) | Neural TTS from Fonora |
| [Breakdown](https://fonora.org/#breakdown) | Per-word phonetic analysis |
| [Samples](https://fonora.org/#samples) | Multilingual paragraph demos |
| [Quiz](https://fonora.org/#quiz) | Decode / construct practice |

Docs: [language-rules.md](docs/language-rules.md) · [multilingual-support.md](docs/multilingual-support.md) · [IPA pipeline report](docs/IPA-PIPELINE-REPORT.md)

### 2. Fonoran: the language

**Fonoran** is an **experimental constructed language** built using Fonora. It has primitive root syllables, compound words, English meanings, derivation trees, and a semantic coordinate system (DDA).

| Language asset | Purpose |
| --- | --- |
| [Language builder](/fonoran/) | Create, review, and explore vocabulary |
| [Dictionary](/fonoran/#dictionary) | Browse roots and compounds |
| [fonoran.md](docs/fonoran.md) | **Start here** — guide, pipeline, API |
| Live data | `data/fonoran-sound-bucket.json` (your vocabulary) |

### 3. Language Builder Tools

The **Language Builder Tools** at [`/fonoran/`](fonoran/) are the suite used to **create, review, test, and explore** Fonoran.

| Builder tool | Purpose |
| --- | --- |
| [Review](fonoran/#review) | Approve roots and words (Root queue · Roots · Words · Generated) |
| [Word Generator](fonoran/#wordgen) | English phrase → compound suggestions (beta) |
| [Word Creator](fonoran/#create) | Stack roots and approved words |
| [Root Creator](fonoran/#roots) | Create primitive syllables (CV / CVC) |
| [Concept Editor](fonoran/#concepts) | Edit concepts, aliases, spellings |
| [Dictionary](fonoran/#dictionary) | Derivation trees and family graphs |
| [Health / Advanced](fonoran/#health) | Scores, Run DDA, import build |

CLI: `npm run fonoran:build`, `fonoran:root-candidates`, `fonoran:reset`. See [docs/fonoran.md](docs/fonoran.md#pipeline).

## Live site

**https://fonora.org**: main script app  
**https://fonora.org/fonoran/**: language builder

## Development

### Run locally

```bash
git clone https://github.com/jamesc137/fonora.git
cd fonora
npm install
npm start
```

Open [http://localhost:8000](http://localhost:8000) (script app) and [http://localhost:8000/fonoran/](http://localhost:8000/fonoran/) (builder).

Browsers block `fetch()` and WASM when opening HTML directly (`file://`). Always use the HTTP server.

### Deploy

Production uses the included Node static server (`npm start`). See **[docs/deploy.md](docs/deploy.md)** for Heroku setup, PostgreSQL, custom domain (`fonora.org`), and hosting notes.

Quick Heroku deploy:

```bash
heroku create
git push heroku main
```

### Editing rules

Edit [`docs/language-rules.md`](docs/language-rules.md) and reload the browser. Changes to symbols, keyboard mappings, sounds, and grid cells update automatically.

### Tests

```bash
npm test                              # unit/integration assertions
npm run test:vowels                   # vowel readability report → reports/
npm run test:minimal-pairs            # minimal-pair distinctness report → reports/
npm run audit:collisions              # collision audit → docs/FONORA_COLLISION_AUDIT.md
npm run test:pronunciation-validation # IPA round-trip batch report → reports/
npm run fonoran:import                # import local JSON bucket → PostgreSQL (if configured)
npm run fonoran:export                # export PostgreSQL bucket → JSON backup
```

| Command | UI equivalent |
| --- | --- |
| `npm test` | Append `?test` to the app URL (browser console) |
| `npm run test:pronunciation-validation` | Pronunciation Validation tab |

### Contributing

Contributions welcome, see [CONTRIBUTING.md](CONTRIBUTING.md). Fonoran vocabulary proposals use a Google Form (see [docs/fonoran-auth-and-release.md](docs/fonoran-auth-and-release.md)). Full documentation index: [docs/README.md](docs/README.md).

## License

[MIT](LICENSE), Copyright (c) 2026 James Calhoun.

| Component | License |
| --- | --- |
| Fonora (this repo) | [MIT](LICENSE) |
| eSpeak NG (IPA WASM) | GPL-3.0-or-later — [details](docs/espeak-integration.md) |
| WordNet, Piper, Mermaid, etc. | [third-party.md](docs/third-party.md) |

Full attribution list: **[docs/third-party.md](docs/third-party.md)**.

## Links

- Website: https://fonora.org
- Repository: https://github.com/jamesc137/fonora
- Issues: https://github.com/jamesc137/fonora/issues
