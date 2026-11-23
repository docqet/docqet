# Persona

A type of person the software serves, written as one invented person so it's
easy to picture: Maria, front desk clerk, "runs the front desk: takes bookings,
and checks guests in and out".

## Details

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
  business, so a persona is written for the whole project, not in a domain,
  and projects that serve the same people share its ID.
- **It isn't a role or a permission.** It says who someone is and what they
  need, not what they're allowed to do.
- **It has no stability level or maturity.** It has a
  [readiness](readiness.md): how ready the software is for them, worked out
  from the maturity of what they need.

## In the spec

A persona is a doc in `docs/product/personas/`, outside any domain, with a
picture. [`front-desk-clerk.md`](../../../spec/examples/hotel-bookings/docs/product/personas/front-desk-clerk.md),
shortened:

```markdown
---
image: https://randomuser.me/api/portraits/women/68.jpg
---

# Maria, front desk clerk

Runs the front desk: takes bookings, and checks guests in and out.

## Needs

- To tell a guest at once whether a room is free for their dates, and hold it
  for them, without ever giving the same room to two guests.

## Knows

Every room in the hotel, the regulars, and the cancellation policy by heart.

## Context

At the desk all shift, on a shared desktop, with a guest or the phone waiting
most of the time.

## Expects

The paper diary's view of the hotel: rooms down the side, nights across the
top.

## Cares about

Never having to tell a guest standing in front of them that their room was
given away.
```

A capability links them with `personas: [front-desk-clerk]`.

## Not to be confused with

- A role or permission: what someone may do in the software. A persona is who
  they are and what they need.
