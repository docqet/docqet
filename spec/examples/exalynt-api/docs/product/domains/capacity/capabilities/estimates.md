---
name: Estimates
summary: >-
  Exalynt prepares estimates of what a project might take, and clients and
  prospects read them to see what each focus and the project would cost and
  take on every block type.
stability: beta
personas:
  - client-admin-founder
  - client-admin-operations
  - client-member
  - exalynt-engineer-1
  - exalynt-engineer-2
  - exalynt-admin
rules:
  - estimates/focus-sizes-and-block-prices
  - estimates/each-focus-has-its-own-pace
  - estimates/discounts-apply-to-the-whole-project
  - estimates/estimates-keep-their-original-prices
  - estimates/estimates-record-their-author
  - estimates/replacing-replaces-everything
  - estimates/clients-read-only-their-own-estimates
  - estimates/only-exalynt-writes-estimates
  - estimates/engineers-work-on-supported-clients-estimates
  - estimates/prospects-see-estimates-once-attached
  - estimates/deleting-an-estimate-is-permanent
  - estimates/estimates-are-for-organizations-or-prospects
  - estimates/a-focus-belongs-to-one-estimate
concepts: [estimate, capacity-block, capacity-unit]
gaps:
  - id: no-asking-for-estimates
    text: >-
      Clients can't ask for an estimate, or for an updated one when the scope
      changes, in the product. They ask Exalynt outside it.
  - id: no-estimate-notifications
    text: >-
      Nobody is told when an estimate is shared with their organization or
      changed.
  - id: prospects-attached-by-hand
    text: >-
      A prospect's estimate is attached to their organization by hand once
      they've signed up.
  - id: fixed-operations-fee
    text: The operations fee is fixed, so changing it takes a release.
  - id: operations-not-shown
    text: >-
      Operations aren't shown for now: there's no way to include them when
      writing an estimate, and nothing on the client's estimate or its PDF.
      Exalynt still keeps whether an estimate includes them, and its fee.
  - id: tried-paces-not-saved
    text: Paces the client tries are never saved, and reset on leaving.
  - id: pdf-leaves-out-planned-pace
    text: >-
      The PDF offers the project on each pace as an option, with every focus
      on it, and leaves out the pace each focus was planned on.
  - id: pdf-not-kept
    text: >-
      The PDF is built on the reader's device, so it isn't stored or kept as
      sent.
  - id: pdf-layout-breaks
    text: >-
      In the PDF, a title with no spaces runs off the page and into the
      footer, and web addresses get hyphenated.
  - id: no-retry-after-failed-load
    outcome: usability/beta/recover
    text: A failed load says to reload, with no way to retry in place.
  - id: tested-only-through-the-api
    outcome: functionality/beta/stays-correct
    text: >-
      The workflow is tested end to end only through the API. The console's
      own tests cover the math and what a save sends.
tradeoffs:
  - id: last-save-wins
    text: >-
      When two people edit one estimate at once, the later save replaces the
      earlier one, without a warning.
    cost: The earlier person's changes are lost without them knowing.
  - id: deleting-is-permanent
    text: Deleting an estimate is permanent.
    cost: Getting one back means restoring a backup.
decisions:
  - topic: Asking for estimates and engineers
    question: >-
      Is asking for an estimate, or for a particular engineer, a flow of
      its own? _At MVP:_ no. Clients ask Exalynt outside the product.
---

## Includes

- Clients see the pace each focus of an estimate is planned at, and any
  discounts off it.
- Clients download an estimate as a PDF.
- Engineers prepare and update estimates: focuses, such as new features or
  improvements to an existing system, each sized, planned at a pace and still
  priced on every block type, with an optional description and notes, and
  discounts off the whole project.
- Admins prepare and update estimates for any client organization, or for a
  prospect that isn't a client yet, with discounts off the whole project.
- Admins send a prospect their estimate as a PDF, and attach it to their
  organization once they sign up.
