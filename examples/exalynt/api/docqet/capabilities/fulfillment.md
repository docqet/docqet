---
docqet: capability
id: fulfillment
name: Fulfillment
description: >-
  A block's engineer starts it once its week begins, and marks it fulfilled
  when the work is done, with nobody reviewing it.
stability: alpha
feature: feature:block-delivery
solves:
  - problem:spend-without-visible-progress
  - problem:requests-go-unheard
  - problem:working-without-client-context
  - problem:reporting-eats-into-the-work
  - problem:team-trouble-seen-one-by-one
  - problem:exceptions-hide-in-routine
initiatives: [initiative:mvp]
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
  - rule:shares-earned-at-fulfillment
  - rule:payout-basis-per-capacity-unit
  - rule:engineer-earns-the-engineer-share
  - rule:team-leads-earn-team-lead-share
  - rule:available-teammates-earn-team-support-share
  - rule:unlisted-shares-earn-nothing
  - rule:shares-dont-reduce-each-other
  - rule:partnership-share-earned-at-fulfillment
  - rule:partnerships-earn-under-their-agreement-in-effect
  - rule:coupons-never-change-shares
  - rule:unclaimed-shares-stay-with-exalynt
  - rule:when-basis-and-percentages-are-fixed
  - rule:each-share-rounds-on-its-own
  - rule:refunds-after-fulfillment-change-nothing
  - rule:reassignment-before-fulfillment-earns-nothing
  - rule:when-team-support-earners-are-fixed
  - rule:when-the-team-lead-beneficiary-is-fixed
  - rule:no-lead-means-no-lead-share
  - rule:one-team-lead-share-per-block
  - rule:invalid-payout-account-delays-lead-share
  - rule:partner-status-leaves-engineers-unchanged
  - rule:earnings-belong-to-the-partnership
  - rule:partnership-terms-set-at-invitation
  - rule:partnership-share-of-payout-basis
  - rule:engineering-capacity-is-the-only-basis
  - rule:earning-window-opens-at-first-purchase
  - rule:earning-windows-never-reset-or-pause
  - rule:unfulfilled-capacity-earns-partnerships-nothing
  - rule:attribution-at-purchase-decides-the-partnership
  - rule:partnerships-earn-without-a-payout-account
  - rule:manager-controls-the-partnerships-payout-account
  - rule:exalynt-bears-partnership-earnings
  - rule:partners-see-only-their-partnerships-earnings
concepts: [concept:capacity-block, concept:fulfilled, concept:focus, concept:payout-share]
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
    affects:
      - outcome:usability/beta/recover
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
