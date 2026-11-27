---
docqet: component
id: engine
name: Engine
description: >-
  What the CLI and the server both use to read Docqet: indexing a project,
  checking it, putting a product's projects together, and working out
  maturity, readiness, risk and improvements.
is: archetype:library
serves:
  - capability:indexing
  - capability:checking
  - capability:product-view
  - capability:readiness
  - capability:improvements
  - capability:initiative-scope
  - capability:problems
  - capability:constraints
---

The engine is the packages under `internal/` that touch no terminal, network
or database: `index` and `check` work on one project's state, `combine` puts
a product's states together, and `derive` works everything else out from the
result. The CLI and the server call the same functions, so a number never
differs between the terminal and the browser.

It runs in order: index each project, check it, combine the product, derive.
Nothing derived is stored; each read works it out again from the states.
