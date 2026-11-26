---
docket: concept
id: gap
domain: authoring
name: Gap
description: >-
  A known shortfall in what the software does, or in how it's built, that needs
  work nobody has done yet: building, deciding, designing or testing. It's
  written down rather than hidden, so people see it before they depend on what
  it's in. We intend to close it, and when and how is up to us: Docket lists it
  so we know about it.
confused-with:
  - concept: "concept:tradeoff"
    summary: >-
      something we've decided to live with, and don't intend to close.
  - concept: "concept:open-decision"
    summary: >-
      what's intended isn't settled yet.
  - term: "A draft [capability](capability.md)"
    summary: >-
      a whole result of value not started yet.
  - term: "A bug"
    summary: >-
      the software meant to do something and doesn't, closed by fixing the code, in the issue tracker. A gap needs work nobody has done yet.
  - term: "A task"
    summary: >-
      Docket doesn't say when or how a gap is closed. Planning that is a task tracker's job. [Risk](../../reporting/concepts/risk.md) says what's at stake, not what to do first.
---

## Where gaps and tradeoffs go

Gaps and [tradeoffs](tradeoff.md) live in frontmatter, so readers can count
and group them. Each is recorded in exactly one place: the doc it's about.
Who would notice a gap decides which doc that is:

| Declared on | Gaps | Tradeoffs |
| --- | --- | --- |
| [Capability](capability.md) | What someone using the product would notice | Limits it has by choice |
| [Feature](feature.md) | None: a capability it lacks is a draft capability | Non-goals: capabilities we've decided never to build |
| [Mechanism](mechanism.md) or [component](component.md) | What only someone working on the code would notice | Technical choices |

- **A product gap**, such as the room calendar not being usable from the
  keyboard, is written in the domain's words.
- **A technical gap**, such as nothing testing a correction of a correction
  in the ledger, is written in the code's words, and shows on every
  capability that relies on its mechanism or component. Technical debt is a
  technical gap.
- **Domains, rules, concepts, personas and initiatives have neither.** A
  limit across a whole domain is a [rule](rule.md), or a tradeoff on the
  mechanism that causes it.
- **One gap, not two.** When a gap has a visible effect and a technical
  cause, the effect is the capability's gap, and the technical doc's body
  explains the cause.

## What isn't a gap

A gap is what falls short in the thing itself, never what a level already
says:

- **A missing capability** is a draft capability, not a gap.
- **Relying on a capability at a lower level** isn't a gap, such as referrals
  relying on Partnerships at Alpha: that capability's level already says how
  much can be counted on, so a gap saying so would count it twice.
- **Being behind a flag, opt-in, not yet in production, or still changing**
  is what Prototype and Alpha mean, so none of it is a gap there.
- **A bug usually isn't one.** When the software is meant to do something and
  simply doesn't, fixing the code closes it, so it belongs in the issue
  tracker. A known bug is a gap only when it won't be fixed soon and changes
  what people can rely on.

What a level already says becomes a gap only where the level says otherwise,
such as a Beta capability that still isn't available to the people it
serves.

## What's at stake

A gap says what's at stake with its `impact`, `likelihood` and `reach`.
Every gap rates all three: none of them has a default, and a gap missing
one is `invalid-frontmatter`. All three are rated as if people relied on the
capability, never lowered by its level, since
[risk](../../reporting/concepts/risk.md) weighs them by its level. So they
aren't rated again when the capability is promoted. Readers order gaps by
the risk worked out from them.

All three ratings are judgement, in that software's circumstances, and none
of them needs to be exact. Where in
the code a gap is doesn't change them, so a gap in a background job, a
library or a deploy script is rated the same way as one on a screen.

### Impact

How bad it is for those it reaches, if it bit. It's one of four, from least
to most, each taking more than the one before:

| Impact         | What's lost                   | The test                                                                                                                                                                                                              |
| -------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `negligible`   | Nothing                       | Nothing anyone relies on changes. At most, someone notices it.                                                                                                                                                        |
| `inconvenient` | Time                          | What people rely on still comes out right, but it takes them extra time, a step by hand, or a workaround.                                                                                                            |
| `blocking`     | The outcome                   | Someone, or some group of people, can't get done what they rely on it for, by any route available, until it's closed. They know it, and it waits.                                                                     |
| `damaging`     | Something they can't get back | It leaves something wrong that can't be fully put right, or that someone acts on without knowing, at a cost: data lost or kept wrong, money moved wrongly, legal or financial exposure, someone able to do what they shouldn't. |

Ask these in order, and stop at the first yes:

1. Could it leave something wrong that can't be fully put right, or that
   someone acts on without knowing, at a cost? It's `damaging`.
2. Could it stop someone getting done what they rely on it for, with no way
   around it? It's `blocking`.
3. Does it cost someone time, a step by hand, or a workaround, while what
   they get is still right? It's `inconvenient`.
4. Otherwise, it's `negligible`.

Where the lines fall:

- **A wrong result someone notices and puts right is `inconvenient`**: clerks
  correcting children's city tax by hand. It's `damaging` only once nobody
  catches it, or it can't be taken back.
- **Only people count.** A gap that changes nothing for anyone yet, such as
  records that are never cleaned up, is `negligible`, however untidy it is.
- **It's never lowered for being rare or reaching few.** That's what
  likelihood and reach are for. A calendar that needs a mouse is `blocking`
  for anyone who can't use one, however few they are.
- **When torn between two, pick the lower** unless the higher one's test is
  plainly met. That keeps `damaging` rare, so it means something.
- **A gap that only bites in certain conditions**, such as untested code, is
  rated by what would happen if it bit, and its description says what the
  conditions are.

### Likelihood

How likely it is to bite within the next year:

| Likelihood | The test                                             |
| ---------- | ---------------------------------------------------- |
| `certain`  | It's happening, or it definitely will within a year. |
| `expected` | You'd bet on it happening within a year.             |
| `possible` | It could happen, but you wouldn't bet on it.         |
| `unlikely` | It would surprise you.                               |

A gap that's biting today is `certain`. One that bites only in some
condition, such as untested corrections that matter only when someone changes
them, is rated by how likely that condition is, and its description says what
the condition is. When torn between two, pick the higher.

### Reach

How many of the people the software serves it would reach, if it bit: the
people its capabilities' [personas](persona.md)
stand for, and whoever runs it, builds on it, or depends on what it
produces:

| Reach  | The test                                           |
| ------ | -------------------------------------------------- |
| `all`  | Everyone the software serves.                      |
| `most` | Most of them: it's the usual case.                 |
| `some` | A real share of them, but not the usual case.      |
| `few`  | A small group with a particular need or situation. |

It's who they are and what they do, not a count anyone has to know. So the
same gap can reach differently in different software: a calendar that needs a
mouse reaches `some` of a public booking site's guests, and `few` of an
office tool's staff. When it's unclear, or when torn between two, pick the
higher, and say why in its description.

Two kinds of gap always reach `all`, since one case lands on everyone: legal
or contractual exposure the business really has, such as an accessibility
duty, and someone able to do what they shouldn't, such as seeing another
tenant's data.

## Affects

The docs make claims by being written: declaring a
[level](stability-level.md) claims every outcome the
[stability rubric](rubric.md) expects at it, and following a rule claims
the rule holds. A gap, a tradeoff and an
[open decision](open-decision.md) are the three ways of saying "except
here", and `affects` is how each says which claim, or which other item, it's
about. What it means comes from what's doing the affecting:

| `affects` → | An outcome | A rule | A gap | A tradeoff |
| --- | --- | --- | --- | --- |
| **Gap** | Not met yet | Not held yet | | |
| **Tradeoff** | Not met, by choice | | | |
| **Decision** | Open: neither claimed nor short | | Waits on it | Reopened |

What each means for a tradeoff and a decision is on
[Tradeoff](tradeoff.md) and [Open decision](open-decision.md). For all
three:

- **It's a list of references**: `outcome:<quality>/<level>/<id>`,
  `rule:<id>`, with `@<domain>` for a rule in another domain, or a gap's or
  tradeoff's ID. Any other target, such as a capability, a persona, or a gap
  affecting a gap, is `invalid-frontmatter`: the doc an item is declared on
  is already what it's about, and which gap to close first is for a task
  tracker. A reference to something that doesn't exist is `unknown-id`, or
  `unknown-outcome` for an outcome.
- **It stays on its side.** A product gap, tradeoff or decision affects
  outcomes, rules, and product gaps and tradeoffs. A technical one affects
  outcomes, and technical gaps and tradeoffs. Product docs never link to
  technical docs.
- **The link is held by what's deleted first.** Closing a gap, reversing a
  tradeoff or answering a decision deletes it with its `affects`, and what it
  affected goes back to how it was: an outcome to met, a gap or tradeoff to
  waiting on nothing.

For a gap:

- **Most gaps affect nothing.** They're limits on what the capability does.
- **A gap affecting a claim breaks it** where that claim is made: on each
  capability it shows on whose level expects the outcome, or that follows the
  rule. People may be relying on something that isn't true yet, so it raises
  the gap's [risk](../../reporting/concepts/risk.md) there.
- **A rule written before it's built** is followed with a gap affecting it on
  each capability that doesn't hold to it yet, since following a rule
  otherwise claims it holds. City tax is added for children, so city tax
  doesn't yet hold to "children pay no city tax".
- **A gap about something that must always hold**, where no rule says so,
  means writing the rule and naming it: the rule is what we intend, and the
  gap is the part not done yet. Several gaps can affect one rule, each a part
  of it.

## Lifecycle

Open → Closed

A closed gap is deleted, and git has its history. A gap we decide never to
close is deleted too, and written as a [tradeoff](tradeoff.md), with its
drawback.

## How it's written

Gaps are listed in the `gaps` frontmatter field of the doc they're on. Each
has:

- **`id`**: its key, unique among the gaps and tradeoffs of that doc across
  every project and domain that writes the doc, so its ID means one gap or
  tradeoff. A capability written in two domains can't have a gap with the
  same key in each. A second is a `duplicate-id` problem. The gap's ID is its
  doc's [reference](doc.md#references) plus its key, such as
  `capability:room-booking#calendar-needs-a-mouse`.
- **`name`**: what falls short, in a few words, such as
  `Calendar needs a mouse`.
- **`description`**: a sentence or two.
- **`impact`**, **`likelihood`** and **`reach`**: what's at stake, as above.
- **Optionally**, the outcomes and rules it `affects`.

Room booking's calendar falls short of an outcome Beta expects. It's
`certain`, since it's true today, and reaches `all`, since it's an
accessibility duty the hotel has:

```yaml
gaps:
  - id: calendar-needs-a-mouse
    name: Calendar needs a mouse
    affects:
      - outcome:usability/beta/everyone
    impact: blocking
    likelihood: certain
    reach: all
    description: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
```

On [city tax](../../../../examples/hotel-billing/docket/domains/billing/capabilities/city-tax.md),
a gap affects a rule. It's happening now, and every clerk corrects it:

```yaml
gaps:
  - id: children-corrected-by-hand
    name: City tax charged for children
    affects:
      - rule:children-pay-no-city-tax
    impact: inconvenient
    likelihood: certain
    reach: all
    description: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
```

A technical gap on the
[ledger](../../../../examples/hotel-billing/docket/components/ledger.md)
affects an outcome. It's `expected`, since someone is likely to change how
corrections work within a year, and reaches `few`, since only a
twice-corrected charge is at stake:

```yaml
gaps:
  - id: corrections-of-corrections-untested
    name: Corrections of corrections untested
    affects:
      - outcome:maintainability/ga/others-can-change
    impact: damaging
    likelihood: expected
    reach: few
    description: >-
      Nothing tests correcting a line that is itself a correction, so a change
      to how corrections work in `correct` could stop a twice-corrected charge
      netting to zero without anything failing.
```

Its ID is `component:ledger#corrections-of-corrections-untested`, and the
code it shows in points at it with an [annotation](annotation.md), in place
of a bare TODO:

```ts
// docket:gap component:ledger#corrections-of-corrections-untested
export function correct(bill: Bill, line: Line, id: string, businessDay: string): void {
```
