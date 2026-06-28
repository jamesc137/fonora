# Third-party software and licenses

Fonora is [MIT-licensed](../LICENSE). The project also bundles or calls these components:

| Component | Used for | License |
| --- | --- | --- |
| **eSpeak NG** | IPA pronunciation (WASM) | [GPL-3.0-or-later](https://github.com/espeak-ng/espeak-ng) — see [espeak-integration.md](espeak-integration.md) |
| **@echogarden/espeak-ng-emscripten**, **espeak-ng** (npm) | Bundled eSpeak engine | Same GPL chain as eSpeak NG |
| **WordNet** | Word Generator semantic lookup (synonyms, hypernyms) | [Princeton WordNet license](https://wordnet.princeton.edu/license-and-commercial-use) — attribution required for research and non-commercial use |
| **wordpos** | Node.js interface to WordNet | MIT |
| **Piper** / **piper-tts-web** | Neural TTS (“Listen” in the builder) | MIT (library); voice models from [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices) (see each model card) |
| **ONNX Runtime Web** | Piper inference in the browser | Apache-2.0 |
| **Mermaid** | Word-tree diagrams in the language builder | MIT (loaded from jsDelivr in `fonoran/index.html`) |
| **pg** | Optional PostgreSQL storage for the lab bucket | MIT |

## WordNet attribution

WordNet is a lexical database developed at Princeton University. Fonoran’s Word Generator uses WordNet synsets and hypernym chains (via **wordpos** and `tools/fonoran-semantic-lookup.js`) to map English input to concept primitives. Results are cached in `data/fonoran-semantic-cache.json`.

WordNet is free for research and non-commercial use with attribution. Read the [full license](https://wordnet.princeton.edu/license-and-commercial-use) before commercial redistribution.

Suggested citation:

> George A. Miller, Christiane Fellbaum, and colleagues. *WordNet*. Princeton University. https://wordnet.princeton.edu

## eSpeak NG (GPL)

If you distribute Fonora with the embedded eSpeak WASM bundle, GPL obligations apply to that component (source offer, etc.). Fonora’s encoder and symbol logic are separate MIT-licensed code. Details: [espeak-integration.md](espeak-integration.md).
