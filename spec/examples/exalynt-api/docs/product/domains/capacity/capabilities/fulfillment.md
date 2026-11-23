---
id: fulfillment
name: Fulfillment
description: >-
  A block's engineer starts it once its week begins, and marks it fulfilled
  when the work is done, with nobody reviewing it.
stability: alpha
personas:
  - persona:exalynt-engineer-1
  - persona:exalynt-engineer-2
  - persona:exalynt-team-lead
  - persona:exalynt-admin
  - persona:client-admin-founder
  - persona:client-admin-operations
  - persona:client-member
rules:
  - rule:engineers-start-their-blocks-from-the-start-of-the-week
  - rule:engineers-mark-their-blocks-fulfilled
  - rule:started-before-fulfilled
  - rule:fulfilled-is-final
  - rule:clients-follow-a-blocks-status
  - rule:a-focus-is-its-own-record
  - rule:who-changes-a-focus
  - rule:focus-attachments-are-the-clients
  - rule:no-fulfillment-deadline
  - rule:engineers-post-updates-on-their-blocks
  - rule:only-its-writer-changes-an-update
  - rule:clients-read-a-blocks-updates
  - rule:starting-a-block-records-who-and-when
  - rule:shares-earned-at-fulfillment@pay
  - rule:payout-basis-per-capacity-unit@pay
  - rule:engineer-earns-the-engineer-share@pay
  - rule:team-leads-earn-team-lead-share@pay
  - rule:available-teammates-earn-team-support-share@pay
  - rule:unlisted-shares-earn-nothing@pay
  - rule:shares-dont-reduce-each-other@pay
  - rule:partnership-share-earned-at-fulfillment@pay
  - rule:partnerships-earn-under-their-agreement-in-effect@pay
  - rule:coupons-never-change-shares@pay
  - rule:unclaimed-shares-stay-with-exalynt@pay
  - rule:when-basis-and-percentages-are-fixed@pay
  - rule:each-share-rounds-on-its-own@pay
  - rule:refunds-after-fulfillment-change-nothing@pay
  - rule:reassignment-before-fulfillment-earns-nothing@pay
  - rule:when-team-support-earners-are-fixed@pay
  - rule:when-the-team-lead-beneficiary-is-fixed@pay
  - rule:no-lead-means-no-lead-share@pay
  - rule:one-team-lead-share-per-block@pay
  - rule:invalid-payout-account-delays-lead-share@pay
  - rule:partner-status-leaves-engineers-unchanged@pay
  - rule:earnings-belong-to-the-partnership@pay
  - rule:partnership-terms-set-at-invitation@pay
  - rule:partnership-share-of-payout-basis@pay
  - rule:engineering-capacity-is-the-only-basis@pay
  - rule:earning-window-opens-at-first-purchase@pay
  - rule:earning-windows-never-reset-or-pause@pay
  - rule:unfulfilled-capacity-earns-partnerships-nothing@pay
  - rule:attribution-at-purchase-decides-the-partnership@pay
  - rule:partnerships-earn-without-a-payout-account@pay
  - rule:manager-controls-the-partnerships-payout-account@pay
  - rule:exalynt-bears-partnership-earnings@pay
  - rule:partners-see-only-their-partnerships-earnings@pay
concepts: [concept:capacity-block, concept:fulfilled, concept:focus, concept:payout-share@pay]
gaps:
  - id: no-start-or-fulfill-notifications
    name: No notice of starts or fulfillment
    impact: inconvenient
    description: Nobody is told when a block is started or fulfilled.
  - id: no-review
    name: No review before fulfillment
    impact: damaging
    description: No one checks the work before a block is fulfilled.
    when: A block is marked fulfilled before its work is done.
  - id: departed-engineers-blocks-stuck
    name: Departed engineers' blocks can't be fulfilled
    impact: blocking
    description: >-
      Only a block's own engineer can mark it fulfilled, so a block whose
      engineer has left can't be fulfilled by anyone else.
    when: A block's engineer leaves before marking it fulfilled.
  - id: my-blocks-only-grows
    name: My blocks keeps every past block
    impact: inconvenient
    description: >-
      My blocks shows every block an engineer has ever had, so its fulfilled
      column only grows.
    when: An engineer fulfills more and more blocks.
  - id: browser-week-not-utc
    name: This week follows the browser, not UTC
    impact: inconvenient
    description: >-
      "This week" on My blocks is the browser's own week, while a block's week
      starts on Monday UTC, so around midnight a block can show as ready when
      starting it is refused, or not yet ready when it can be started.
    when: Someone away from UTC looks at My blocks around the turn of the week.
  - id: block-history-not-recorded
    name: Block history not recorded
    impact: inconvenient
    description: >-
      A block's page shows only when it was started and fulfilled. Its
      scheduling, rescheduling, claims and unclaims aren't recorded, so they
      don't show.
  - id: early-starts-not-shown
    name: Older blocks show no start
    impact: negligible
    description: A block started before starts were recorded shows no start.
  - id: starter-not-named
    name: Lead or admin starter not named
    impact: negligible
    description: >-
      A block started by a lead or an admin shows as started by Exalynt, not
      by name.
  - id: no-focus-notifications
    name: No notice of focus changes
    impact: inconvenient
    description: >-
      Nobody is told when a block's focus is added or changed, by Exalynt or
      by the client.
  - id: no-update-notifications
    name: No notice of new updates
    impact: inconvenient
    description: >-
      Nobody is told when an update is posted, and a block's page shows
      someone else's new updates only when it's opened again.
  - id: svg-images-blank
    name: SVG images show blank
    impact: inconvenient
    description: >-
      An SVG attached to an update or a focus as an image shows blank, though
      it still downloads.
    when: Someone attaches an SVG as an image.
  - id: no-focus-only-updates
    name: No updates about a focus alone
    impact: inconvenient
    description: An update about a focus alone, with no block, can't be posted yet.
  - id: unused-focus-not-editable
    name: Unused focuses can't be edited
    impact: inconvenient
    description: >-
      A focus taken off every block can't be edited any more, though it can
      still be found and put back on a block.
    when: A focus is taken off every block.
  - id: focus-search-titles-only
    name: Focus search matches titles only
    impact: inconvenient
    description: Searching a client's focuses matches their titles only.
  - id: updates-per-block-only
    name: Updates shown per block only
    impact: inconvenient
    description: >-
      A block's page shows only that block's updates, not those posted on
      other blocks with the same focus.
tradeoffs:
  - id: fulfilled-cant-be-reopened
    name: Fulfilled is final, no reopening
    outcome: usability/beta/recover
    impact: damaging
    description: Marking a block fulfilled is final.
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
