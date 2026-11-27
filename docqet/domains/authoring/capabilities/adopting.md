---
docqet: capability
id: adopting
domain: authoring
name: Adopting an existing repository
description: >-
  How do we write down the intention of software that's already built? Agents
  propose it from the code, tests and docs, in batches a person can check, and
  it's declared only once that person confirms it.
stability: prototype
solves: [problem:no-record-of-what-it-was-for, problem:agents-guess-intention]
gaps:
  - id: inferred-intention-unmarked
    name: Inferred intention has no marker
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      There's no way to mark intention an agent worked out from code as
      unconfirmed, so the kit has agents propose it, and write it only once a
      person confirms it.
decisions:
  - topic: Unconfirmed intention
    question: >-
      How is intention an agent worked out from existing code marked, so it
      isn't counted as declared until a person confirms it? It isn't a draft
      capability, which a person has declared and nobody has started.
    affects:
      - capability:adopting#inferred-intention-unmarked
---

The kit's [adopting guide](../../../../kit/skills/docqet/adopting.md) is how
agents do it today.
