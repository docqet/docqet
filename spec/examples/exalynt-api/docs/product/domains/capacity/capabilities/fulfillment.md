---
name: Fulfillment
description: >-
  A block's engineer starts it once its week begins, and marks it fulfilled
  when the work is done, with nobody reviewing it.
stability: alpha
personas:
  - exalynt-engineer-1
  - exalynt-engineer-2
  - exalynt-team-lead
  - exalynt-admin
  - client-admin-founder
  - client-admin-operations
  - client-member
rules:
  - fulfillment/engineers-start-their-blocks-from-the-start-of-the-week
  - fulfillment/engineers-mark-their-blocks-fulfilled
  - fulfillment/started-before-fulfilled
  - fulfillment/fulfilled-is-final
  - fulfillment/clients-follow-a-blocks-status
  - fulfillment/a-focus-is-its-own-record
  - fulfillment/who-changes-a-focus
  - fulfillment/focus-attachments-are-the-clients
  - fulfillment/no-fulfillment-deadline
  - fulfillment/engineers-post-updates-on-their-blocks
  - fulfillment/only-its-writer-changes-an-update
  - fulfillment/clients-read-a-blocks-updates
  - fulfillment/starting-a-block-records-who-and-when
  - earnings-and-payouts/shares-earned-at-fulfillment
  - earnings-and-payouts/payout-basis-per-capacity-unit
  - earnings-and-payouts/engineer-earns-the-engineer-share
  - earnings-and-payouts/team-leads-earn-team-lead-share
  - earnings-and-payouts/available-teammates-earn-team-support-share
  - earnings-and-payouts/unlisted-shares-earn-nothing
  - earnings-and-payouts/shares-dont-reduce-each-other
  - earnings-and-payouts/partnership-share-earned-at-fulfillment
  - earnings-and-payouts/partnerships-earn-under-their-agreement-in-effect
  - earnings-and-payouts/coupons-never-change-shares
  - earnings-and-payouts/unclaimed-shares-stay-with-exalynt
  - earnings-and-payouts/when-basis-and-percentages-are-fixed
  - earnings-and-payouts/each-share-rounds-on-its-own
  - earnings-and-payouts/refunds-after-fulfillment-change-nothing
  - earnings-and-payouts/reassignment-before-fulfillment-earns-nothing
  - earnings-and-payouts/when-team-support-earners-are-fixed
  - earnings-and-payouts/when-the-team-lead-beneficiary-is-fixed
  - earnings-and-payouts/no-lead-means-no-lead-share
  - earnings-and-payouts/one-team-lead-share-per-block
  - earnings-and-payouts/invalid-payout-account-delays-lead-share
  - earnings-and-payouts/partner-status-leaves-engineers-unchanged
  - earnings-and-payouts/earnings-belong-to-the-partnership
  - earnings-and-payouts/partnership-terms-set-at-invitation
  - earnings-and-payouts/partnership-share-of-payout-basis
  - earnings-and-payouts/engineering-capacity-is-the-only-basis
  - earnings-and-payouts/earning-window-opens-at-first-purchase
  - earnings-and-payouts/earning-windows-never-reset-or-pause
  - earnings-and-payouts/unfulfilled-capacity-earns-partnerships-nothing
  - earnings-and-payouts/attribution-at-purchase-decides-the-partnership
  - earnings-and-payouts/partnerships-earn-without-a-payout-account
  - earnings-and-payouts/manager-controls-the-partnerships-payout-account
  - earnings-and-payouts/exalynt-bears-partnership-earnings
  - earnings-and-payouts/partners-see-only-their-partnerships-earnings
concepts: [capacity-block, fulfilled, focus, payout-share]
gaps:
  - id: no-start-or-fulfill-notifications
    impact: inconvenient
    summary: Nobody is told when a block is started or fulfilled.
  - id: no-review
    impact: damaging
    summary: No one checks the work before a block is fulfilled.
    when: A block is marked fulfilled before its work is done.
  - id: departed-engineers-blocks-stuck
    impact: blocking
    summary: >-
      Only a block's own engineer can mark it fulfilled, so a block whose
      engineer has left can't be fulfilled by anyone else.
    when: A block's engineer leaves before marking it fulfilled.
  - id: my-blocks-only-grows
    impact: inconvenient
    summary: >-
      My blocks shows every block an engineer has ever had, so its fulfilled
      column only grows.
    when: An engineer fulfills more and more blocks.
  - id: browser-week-not-utc
    impact: inconvenient
    summary: >-
      "This week" on My blocks is the browser's own week, while a block's week
      starts on Monday UTC, so around midnight a block can show as ready when
      starting it is refused, or not yet ready when it can be started.
    when: Someone away from UTC looks at My blocks around the turn of the week.
  - id: block-history-not-recorded
    impact: inconvenient
    summary: >-
      A block's page shows only when it was started and fulfilled. Its
      scheduling, rescheduling, claims and unclaims aren't recorded, so they
      don't show.
  - id: early-starts-not-shown
    impact: negligible
    summary: A block started before starts were recorded shows no start.
  - id: starter-not-named
    impact: negligible
    summary: >-
      A block started by a lead or an admin shows as started by Exalynt, not
      by name.
  - id: no-focus-notifications
    impact: inconvenient
    summary: >-
      Nobody is told when a block's focus is added or changed, by Exalynt or
      by the client.
  - id: no-update-notifications
    impact: inconvenient
    summary: >-
      Nobody is told when an update is posted, and a block's page shows
      someone else's new updates only when it's opened again.
  - id: svg-images-blank
    impact: inconvenient
    summary: >-
      An SVG attached to an update or a focus as an image shows blank, though
      it still downloads.
    when: Someone attaches an SVG as an image.
  - id: no-focus-only-updates
    impact: inconvenient
    summary: An update about a focus alone, with no block, can't be posted yet.
  - id: unused-focus-not-editable
    impact: inconvenient
    summary: >-
      A focus taken off every block can't be edited any more, though it can
      still be found and put back on a block.
    when: A focus is taken off every block.
  - id: focus-search-titles-only
    impact: inconvenient
    summary: Searching a client's focuses matches their titles only.
  - id: updates-per-block-only
    impact: inconvenient
    summary: >-
      A block's page shows only that block's updates, not those posted on
      other blocks with the same focus.
tradeoffs:
  - id: fulfilled-cant-be-reopened
    outcome: usability/beta/recover
    impact: damaging
    summary: Marking a block fulfilled is final.
    drawback: >-
      A fulfilled block can't be reopened, even when it was marked fulfilled
      by mistake.
    when: A block is marked fulfilled by mistake.
---

## Includes

- Engineers see their blocks on My blocks by where each stands: scheduled, ready
  (its week has started and it isn't started yet), in progress, and fulfilled.
- Engineers open a block they're on and see its client, type, week, focus, size,
  and what it earns them, with its next step.
- Engineers add a focus to a block they're on, saying what its work is about: a
  title, a description, and the client's images, videos (each with a caption if
  they like), and files. Or they search the client's focuses and choose one
  already written, such as one carried over from last week's block.
- Engineers edit a block's focus, which changes it on every block it's on,
  change the block to a different focus, new or existing, or take it off the
  block.
- Engineers post updates on a block they're on as they work: text, metrics
  (before and after), the client's images, videos and files, and links to things
  elsewhere, such as a pull request.
- Engineers edit or delete their updates.
- Engineers see when a block they're on was started and fulfilled, and who
  started it.
- Team leads start their team's engineers' blocks.
- Team leads add, choose, edit, change, or take off the focus of their team's
  engineers' blocks.
- Team leads post, edit, and delete updates on their team's engineers' blocks.
- Admins start any block.
- Admins add, choose, edit, change, or take off the focus of any block.
- Admins post, edit, and delete updates on any block.
- Clients follow each block's status: in progress once it's started, then
  fulfilled.
- Clients open a block on its own page in the portal and read its focus, with
  its images, videos and files, and its updates, beside when it was started and
  fulfilled. That page is a prototype.
- On that page, clients add a focus to any of their blocks, whether or not an
  engineer is on it yet: a title, a description, and images, videos (each with a
  caption if they like), and files they upload. Or they search their focuses and
  choose one already written.
- Clients edit a block's focus, which changes it on every block it's on, change
  the block to a different focus, new or existing, or take it off the block.
