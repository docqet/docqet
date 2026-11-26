---
docqet: concept
id: rubric
domain: authoring
name: Stability rubric
description: >-
  What each [stability level](stability-level.md) generally means and expects,
  so the people depending on a capability and the people building it share the
  same picture of its level.
confused-with:
  - term: "A gate or a test"
    summary: >-
      nothing fails when an outcome isn't met. It's a shared picture of what a level means, for people to judge by.
---

A stability level says in one word how stable something is. The stability
rubric says what that word means, quality by quality, for the people
depending on a capability and the people and agents building it.

It's built into the format, so it's the same for every project and every
tool that reads Docqet, whatever kind of software it is. A project doesn't
copy it, change it or configure it. It's a tool for applying engineering
judgment about stability the same way everywhere, not the authority on what
stability means.

## A guideline, not a gate

- **Not every box needs checking.** Work can be called a level, GA included,
  with outcomes unmet. What's unmet is written down as a known [gap](gap.md),
  or a [tradeoff](tradeoff.md), so everyone can see it.
- **It doesn't replace engineering judgment.** The engineer decides what fits
  the work, and judgment about the work wins over the wording of any
  outcome.
- **It applies differently to every project.** What an outcome takes, and
  whether it applies at all, depends on the software, who uses it, and the
  circumstances.

## Qualities

The rubric has ten qualities, each a question someone asks before
depending on the work. Lower levels ask for little, enough to learn whether
the work is worth doing, and each level adds to the ones below it as more
people come to rely on the work:

| Quality         | The question it answers                                       |
| --------------- | ------------------------------------------------------------- |
| Utility         | Is it worth building, and is this the right way to build it?  |
| Usability       | Can its users learn and use it on their own?                  |
| Functionality   | Does it do what it should, and keep doing it?                 |
| Reliability     | Does it keep working when something goes wrong?               |
| Efficiency      | Is it fast enough, at a cost that makes sense?                |
| Security        | Is it protected, and does it follow the rules?                |
| Compatibility   | Does it fit with what's around it?                            |
| Observability   | When something goes wrong, does someone find out and see why? |
| Maintainability | Is it easy to understand and change?                          |
| Supportability  | Who's responsible, and where do people turn?                  |

They draw on ISO/IEC 25010, Kubernetes' feature graduation and production
readiness review, Google's SRE practice, AWS Well-Architected and FURPS+.
Practices and artifacts, such as tests, docs, logs and CI, aren't qualities:
they're ways a quality might be met, so they appear in `implementation`.

## Levels and outcomes

Each quality has a `question`, `why` it matters, and an entry for every
level:

- **`summary`** says in a sentence how much that level asks of the quality.
  An entry without one expects nothing at that level. Efficiency, for
  example, expects nothing before Beta.
- **`outcomes`** are what should be true of the work at that level, such as
  "a bad release can be undone" at Beta. Each is something someone can call
  met or not, worded to fit any kind of software, from a web app to a CLI,
  an HTTP API, a background job or a library.

**A level includes every outcome the levels below it expect**, unless
`until` names the last level an outcome applies to.
`outcome:compatibility/prototype/opt-in`, which keeps it to those who chose
to try it, applies through Alpha, and Beta's normal release replaces it.

### Examples

Each outcome has two lists of examples, to help judge how to meet it at that
level, or whether to at all. They're illustrations, not instructions,
requirements or complete lists:

- **`implementation`** is how meeting it might look, which tools show as
  "How it might look". There are other ways to meet it.
- **`overengineering`** is work that may be overengineering at that level.
  It may be in scope at another level, or never needed for the project at
  all, so it isn't a to-do list for the next level. It's there to help judge
  where a level's work stops.

An example is its text alone, or its `text` and `kinds`: the kinds of
software it may suit, from the file's `kinds` list: web app, mobile app,
desktop app, HTTP API, CLI, background job and library. Kinds are
indications, not rules: a project can be several kinds, an untagged example
may not suit it, and one tagged for another kind may suit it well.

An entry without outcomes can still have `implementation` and
`overengineering`, for what work on the quality might look like at that
level.

## What's met

**An outcome that applies is met unless a gap, tradeoff or decision
[affects](gap.md#affects) it.** Declaring a level claims what that level
expects, except the gaps, tradeoffs and decisions written down, so only what
isn't met is recorded. An outcome that doesn't apply, such as accessibility
for an API with no screens, counts as met too.

Each outcome a capability's level expects has a standing:

- **Not met**: a gap affects it, on the capability or on a
  [mechanism](mechanism.md) or [component](component.md) it relies on.
- **Not met, by choice**: a tradeoff there affects it. We chose not to meet
  it, and the tradeoff says why. The ledger's balance, worked out every time
  it's asked for, falls short of "the work it does is bounded" on purpose.
- **Open**: an [open decision](open-decision.md) there affects it: whether to
  meet it, or whether it applies, isn't settled, so it's neither claimed nor
  short. Hotel Bookings' deployment asks whether restoring the night before's
  database is enough to undo a schema change, which leaves "recovering from a
  bad release or a loss of data is known to work" open for check-out, at GA.
  A gap there affects it too, and wins, so it shows as not met, with the
  question beside it.
- **Met, with evidence**: a mechanism or component it relies on `meets` it,
  and that mechanism's or component's [evidence](evidence.md) is the proof.
  Hotel Bookings' deployment meets "a bad release can be undone" for every
  capability it applies to.
- **Met, on trust**: nothing affects it.

A gap wins over a tradeoff, a tradeoff over a decision, and all three over
`meets`.

A draft has no level, so it claims none of it.

## How it's written

The rubric is in
[`internal/rubric/rubric.yml`](../../../../internal/rubric/rubric.yml),
in Docqet's own repository. It's embedded in `docqet`, so each build
carries the version it was built with, and in every [state](state.md), so a
reader has the version the state was indexed with. Agents read it with
`docqet rubric`. An outcome, under its quality and level, shortened:

```yaml
  - id: reliability
    name: Reliability
    question: Does it keep working when something goes wrong?
    levels:
      beta:
        outcomes:
          - id: undo-release
            text: A bad release can be undone.
            implementation:
              - text: A rollback to the previous release.
                kinds: [web-app, http-api, background-job]
```

**An outcome's reference** is `outcome:` and its quality, level and own ID:
`outcome:reliability/beta/undo-release`. It's in no domain. Its level is in
it, so moving an outcome to another level changes its reference, and every
doc naming it shows as `unknown-outcome` until someone looks at it again:
what it claims has changed.

**`meets`** on a mechanism or component lists the outcomes it meets for the
capabilities it applies to, as `outcome:<quality>/<level>/<id>`. Its
evidence is the proof. Hotel Bookings'
[deployment](../../../../examples/hotel-bookings/docqet/mechanisms/deployment.md)
lists:

```yaml
meets:
  - outcome:reliability/beta/undo-release
  - outcome:observability/alpha/see-errors
```

A gap, tradeoff or decision names the outcomes it affects the same way, as
room booking's calendar that needs a mouse does:

```yaml
affects:
  - outcome:usability/beta/everyone
```
