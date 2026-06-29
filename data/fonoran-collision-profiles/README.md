# Editorial collision profiles

A collision profile flags generated root spellings that would read or sound badly
to speakers of a particular language. Profiles are editorial, not phonological:
the same Fonoran sound is perfectly legal, but a reviewer building the language
for English speakers may not want `fak` or `fee` as roots.

The architecture is language-agnostic. The default profile is English (`en.json`).
To build Fonoran for another audience, add a sibling profile (e.g. `ja.json`,
`es.json`, `de.json`) and point `collision_profile` in
`data/fonoran-primitive-roots-config.json` at it.

## Schema

```json
{
  "profile_id": "en",
  "locale": "en",
  "description": "…",
  "penalties": {
    "blocked": null,            // null = hard block (never assigned)
    "discouraged": 2000,        // strong penalty; assigned only with no alternative
    "homophone": 500,           // warning penalty
    "particle_near_miss": 800   // warning penalty
  },
  "blocked_forms":      [{ "form": "fak", "category": "profanity", "reason": "…" }],
  "discouraged_forms":  [{ "form": "gas", "category": "common_word", "reason": "…" }],
  "homophone_warnings": [{ "form": "fi", "hears_as": "fee", "reason": "…" }],
  "particle_near_miss": [{ "form": "ma", "particle": "na", "reason": "…" }]
}
```

## Tiers

| Tier | Intent | Generator behavior |
| --- | --- | --- |
| `blocked_forms` | Profanity, slurs, reserved particles | Never assigned (hard skip) |
| `discouraged_forms` | Ordinary words like `gas`, `fan`, `bet` | Strong penalty; used only if nothing else fits |
| `homophone_warnings` | `fi`/`fee`, `tu`/`two`, `no`/`know` | Warning surfaced in review |
| `particle_near_miss` | Forms close to grammar particles `mi`/`ta`/`na` | Warning surfaced in review |

Reviewers always have the final say. Warnings inform the human; they do not block approval.
