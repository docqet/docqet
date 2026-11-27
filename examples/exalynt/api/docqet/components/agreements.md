---
docqet: component
id: agreements
name: Agreements
description: >-
  Client, Engineer and Partner Agreements: rendered from versioned templates,
  offered to a party, accepted, and kept as the PDF made when accepted.
is: archetype:http-api
serves:
  - capability:agreements
  - capability:client-agreements
  - capability:engineer-agreements
  - capability:partner-agreements
  - capability:earnings
tradeoffs:
  - id: apps-hold-people-to-agreements
    name: Agreements enforced in the apps, not the API
    description: >-
      The apps hold people to an agreement, not the API: the portal's,
      console's and hub's gates keep someone out until one is in effect, and
      the API answers what their role allows regardless.
    drawback: >-
      Someone using the API directly can still do what their role allows
      without an agreement in effect.
  - id: pdf-laid-out-in-go
    name: PDFs drawn in Go without Unicode fonts
    description: >-
      The PDF is laid out in Go with fpdf's Helvetica, not a browser or a
      Unicode font, so there's no headless browser to run or font to ship.
    drawback: >-
      A character outside Windows-1252 is "?" for good once accepted, so a
      name with characters outside Western European alphabets keeps them as
      "?" in its PDF.
  - id: accepted-agreements-outlive-their-user
    name: Accepted agreements kept after their user is deleted
    description: >-
      Accepted agreements outlive their user: deleting a user clears `user_id`
      on their accepted ones (migration 91) and keeps their PDFs, since the PDF
      is the record of what was agreed.
    drawback: >-
      A deleted person's name and email stay in those PDFs and rows. That
      matters when a user who accepted an agreement is deleted.
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
