---
docqet: concept
id: persona
name: Persona
description: >-
  A type of person the software serves, written as one invented person so it's
  easy to picture: Maria, front desk clerk, "runs the front desk: takes bookings,
  and checks guests in and out".
confused-with:
  - term: "A role or permission"
    summary: >-
      what someone may do in the software. A persona has a role, but is who they are and what they need.
  - concept: "concept:problem"
    summary: >-
      a pain point personas share. A persona is who has it.
---

A persona says who they are, what they know, the context they work in, what
they expect, and what they care about. What they need is in the
[problems](problem.md) they have, each its own doc, so more than one persona
can share it and capabilities can link to it.

- **[Problems](problem.md) name the personas who have them**, and a
  [capability](capability.md) serves the personas of the problems it solves.
  Arriving guests waiting for a room that isn't ready is a problem for the
  clerk at the desk and the housekeeper on the floor, so room status, which
  solves it, serves both.
- **What it relates to is worked out from links to it**: its problems, the
  capabilities solving them, the features they're in, the areas those are
  in, the [initiatives](initiative.md) whose work is for them, and the gaps
  and open decisions on those capabilities. Nobody lists them on the
  persona, and technical gaps aren't shown for them.
- **It's one across the product.** People work across the parts of the
  business, so a persona is written once, not per area, and projects that
  serve the same people share its ID.
- **It has a role and a title, but isn't a role.** The persona itself says who
  someone is and what they need, not what they're allowed to do.
- **It has no stability level.** It has a
  [readiness](readiness.md): how ready they can rely
  on what they need being, with its improvements.

## How it's written

A persona is a doc whose `docqet` is `persona`. Its frontmatter, in order, is
`docqet`, `id`, `name`, `description`, `role`, `title` and `image`:

- **`name`** is the invented person's name, such as `Maria`, and
  **`description`** a sentence on who they are.
- **`role`** is how they use the software: the role it gives them, as it
  relates to what they may do, or the part they play in it, such as
  `Front desk` or `Client Admin`.
- **`title`** is the job title they hold, such as `Front desk clerk` or
  `Controller`.
- **Either `role` or `title` can be left out**, or `null`, when there's none:
  a hotel guest has no title.
- **`image`**, optional, is the URL of their picture. Any image a browser can
  show works. The examples use randomuser.me's free placeholder portraits.
  Readers show their initials without one.

Its body, which can be left out, is where to say more about who they are, such
as their knowledge of the business and technical skill, their device and how often and
under what pressure they do the work, the words and tools they already know,
and what makes them trust the software or give up on it. What they need goes
in their problems, not here. The examples use headings of their own for
these; nothing reads them.
[`front-desk-clerk.md`](../../examples/hotel-bookings/docqet/personas/front-desk-clerk.md):

```markdown
---
docqet: persona
id: front-desk-clerk
name: Maria
description: Runs the front desk: takes bookings, and checks guests in and out.
role: Front desk
title: Front desk clerk
image: https://randomuser.me/api/portraits/women/68.jpg
---

## Needs

- To tell a guest at once whether a room is free for their dates, and hold it
  for them, without ever giving the same room to two guests.
- To check guests in and out quickly, so nobody waits at the desk.

## Knows

Every room in the hotel, the regulars, and the cancellation policy by heart.

## Context

At the desk all shift, on a shared desktop, with a guest or the phone waiting
most of the time.
```

A problem names them with `personas: [persona:front-desk-clerk]`, and so
does an initiative whose work is for them.
