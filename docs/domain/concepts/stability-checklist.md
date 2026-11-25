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

- **Not met**: a gap affects it, on the capability or on a mechanism or
  component it relies on.
- **Not met, by choice**: a [tradeoff](tradeoff.md) there affects it instead.
  We chose not to meet it, and the tradeoff says why. Ledger's balance, worked
  out every time it's asked for, falls short of "the work it does is bounded"
  on purpose.
- **Open**: an [open decision](open-decision.md) there affects it: whether to
  meet it, or whether it applies, isn't settled, so it's neither claimed nor
  short. Hotel Bookings' deployment asks whether restoring the night before's
  database is enough to undo a schema change, which leaves "recovering from a
  bad release or a loss of data is known to work" open for check-out, at GA.
  A gap there affects it too, and wins, so it shows as not met, with the
  question beside it.
- **Met, with evidence**: a [mechanism](mechanism.md) or [component](component.md)
  it relies on says it meets it, and that mechanism's [evidence](evidence.md) is
  the proof. Hotel Bookings' deployment meets "a bad release can be undone" for
  every capability it lists.
- **Met, on trust**: nothing affects it. Declaring a level claims what it
  expects, except the gaps, tradeoffs and decisions written down.

A gap wins over a tradeoff, a tradeoff over a decision, and all three over
evidence.

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

It's referred to as `outcome:reliability/beta/undo-release`: its quality,
level and own ID. The level is part of it, so if the checklist moves an
outcome to another level, every doc naming it shows a problem until someone
looks at it again, since what it claims has changed. A mechanism that meets it lists
it, as Hotel Bookings'
[deployment](../../../examples/hotel-bookings/docket/mechanisms/deployment.md)
does:

```yaml
meets:
  - outcome:reliability/beta/undo-release
  - outcome:observability/alpha/see-errors
```

A gap that falls short of one affects it, as room booking's calendar that
needs a mouse does:

```yaml
affects:
  - outcome:usability/beta/everyone
```

## Not to be confused with

- A gate or a test: nothing fails when an outcome isn't met. It's a shared
  picture of what a level means, for people to judge by.
