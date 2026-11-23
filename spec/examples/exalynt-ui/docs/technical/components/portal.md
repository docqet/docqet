---
name: Portal
description: >-
  The client portal, where a client organization's people buy and schedule
  capacity, follow their blocks, read estimates, pay, and manage the
  organization.
capabilities:
  - client-home
  - getting-set-up
  - teams
  - capacity-purchasing
  - scheduling
  - fulfillment
  - conversation-spaces
  - estimates
  - billing
  - organizations-and-members
  - client-agreements
gaps:
  - id: home-screens-untested
    name: Home screens untested in the portal
    outcome: functionality/beta/stays-correct
    impact: inconvenient
    description: >-
      Home's workflow is tested end to end only by the API's tests. The
      portal's own unit tests cover what the page works out (`homeState`) and
      what it reads (`listCurrentCapacities`), not its screens or how a
      section fails.
    when: A change breaks Home's screens or how a section fails.
  - id: home-not-switchable
    name: Home can't be switched off alone
    impact: inconvenient
    description: >-
      Home can't be switched off on its own, so a bad release of it is rolled
      back with everything else.
    when: A release breaks Home.
  - id: blocks-read-twice-on-home
    name: Blocks read twice on Home
    impact: negligible
    description: >-
      The setup bubble reads the blocks on now, the teams and billing when the
      organization changes and each time it opens, so on Home the blocks are
      read twice.
  - id: team-read-per-page
    name: Teams reread on every page
    impact: negligible
    description: >-
      Each page that shows the organization's teams reads them again.
  - id: team-screens-untested
    name: Your teams screens untested in the portal
    outcome: functionality/beta/stays-correct
    impact: inconvenient
    description: >-
      Your teams is tested end to end only by the API's feature tests. The
      portal's own unit tests cover reading every page of teams and the order
      people show in.
    when: A change breaks the Your teams screens.
  - id: every-block-loaded
    name: Capacity and Schedule load every block
    outcome: efficiency/beta/bounded
    impact: inconvenient
    description: >-
      Capacity and the Schedule load every block the organization has bought,
      reading each page of them in turn, and Capacity filters, sorts and pages
      them in the browser.
    when: An organization has bought many blocks.
  - id: block-page-reads-every-block
    name: Block page reads every block to find one
    impact: inconvenient
    description: >-
      A block's page reads every one of the organization's blocks to find
      this one by its number.
    when: An organization has bought many blocks.
  - id: billing-screens-untested
    name: Billing untested against a real provider
    outcome: functionality/beta/stays-correct
    impact: blocking
    description: >-
      Billing and payment methods are tested end to end only by the API's
      feature tests, which run without a real payment provider.
    when: >-
      A change breaks Billing, or the real payment provider behaves unlike
      the tests.
  - id: members-unpaged
    name: Members table unpaged
    outcome: efficiency/beta/bounded
    impact: inconvenient
    description: >-
      The Members table reads every member of the organization at once,
      unpaged.
    when: An organization grows to many members.
  - id: members-screens-untested
    name: Members page itself untested
    impact: inconvenient
    description: >-
      The portal's own unit tests on Members cover only how pasted addresses
      are read, what is left to retry after some invitations fail, and the
      role an invitation starts on. The rules are tested by the API's
      acceptance tests, and nothing tests the page itself.
    when: A change breaks the Members page.
  - id: logo-not-cached
    name: Organization logo never cached by the browser
    impact: negligible
    description: >-
      An organization's logo is read with the session token, once per change
      and per page load, so the browser doesn't cache it.
tradeoffs:
  - id: provider-pages-for-billing
    name: Billing on the provider's own pages
    impact: inconvenient
    description: >-
      Payment methods, invoices and company details stay on the payment
      provider's own pages, which Billing opens at an address the API asks the
      provider for. The portal knows nothing of the provider, and shows only a
      label for the default payment method.
    drawback: >-
      Clients leave the portal to see an invoice or change how they pay, and a
      portal page left open in another tab doesn't see what they changed there.
  - id: no-gravatar-for-members
    name: Photos or initials, never Gravatar
    impact: negligible
    description: >-
      Members show their own photo or their initials, never a Gravatar, which
      would send their address, hashed, to a third party.
    drawback: >-
      A member who hasn't uploaded a photo shows initials here, though their
      profile shows their Gravatar.
---

Every page acts in the organization being looked at. `AccessProvider` holds
it and the reader's role in it, and `Layout.tsx` builds the rail from that
role: a role without capacity, estimate or team reads (Billing) doesn't get
those pages, and one without `invoice:read` (Member) doesn't get Billing. The
pages that are left check the same permissions, say why when the role can't
see them, and ask the API for nothing then. `RequireOrganization` sends
someone in no organization to onboarding, or offers someone with the console
to create one. Switching organization starts each page again.

Nobody works in an organization until its Client Agreement is in effect:
`Layout.tsx` puts the agreement in place of every page (`AgreementGate`), for
someone with `organization:manage` to accept, or tells anyone else an Admin
has to first. The organization switcher stays, to work in another. The gate
is the app's alone: the API still answers what a member's role allows
without an agreement in effect, so anything new that must wait for the
agreement has to sit behind the gate.

Every page reads and writes the API: the portal has no placeholder data
(`data/relationships.ts` only orders the API's teams). A block's own page
(`capacity/View.tsx`) is marked Prototype in `src/featureStability.ts`, below
Fulfillment's Alpha, because whether it's the right page for a client is
still the question, not because its data is fake. Its focus, timeline and
conversations are the console's, from `src/components/block/`.

The setup bubble's steps are worked out by `beforeWorkStarts`
(`components/setup/`), which unit tests cover. Estimates' figures are worked
out in the browser by `src/estimates/`, from the sizes it shares with the API
and the prices each estimate carries; unit tests pin them to the API's.

Buying holds one `Idempotency-Key` for each opening of
`PurchaseCapacityDialog`, so trying again while the dialog is open can't
charge twice, and closing it starts a new purchase with a new key. The
provider's page for an invoice is opened at an address the API reads from the
provider each time, since those addresses expire, so the portal never keeps
one. The Schedule's weeks are the API's, rolling over at midnight UTC.
