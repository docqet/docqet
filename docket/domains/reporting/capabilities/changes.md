---
docket: capability
id: changes
domain: reporting
name: Changes
description: >-
  Engineers see how a project's docs changed between commits, and the history
  of any doc, with `docket diff`, `log` and `history`.
stability: prototype
personas: [persona:engineer, persona:coding-agent]
gaps:
  - id: diff-only
    name: Only diff is built
    impact: inconvenient
    likelihood: certain
    reach: most
    description: >-
      `docket diff` compares two points, but `docket log` and `docket history`
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
