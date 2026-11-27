---
docqet: capability
id: evidence-against-intent
name: Evidence against intent
description: >-
  Everyone sees each capability's and rule's claim beside what backs it: the
  code that implements it, the tests that verify it and their results, the
  gaps declared on it, and what its level expects that no evidence backs yet.
stability: draft
within: feature:intent-vs-reality
solves: [problem:planned-and-built-drift-apart, problem:unclear-what-to-rely-on]
included-in: [initiative:why-first-class]
uses: [concept:evidence, concept:gap, concept:rubric, concept:declared-and-derived]
decisions:
  - topic: Derived shortfalls
    question: >-
      Which of what a level expects can be worked out as missing from the
      evidence, such as a Beta capability whose rule nothing verifies, or a
      capability nothing implements? And can a person turn one into a
      declared gap, or say it doesn't apply?
  - topic: Staleness
    question: >-
      Should it show where the code a capability's annotations point at has
      changed while its docs haven't, and over how many commits or how long
      before that's worth saying?
---

What's declared missing is a gap. What the evidence shows is missing, though
nobody declared it, is a derived shortfall, and it never fails
`docqet check`: it's the derived side of
[declared and derived](../concepts/declared-and-derived.md).
