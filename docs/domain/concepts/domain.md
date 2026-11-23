# Domain

A part of the business the software serves, with a language of its own: within
a domain, each word means one thing. It's a business area and a bounded
context, in domain-driven design's terms, as one.

## Details

Guest stays is a domain: "looking after guests from their booking to their
check-out". Billing is another: "charging guests for their stays and getting
paid". Booking means a guest's hold on one room in Guest stays, and what a
guest is charged for a stay in Billing. Both are right, each in its domain.

- **It's named for the part of the business it serves**, not for an app, a
  service or a team: Guest stays, not "the guest app" or "the front-office
  suite".
- **It doesn't follow how the software is packaged.** Several
  [projects](project.md) can work in one domain, and one project can work in
  several. Repackaging the software, or reorganizing the teams that build it,
  never creates, removes or splits a domain.
- **Every product doc but a persona is written in exactly one domain**: the
  one whose words it uses. A project's docs for each domain are in a folder of
  their own.
- **Domains are shared by ID.** Projects that work in the same part of the
  business use the same domain ID, and their contributions to it are one
  domain.
- **Features and capabilities can span domains.** Front desk is in Guest
  stays, where clerks check guests in and out, and in Billing, where the bill
  is settled at check-out. Each domain's part is its own, and the feature is
  one.
- **Rules and concepts are the domain's own.** The same ID in two domains is
  two definitions, shown side by side, and that's not a problem. A capability
  uses its own domain's [rules](rule.md) and [concepts](concept.md), unless it
  names another domain's, or only one domain defines that ID.
- **It holds open decisions whose answer becomes a rule or concept**, since
  that's where the answer will go. See [open decision](open-decision.md).
- **It provides value only through its features.** A domain with no features
  is a part of the business the software doesn't serve yet.
- **It's one level.** A domain holds its parts of features, never other
  domains.
- **It has no stability level.** It has a [maturity](maturity.md), worked out
  from its parts of features.

## In the spec

A domain is a folder under `docs/product/domains/`, and the folder's name is
its ID. Everything written in its words is inside it:

```text
docs/product/domains/guest-stays/
├── domain.md
├── features/reservations.md
├── capabilities/room-booking.md
├── rules/booking/no-double-booking.md
└── concepts/booking.md
```

Its [`domain.md`](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/domain.md)
gives its name and summary, and anything worth saying about it. It has no
frontmatter:

```markdown
# Guest stays

Looking after guests from their booking to their check-out.

## Open decisions

- **Early arrivals:** when a guest arrives before the room's usual check-in
  time, does their stay start that day, or is the night before part of it?
```

## Not to be confused with

- [Project](project.md): a repository. A project works in domains, but says
  nothing about what words mean.
- [Feature](feature.md): a job the product does. A domain is the part of the
  business whose language the job is described in.
