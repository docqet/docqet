# Stability checklist

What each [stability level](stability-level.md) generally means and expects,
so the people depending on a capability and the people building it share the
same picture of its level.

## Details

It's grouped by quality, such as usability, reliability and security, each a
question someone asks before depending on the work. Each level of each
quality has the outcomes it expects, such as "a bad release can be undone" at
Beta, with examples of how meeting one might look for different kinds of
software, and examples of what may be overengineering at that level.

It's a guideline, not a gate. It doesn't replace engineering judgment, and it
applies differently to every project: an outcome that applies is usually met,
not applicable, a known [gap](gap.md), or a [tradeoff](tradeoff.md). It's the same for every
project, whatever kind of software it is.

Each outcome a capability's level expects is one of:

- **Not met**: a gap names it, on the capability or on a mechanism or component
  it relies on.
- **Not met, by choice**: a [tradeoff](tradeoff.md) there names it instead.
  We chose not to meet it, and the tradeoff says why. Ledger's balance, worked
  out every time it's asked for, falls short of "the work it does is bounded"
  on purpose.
- **Met, with evidence**: a [mechanism](mechanism.md) or [component](component.md)
  it relies on says it meets it, and that mechanism's [evidence](evidence.md) is
  the proof. Hotel Bookings' deployment meets "a bad release can be undone" for
  every capability it lists.
- **Met, on trust**: nothing names it. Declaring a level claims what it
  expects, except the gaps and tradeoffs written down.

A draft claims none of it.

## In the spec

The checklist is part of the spec, in
[`checklist.yml`](../../../spec/stability/checklist.yml), so no project copies
or changes it. An outcome, under its quality and level, shortened:

```yaml
  - id: reliability
    name: Reliability
    question: Does it keep working when something goes wrong?
    levels:
      beta:
        outcomes:
          - id: undo-release
            text: A bad release can be undone.
            implementation:
              - text: A rollback to the previous release.
                kinds: [web-app, http-api, background-job]
```

Its full ID is `reliability/beta/undo-release`. A mechanism that meets it lists
it, as Hotel Bookings'
[deployment](../../../spec/examples/hotel-bookings/docket/mechanisms/deployment.md)
does:

```yaml
meets:
  - reliability/beta/undo-release
  - observability/alpha/see-errors
```

A gap that falls short of one names it, as
`outcome: usability/beta/everyone` on room booking.

## Not to be confused with

- A gate or a test: nothing fails when an outcome isn't met. It's a shared
  picture of what a level means, for people to judge by.
