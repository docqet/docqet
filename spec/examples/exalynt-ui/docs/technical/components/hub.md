---
id: hub
name: Hub
description: >-
  The Partner Hub, where a partnership's manager follows the clients it has
  brought in, invites more, and sees what it earns and how it's paid.
capabilities:
  - capability:partner-home
  - capability:partnerships
  - capability:client-invitations
  - capability:partner-clients
  - capability:partner-earnings
  - capability:partner-payouts
  - capability:partner-payout-accounts
  - capability:partner-agreements
  - capability:getting-set-up
---

Every page acts in one of the partnerships the signed-in person manages.
`PartnershipProvider` reads them from the API and opens the one they last
looked at in this browser, or else the first by name; someone who manages
none is told the hub has nothing for them. Switching partnership gives up on
reads still going and reads everything again for the new one.

A partnership works in the hub only once its Partner Agreement is in effect:
until then `Layout.tsx` puts the agreement sent with its invitation in place
of every page, for its manager to accept, and the switcher stays. The gate is
the hub's alone: the API still answers the partnership's manager without a
Partner Agreement in effect. The welcome page (`welcome/`), where a partner
invitation lands, sits outside that gate, since someone who hasn't accepted
has no hub yet.

Every page reads and writes the API; the hub has no placeholder data.
Earnings, Payouts and Clients read every page of theirs from the API, then
page them in the browser; Home's Clients card asks for just the latest five.
The payout account page is `src/account/payoutAccount/PayoutAccountPage.tsx`,
the same page as the console's, for the partnership's own account, apart
from its manager's. `holdNotice`, which says what holds earnings up, is unit
tested.

The invitations list shows the API's refusals (an address it can't take, one
already invited, a limit reached) as the API words them. Any other failure is
worded by the page.
