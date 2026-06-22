# Contributing to Fonora

Thank you for helping improve Fonora. This project is an experimental open-source phonetic writing system and research platform.

**Live site:** [https://fonora.org](https://fonora.org)  
**Source:** [https://github.com/jamesc137/fonora](https://github.com/jamesc137/fonora)

## Ways to contribute

- **Language rules** — propose changes to [`docs/language-rules.md`](docs/language-rules.md) (symbols, grid cells, vowel mappings) with reasoning and test cases
- **IPA pipeline** — improve normalization, encoding, or validation in `js/`
- **Documentation** — clarify concepts, add examples, fix outdated docs in `docs/`
- **Bug reports** — open a GitHub issue with reproduction steps
- **Tests** — extend `js/tests-core.js` when fixing encoding or grammar behavior

## Development setup

```bash
git clone https://github.com/jamesc137/fonora.git
cd fonora
npm install
npm start
```

Open [http://localhost:8000](http://localhost:8000). The app requires HTTP (not `file://`) for ES modules, WASM, and `fetch()`.

Run tests before opening a PR:

```bash
npm test
```

## Project structure

| Area | Location |
| --- | --- |
| Authoritative symbol rules | `docs/language-rules.md` |
| App UI | `index.html`, `app.css`, `js/app.js` |
| IPA → Fonora pipeline | `js/ipa*.js`, `js/encode.js`, `js/decode.js` |
| WASM assets (generated) | `vendor/` via `npm install` |
| Research docs | `docs/` |

## Changing language rules

1. Edit `docs/language-rules.md`
2. Reload the browser (or restart `npm start`)
3. Run `npm test` and relevant validation commands (see [README.md](README.md))
4. Describe the linguistic motivation in your PR

Symbol changes should stay consistent with the v3 vowel grammar (`⚬X` simple, `⚬XᵔY` diphthong).

## Pull requests

- Keep PRs focused — one logical change per PR when possible
- Include test updates when behavior changes
- Note any experimental or reserved grid cells affected
- Do not commit `node_modules/`, `vendor/`, `.env`, or generated `reports/`

## Code of conduct

Be respectful and constructive. Fonora is a research project; disagree about linguistics and engineering on the merits.

## Questions

Open a [GitHub discussion or issue](https://github.com/jamesc137/fonora/issues) for design questions before large refactors.
