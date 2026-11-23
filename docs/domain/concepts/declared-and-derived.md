# Declared and derived

Everything in Docket is one or the other: written by people and agents, or
worked out from what they wrote.

## Details

- **Declared**: written by people and agents. [Docs](doc.md),
  [stability levels](stability-level.md), [rules](rule.md),
  [open decisions](open-decision.md), [gaps](gap.md),
  [tradeoffs](tradeoff.md), [links](link.md) and
  [annotations](annotation.md).
- **Derived**: worked out by the [indexer](indexer.md), or by readers.
  [Evidence](evidence.md), [maturity](maturity.md), [bands](band.md),
  [readiness](readiness.md), [risk](risk.md), each
  checklist outcome's standing, reverse links and [problems](problem.md). Nobody edits it by hand.

Intention is only ever declared in a repository, so it's reviewed with the
code. Servers and other tools read it and show it, but never change it.

## In the spec

Room booking's declared part is its doc:

```yaml
stability: beta
rules: [rule:no-double-booking, rule:minimum-stay, rule:same-day-turnover]
```

Its derived part is in [state](state.md), worked out from that doc and
everything else in the repository: the feature that lists it, and the evidence
that names it:

```json
{
  "id": "room-booking",
  "feature": "feature:reservations",
  "evidence": {
    "implements": [{ "file": "src/booking/repository.ts", "line": 6, "text": "..." }]
  }
}
```

## Not to be confused with

- Declared and confirmed: intention an agent works out from existing code
  isn't counted as declared until a person confirms it.
