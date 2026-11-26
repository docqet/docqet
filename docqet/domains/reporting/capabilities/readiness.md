---
docqet: capability
id: readiness
domain: reporting
name: Maturity and readiness
description: >-
  Everyone sees how far along each feature, domain and persona is, how ready
  it is to rely on, and the gaps holding it back.
stability: prototype
personas: [persona:product-owner, persona:engineer]
concepts: [concept:maturity, concept:band, concept:readiness, concept:risk, concept:exposure]
rules:
  - rule:drafts-claim-nothing
gaps:
  - id: decisions-not-rated
    name: Rated decisions don't count
    impact: damaging
    likelihood: possible
    reach: all
    description: >-
      A decision's impact, likelihood and reach aren't read yet, so a rated
      decision has no risk and adds nothing to exposure, and readiness shows
      higher than it is wherever one is open. Decisions are still shown with
      the risk of the riskiest gap they affect.
---
