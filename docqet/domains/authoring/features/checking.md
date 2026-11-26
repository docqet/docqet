---
docqet: feature
id: checking
domain: authoring
name: Checking a project
description: >-
  Working out a project's state from its docs and annotations, and finding the
  problems in them.
capabilities:
  - capability:indexing
  - capability:checking
  - capability:touches
tradeoffs:
  - id: no-editor-integration
    name: No watching or editor integration
    description: >-
      Docqet doesn't watch files, plug into editors, or run as a language
      server. Problems show when `docqet check` runs.
    benefit: >-
      One command that works the same everywhere, with no editor to support.
    drawback: >-
      A problem is found only when someone runs the check, such as in a
      pre-commit hook or CI, not as the doc is written.
---
