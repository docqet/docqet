---
docqet: capability
id: local-viewer
domain: understanding
name: Local viewer
description: >-
  Engineers see their working tree the way the server will show it, on their
  own machine, with `docqet ui`.
stability: prototype
personas: [persona:engineer]
gaps:
  - id: no-reindex
    name: Doesn't re-index as files change
    impact: inconvenient
    likelihood: certain
    reach: all
    description: >-
      It shows the state `docqet index` last wrote, read again on each
      reload, so engineers run `docqet index` after each change to see it.
  - id: working-tree-only
    name: Only the working tree
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      It can't show a commit or a time, as the server's `?at=` will, until
      Docqet can read history.
---
