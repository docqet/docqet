---
docqet: domain
id: understanding
name: Understanding
description: >-
  Making clear to everyone involved, technical or not, what the software is
  meant to do, where it meets that and where it falls short, what would
  improve it, and how that's changed.
decisions:
  - topic: Results and changes
    question: >-
      What are the test and QA results a server is sent, and the changes it
      works out as states are applied: what each holds, and what each is
      called? "Runs" or "reports" for results, since each send is one JUnit
      or QA run, and "timeline" or "events" for changes, have been
      considered. "History" is taken by `docqet history`.
---

Authoring is what people write down and keep true. Understanding is what
Docqet works out from it, and how everyone involved, technical or not, sees
where the software stands. Read [authoring](../authoring/domain.md) first: it
introduces the format, its principles and every concept. This domain's
[concepts](concepts/) define what's worked out, and its features and
capabilities say which questions Docqet answers with them.

## Every capability answers a question

This domain exists so that everyone with a stake in the software shares one
view of it: what it's meant to do, and where it stands against that. Pages,
screens and commands change. The questions people ask of the software don't.
So each capability here is defined by the question it answers and who asks
it, never by the view that answers it today, just as
[delivery isn't a capability](../authoring/domain.md#agnostic-of-implementation).

- **A capability answers one question someone with a stake asks**, in their
  words. Its description starts with that question, then says who asks it
  and what the answer shows, and names no page, screen or command. Its
  `name` is the short label people use. A feature's description starts with
  the broader question its capabilities answer together.
- **A new view isn't a new capability.** It's a new capability only if it
  answers a question nothing answered before. Two views of the same
  question, such as a page and a command, are one capability.
- **A question nothing answers yet is a draft capability**, never a gap on a
  view.

| Feature                                                | Its question                                              |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Where it stands](features/where-it-stands.md)         | Where does the software stand, and what would improve it? |
| [Reading the intention](features/reading-intention.md) | What is the software meant to do, and why?                |
| [Seeing what changed](features/history.md)             | How has it changed?                                       |
| [Sharing one view](features/sharing.md)                | Is everyone looking at the same, current picture?         |

Readiness and improvements are a pair. [Readiness](capabilities/readiness.md)
answers what's holding the software back: capabilities at lower levels pull
its maturity down, and the gaps and rated open decisions on them add
exposure. [Improvements](capabilities/improvements.md) answers what to do
about it, and what each step would be worth. Sharing one view answers no
question of its own: its capabilities are how every answer reaches everyone.

## What's worked out

Readers put a [product's](concepts/product.md) projects together by ID, and
show any [contradiction](concepts/contradiction.md) between them instead of
choosing one. From the result they work out:

- **[Risk](concepts/risk.md)**: what's at stake in each gap, and each rated
  open decision, scored from the impact, likelihood and reach it declares,
  the level of each capability it's on, and whether it breaks a claim made
  there.
- **[Exposure](concepts/exposure.md)**: what the gaps and rated decisions on
  some capabilities put at stake together, from the riskiest on each.
- **[Maturity](concepts/maturity.md)**: how far along each feature, domain,
  project, initiative, and what serves each persona, is, from its
  capabilities' levels. Each falls in a [band](concepts/band.md).
- **[Readiness](concepts/readiness.md)**: how ready people can rely on each
  capability, feature, domain, project, persona and initiative being, as a
  recommendation, with its improvements: what would raise it, and by how
  much. It's maturity less exposure.

Read them in that order, since each builds on the one before. None of them
is written down or in [state](../authoring/concepts/state.md), since each
needs every project that contributes to a capability.

## Where intention and reality differ

Docqet names the ways the software can differ from what's intended, so each
can be shown the same way and nothing is hidden:

| Shape                                                       | What it means                                                                             | Declared or derived |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| **[Open decision](../authoring/concepts/open-decision.md)** | What's intended isn't settled yet                                                         | Declared            |
| **[Gap](../authoring/concepts/gap.md)**                     | The software falls short of what's intended, in a way that needs work nobody has done yet | Declared            |
| **[Tradeoff](../authoring/concepts/tradeoff.md)**           | We chose this on purpose, with its benefit and drawback                                   | Declared            |
| **[Finding](../authoring/concepts/finding.md)**             | The docs are wrong or contradict each other                                               | Derived             |

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

### What's open, and what holds

What's open is the open decisions and the gaps, and nothing else. Everything
else declared is taken to hold: a gap is how we say part of it doesn't yet.
Everything declared, such as what a capability does, each rule it follows,
and each outcome its level
[expects](../authoring/concepts/rubric.md), is a claim, and each claim
is in one of these standings:

| Standing                | When                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **Not held**            | A gap affects it, for all of it or a part                                                 |
| **Not held, by choice** | A tradeoff affects it: only an expected outcome                                           |
| **Open**                | An open decision affects it: only an expected outcome                                     |
| **Held, with evidence** | Something in the repository points at it as [evidence](../authoring/concepts/evidence.md) |
| **Held, on trust**      | Nothing affects it, which is the usual case                                               |

A gap wins over a tradeoff, a tradeoff over a decision, and all three over
evidence. A decision can also affect a gap, which then waits on its answer,
or a tradeoff, which it reopens. Evidence is always optional: it shows how
we know something holds, and its absence is never open. A
draft capability claims nothing yet.
