---
docqet: capability
id: checking
domain: authoring
name: Checking
description: >-
  Is anything in the docs wrong? Engineers and CI see the findings in a
  project's docs and annotations, each with where to fix it.
stability: prototype
solves: [problem:docs-drift-from-code]
concepts: [concept:finding]
rules:
  - rule:docs-with-findings-still-index
  - rule:no-evidence-isnt-a-finding
gaps:
  - id: links-into-other-projects
    name: Links into another project are findings
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      In a product of several projects, a doc that names a rule, concept or
      feature defined in another project is reported as a finding, since
      `--product` isn't built and the check sees only this project. A team
      reusing another project's IDs gets a failing check it can't fix.
---

Today it's `docqet check`.
