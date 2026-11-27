---
docqet: capability
id: rubric
domain: authoring
name: Stability rubric
description: >-
  Everyone sees what each stability level expects of a capability, from the
  stability rubric built into `docqet`.
stability: prototype
solves: [problem:no-shared-sense-of-enough]
concepts: [concept:rubric, concept:stability-level]
decisions:
  - topic: A rubric of a project's own
    question: >-
      The rubric is the same for every project. Should a project be
      able to change it, once someone adopting Docqet needs different
      outcomes?
  - topic: What met means
    question: >-
      An outcome counts as met unless a gap, tradeoff or decision says it
      isn't, so nothing shows which outcomes someone actually looked at, and
      one added to the rubric counts as met everywhere at once. Should
      the docs record when someone last went through them, and against which
      version? Should they say which outcomes don't apply, and why? Should
      Docqet work some out itself, such as
      `outcome:functionality/alpha/main-path` from its rules' evidence?
---

People and agents read it from the command line with `docqet rubric`, and
in the UI.
