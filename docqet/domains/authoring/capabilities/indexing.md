---
docqet: capability
id: indexing
domain: authoring
name: Indexing
description: >-
  What does the project say at this commit? Engineers and CI work out a
  project's state from its docs and annotations, at the working tree or any
  commit.
stability: prototype
personas: [persona:engineer, persona:coding-agent]
concepts: [concept:indexer, concept:state, concept:project]
rules:
  - rule:location-means-nothing
  - rule:same-files-same-state
  - rule:nested-projects-are-separate
  - rule:ignored-files-arent-read
  - rule:docs-with-findings-still-index
---

Today it's `docqet index`.
