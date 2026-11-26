---
docket: concept
id: contradiction
domain: reporting
name: Contradiction
description: >-
  Two contributions that should agree and don't, such as two
  [projects](../../authoring/concepts/project.md) describing check-out differently, or listing the same
  capability under different features. Docket shows a contradiction as a
  [problem](../../authoring/concepts/problem.md), naming the projects involved, instead of choosing one.
confused-with:
  - concept: "concept:problem@authoring"
    summary: >-
      anything wrong in the docs. A contradiction is one kind, found only when projects are put together.
---

Duplicates will happen as several projects describe one product. Visible, they
can be fixed.

What should agree, so that a difference is a contradiction:

- **A domain's, feature's, capability's, persona's, initiative's, mechanism's
  or component's name or description**, in every project that declares it,
  or a persona's role or title. What else each contribution says is its own:
  its body, and its frontmatter fields that aren't links, such as
  `decisions` or a rule's `why`. Those are shown side by side, labelled with
  their project and domain.
- **Which feature a capability is in.** A capability in two features is a
  contradiction, whichever projects list them.
- **A rule or concept within one domain**, when more than one project
  declares it there.

What isn't a contradiction:

- **A feature or capability in several domains.** Work crosses domains, and
  each domain contributes its part.
- **A capability's levels.** Each domain that builds it says how far along its
  part is.
- **The same word meaning different things in different domains.** That's
  what [domains](../../authoring/concepts/domain.md) are for.

## How it's written

Hotel Bookings writes check-out in Guest stays:

```yaml
name: Check-out
description: >-
  Clerks check guests out on their departure day and take payment for anything
  still owed.
```

Hotel Billing writes it in Billing, with a description of its own:

```yaml
name: Check-out
description: >-
  Guests settle their bill as they leave, so nothing is left owing once
  they've gone.
```

Each project's [state](../../authoring/concepts/state.md) only knows its own contribution, so the
contradiction appears when they're combined, as a problem naming both:

```json
{
  "type": "contradiction",
  "subject": "capability:check-out",
  "capabilities": ["capability:check-out"],
  "message": "Hotel Bookings and Hotel Billing describe Check-out differently."
}
```

Both put check-out in Front desk, so that part agrees: Front desk is one
feature in two domains, Guest stays and Billing, with check-out in both.
Check-out is GA in Guest stays and Alpha in Billing, each domain's own and no
contradiction, so it's Alpha in short.
