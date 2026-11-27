---
docqet: capability
id: cli-reads
name: Looking up intention
description: >-
  Engineers and agents look up what a capability, rule or gap says, and how
  ready it is, while they work, from the working tree or a commit, without
  leaving the terminal.
stability: prototype
within: feature:keeping-current
solves:
  - problem:intent-in-peoples-heads
  - problem:agents-guess-intention
  - problem:docs-slow-every-change
gaps:
  - id: no-status
    name: No status
    impact: inconvenient
    likelihood: certain
    reach: most
    description: >-
      `docqet show` and `docqet list` are built, but `docqet status` isn't, so
      the overview of maturity, readiness and risk is only in the UI.
  - id: working-tree-only
    name: Reads only this project's files
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      Reads take the working tree or a commit, but not `--remote` or
      `--product`, so they can't show the server's states or the rest of the
      product.
---

Today it's `docqet show` and `docqet list`. Agents work only through commands,
so for them this is the only way to read the intention.
