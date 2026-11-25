# Contradiction

Two contributions that should agree and don't, such as two
[projects](project.md) describing check-out differently, or listing the same
capability under different features. Docket shows a contradiction as a
[problem](problem.md), naming the projects involved, instead of choosing one.

## Details

Duplicates will happen as several projects describe one product. Visible, they
can be fixed.

What should agree:

- **A domain's, feature's, capability's, persona's, initiative's, mechanism's
  or component's name and description**, in every project that declares it. What else each
  contribution says is its own: its body, and its frontmatter fields that
  aren't links, such as `decisions` or a rule's
  `why`. Those are shown side by side, labelled with their project and
  domain.
- **Which feature a capability is in.**
- **A rule or concept within one domain**, when more than one project
  declares it there.

What isn't a contradiction:

- **A feature or capability in several domains.** Work crosses domains, and
  each domain contributes its part.
- **A capability's levels.** Each domain that builds it says how far along its
  part is.
- **The same word meaning different things in different domains.** That's
  what [domains](domain.md) are for.

## In the spec

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

Each project's [state](state.md) only knows its own contribution, so the
contradiction appears when they're combined, as a problem naming both:

```json
{
  "type": "contradiction",
  "subject": "capability:check-out",
  "capabilities": ["capability:check-out"],
  "message": "Hotel Bookings and Hotel Billing describe Check-out differently."
}
```

Both put check-out in Front desk, so that part agrees, and its two levels, GA
in Guest stays and Alpha in Billing, are each domain's own and no
contradiction.

## Not to be confused with

- [Problem](problem.md): anything wrong in the docs. A contradiction is one
  kind, found only when projects are put together.
