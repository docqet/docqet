---
docqet: component
id: console
name: Console
description: >-
  The console, where Exalynt's engineers set themselves up, claim and work
  their blocks, offer their time, write estimates, and see what they're paid.
is: archetype:web-app
serves:
  - capability:getting-set-up
  - capability:claiming-blocks
  - capability:fulfillment
  - capability:conversation-spaces
  - capability:teams
  - capability:availability
  - capability:earnings
  - capability:payouts
  - capability:payout-accounts
  - capability:estimates
  - capability:engineer-agreements
---

The console acts in no organization: its requests name none, so the caller's
platform role applies. Nobody works in it without an Engineer Agreement in
effect, admins who also work as engineers included. Until they've accepted
one, `Layout.tsx` puts the one sent to them in place of every page, or says
none has been sent (`ConsoleGate`). The gate is the app's alone: the API
still answers what someone's role allows without an agreement in effect, and
the admin app isn't gated at all.

Two pages are still on placeholder data from `data/mock.ts`, through
`data/relationships.ts`: the overview (`overview/`) and a client's page
(`clients/`), both topped by a `PrototypeNotice`. Neither is part of a
capability yet. The overview does read the engineer's availability and the
terms of their Engineer Agreement from the API. Everything else reads and
writes the API.

My Schedule (`assignments/`) claims and unclaims straight through the API,
which holds the staffing rules. A refusal is toasted and everything is read
again. The weekly layout is drawn like the portal's Schedule, from
`components/schedule/`.

A block's page (`blocks/`) is at the block's id, not its number, since
numbers repeat across clients; the old `/console/assignments/:id` sends on to
it. Its focus, timeline and conversations come from `src/components/block/`,
shared with the portal's block page. The timeline is Alpha and the
conversations Prototype in `src/featureStability.ts`, each with the level of
its own capability. An update's or focus's images, videos and files are
uploaded to the client's organization and read with the engineer's token
only when their section opens, and anything but a plain image or video is
only ever a download (`objectURLOf`). Until a messaging provider is set up,
conversations are kept by the noop provider and can't be opened.

The payout account page is `src/account/payoutAccount/PayoutAccountPage.tsx`,
the same page the hub mounts for a partnership, here for the engineer's own
account. It's real, through the API, on Stripe Connect.

Estimates' figures are worked out in the browser by `src/estimates/`, from
the sizes it shares with the API (`SIZES`) and the prices each estimate
carries, and unit tests pin them to the API's.
