---
docqet: capability
id: checking
domain: authoring
name: Checking
description: >-
  Is anything in the docs wrong? Engineers and CI find the problems in a
  project's docs and annotations, each with where to fix it.
stability: prototype
personas: [persona:engineer, persona:coding-agent]
concepts: [concept:problem]
rules:
  - rule:docs-with-problems-still-index
  - rule:no-evidence-isnt-a-problem
gaps:
  - id: links-into-other-projects
    name: Links into another project are problems
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      In a product of several projects, a doc that names a rule, concept or
      feature defined in another project is reported as a problem, since
      `--product` isn't built and the check sees only this project. A team
      reusing another project's IDs gets a failing check it can't fix.
---

Today it's `docqet check`.
