---
docqet: concept
id: persona
domain: authoring
name: Persona
description: >-
  A type of person the software serves, written as one invented person so it's
  easy to picture: Maria, front desk clerk, "runs the front desk: takes bookings,
  and checks guests in and out".
confused-with:
  - term: "A role or permission"
    summary: >-
      what someone may do in the software. A persona has a role, but is who they are and what they need.
---

A persona says who they are, what they need the software to do for them, what
they know, the context they work in, what they expect, and what they care
about.

- **[Capabilities](capability.md) link to the personas they serve**: whoever
  does it, or whoever it's done for when the software does it on its own. Room
  status serves the housekeeper who marks rooms clean and the clerk who sees
  which are ready. Night audit runs by itself, and serves the night auditor and
  the manager.
- **What it relates to is worked out from those links**: its capabilities, the
  features they're in, the domains those are in, and the gaps and open
  decisions on those capabilities. Nobody lists them on the persona, and
  technical gaps aren't shown for them.
- **It's one across every domain.** People work across the parts of the
  business, so a persona is written once for the whole project, not in a
  domain, and projects that serve the same people share its ID.
- **It has a role and a title, but isn't a role.** The persona itself says who
  someone is and what they need, not what they're allowed to do.
- **It has no stability level.** It has a
  [readiness](../../reporting/concepts/readiness.md): how ready they can rely
  on what they need being, with its improvements.

## How it's written

A persona is a doc whose `docqet` is `persona`, outside any domain. Its
frontmatter, in order, is `docqet`, `id`, `name`, `description`, `role`,
`title`, `image` and `initiatives`:

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
- **`initiatives`**, optional, lists the [initiatives](initiative.md) whose
  work is for them, so showing one initiative shows only its people.

Its body, which can be left out, is where to say more about who they are, such
as what they need the software to do for them and why it matters to them,
their domain knowledge and technical skill, their device and how often and
under what pressure they do the work, the words and tools they already know,
and what makes them trust the software or give up on it. The examples use
headings of their own for these; nothing reads them.
[`front-desk-clerk.md`](../../../../examples/hotel-bookings/docqet/personas/front-desk-clerk.md):

```markdown
---
docqet: persona
id: front-desk-clerk
name: Maria
description: Runs the front desk: takes bookings, and checks guests in and out.
role: Front desk
title: Front desk clerk
image: https://randomuser.me/api/portraits/women/68.jpg
initiatives: [initiative:busy-season]
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

A capability links them with `personas: [persona:front-desk-clerk]`.
