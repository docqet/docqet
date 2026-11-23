# Stability level

How much people can depend on a [capability](capability.md) right now. It's
declared by the people building it, and only changes when someone decides to
promote or demote it.

## Details

| Level     | How stable | In short                                                                       |
| --------- | ---------- | ------------------------------------------------------------------------------ |
| Prototype | Exploring  | Explores an idea. May change completely or be thrown away.                     |
| Alpha     | Developing | Works, but still taking shape. Frequent breaking changes and bugs.             |
| Beta      | Refining   | Settled enough for real use. Occasional breaking changes, usually announced.   |
| GA        | Stable     | Keeps working as it does today. Breaking changes are rare and come with time.  |

A capability declared but not started yet is a **draft**. It has no level, so
it promises nothing, claims nothing on the
[checklist](stability-checklist.md), and counts toward no
[maturity](maturity.md) or [readiness](readiness.md). It shows as Draft, with
no level's mark.

- **Beta is the bar for real use.** A capability at Beta or GA, with no
  gap that's unacceptable on it, is [ready](readiness.md).
- **Only capabilities have one.** Features, domains and projects have a
  maturity and a readiness instead, and personas a readiness.
- **A capability has one in each domain that builds part of it.** Where they
  differ, its level in short is the lowest, since that's what you can count on
  everywhere.
- **A level is about dependability, not quality.** A prototype that answers its
  question quickly is good work.
- **Stability isn't perfection.** A GA capability can still have bugs and known
  gaps.

## Lifecycle

Draft → Prototype → Alpha → Beta → GA

A draft becomes a Prototype when work starts on it. Every other move is a
promotion or demotion someone decides on, never something Docket works out.

## In the spec

`stability` in a capability's frontmatter, as `draft`, `prototype`, `alpha`,
`beta` or `ga`, which readers show as Draft, Prototype, Alpha, Beta and GA:

```yaml
stability: beta
```

A capability that spans domains declares its level in each. Hotel Bookings'
[check-out](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/check-out.md),
in Guest stays, says `stability: ga`, and Hotel Billing's
[check-out](../../../spec/examples/hotel-billing/docs/product/domains/billing/capabilities/check-out.md),
in Billing, says `stability: alpha`, so check-out is Alpha in short.

## Not to be confused with

- [Maturity](maturity.md): how far along a whole feature, domain or project
  is, worked out from its capabilities' levels.
- [Readiness](readiness.md): whether a capability, or everything a feature,
  domain, project or persona counts, is ready to use, worked out from levels
  and gaps.
- How good the work is: a level says how much people can depend on it.
