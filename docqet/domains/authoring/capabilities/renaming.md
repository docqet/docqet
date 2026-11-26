---
docqet: capability
id: renaming
domain: authoring
name: Renaming
description: >-
  Engineers change a doc's ID, with everything that names it, and get the
  trailer to commit it with, using `docqet rename`.
stability: prototype
personas: [persona:engineer, persona:coding-agent]
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
