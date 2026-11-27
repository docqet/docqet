---
docqet: capability
id: trailers
domain: authoring
name: Trailers
description: >-
  What did something that's gone become? Commits say what a doc, gap or
  decision they removed became, so history can follow it.
stability: prototype
personas: [persona:engineer, persona:coding-agent]
concepts: [concept:trailer]
decisions:
  - topic: Keys for decisions
    question: >-
      A decision is a `topic` and a `question`, with nothing that names it, so
      a trailer can't name one. What key should each have, as a gap or
      tradeoff has, such as `capability:refunds#where-the-money-goes`?
    affects:
      - capability:agent-guidance#decisions-not-named
  - topic: Why something was removed
    question: >-
      A gap deleted because it was never real looks the same as one closed by
      work. Should a removal be able to say why?
  - topic: A trailer left out
    question: >-
      A rename committed without its trailer reads in history as one thing
      removed and another added, and only rewriting that commit fixes it.
      Should a later commit be able to say what an earlier one's removal
      became?
---

The format is the [trailer](../concepts/trailer.md) concept.
