# Legacy Fonoran tooling

These scripts are **not** part of the converged language pipeline. Use `npm run fonoran:build` instead.

| Script | Status | Replacement |
| --- | --- | --- |
| `fonoran-primitive-roots.js` | Deprecated | `fonoran-build.js` + `fonoran-root-candidates.js` |
| `fonoran-primitive-roots-import.js` | Deprecated | `fonoran-build.js` |
| `fonoran-gen3.js`, `fonoran-gen3-1.js` | Experimental archive | Converged concept inventory + build |
| `fonoran-english-roots-build.js` | Auxiliary | `fonoran-english-lexicon.js` (inventory-based) |

Active workflow: see [docs/fonoran.md](../docs/fonoran.md#pipeline).

Legacy files remain in `tools/` for reference; npm scripts for primitive-roots exit with a deprecation message.
