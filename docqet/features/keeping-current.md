---
docqet: feature
id: keeping-current
name: Keeping it true
description: >-
  Keeping intention and evidence true in the same change as the code, so the
  docs never describe software that's gone.
within: area:authoring
tradeoffs:
  - id: no-editor-integration
    name: No watching or editor integration
    description: >-
      Docqet doesn't watch files, plug into editors, or run as a language
      server. Findings show when `docqet check` runs.
    benefit: >-
      One command that works the same everywhere, with no editor to support.
    drawback: >-
      A finding is found only when someone runs the check, such as in a
      pre-commit hook or CI, not as the doc is written.
---
