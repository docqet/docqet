---
docqet: capability
id: renaming
domain: authoring
name: Renaming
description: >-
  Engineers change a doc's ID, with everything that names it, and get the
  trailer to commit it with.
stability: prototype
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
  - id: domain-rename-stops-at-its-doc
    name: Renaming a domain changes only its own doc
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      Renaming a domain changes the domain doc's ID, but not the `domain` of
      its features and capabilities, nor its rules and concepts. Each rule
      and concept has to be renamed on its own, with a trailer for each, and
      the rest edited by hand.
---

Today it's `docqet rename`.
