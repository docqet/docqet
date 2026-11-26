---
docqet: domain
id: reporting
name: Reporting
description: >-
  Showing everyone with a stake in software where it is: what it does, who it
  serves, how ready it is, what's left, and how that's changed.
decisions:
  - topic: Results and changes
    question: >-
      What are the test and QA results a server is sent, and the changes it
      works out as states are applied: what each holds, and what each is
      called? "Runs" or "reports" for results, since each send is one JUnit
      or QA run, and "timeline" or "events" for changes, have been
      considered. "History" is taken by `docqet history`.
---

Authoring is what people write down. Reporting is what Docqet works out from
it, and how it shows that to everyone with a stake in the software. Read
[authoring](../authoring/domain.md) first: it introduces the format, its
principles and every concept. This domain's [concepts](concepts/) define
what's worked out, and its features and capabilities say how Docqet shows
them.

## What's worked out

Readers put a [product's](concepts/product.md) projects together by ID, and
show any [contradiction](concepts/contradiction.md) between them instead of
choosing one. From what's left they work out:

- **[Risk](concepts/risk.md)**: what's at stake in each gap, scored from the
  impact, likelihood and reach it declares, the level of each capability
  it's on, and whether it breaks a claim made there.
- **[Exposure](concepts/exposure.md)**: what the gaps on some capabilities
  put at stake together, from the riskiest gap on each.
- **[Maturity](concepts/maturity.md)**: how far along each feature, domain,
  project, initiative, and what serves each persona, is, from its
  capabilities' levels. Each falls in a [band](concepts/band.md).
- **[Readiness](concepts/readiness.md)**: how ready people can rely on each
  capability, feature, domain, project, persona and initiative being, as a
  recommendation, with what's left. It's maturity less exposure.

Read them in that order, since each builds on the one before. None of them
is written down or in [state](../authoring/concepts/state.md), since each
needs every project that contributes to a capability.

## Where intention and reality differ

Docqet names the ways the software can differ from what's intended, so each
can be shown the same way and nothing is hidden:

| Shape                                                          | What it means                                                                             | Declared or derived |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| **[Open decision](../authoring/concepts/open-decision.md)**    | What's intended isn't settled yet                                                         | Declared            |
| **[Gap](../authoring/concepts/gap.md)**                        | The software falls short of what's intended, in a way that needs work nobody has done yet | Declared            |
| **[Tradeoff](../authoring/concepts/tradeoff.md)**              | We chose this on purpose, with its benefit and drawback                                   | Declared            |
| **[Problem](../authoring/concepts/problem.md)**                | The docs are wrong or contradict each other                                               | Derived             |

Each declared one is written on the thing it's about, once, and shown on
everything it affects. When one seems to belong to two things, it's about
something they share, such as a rule they follow or a mechanism they rely
on. Nothing is declared on a project, a persona or an initiative: theirs are
worked out.

| Declared on            | Open decisions                                                           | Gaps                                               | Tradeoffs                                            |
| ---------------------- | ------------------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------- |
| Domain                 | Ones whose answer becomes a rule or concept                              | —                                                  | —                                                    |
| Feature                | Ones whose answer adds a capability or rules one out                     | —                                                  | Non-goals: capabilities we've decided never to build |
| Capability             | Ones whose answer changes what it does                                   | What people using it would notice                  | Limits it has by choice                              |
| Mechanism or component | Ones whose answer becomes a tradeoff, a gap, or a mechanism or component | What only someone working on the code would notice | Technical choices                                    |

A rule holds none of them. A rule is decided once its doc exists, and a gap
that says a capability doesn't hold to a rule yet is the capability's.

### What's left, and what holds

What's left is the open decisions and the gaps, and nothing else. Everything
else declared is taken to hold: a gap is how we say part of it doesn't yet.
Everything declared, such as what a capability does, each rule it follows,
and each outcome its level
[expects](../authoring/concepts/rubric.md), is a claim, and each claim
is in one of these standings:

| Standing                | When                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Not held**            | A gap affects it, for all of it or a part                                               |
| **Not held, by choice** | A tradeoff affects it: only an expected outcome                                         |
| **Open**                | An open decision affects it: only an expected outcome                                   |
| **Held, with evidence** | Something in the repository points at it as [evidence](../authoring/concepts/evidence.md) |
| **Held, on trust**      | Nothing affects it, which is the usual case                                             |

A gap wins over a tradeoff, a tradeoff over a decision, and all three over
evidence. A decision can also affect a gap, which then waits on its answer,
or a tradeoff, which it reopens. Evidence is always optional: it shows how
we know something holds, and its absence is never something left to do. A
draft capability claims nothing yet.
