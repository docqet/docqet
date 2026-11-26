---
docqet: capability
id: checking
domain: authoring
name: Checking
description: >-
  Engineers and CI find the problems in a project's docs and annotations, each
  with where to fix it, with `docqet check`.
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
  - id: half-rated-decisions
    name: Half-rated decisions aren't reported
    impact: inconvenient
    likelihood: expected
    reach: some
    description: >-
      A decision with only one or two of its impact, likelihood and reach
      isn't reported as invalid frontmatter, since the ratings aren't read at
      all yet, so whoever wrote it isn't told it has no risk.
---
