---
docket: component
id: ui
name: UI
description: >-
  The web app `docket` serves, built into the binary, that shows a product's
  projects.
capabilities:
  - capability:overview
  - capability:readiness
  - capability:product-view
  - capability:local-viewer
gaps:
  - id: works-out-figures-itself
    name: Works out maturity and readiness itself
    impact: negligible
    likelihood: expected
    description: >-
      The UI works out maturity, readiness and risk in TypeScript, so once
      `docket` works them out in Go, the two can disagree until the UI reads
      them from the API.
---

How it's laid out is in [the UI's README](../../ui/README.md), and its move to
the API in [The UI](../../docs/architecture/ui.md).
