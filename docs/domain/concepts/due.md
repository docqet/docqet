# Due

When a [gap](gap.md) has to be closed, worked out from its `until` and the
levels of the capabilities it's about. Nobody writes it down.

## Details

| Due | When |
| --- | --- |
| **Due now** | The capability is already at the level the gap was to close by, so its level expects it closed |
| **Before the next level** | It has to close before the capability's next promotion |
| **Later** | Before a level further on |
| **When something happens** | Its `until` is an event |
| **Not decided** | Nobody has decided when |

- **A product gap is about its capability**, at the capability's level in the
  gap's domain.
- **A technical gap is about the capability its `until` names**, or else every
  capability its system or component serves, and takes the most pressing. Each
  is at the level of the part its own project builds, since that's the part
  it serves.
- **A draft has no level**, so nothing on it is due.

It isn't in a project's [state](state.md), since the levels it depends on can
come from another project. Readers work it out when they show it.

## In the spec

Nothing is written for it: it comes from each gap's `until`. In the examples:

| Gap | `until` | The capability's level | Due |
| --- | --- | --- | --- |
| Room booking's calendar needs a mouse | `ga` | Room booking is Beta | Before the next level |
| Cancellations' late fee isn't charged | `beta` | Cancellations is Alpha | Before the next level |
| The ledger's corrections of corrections are untested | `extra-charges@ga` | Extra charges is GA | Due now |
| Deployment's migrations only go forward | `ga` | Check-out is GA in Hotel Bookings | Due now |
| Invoices send no payment reminders | `not-decided` | | Not decided |

Check-out is Alpha in Hotel Billing, so its level in short is Alpha. The
deployment gap is still due, since deployment is Hotel Bookings', and serves
Hotel Bookings' part of check-out, which is GA.

## Not to be confused with

- A deadline: Docket has no dates, owners or estimates. Planning the work is
  a task tracker's job. Due only says whether a capability's level already
  expects the gap closed.
