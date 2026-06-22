# Fonora Collision Audit

Generated: 2026-06-22T01:10:43.078Z
Rules version: v2

## Executive summary

- **Exact symbol collisions:** 0
- **Concatenation → single-key collisions:** 4
- **Concatenation → sequence collisions:** 12
- **Greedy decoder hazards:** 17
- **Word-level boundary issues:** 4 (bar, car, far, for)
- **v2 collision test scope:** 5 minimal-pair groups / 13 words — symbol distinctness only

The bar/boy/bor fix addressed **display labeling** and **boundary-aware round-trip** in the IPA pipeline. It does **not** remove underlying symbol ambiguity where `o + r` and `oy` share symbols, or where `th + t` and `t + s` share symbols.

## 1. Symbol inventory

| key | type | IPA | symbols | source | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| ? | grid | ? | `⌇⊃` | sound grid (voice+throat) | reserved | Open research gap |
| ? | grid | ? | `⌀⊃` | sound grid (friction+throat) | reserved | Open research gap |
| ? | grid | ? | `⏌⊃` | sound grid (nasal+throat) | reserved | Open research gap |
| ? | grid | ? | `⌣⊃` | sound grid (glide+throat) | reserved | Open research gap |
| a | vowel | ʌ, ə, ɐ | `⚬⊃` | vowel recipe | defined | CUP |
| ae | vowel | æ | `⚬⚬◠` | vowel recipe | defined | TRAP |
| ay | vowel | eɪ | `⚬⚬∩⌣∩` | vowel recipe | defined | FACE |
| b | grid | /b/ | `⌇∋` | sound grid (voice+lips) | defined | Voiced lips sound |
| c | grid | /tʃ/ or /c/ | `◠` | sound grid (plain+middle_tongue) | defined | Plain middle tongue stop/affricate place |
| d | grid | /d/ | `⌇∩` | sound grid (voice+front_tongue) | defined | Voiced front tongue sound |
| dh | derived | /ð/ | `∩⌇` | derived (reverse_front_tongue_voice) | defined | Voiced dental fricative |
| e | vowel | ɛ, e, eː, ɜ, ɜː | `⚬⚬∩` | vowel recipe | defined | DRESS |
| ee | vowel | iː, i | `⚬∩` | vowel recipe | defined | FLEECE |
| eye | vowel | aɪ | `⚬⚬∪⌣∩` | vowel recipe | defined | PRICE |
| f | grid | /f/ | `⌀∋` | sound grid (friction+lips) | defined | Friction lips sound |
| g | grid | /g/ | `⌇∪` | sound grid (voice+back_tongue) | defined | Voiced back tongue sound |
| h | grid | /h/ | `⊃` | sound grid (plain+throat) | defined | Plain throat sound (glottal fricative) |
| i | vowel | ɪ | `⚬◠` | vowel recipe | defined | KIT |
| j | grid | /dʒ/ | `⌇◠` | sound grid (voice+middle_tongue) | defined | Voiced middle tongue sound |
| k | grid | /k/ | `∪` | sound grid (plain+back_tongue) | defined | Plain back tongue stop |
| l | grid | /l/ | `⌣∪` | sound grid (glide+back_tongue) | defined | Glide back tongue sound |
| m | grid | /m/ | `⏌∋` | sound grid (nasal+lips) | defined | Nasal lips sound |
| n | grid | /n/ | `⏌∩` | sound grid (nasal+front_tongue) | defined | Nasal front tongue sound |
| ñ | grid | /ɲ/ | `⏌◠` | sound grid (nasal+middle_tongue) | defined | Nasal middle tongue sound |
| ng | grid | /ŋ/ | `⏌∪` | sound grid (nasal+back_tongue) | defined | Nasal back tongue sound |
| o | vowel | ɑ, ɒ, ɔ, ɑː, ɔː | `⚬⚬∪` | vowel recipe | defined | LOT / THOUGHT |
| oh | vowel | o, oː | `⚬∪` | vowel recipe | defined | GOAT |
| oo | vowel | uː, u, ʉ, ɯ | `⚬⚬∋` | vowel recipe | defined | GOOSE |
| ow | vowel | aʊ, əʊ, oʊ | `⚬⚬∪⌣∋` | vowel recipe | defined | MOUTH / GOAT diphthong |
| oy | vowel | ɔɪ | `⚬⚬∪⌣◠` | vowel recipe | defined | CHOICE |
| p | grid | /p/ | `∋` | sound grid (plain+lips) | defined | Plain lips stop |
| r | grid | /r/ | `⌣◠` | sound grid (glide+middle_tongue) | defined | Glide middle tongue sound |
| s | grid | /s/ | `⌀∩` | sound grid (friction+front_tongue) | defined | Friction front tongue sound |
| sh | grid | /ʃ/ | `⌀◠` | sound grid (friction+middle_tongue) | defined | Friction middle tongue sound |
| t | grid | /t/ | `∩` | sound grid (plain+front_tongue) | defined | Plain front tongue stop |
| th | derived | /θ/ | `∩⌀` | derived (reverse_front_tongue_friction) | defined | Voiceless dental fricative |
| u | vowel | ʊ | `⚬∋` | vowel recipe | defined | FOOT |
| v | derived | /v/ | `∋⌇` | derived (reverse_lips_voice) | defined | Reversed lips+voice ordering |
| w | grid | /w/ | `⌣∋` | sound grid (glide+lips) | defined | Glide lips sound |
| x | grid | /x/ | `⌀∪` | sound grid (friction+back_tongue) | defined | Friction back tongue sound |
| y | grid | /j/ | `⌣∩` | sound grid (glide+front_tongue) | defined | Glide front tongue sound |
| z | derived | /z/ | `⌀⌇` | derived (reverse_friction_voice) | defined | Voiced counterpart of /s/ |

_Full inventory: 73 rows (including 31 IPA map entries)._

## 2. Exact symbol collisions

No two distinct encodable phoneme keys share the exact same symbol string.

## 3. Concatenation collisions

| sequence A | sequence B | symbols | type | example risk | recommendation |
| --- | --- | --- | --- | --- | --- |
| o + y | eye | `⚬⚬∪⌣∩` | sequence-equals-single | oy may encode as eye diphthong/composite | Known vowel+glide vs diphthong collision — requires symbol boundaries or recipe change (documented in language-rules homograph note) |
| o + w | ow | `⚬⚬∪⌣∋` | sequence-equals-single | ow may encode as ow diphthong/composite | Known vowel+glide vs diphthong collision — requires symbol boundaries or recipe change (documented in language-rules homograph note) |
| o + r | oy | `⚬⚬∪⌣◠` | sequence-equals-single | or may encode as oy diphthong/composite | Known vowel+glide vs diphthong collision — requires symbol boundaries or recipe change (documented in language-rules homograph note) |
| e + y | ay | `⚬⚬∩⌣∩` | sequence-equals-single | ey may encode as ay diphthong/composite | Known vowel+glide vs diphthong collision — requires symbol boundaries or recipe change (documented in language-rules homograph note) |
| th + t | t + s | `∩⌀∩` | sequence-equals-sequence | tht vs ts share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| th + p | t + f | `∩⌀∋` | sequence-equals-sequence | thp vs tf share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| th + k | t + x | `∩⌀∪` | sequence-equals-sequence | thk vs tx share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| th + c | t + sh | `∩⌀◠` | sequence-equals-sequence | thc vs tsh share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| dh + t | t + d | `∩⌇∩` | sequence-equals-sequence | dht vs td share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| dh + p | t + b | `∩⌇∋` | sequence-equals-sequence | dhp vs tb share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| dh + k | t + g | `∩⌇∪` | sequence-equals-sequence | dhk vs tg share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| dh + c | t + j | `∩⌇◠` | sequence-equals-sequence | dhc vs tj share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| v + t | p + d | `∋⌇∩` | sequence-equals-sequence | vt vs pd share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| v + p | p + b | `∋⌇∋` | sequence-equals-sequence | vp vs pb share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| v + k | p + g | `∋⌇∪` | sequence-equals-sequence | vk vs pg share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |
| v + c | p + j | `∋⌇◠` | sequence-equals-sequence | vc vs pj share symbols | Language-design decision — distinct phoneme sequences indistinguishable without boundaries |

## 4. Greedy decoder hazards

`decodeSymbols()` uses longest-match on unsegmented symbol strings. `decodeToPhonemeKeys()` uses space boundaries when present.

| symbols | expected keys | greedy keys | spaced keys | spacing fixes? | notes |
| --- | --- | --- | --- | --- | --- |
| `∩⌀◠` | t sh | th c | t sh | yes | phoneme keys [t sh] |
| `∩⌀⌇` | t z | th ? | t z | yes | phoneme keys [t z] |
| `∩⌀∪` | t x | th k | t x | yes | phoneme keys [t x] |
| `∩⌀∩` | t s | th t | t s | yes | phoneme keys [t s] |
| `∩⌇◠` | t j | dh c | t j | yes | phoneme keys [t j] |
| `∩⌇∪` | t g | dh k | t g | yes | phoneme keys [t g] |
| `∩⌀∋` | t f | th p | t f | yes | phoneme keys [t f] |
| `∩⌇∩` | t d | dh t | t d | yes | phoneme keys [t d] |
| `∩⌇∋` | t b | dh p | t b | yes | phoneme keys [t b] |
| `∋⌇◠` | p j | v c | p j | yes | phoneme keys [p j] |
| `∋⌇∪` | p g | v k | p g | yes | phoneme keys [p g] |
| `∋⌇∩` | p d | v t | p d | yes | phoneme keys [p d] |
| `∋⌇∋` | p b | v p | p b | yes | phoneme keys [p b] |
| `⚬⚬∪⌣∩` | o y | eye | o y | yes | phoneme keys [o y] |
| `⚬⚬∪⌣∋` | o w | ow | o w | yes | phoneme keys [o w] |
| `⚬⚬∪⌣◠` | o r | oy | o r | yes | phoneme keys [o r] |
| `⚬⚬∩⌣∩` | e y | ay | e y | yes | phoneme keys [e y] |

## 5. Real word round-trip risks

| word | phoneme keys | recovered | unspaced recover | issues |
| --- | --- | --- | --- | --- |
| bar | b o r | b o r | b oy | boundary-dependent, greedy-concat-misleading |
| car | k o r | k o r | k oy | boundary-dependent, greedy-concat-misleading |
| far | f o r | f o r | f oy | boundary-dependent, greedy-concat-misleading |
| for | f o r | f o r | f oy | boundary-dependent, greedy-concat-misleading |

### Full word table

| word | IPA | phoneme keys | symbols | recovered keys | unspaced | issues |
| --- | --- | --- | --- | --- | --- | --- |
| bar | bˈɑːɹ | b o r | `⌇∋ ⚬⚬∪ ⌣◠` | b o r | b oy | boundary-dependent, greedy-concat-misleading |
| boy | bˈɔɪ | b oy | `⌇∋ ⚬⚬∪⌣◠` | b oy | b oy | — |
| bor | bˈoːɹ | b oh r | `⌇∋ ⚬∪ ⌣◠` | b oh r | b oh r | — |
| car | kˈɑːɹ | k o r | `∪ ⚬⚬∪ ⌣◠` | k o r | k oy | boundary-dependent, greedy-concat-misleading |
| core | kˈoːɹ | k oh r | `∪ ⚬∪ ⌣◠` | k oh r | k oh r | — |
| coy | kˈɔɪ | k oy | `∪ ⚬⚬∪⌣◠` | k oy | k oy | — |
| far | fˈɑːɹ | f o r | `⌀∋ ⚬⚬∪ ⌣◠` | f o r | f oy | boundary-dependent, greedy-concat-misleading |
| foy | fˈɔɪ | f oy | `⌀∋ ⚬⚬∪⌣◠` | f oy | f oy | — |
| for | fˈɔːɹ | f o r | `⌀∋ ⚬⚬∪ ⌣◠` | f o r | f oy | boundary-dependent, greedy-concat-misleading |
| saw | sˈɔː | s o | `⌀∩ ⚬⚬∪` | s o | s o | — |
| soar | sˈoːɹ | s oh r | `⌀∩ ⚬∪ ⌣◠` | s oh r | s oh r | — |
| soy | sˈɔɪ | s oy | `⌀∩ ⚬⚬∪⌣◠` | s oy | s oy | — |
| hat | hˈæt | h ae t | `⊃ ⚬⚬◠ ∩` | h ae t | h ae t | — |
| hot | hˈɑːt | h o t | `⊃ ⚬⚬∪ ∩` | h o t | h o t | — |
| hut | hˈʌt | h a t | `⊃ ⚬⊃ ∩` | h a t | h a t | — |
| cat | kˈæt | k ae t | `∪ ⚬⚬◠ ∩` | k ae t | k ae t | — |
| cot | kˈɑːt | k o t | `∪ ⚬⚬∪ ∩` | k o t | k o t | — |
| cut | kˈʌt | k a t | `∪ ⚬⊃ ∩` | k a t | k a t | — |
| bad | bˈæd | b ae d | `⌇∋ ⚬⚬◠ ⌇∩` | b ae d | b ae d | — |
| bod | bˈɑːd | b o d | `⌇∋ ⚬⚬∪ ⌇∩` | b o d | b o d | — |
| bud | bˈʌd | b a d | `⌇∋ ⚬⊃ ⌇∩` | b a d | b a d | — |
| bake | bˈeɪk | b ay k | `⌇∋ ⚬⚬∩⌣∩ ∪` | b ay k | b ay k | — |
| back | bˈæk | b ae k | `⌇∋ ⚬⚬◠ ∪` | b ae k | b ae k | — |
| book | bˈʊk | b u k | `⌇∋ ⚬∋ ∪` | b u k | b u k | — |
| boot | bˈuːt | b oo t | `⌇∋ ⚬⚬∋ ∩` | b oo t | b oo t | — |
| eight | ˈeɪt | ay t | `⚬⚬∩⌣∩ ∩` | ay t | ay t | — |
| ate | ˈeɪt | ay t | `⚬⚬∩⌣∩ ∩` | ay t | ay t | — |
| hello | həlˈoʊ | h a l ow | `⊃ ⚬⊃ ⌣∪ ⚬⚬∪⌣∋` | h a l ow | h a l ow | — |
| thin | θˈɪn | th i n | `∩⌀ ⚬◠ ⏌∩` | th i n | th i n | — |
| this | ðˈɪs | dh i s | `∩⌇ ⚬◠ ⌀∩` | dh i s | dh i s | — |
| zoo | zˈuː | z oo | `⌀⌇ ⚬⚬∋` | z oo | z oo | — |
| buzz | bˈʌz | b a z | `⌇∋ ⚬⊃ ⌀⌇` | b a z | b a z | — |
| music | mjˈuːzɪk | m y oo z i k | `⏌∋ ⌣∩ ⚬⚬∋ ⌀⌇ ⚬◠ ∪` | m y oo z i k | m y oo z i k | — |
| father | fˈɑːðɚ | f o dh a r | `⌀∋ ⚬⚬∪ ∩⌇ ⚬⊃ ⌣◠` | f o dh a r | f o dh a r | — |
| palm | pˈɑːm | p o m | `∋ ⚬⚬∪ ⏌∋` | p o m | p o m | — |
| tht | tˌiːˌeɪtʃtˈiː | t ee ay c t ee | `∩ ⚬∩ ⚬⚬∩⌣∩ ◠ ∩ ⚬∩` | t ee ay c t ee | t ee ay c t ee | — |
| ts | tˌiːˈɛs | t ee e s | `∩ ⚬∩ ⚬⚬∩ ⌀∩` | t ee e s | t ee e s | — |
| pb | pˌiːbˈiː | p ee b ee | `∋ ⚬∩ ⌇∋ ⚬∩` | p ee b ee | p ee b ee | — |

## 6. Test suite review

### What `npm run test:v2-collisions` actually tests

- Within-group distinct Fonora symbol strings (fonora field)
- Does NOT check exact symbol collisions in inventory
- Does NOT check phoneme-key concatenation collisions
- Does NOT check unspaced greedy decode hazards
- Recovered keys now space-separated — no longer English spellings

### Misleading claims

- "0 collision groups" means minimal-pair groups have distinct symbol outputs — not zero symbol-system collisions
- Spacing in pipeline output can hide concatenation collisions during round-trip

### Recommended separate reports

- exact symbol collisions
- concatenation collisions (sequence vs single, sequence vs sequence)
- boundary-dependent round-trip failures
- word-level phoneme-key recovery mismatches

**Rename suggestion:** `test:v2-collisions` → `test:v2-minimal-pairs` or report "distinct symbol outputs per minimal-pair group".

## 7. Recommended fix order (no language redesign yet)

1. **Documentation / UI (done partially):** Label recovered output as phoneme keys, not English spellings.
2. **Boundary convention (done in pipeline):** Space-separated symbol groups in IPA pipeline output; preserve boundaries in normalize.
3. **Human language-design decisions required:**
   - `o + r` vs `oy` (also affects `o + y`→`eye`, `o + w`→`ow`, `e + y`→`ay`)
   - `th + t` vs `t + s`, `dh + t` vs `t + d`, `v + p` vs `p + b` (derived reverse order vs grid)
4. **Test suite:** Add `npm run audit:collisions` to CI; extend word-risk list; rename v2 collision test.
5. **Do not yet:** invent new symbols or remove mappings without explicit design approval.

## 8. Issue classification

| issue | class | needs human decision? |
| --- | --- | --- |
| Recovered keys looked like English (boy) | code bug / display | no — fixed |
| o+r symbol sequence equals oy | language-design collision | yes |
| Vowel+glide sequences equal diphthongs (eye/ow/oy/ay) | language-design collision | yes — homograph note exists |
| th+t equals t+s symbol strings | language-design collision | yes |
| Unspaced greedy decode mis-recovery | decoder + boundary issue | partially mitigated by spacing |
| v2 test "0 collisions" wording | test/documentation bug | no — rename/clarify |
