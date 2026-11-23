---
name: Portal
summary: >-
  The client portal, where a client organization's people buy and schedule
  capacity, follow their blocks, read estimates, pay, and manage the
  organization.
start: >-
  `src/apps/portal/`, starting at `Layout.tsx` and `navigation.ts`
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
code: [src/apps/portal/**]
gaps:
  - id: home-screens-untested
    outcome: functionality/beta/stays-correct
    text: >-
      Home's workflow is tested end to end only by the API's tests. The
      portal's own unit tests cover what the page works out (`homeState`) and
      what it reads (`listCurrentCapacities`), not its screens or how a
      section fails.
  - id: home-not-switchable
    text: >-
      Home can't be switched off on its own, so a bad release of it is rolled
      back with everything else.
  - id: blocks-read-twice-on-home
    text: >-
      The setup bubble reads the blocks on now, the teams and billing when the
      organization changes and each time it opens, so on Home the blocks are
      read twice.
  - id: team-read-per-page
    text: >-
      Each page that shows the organization's teams reads them again.
  - id: team-screens-untested
    outcome: functionality/beta/stays-correct
    text: >-
      Your teams is tested end to end only by the API's feature tests. The
      portal's own unit tests cover reading every page of teams and the order
      people show in.
  - id: every-block-loaded
    outcome: efficiency/beta/bounded
    text: >-
      Capacity and the Schedule load every block the organization has bought,
      reading each page of them in turn, and Capacity filters, sorts and pages
      them in the browser.
  - id: block-page-reads-every-block
    text: >-
      A block's page reads every one of the organization's blocks to find
      this one by its number.
  - id: billing-screens-untested
    outcome: functionality/beta/stays-correct
    text: >-
      Billing and payment methods are tested end to end only by the API's
      feature tests, which run without a real payment provider.
  - id: members-unpaged
    outcome: efficiency/beta/bounded
    text: >-
      The Members table reads every member of the organization at once,
      unpaged.
  - id: members-screens-untested
    text: >-
      The portal's own unit tests on Members cover only how pasted addresses
      are read, what is left to retry after some invitations fail, and the
      role an invitation starts on. The rules are tested by the API's
      acceptance tests, and nothing tests the page itself.
  - id: logo-not-cached
    text: >-
      An organization's logo is read with the session token, once per change
      and per page load, so the browser doesn't cache it.
tradeoffs:
  - id: provider-pages-for-billing
    text: >-
      Payment methods, invoices and company details stay on the payment
      provider's own pages, which Billing opens at an address the API asks the
      provider for. The portal knows nothing of the provider, and shows only a
      label for the default payment method.
    cost: >-
      Clients leave the portal to see an invoice or change how they pay, and
      a page left open in another tab doesn't see what they changed there.
  - id: no-gravatar-for-members
    text: >-
      Members show their own photo or their initials, never a Gravatar, which
      would send their address, hashed, to a third party.
    cost: >-
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
