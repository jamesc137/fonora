# Compiling English into meaning

> **TL;DR.** The interpretive translator compiles English into the nearest *approved concepts*, not word-for-word glosses. Three layers — a frame parser, a resolution cascade, and a surface builder — turn a sentence into Fonoran. Crucially, it never fabricates a spelling: anything it cannot resolve is shown honestly in red, so the gaps are visible instead of hidden.

## The question

Can English be compiled into Fonoran by mapping to the nearest *concepts* the language actually has — rather than substituting word for word — while being honest about everything it can't express yet?

## The hypothesis

A three-layer compiler does the job: a **frame parser** finds the clause structure, a **resolution cascade** maps each piece to a concept (direct match → interpreted mapping → WordNet/semantic lookup → unknown), and a **surface builder** emits roots and particles in clause order. The translator must **never invent spelling**.

## The constraints

- **Semantic economy:** prefer the shortest transparent path; omit implied concepts unless needed.
- Unresolved concepts surface in **red** — visible, honest gaps.
- A golden regression suite (`npm run test:translator`) guards behavior.

## What we built

[`tools/fonoran-translator.js`](https://github.com/jamesc137/fonora/blob/main/tools/fonoran-translator.js) with English resolution in [`fonoran-english-resolve.js`](https://github.com/jamesc137/fonora/blob/main/tools/fonoran-english-resolve.js) and a semantic cache, documented in [interpretive-translator.md](../fonoran-interpretive-translator.md). You can use it live at [Translator](/language#translator).

## What happened

The compiler works: direct matches render plainly, interpreted and WordNet matches are tinted by confidence, and genuinely unknown words stay red rather than being faked. It honors the Constitution's honesty principle. Longer phrases still degrade, and assembling brand-new compounds from approved roots remains future work.

## The question that followed

Reading and translation were covered. But a script is only half useful if you can't *produce* it. How do people physically type Fonora — and can we measure whether they're learning to spell?
