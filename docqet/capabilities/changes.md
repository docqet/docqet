---
docqet: capability
id: changes
name: Changes
description: >-
  Engineers and agents see how a project's docs changed between commits, and
  the history of any doc.
stability: prototype
within: feature:keeping-current
solves: [problem:docs-drift-from-code, problem:why-it-changed-is-lost, problem:thread-lost-switching-hats]
uses: [concept:trailer]
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
decisions:
  - topic: Keys for decisions
    question: >-
      A decision is a `topic` and a `question`, with nothing that names it, so
      a trailer can't name one. What key should each have, as a gap or
      tradeoff has, such as `capability:refunds#where-the-money-goes`?
    affects:
      - capability:agent-guidance#decisions-not-named
  - topic: Why something was removed
    question: >-
      A gap deleted because it was never real looks the same as one closed by
      work. Should a removal be able to say why?
  - topic: A trailer left out
    question: >-
      A rename committed without its trailer reads in history as one thing
      removed and another added, and only rewriting that commit fixes it.
      Should a later commit be able to say what an earlier one's removal
      became?
---

Today it's `docqet diff`, with `docqet log` and `docqet history` to come.

## Includes

- Commits saying what a doc, gap or decision they removed became, with
  [trailers](../concepts/trailer.md), so history can follow it.
