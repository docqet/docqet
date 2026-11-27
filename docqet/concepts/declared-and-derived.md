---
docqet: concept
id: declared-and-derived
name: Declared and derived
description: >-
  Everything in Docqet is one or the other: written by people and agents, or
  worked out from what they wrote.
confused-with:
  - term: "Declared and confirmed"
    summary: >-
      intention an agent works out from existing code isn't counted as declared until a person confirms it.
---

- **Declared**: written by people and agents. [Docs](doc.md),
  [stability levels](stability-level.md), [rules](rule.md),
  [open decisions](open-decision.md), [gaps](gap.md),
  [tradeoffs](tradeoff.md), [links](link.md) and
  [annotations](annotation.md).
- **Derived**: worked out by the [indexer](indexer.md), or by readers.
  [Evidence](evidence.md), [maturity](maturity.md), [bands](band.md),
  [readiness](readiness.md), [risk](risk.md), the
  standing of each outcome in [the stability rubric](rubric.md), reverse
  links and [findings](finding.md). Nobody edits it by hand.

Intention is only ever declared in a repository, so it's reviewed with the
code. Servers and other tools read it and show it, but never change it.

## How it's written

Room booking's declared part is its doc:

```yaml
stability: beta
feature: feature:reservations
solves: [problem:room-given-to-two-guests]
rules: [rule:no-double-booking, rule:minimum-stay, rule:same-day-turnover]
```

Its derived part is in [state](state.md), worked out from that doc and
everything else in the repository: the personas of the problem it solves,
and the evidence that names it:

```json
{
  "id": "room-booking",
  "personas": ["persona:front-desk-clerk"],
  "evidence": {
    "implements": [{ "file": "src/booking/repository.ts", "line": 6, "text": "..." }]
  }
}
```
