# Fonora documentation

Index of project docs. See **[platform-overview.md](platform-overview.md)** for the three-layer map.

**Authoritative symbol rules:** [language-rules.md](language-rules.md) (`fonora_version: v3`).

---

## Essential

| Topic | Document |
| --- | --- |
| Platform overview | [platform-overview.md](platform-overview.md) |
| Third-party licenses | [third-party.md](third-party.md) |
| Deploy & PostgreSQL | [deploy.md](deploy.md) |
| Contributing | [../CONTRIBUTING.md](../CONTRIBUTING.md) |

---

## Script layer

| Topic | Document |
| --- | --- |
| Fonora encoding rules | [language-rules.md](language-rules.md) |
| Transliteration | [multilingual-support.md](multilingual-support.md) |
| IPA pipeline | [IPA-PIPELINE-REPORT.md](IPA-PIPELINE-REPORT.md) |
| eSpeak NG / WASM | [espeak-integration.md](espeak-integration.md) |
| Pronunciation validation | [pronunciation-validation.md](pronunciation-validation.md) |
| IPA normalization | [ipa-normalize.md](ipa-normalize.md) |

---

## Language layer

| Topic | Document |
| --- | --- |
| **Fonoran guide** | [fonoran.md](fonoran.md) |
| Fonoran grammar | [fonoran-grammar.md](fonoran-grammar.md) |
| Interpretive translator | [fonoran-interpretive-translator.md](fonoran-interpretive-translator.md) |

---

## Archive

Historical experiments and audits. Not the active Fonoran workflow (see [fonoran.md](fonoran.md)).

| Document | Notes |
| --- | --- |
| [fonoran-gen3.md](fonoran-gen3.md) | DDA Gen 3 experiment |
| [fonoran-gen3-1.md](fonoran-gen3-1.md) | Gen 3.1 phonetic layer |
| [fonoran-generator-archive.md](fonoran-generator-archive.md) | Retired bulk generators |
| [fonoran-semantic-foundation.md](fonoran-semantic-foundation.md) | Semantic proposal (reference) |
| [fonoran-primitive-roots-report.md](fonoran-primitive-roots-report.md) | Old generator report |
| [FONORA_CLEANUP_AUDIT.md](FONORA_CLEANUP_AUDIT.md) | June 2026 audit |
| [fonoran-root-workflow.md](fonoran-root-workflow.md) | Redirect → [fonoran.md#pipeline](fonoran.md#pipeline) |

---

## Tests (CLI)

| Command | Purpose |
| --- | --- |
| `npm test` | Unit/integration (`?test` in browser) |
| `npm run test:pronunciation-validation` | IPA round-trip report |
| `npm run fonoran:build` | Converged Fonoran pipeline |
| `npm run fonoran:import` / `fonoran:export` | PostgreSQL bucket sync |

See [README.md](../README.md) for the full test list.
