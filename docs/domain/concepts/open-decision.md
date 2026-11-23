# Open decision

A question about what's intended that hasn't been settled, recorded so it
isn't lost or quietly decided in code.

## Details

It sits where its answer will go:

| On | When its answer becomes | Example |
| --- | --- | --- |
| [Domain](domain.md) | A rule or concept | Does an early arrival's stay start that day? |
| [Feature](feature.md) | A capability, or a tradeoff ruling one out | Should Reservations hold parking spaces as well as rooms? |
| [Capability](capability.md) | A change to what it does | Who goes first on the waitlist? |
| [System](system.md) or [component](component.md) | A tradeoff | Do releases switch over all at once, or one server at a time? |

A [rule](rule.md) never holds one: a rule is decided once its doc exists.
Something the business hasn't committed to yet is an open decision, not a
rule.

Open decisions on a capability show on every persona it serves, and on its
feature and domain, but they're declared once.

## Lifecycle

Open → Settled

Once it's settled, it's removed, and its answer is written where it belongs:
a rule, a concept, a capability, a change to what a capability does, or a
tradeoff.

## In the spec

An open decision is a list item under an `## Open decisions` section in the
body of the doc it's on, a short label in bold, then the question. On the
[Guest stays domain](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/domain.md):

```markdown
## Open decisions

- **Early arrivals:** when a guest arrives before the room's usual check-in
  time, does their stay start that day, or is the night before part of it?
```

On the [waitlist](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/waitlist.md),
a draft capability:

```markdown
## Open decisions

- **Who goes first:** whoever asked first, or whoever's stay fits the free
  nights best?
```

It's prose for people, so it has no frontmatter. Readers find it by its
heading.

## Not to be confused with

- [Gap](gap.md): what's intended is settled, and the software doesn't do it
  yet.
- [Rule](rule.md): a decision already made.
