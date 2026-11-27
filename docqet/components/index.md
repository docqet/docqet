---
docqet: component
id: index
name: Index
description: >-
  Reads a project's docs and annotations, and works out its state: each doc's
  entry, evidence, reverse links, and the findings only files show.
within: component:engine
serves:
  - capability:indexing
  - capability:docs-format
  - capability:annotations
---

How it works is in [Indexing](../../docs/architecture/indexing.md).
