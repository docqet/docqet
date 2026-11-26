---
docket: capability
id: overview
domain: reporting
name: Overview
description: >-
  Everyone sees at a glance what the software can do, who it serves, how
  stable each capability is, the rules each follows, and its gaps.
stability: prototype
personas: [persona:product-owner, persona:engineer]
gaps:
  - id: not-on-the-server
    name: Not on the server yet
    impact: blocking
    reach: most
    description: >-
      The server serves the UI, but the UI shows the `state.json` files
      beside it, not the states applied to the server, so what people see
      there isn't what CI sent.
---

The UI is in [ui/](../../../../ui/).
