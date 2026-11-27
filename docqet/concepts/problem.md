---
docqet: concept
id: problem
name: Problem
description: >-
  A pain point one or more personas share, said in their words without naming
  the software: why the software exists. Capabilities say which problems they
  solve.
confused-with:
  - concept: "concept:capability"
    summary: >-
      one result the software produces, part of the answer to a problem. A problem would still be true if the software didn't exist.
  - concept: "concept:gap"
    summary: >-
      something a capability doesn't do yet. A gap is in the software; a problem is in the world.
  - concept: "concept:finding"
    summary: >-
      a mistake in the docs.
---

A guest's room being given to someone else is a problem the front desk clerk
has: "I take bookings at the desk and on the phone, interrupted all the time,
and I can promise a room for a night it's already taken." Room booking and
check-in are capabilities that solve it.

- **It never names the software**, its screens or its capabilities. Ask
  whether it would still be true if the software didn't exist. "Can't book a
  room online" fails: it's a capability with "can't" in front. "Guests are
  turned away when rooms are free" passes.
- **It says the situation and the cost.** Its description is what goes wrong
  today, and when, as the people who have it would say it. Its `cost` is what
  that costs them or the business, so whoever weighs it against other work can
  tell how much it matters.
- **Personas share it only when it's the same pain.** Two personas who hit
  something in different situations, or at different costs, have two
  problems. One problem, named by both, is the same situation for each.
- **[Capabilities](capability.md) say which problems they solve**, with
  `solves`. A problem lists none of them: they're worked out, drafts among
  them, since a draft answers a problem nothing else does yet. One problem
  often needs capabilities in several [features](feature.md), and one
  capability can solve several problems.
- **A capability serves the [personas](persona.md) of the problems it
  solves.** Nobody lists a capability's personas once it solves a problem.
- **A problem nothing solves is a problem the software doesn't answer yet.**
  It's shown, so the work it's waiting on can be weighed.
- **It's one across the product.** People's problems don't follow the parts
  of the business, so a problem is written once, not per area, and projects
  that solve the same problem share its ID. A problem names personas the project defines.
- **It has no stability level.** It has a
  [readiness](readiness.md): how ready people can
  rely on the capabilities that solve it being, with its improvements.

Problems and personas are the problem space, why the software exists, and
everything else is the solution space, as
[problem space and solution space](../areas/authoring.md#problem-space-and-solution-space)
sets out. Links only point toward why: a capability links to its problems,
and a problem never links to the solution.

## How it's written

A problem is a doc whose `docqet` is `problem`. Its frontmatter, in order, is `docqet`, `id`, `name`, `description`, `cost` and
`personas` (required):

- **`name`** is the problem in a few words, the way a rule's name is the rule:
  `A guest's room is given to someone else`.
- **`description`** is the situation, in the words of the people who have it.
- **`cost`**, optional, is what it costs them or the business.
- **`personas`** names the personas who have it, at least one.

Its body, which can be left out, is anything more about the pain, such as
when it happens, how often, and what people do about it today.
[`room-given-to-two-guests.md`](../../examples/hotel-bookings/docqet/problems/room-given-to-two-guests.md):

```markdown
---
docqet: problem
id: room-given-to-two-guests
name: A guest's room is given to someone else
description: >-
  I take bookings at the desk and on the phone, interrupted all the time. To
  tell a guest whether a room is free I have to check every night of their
  stay, and I can promise a room for a night it's already taken. I find out
  when the second guest is standing in front of me.
cost: >-
  Telling a guest at the desk that their room was given away: the worst
  conversation the front desk has.
personas: [persona:front-desk-clerk]
---
```

A capability links it with `solves: [problem:room-given-to-two-guests]`.
