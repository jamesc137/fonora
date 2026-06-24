# Fonoran language lab

> **Status:** production feature at `/fonoran/` — a hand-held creative language builder.

**Fonoran** is an experimental constructed language written in the [Fonora phonetic script](platform-overview.md). This doc covers the **Language Layer** (vocabulary model) and **Language Builder Tools** (tabs and API). For the script itself, see [language-rules.md](language-rules.md) and [multilingual-support.md](multilingual-support.md).

Build a language word-by-word: create primitive roots, compose them into words, approve your choices, and explore how the vocabulary grows as a family tree.

## Quick start

```bash
npm start
# Open http://localhost:8000/fonoran/ — lander page; add #roots to jump into the builder
```

## Language model

| Rule | Detail |
| --- | --- |
| **Primitive roots** | Atomic syllables you create (CV / CVC). Stored in `bucket.sounds`. |
| **Words** | Built by stacking roots and/or approved words. Stored in `bucket.compounds`. |
| **Recursive composition** | Once `kaso = ka + so` is **approved**, you can build `lakaso = la + kaso`. |
| **Derivation tree** | Every word stores its full component tree — visible in Language Explorer. |
| **Circular derivations** | Invalid. Word A cannot depend on word B if B already depends on A. |
| **Review workflow** | `draft → needs_review → approved \| rejected \| revised` for roots and words. |
| **DDA (semantic layer)** | System-maintained, invisible during creation. Run **Run DDA** in Advanced when you've added new material. |

Your living language lives in **`data/fonoran-sound-bucket.json`** (gitignored locally) when using JSON storage, or in **PostgreSQL** when `DATABASE_URL` is set. The JSON file is imported on first boot — never deleted. Reference generator data (gen3.1 glosses for the English picker) is separate — it does not overwrite your words.

See [platform-overview.md](platform-overview.md) for storage details and [deploy.md](deploy.md) for PostgreSQL setup.

## UI tabs (Language Builder Tools)

| Tab | Builder tool | Purpose |
| --- | --- | --- |
| **Root Creator** (Roots) | Root Creator | Browse and create primitive syllables |
| **Compound Creator** (Create Words) | Compound Creator | Stack **roots** + **approved words** → preview → name → save |
| **Review** | Review Tools | Approve, reject, or edit pending items |
| **Dictionary** | Dictionary + Language Explorer | Browse everything; click any item for derivation trees and family graphs |

**Language Explorer** shows: Built from · Derivation tree · Used in · Related words · Mermaid family graph.

**Advanced:** Run DDA, compound parser, health metrics, optional debug DDA fields, lab reset.

## API

| Endpoint | Method |
| --- | --- |
| `/api/fonoran/lab` | GET |
| `/api/fonoran/lab/compounds` | POST `{ components: [{type, ref}], meaning }` |
| `/api/fonoran/lab/graph/:kind/:ref` | GET — `kind` = `root` or `word` |
| `/api/fonoran/lab/graph/preview` | POST `{ components, spelling?, meaning? }` — draft explorer graph |
| `/api/fonoran/lab/run-dda` | POST `{ scope: "pending" \| "stale" \| "all" }` |
| `/api/fonoran/lab/parse/:spelling` | GET |
| `/api/fonoran/lab/health` | GET |

Legacy `parts: ["ka","so"]` is still accepted; stored as typed components internally.

## Component reference

```json
{ "type": "root", "ref": "ka" }
{ "type": "word", "ref": "cmp-kaso" }
```

Spelling = concatenation of component phonetic forms left-to-right.

## Historical generators

Bulk Gen 1/Gen 2 generators were removed. How they worked: [fonoran-generator-archive.md](fonoran-generator-archive.md).

Gen 3 reference data remains for DDA inference and the English meaning picker only. Generator audit reports (`npm run fonoran:gen3:audit`, etc.) write to **`reports/`** (gitignored). Your live scores are always **Health** in the app.
