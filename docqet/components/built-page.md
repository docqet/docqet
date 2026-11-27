---
docqet: component
id: built-page
name: How it's built pages
description: >-
  The mechanisms and components list and each one's page,
  `ui/src/pages/built`: how it's built, its technical gaps, where it is in
  the code, and the capabilities relying on it.
within: component:ui
serves: [capability:how-its-built]
gaps:
  - id: no-claim-beside-evidence
    name: Claims aren't shown beside their evidence
    impact: inconvenient
    likelihood: certain
    reach: most
    description: >-
      The pages show how each part is built, but not each capability's claim
      beside what backs it, so where what was built differs from what was
      meant has no view of its own.
---

It answers "how is it built, and where does that fall short?" A component
shows its archetype, the bigger component it's within, and its parts.
