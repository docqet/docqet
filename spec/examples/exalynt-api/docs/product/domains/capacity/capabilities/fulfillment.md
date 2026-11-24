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
  - id: departed-engineers-blocks-stuck
    name: Departed engineers' blocks can't be fulfilled
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      Only a block's own engineer can mark it fulfilled, so a block whose
      engineer has left can't be fulfilled by anyone else.
tradeoffs:
  - id: fulfilled-cant-be-reopened
    name: Fulfilled is final, no reopening
    outcome: usability/beta/recover
    description: Marking a block fulfilled is final.
    drawback: >-
      A fulfilled block can't be reopened, even when it was marked fulfilled
      by mistake.
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
