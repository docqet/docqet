---
docket: capability
id: expectations
domain: authoring
name: Expectations
description: >-
  Everyone sees what each stability level expects of a capability, from the
  expectations built into `docket`.
stability: prototype
personas: [persona:engineer, persona:coding-agent, persona:product-owner]
concepts: [concept:expectations, concept:stability-level]
decisions:
  - topic: Expectations of a project's own
    question: >-
      The expectations are the same for every project. Should a project be
      able to change them, once someone adopting Docket needs different
      outcomes?
  - topic: What met means
    question: >-
      An outcome counts as met unless a gap, tradeoff or decision says it
      isn't, so nothing shows which outcomes someone actually looked at, and
      one added to the expectations counts as met everywhere at once. Should
      the docs record when someone last went through them, and against which
      version? Should they say which outcomes don't apply, and why? Should
      Docket work some out itself, such as
      `outcome:functionality/alpha/main-path` from its rules' evidence?
---

`docket expectations`, which shows them from the command line, is drafted and
not built yet. Agents read them there once it is, and the UI shows them today.
