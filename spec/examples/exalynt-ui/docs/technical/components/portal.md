---
id: portal
name: Portal
description: >-
  The client portal, where a client organization's people buy and schedule
  capacity, follow their blocks, read estimates, pay, and manage the
  organization.
capabilities:
  - capability:client-home
  - capability:getting-set-up
  - capability:teams
  - capability:capacity-purchasing
  - capability:scheduling
  - capability:fulfillment
  - capability:conversation-spaces
  - capability:estimates
  - capability:billing
  - capability:organizations-and-members
  - capability:client-agreements
tradeoffs:
  - id: provider-pages-for-billing
    name: Billing on the provider's own pages
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
