---
docqet: capability
id: renaming
name: Renaming
description: >-
  Engineers change a doc's ID, with everything that names it, and get the
  trailer to commit it with.
stability: prototype
feature: feature:keeping-current
solves: [problem:docs-drift-from-code, problem:docs-slow-every-change]
gaps:
  - id: other-projects-not-listed
    name: Other projects' references aren't listed
    impact: inconvenient
    likelihood: possible
    reach: some
    description: >-
      A rename changes every reference in this project, but `--product`
      isn't built, so references to the old ID in the product's other
      projects aren't listed, and are found only when they break.
---

Today it's `docqet rename`.
