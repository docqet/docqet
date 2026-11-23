---
id: console
name: Console
description: >-
  The console, where Exalynt's engineers set themselves up, claim and work
  their blocks, offer their time, write estimates, and see what they're paid.
capabilities:
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
gaps:
  - id: setup-reads-on-every-page
    name: Setup bubble rereads on every page
    impact: negligible
    description: >-
      The setup bubble reads again on each page and each time it opens, four
      requests and a call to the payout provider each time, until everything
      on it is done.
  - id: readiness-worked-out-twice
    name: Readiness worked out twice in the browser
    outcome: functionality/beta/stays-correct
    impact: inconvenient
    description: >-
      Who's ready for client work is worked out in the browser, in the
      console's `components/setup/` and again on the admin's engineer page,
      so no acceptance test covers it, and the two can drift apart.
    when: What makes someone ready changes in one place and not the other.
  - id: board-reads-every-block
    name: My blocks reads every block ever
    outcome: efficiency/beta/bounded
    impact: inconvenient
    description: >-
      My blocks reads every block the engineer has ever had, a page at a
      time.
    when: An engineer's blocks grow to many pages.
  - id: conversation-counts-read-on-open
    name: Conversation counts read only on open
    impact: inconvenient
    description: >-
      A block's conversation counts are read when its page opens, and again
      when a conversation window closes, and at no other time.
  - id: team-screens-untested
    name: Teams screens untested in the console
    outcome: functionality/beta/stays-correct
    impact: inconvenient
    description: >-
      Teams is tested end to end only by the API's feature tests. The
      console's own unit tests cover finding the engineer's team.
    when: A change breaks the Teams screens.
  - id: availability-changes-not-atomic
    name: Availability changes across weeks not atomic
    outcome: reliability/ga/holds-up
    impact: inconvenient
    description: >-
      Changing a run of weeks takes several calls, so a failure partway
      leaves some weeks changed and others not. The page says it
      failed and shows what's there.
    when: A call fails partway through changing a run of weeks.
  - id: earnings-unpaged
    name: Earnings loaded whole, unpaged
    outcome: efficiency/beta/bounded
    impact: inconvenient
    description: >-
      Earnings loads the whole list at once, with no pagination, and the API
      works out what's upcoming afresh on every read.
    when: An engineer's earnings grow to a long list.
  - id: earnings-failures-unreported
    name: Earnings load failures not reported
    outcome: observability/alpha/see-errors
    impact: inconvenient
    description: >-
      A failure to load Earnings is shown on the page but not reported to
      telemetry.
    when: Earnings fails to load.
  - id: this-week-from-browser
    name: This week taken from the browser's clock
    impact: inconvenient
    description: >-
      "This week" on My blocks and Availability is the browser's, while the
      API counts weeks from Monday in UTC, so around midnight on a Sunday a
      block can show Ready that can't be started yet, and a change to the
      week ending can be refused.
    when: Around midnight on a Sunday, in a time zone away from UTC.
  - id: estimate-save-unchecked
    name: Last estimate save silently wins
    impact: damaging
    description: >-
      Saving an estimate sends the whole of it, with no check of what changed
      since it was opened, so of two people editing at once the last save
      wins.
    when: Two people edit the same estimate at once.
  - id: estimate-editor-screens-untested
    name: Estimate editor screens untested in the console
    outcome: functionality/beta/stays-correct
    impact: inconvenient
    description: >-
      The estimate editor is tested end to end only by the API's feature
      tests. The console's own tests cover the math and what a save sends.
    when: A change breaks the estimate editor's screens.
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
