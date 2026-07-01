# Typing an invented script

> **TL;DR.** Reading a script you can't write is only half a literacy. This experiment closed the read-write loop with a visual QWERTY input method, keyboard-testing drills, and spelling practice, so learners can physically produce Fonora symbols — and so we can measure whether they're actually learning to spell.

## The question

Learners could read Fonora and watch it being generated, but how do they *produce* it? And how would we know whether someone has genuinely learned to spell in the script?

## The hypothesis

A visual on-screen keyboard that maps the familiar QWERTY layout onto Fonora's compose grid, paired with spelling and typing practice, closes the read-write loop and makes spelling skill measurable.

## The constraints

- The keyboard must be **responsive** — usable on small screens, not just desktop.
- The compose UX has to map cleanly onto the articulation grid so that typing reinforces the script's logic.
- Practice modes need to score progress, not just accept input.

## What we built

A visual QWERTY IME in [`js/fonora-keyboard-ui.js`](https://github.com/jamesc137/fonora/blob/main/js/fonora-keyboard-ui.js), plus [Keyboard Testing](/tools#keyboard) drills and [Spelling Practice](/learn#writing), backed by compose and layout modules and a typing-practice mode.

## What happened

The loop closed: learners can now read, hear, translate, *and* type Fonora. Keyboard testing and spelling practice turn "can you write it?" into something with a score attached, which feeds directly into evaluating the project's central learnability claim.

## The question that followed

Reading, writing, translation, and typing were all in place. That set up the experiment the whole project had been building toward: put two people who share the roots together — can they actually recover each other's meaning?
