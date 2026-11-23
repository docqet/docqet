# System

How something overarching works: one that several features rely on, so you
need the whole picture to change it safely.

## Details

Hotel Billing's ledger is a system: every amount a guest owes or pays, as
lines on their bill that are only ever added. Deposits, extra charges,
check-out and direct billing all rely on it. Expect a handful per repository,
such as authentication, deployment or tenant isolation.

A system is a technical doc, written in the code's words, so it follows
what [how it's built](../overview.md#how-its-built) says of them all: it holds
only what the code can't show, links to the capabilities that rely on it and
never the other way, and has no level or domain of its own.

- **It lists the [capabilities](capability.md) that rely on it.** Its
  technical gaps show on each of them, under the hood.
- **It holds the technical [gaps](gap.md), [tradeoffs](tradeoff.md) and
  [open decisions](open-decision.md) about it.**
- **It can meet [checklist outcomes](stability-checklist.md)** for the
  capabilities it serves. Each of them then shows the outcome as met, with
  evidence, and the system's [evidence](evidence.md) is the proof.

## In the spec

A system is a doc in `docs/technical/systems/`. Its frontmatter holds what
tools compute with, and its body what an engineer reads first.
[`ledger.md`](../../../spec/examples/hotel-billing/docs/technical/systems/ledger.md),
with its body shortened:

```markdown
---
capabilities: [extra-charges, split-bills, deposits, check-out, direct-billing]
code: [src/ledger/**]
meets: [reliability/beta/data-kept]
gaps:
  - id: corrections-of-corrections-untested
    until: extra-charges@ga
    outcome: maintainability/ga/others-can-change
    text: >-
      Nothing tests correcting a line that is itself a correction, so a change
      to `correct` could stop a twice-corrected charge netting to zero without
      anything failing.
tradeoffs:
  - id: balance-worked-out-on-read
    text: >-
      A bill's balance is added up from its lines every time it's asked for,
      not stored on the bill.
    cost: Opening a bill gets slower as lines are added to it.
    revisit: a bill passes 1,000 lines
---

# Ledger

Every amount a guest owes or pays, as lines on their bill that are only ever
added, never changed.

**Code:** `src/ledger/ledger.ts`, starting at `post`

## How it works

Everything that changes what a guest owes goes through `post`: room nights,
extras, deposits, payments and corrections. ...

## Gotchas

- Amounts are whole cents, never fractions of a unit, so totals add up
  exactly. Convert at the edges, when reading input and showing amounts.
```

Code points back at it as evidence, `// docket:implements system:ledger`,
which is also the evidence that it meets `reliability/beta/data-kept`.

## Not to be confused with

- [Component](component.md): one area of the code, that only someone working
  on it needs. A fact moves from a component to a system when a second area
  needs it.
- [Feature](feature.md): a job the product does, in the domain's words. A
  system is how part of it's built, in the code's.
