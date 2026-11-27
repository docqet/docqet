---
docqet: capability
id: indexing
name: Indexing
description: >-
  Engineers and CI work out a project's state from its docs and annotations,
  at the working tree or any commit.
stability: prototype
within: feature:keeping-current
solves: [problem:docs-drift-from-code]
follows:
  - rule:location-means-nothing
  - rule:same-files-same-state
  - rule:nested-projects-are-separate
  - rule:ignored-files-arent-read
  - rule:docs-with-findings-still-index
uses: [concept:indexer, concept:state, concept:project]
---

Today it's `docqet index`.
