---
name: Availability
summary: >-
  How much of a week each engineer offers, which Capacity adds up per team.
start: >-
  `internal/services/availability.go`,
  `internal/repositories/postgres/availability.go`
capabilities: [availability, scheduling, claiming-blocks, staffing]
code:
  - internal/services/availability.go
  - internal/repositories/postgres/availability.go
gaps:
  - id: not-load-tested
    outcome: efficiency/beta/realistic-volumes
    text: >-
      Availability hasn't been load-tested.
tradeoffs:
  - id: recurrence-rules-not-weeks
    text: >-
      Availability is stored as recurrence rules, not a `weeks` column. A
      column would do, as the rules are only ever `FREQ=WEEKLY` with an
      optional `COUNT`, but moving off them is an expand/contract migration on
      a table Capacity reads, with nothing to gain for now.
    cost: >-
      The database can't filter by the weeks a rule covers, so `from` on the
      overrides list is widened by 51 weeks and checked in Go, and a page can
      come back short.
---

An engineer has rows in `availabilities`, each a weekly RFC 5545 recurrence
rule and not a row per week:

| Kind | Rule | What it is |
| --- | --- | --- |
| `baseline` | `FREQ=WEEKLY` | What they offer each week from `starts_on`. One each, by a partial unique index |
| `override` | `FREQ=WEEKLY;COUNT=n` | Replaces it for n weeks, at most 52. Never two for one week |
| `past_baseline` | `FREQ=WEEKLY;COUNT=n` | What the baseline offered before it last changed. Never shown or changed |

A week resolves to the override covering it, otherwise the baseline or past
baseline covering it, otherwise 0. `AvailabilityService.Weeks` does that for
one engineer and `CapacityService.totalUnits` for many, both through
`applyWeeks`.

**Past weeks** are protected in the service and not just the page. A baseline
already under way that changes leaves a `past_baseline` for its weeks so far,
and its `starts_on` moves up. The seeders and tests' setup write earlier rows
through the repository, which doesn't know about any of this.

**Locking.** Every change first locks the engineer's `users` row
(`AvailabilityRepository.LockUser`), so overlap checks hold. Setting a first
baseline doesn't need it, as the unique index allows only one.

**Taking blocks out.** Every change runs through `AvailabilityService.change`,
which compares the engineer's weeks before and after in the same transaction
and has `CapacityService.fitEngineerWeeks` (`room_fitting.go`) take blocks out
of the ones that went down. A dry run makes the change and rolls it back.
Scheduling and claiming read availability without the engineer's lock; the
week locks fitting takes serialize them.

**A run of weeks at once.** `POST /availability/{id}/changes` sets a run of
weeks in one transaction, replacing the overrides that cover them. The console
used to do that with several calls, which passed through weeks briefly back at
the baseline: with blocks taken out on every reduction, that would take out
blocks the final state still fits.

**Who reaches it.** `availabilities` is shared and holds no client's data, so
row-level security doesn't apply. `api_organization` can only read it, for
Capacity's room, and clients see only totals. `availability:manage` only ever
reaches the caller's own: an admin can set their own and not an engineer's.

`GET /v1/users/{id}/availability` isn't paged. Its window is capped at 53
weeks, which acts as its page size.
