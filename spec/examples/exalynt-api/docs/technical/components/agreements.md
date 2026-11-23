---
name: Agreements
summary: >-
  Client, Engineer and Partner Agreements: rendered from versioned templates,
  offered to a party, accepted, and kept as the PDF made when accepted.
start: >-
  `internal/services/agreements.go` (`AgreementService`, `recordAcceptance`),
  `internal/agreements` (templates, `definitions.go`, `pdf.go`),
  `internal/models/term.go` (the terms catalog, `ChooseTerms`),
  `internal/repositories/postgres/agreement.go`; offers at invitation in
  `internal/services/invitations.go`, to an organization as it's created in
  `internal/services/organizations.go`, and to a partnership as it's invited
  in `internal/services/partnerships.go` (`OfferPartnerAgreement`). In the ui,
  `src/shared/apiAgreements.ts` (`acceptFailure`) and the gates in
  `src/apps/console/Layout.tsx`, `src/apps/portal/Layout.tsx` and
  `src/apps/hub/Layout.tsx`
capabilities:
  - agreements
  - client-agreements
  - engineer-agreements
  - partner-agreements
  - earnings
code:
  - internal/services/agreements.go
  - internal/agreements/**
  - internal/models/term.go
  - internal/repositories/postgres/agreement.go
  - internal/services/invitations.go
  - internal/services/organizations.go
  - internal/services/partnerships.go
tradeoffs:
  - id: apps-hold-people-to-agreements
    text: >-
      The apps hold people to an agreement, not the API: the portal's,
      console's and hub's gates keep someone out until one is in effect, and
      the API answers what their role allows regardless.
    cost: >-
      Someone using the API directly can still do what their role allows
      without an agreement in effect.
    revisit: someone works through the API without an agreement
  - id: pdf-laid-out-in-go
    text: >-
      The PDF is laid out in Go with fpdf's Helvetica, not a browser or a
      Unicode font, so there's no headless browser to run or font to ship.
    cost: >-
      A character outside Windows-1252 is "?" for good once accepted, so a
      name with characters outside Western European alphabets keeps them as
      "?" in its PDF.
    revisit: a party's name needs one
  - id: no-flag-before-gates
    text: >-
      There's no flag in front of the console's or the portal's gate, like the
      other Beta features.
    cost: >-
      If reading agreements fails, every engineer is kept out of the console,
      or every client out of the portal, until a fix or a rollback is
      deployed.
    revisit: that happens
  - id: accepted-agreements-outlive-their-user
    text: >-
      Accepted agreements outlive their user: deleting a user clears `user_id`
      on their accepted ones (migration 91) and keeps their PDFs, since the PDF
      is the record of what was agreed.
    cost: >-
      A deleted person's name and email stay in those PDFs and rows.
    revisit: someone asks for theirs to be deleted
---

An offer is a row with its type, version and Commercial Terms. While it's
offered, its document is rendered on every read, filled in with the party as
they are now. Accepting renders it once more, lays it out as a PDF in Go, puts
the PDF in object storage under a key of its own, then records the row as
accepted. If recording fails, the PDF is deleted again, as best it can be. The
accepted row keeps the party's name as the document named it, and the PDF is
never rendered again. Earnings read the terms of the latest accepted Engineer
Agreement (`InEffectTerms`).

**Who reads which agreements.** Engineers' agreements belong to no
organization, so they're read on the platform connection
(`AcrossOrganizations`), where row-level security lets everything through.
Only the service's party filter keeps one person from another's: nothing lists
or gets without a party in the `AgreementQuery`, and an `AgreementQuery`
naming none matches nothing. An organization's are read on the organization
connection, where row-level security keeps them apart too. A partnership's are
read by its manager on the partner connection, where row-level security keeps
partnerships apart, but by an admin holding `partner:manage` on the platform
connection (`ReachPartnership`), where only `partnerParty`'s filter does.

**One offer per party and type** is held by `DeleteOffered` and a partial
unique index. Two admins sending at the same moment means one gets a `500`
from the index, and sends again.

**Deleting a user.** A user's offers are deleted by
`UserService.DeleteByIdentity` before the user, since only accepted rows may be
left with no party. Deleting a user any other way, such as a test's cleanup,
deletes their agreements first or leaves rows behind.

**Templates.** A template version that anyone has accepted never changes: the
next version is added instead. Shared definitions in `definitions.go` are
pulled into every version that uses them, so editing one rewrites every
waiting offer, though not accepted PDFs.

**Deleting an organization or partnership.** `agreements.organization_id` is
`ON DELETE CASCADE` (migration 76), so deleting an organization would delete
its accepted Client Agreements and leave their PDFs behind. Nothing deletes an
organization today; whatever first does decides what happens to them.
`agreements.partnership_id` cascades the same way: today only revoking a
partner's invitation deletes a partnership, and only before its agreement can
be accepted.

The `agreements/` keys in object storage are the only copy of what was
accepted.
