---
id: payouts
name: Payouts
description: How earnings become money sent, to people and to partnerships.
capabilities: [capability:payouts, capability:partner-payouts]
gaps:
  - id: person-and-admin-lists-not-paged
    name: Payout lists not paged
    outcome: efficiency/beta/bounded
    impact: inconvenient
    description: >-
      A person's and the admin's payout lists aren't paged:
      `GET /users/me/payouts` and `GET /payouts` return everything.
    when: Payouts build up over time.
tradeoffs:
  - id: waiting-worked-out-on-read
    name: Waiting payouts worked out on read, not stored
    impact: inconvenient
    description: >-
      What's waiting is worked out on read, not stored as a run: there's no
      scheduler or draft to keep in step, and a week nobody released rolls
      into the next.
    drawback: Every read asks the provider about each payee's account.
    when: The number of payees grows.
---

**Never sent twice.**

- A payout is saved before the provider is asked to send it, so its ID can be
  the idempotency key. A crash in between would otherwise leave money sent
  with no record of it, so the order stays.
- Only an error that means nothing was sent lets a payout's earnings go. Any
  other error from the provider leaves it Processing with no external ID, and
  the next release sends it again under the same ID. Marking one of those
  Failed would pay someone twice.
- `payout_earnings.active` is what stops an earning being sent twice, through a
  partial unique index. It's false once a payout has failed or been canceled,
  which is what puts the earning back in the next release.
- A webhook can arrive before the release has saved the provider's ID, and
  it's acknowledged and ignored. The next event for that payout puts it right.

**What a payout keeps.** A payout's lines copy the figures they had, and their
foreign keys don't cascade, because what a sent payout lists must survive
changes to blocks, people, and clients.

**Who reaches it.** `payouts` has no row-level security and only the platform
role can reach it. `PayoutService` always acts across organizations.

**Payees.** A payee is a person or a partnership, and the same ID could in
principle be either, so a release groups earnings by payee type and ID, and a
payout listing filters on `payee_type` as well as `payee_id`.

**Shared with partner payouts.** The release, `send`, the payouts tables and
the `Payout` resource are shared with partner payouts, which is Beta, so they
hold to Beta even though the admin and console sides are Alpha: they change
without breaking it, and schema is added with new migrations. A partnership's
payouts are paged (`PagePayee`), but a person's and the admin's list still
load whole through `List`.

**Payouts from before Stripe Connect.** Payouts released on the `noop`
provider before production moved to Stripe Connect are kept, `provider` =
`noop`, Paid with no money moved. That was decided, and they aren't treated as
sent when reconciling with Stripe. Migration 98 cleared the `noop` recipients.
