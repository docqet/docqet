---
docqet: capability
id: changes
name: Changes
description: >-
  Engineers and agents see how a project's docs changed between commits, and
  the history of any doc.
stability: prototype
feature: feature:keeping-current
solves: [problem:docs-drift-from-code, problem:why-it-changed-is-lost]
gaps:
  - id: diff-only
    name: Only diff is built
    impact: inconvenient
    likelihood: certain
    reach: most
    description: >-
      `docqet diff` compares two points, but `docqet log` and `docqet history`
      aren't built, so following one thing through every commit means
      diffing commit by commit.
  - id: diff-indexes-every-time
    name: Diff indexes both points every time
    impact: negligible
    likelihood: certain
    reach: all
    description: >-
      Nothing indexed is kept between runs, so each diff indexes both points
      again from git.
---

Today it's `docqet diff`, with `docqet log` and `docqet history` to come.
