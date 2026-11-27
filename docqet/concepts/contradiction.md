---
docqet: concept
id: contradiction
name: Contradiction
description: >-
  Two contributions that should agree and don't, such as two
  [projects](project.md) describing check-out differently, or putting the
  same feature in different areas. Docqet shows a contradiction as a
  [finding](finding.md), naming the projects involved, instead of choosing one.
confused-with:
  - concept: "concept:finding"
    summary: >-
      anything wrong in the docs. A contradiction is one kind, found only when projects are put together.
---

Duplicates will happen as several projects describe one product. Visible, they
can be fixed.

What should agree, so that a difference is a contradiction:

- **Any doc's name or description**, in every project that declares it, a
  persona's role or title, a problem's cost, a constraint's source, and a
  rule's body, since that's the rule in full. What else each contribution
  says is its own: its body, and its frontmatter fields that aren't links,
  such as `decisions` or a rule's `why`. Those are shown side by side,
  labelled with their project.
- **Which area a feature is in.**
- **Which feature a capability is in.** A capability in two features is an
  `in-two-features` finding, whichever projects name them.

What isn't a contradiction:

- **A feature with capabilities from several projects.** Work crosses
  projects, and each project contributes its part.
- **A capability's levels.** Each project that builds it says how far along
  its part is.
- **The same word meaning different things in different parts of the
  business**, when they're two [concepts](concept.md) with different IDs.
  The same ID is one concept, so two projects defining it differently is a
  contradiction.

## How it's written

Hotel Bookings writes check-out:

```yaml
name: Check-out
description: >-
  Clerks check guests out on their departure day and take payment for anything
  still owed.
```

Hotel Billing writes it with a description of its own:

```yaml
name: Check-out
description: >-
  Guests settle their bill as they leave, so nothing is left owing once
  they've gone.
```

Each project's [state](state.md) only knows its own contribution, so the
contradiction appears when they're combined, as a finding naming both:

```json
{
  "type": "contradiction",
  "subject": "capability:check-out",
  "capabilities": ["capability:check-out"],
  "message": "Hotel Bookings and Hotel Billing describe Check-out differently."
}
```

Both put check-out in Front desk, so that part agrees: Front desk is one
feature, with capabilities from both projects. Check-out is GA in Hotel
Bookings and Alpha in Hotel Billing, each project's own and no
contradiction, so it's Alpha in short.
