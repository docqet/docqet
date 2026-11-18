# Spec

The Docket format: how a repository records the state of its software so that
people, agents and tools can all read it. The spec belongs to no particular
tool. Anyone can adopt the format or write their own indexer for it.

**Status: draft for review.** Nothing implements it yet. Each example in
[`examples/`](examples/) is laid out as its own repository root, with the
`state.json` an indexer would produce from it:

- **[`hotel-bookings`](examples/hotel-bookings/)** is a small hotel-booking app
  that uses every part of the spec, code and tests included. The examples
  below come from it.
- **[`hotel-billing`](examples/hotel-billing/)** is the same hotel's billing
  service, in a repository of its own: guest bills, payments, company accounts
  and closing the day. It's a second project to show beside the first. It works
  in the Billing and Finance domains, and contributes Billing's part of Front
  desk, a feature that's mostly Guest stays'.

## Principles

- **The repo is the source of truth.** Everything is declared in the
  repository or derived from it.
- **Declared vs. derived.** People and agents write the declared parts:
  stability, rules, gaps and links. The indexer computes the derived parts:
  maturity, readiness, evidence, reverse links and problems. Nobody edits
  derived state by hand.
- **Evidence is optional.** Code and tests can point at the rules they're
  about, so readers can see them beside the rule. Docket doesn't run tests or
  read their results, and nothing requires evidence at any level.
- **Frontmatter for tools, prose for people.** Each doc is Markdown. Its YAML
  frontmatter holds what a tool computes with: levels, links and gaps.
  Its body holds what people read. No fact is in both.
- **Contradictions are shown, not resolved.** Each repository contributes what
  it knows to one picture of the product. Where two contributions disagree,
  readers see both and a problem, not a winner.

## What's in a repository

```text
docket.yaml                              config: the project's ID and name
docs/
└── product/
    ├── personas/<slug>.md               who the software serves, across every domain
    └── domains/
        └── <domain>/                    one folder per domain the project works in
            ├── domain.md                the domain's name and summary
            ├── features/<slug>.md       the product's jobs, each grouping capabilities
            ├── capabilities/<slug>.md   the only docs with a stability level
            ├── rules/<topic>/<slug>.md  one rule per file, grouped by topic
            └── concepts/<slug>.md
<code and tests, anywhere>               docket:implements and docket:verifies comments
.docket/state.json                       written by `docket index`, gitignored
```

This is the product docs layout forge's `docs` skill uses today, with
these changes:

- Features are new. A feature is a job the product does, and it groups the
  capabilities that do it.
- Domains are new. A domain is a part of the business with a language of its
  own, and a project's docs are in a folder per domain it works in, under
  `domains/`. Forge's single `domain/` folder of rules and concepts becomes
  one of these per domain.
- Each folder directly under `docs/product/` holds one kind of thing:
  `personas/`, which span domains, and `domains/`.
- Frontmatter replaces bold-label lines such as `**Stability:** Alpha`.
- Rules are one per file instead of one file per topic.
- A capability is its one-sentence summary, saying who or what does what.
  "What people can do", with a heading per role, is gone: the people it
  serves are links to personas, and an optional Covers list says what else it
  includes.
- Personas have an image and a Needs section, and no Based on. Capabilities
  link to them, so each persona's capabilities, features and readiness can be
  worked out.
- A rule no longer links to its acceptance test. Whatever verifies or
  implements it, a test or not, points at it instead, and can point at a
  capability too.
- Rules have no kind: core and edge case are gone.
- There are no engineering docs: no systems, components, providers or
  runbooks, and so no technical gaps. A repository can keep them anywhere
  outside `docs/product/`, but Docket doesn't read them.

In the examples, `.docket/state.json` is checked in so you can read it. In a
real repository it's gitignored.

## IDs

A doc's ID is its path under its type's folder, without `.md`: in its domain
for those written in one, or under `personas/` for a persona. A domain's ID is
its folder's name:

| Type       | Folder                                        | Example ID                  |
| ---------- | --------------------------------------------- | --------------------------- |
| domain     | `docs/product/domains/`                       | `guest-stays`               |
| feature    | `docs/product/domains/<domain>/features/`     | `reservations`              |
| capability | `docs/product/domains/<domain>/capabilities/` | `room-booking`              |
| rule       | `docs/product/domains/<domain>/rules/`        | `booking/no-double-booking` |
| concept    | `docs/product/domains/<domain>/concepts/`     | `booking`                   |
| persona    | `docs/product/personas/`                      | `front-desk-clerk`          |

- **IDs, links and values are kebab case**: lowercase words joined by
  hyphens, such as `room-booking`, `accepted-tradeoff`, `to-close-later` or `ga`.
  Tools show values with their own labels, such as GA for `ga`.
- **No `id:` field.** The path is the ID, so there's nothing to drift. Renaming
  a file renames the doc, and the indexer reports every link and annotation the
  rename left dangling.
- **Where the type isn't obvious, the ID carries it**, as `<type>:<id>`, such
  as `rule:booking/no-double-booking` in an annotation or a problem's
  `subject` in `state.json`. In frontmatter the field name gives the
  type, so links there are bare: `rules: [booking/no-double-booking]`.
- **A gap's ID** is its doc's ID plus the gap's key:
  `capability:room-booking#no-waitlist`.
- **What an ID names depends on the type** (see [Domains](#domains)). A
  domain, feature, capability or persona ID names one thing across every
  project. A rule
  or concept ID names one definition within a domain.
- **A link to another domain's rule or concept** adds `@<domain>`:
  `concepts: [booking@guest-stays]`, or
  `docket:verifies rule:bills/closed-bills-dont-change@billing`.

## Doc types

Every doc starts with its frontmatter, if it has any, then a `#` title, which
is its name. The paragraph under the title is its summary. The UI shows both.

| Type | Frontmatter | Body | Example |
| --- | --- | --- | --- |
| domain | none | Anything worth saying about the part of the business, as prose | [guest-stays](examples/hotel-bookings/docs/product/domains/guest-stays/domain.md) |
| feature | `capabilities` (required) | Anything worth saying about the job, as prose | [reservations](examples/hotel-bookings/docs/product/domains/guest-stays/features/reservations.md) |
| capability | `stability` (required), `personas`, `rules`, `concepts`, `code`, `gaps` | Covers, Learning, Success, Open decisions | [room-booking](examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/room-booking.md) |
| rule | `concepts` | The rule, Why | [same-day-turnover](examples/hotel-bookings/docs/product/domains/guest-stays/rules/booking/same-day-turnover.md) |
| concept | none | Details, Lifecycle, Not to be confused with | [booking](examples/hotel-bookings/docs/product/domains/guest-stays/concepts/booking.md) |
| persona | `image` (required) | Needs, Knows, Context, Expects, Cares about | [front-desk-clerk](examples/hotel-bookings/docs/product/personas/front-desk-clerk.md) |

- **`stability`** is `prototype`, `alpha`, `beta` or `ga`, which tools show
  as Prototype, Alpha, Beta and GA. Only capabilities have one. A feature's maturity is worked out from its capabilities' levels,
  and a domain's from its parts of features (see
  [Features and maturity](#features-and-maturity)).
- **`code`** is a list of path globs for where it lives. What verifies or
  implements it is found through [annotations](#evidence) instead.
- **`personas`** lists the personas a capability serves: who does it, or who
  it's done for when the software does it.
- **`image`** is the URL of the persona's picture. Any image a browser can
  show works. The examples use randomuser.me's free placeholder portraits,
  such as `https://randomuser.me/api/portraits/women/68.jpg`.
- The body sections keep their meaning from forge's formats, except for the
  capability's and persona's below. The spec will carry their full
  descriptions once the frontmatter settles.

### Capabilities

A capability is its name and its summary: one sentence saying who or what does
what, such as "Clerks book a free room for a guest's stay" or "The software
closes each business day overnight". The sentence names the people it's about
the way the business does, and `personas` links them, so it reads on its own
and the links carry the exact list.

What a capability doesn't do is said elsewhere:

- **What must always or never happen**, every time, is a rule it follows:
  "a room can't be double-booked".
- **What's missing or limited**, for now or by choice, is a gap: "there's no
  waitlist when every room is taken".

**Covers** is optional: a list of what else the capability includes, when the
sentence alone doesn't show it. Each item is a sentence of its own, with who
or what does it: "Clerks move a booking to new dates."

### Personas

A persona is a type of person the software serves, written as one invented
person: `# Maria, front desk clerk`, with a sentence on who they are as the
summary. Personas are written once for the whole project, not per domain,
since the same people work across domains. Its sections:

- **Needs**: what they need the software to do for them, and why it matters
  to them. This is the value the software provides them.
- **Knows**: their domain knowledge, how well they know the product, and
  their technical skill.
- **Context**: their device, how often they do this, time pressure,
  interruptions.
- **Expects**: the words they use, the tools they already know, and how they
  think the work goes.
- **Cares about**: what makes them trust it, and what would make them give up.

## Links

Every link points one way and is written once:

```text
feature                    → capabilities
capability                 → personas, rules, concepts, code
rule                       → concepts
annotation                 → rules, capabilities    (docket:verifies, docket:implements)
```

The indexer computes the other direction, such as which capabilities a rule
applies to, which feature a capability is in, or which domains a feature spans,
so the UI can show both sides.

### Rules belong to a domain

Rules and concepts belong to a domain, not to any capability or feature. A
capability refers to the rules it follows, and that's the only link between a
rule and the product:

- **A rule can apply to many capabilities**, in one feature or several. In the
  example, `booking/no-double-booking` applies to room booking and group
  bookings in Reservations, and to check-in in Front desk.
- **A feature has no rules of its own.** Its rules are the ones its
  capabilities follow. Features don't list rules, and `state.json` doesn't
  either: a reader works them out from the feature's capabilities.
- **A rule's `<topic>` is a part of its domain**, such as `booking`, never a
  capability or a feature. A rule keeps its ID as capabilities start or stop following it.

Links in the body are ordinary relative Markdown links, for readers. The
indexer reports any that are broken, but only frontmatter and annotations count
as relationships.

## Gaps

Gaps live in a capability's frontmatter so the UI can count and group them.
Each one is what someone using the product would notice, has a key that's
unique within its doc, a kind, and a sentence or two of text:

```yaml
gaps:
  - id: no-waitlist
    kind: to-close-later        # or accepted-tradeoff
    text: >-
      When every room is taken there's no waitlist. Clerks note the guest's
      details outside the app and call them if a room frees up.
```

As in forge today, a gap is recorded in exactly one place.

A gap can also name the [stability checklist](#stability-checklist) item it
falls short of, as `item`. Most gaps are limits on what the capability does,
such as the waitlist, and match no item, so they leave it out:

```yaml
gaps:
  - id: calendar-needs-a-mouse
    kind: to-close-later
    item: experience/usable-by-everyone
    text: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
```

A gap can't name a baseline item: the security and privacy baseline is never a
known gap.

## Stability levels

Every capability is at one of four stability levels. The level says how stable
the work is right now, so people know what they can rely on before they rely
on it.

| Level     | How stable | What it means                                                                                                                                           |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prototype | Exploring  | Explores an idea so we can choose a direction. Its data may be fake, and it may change completely or be thrown away.                                    |
| Alpha     | Developing | Works, but is still taking shape. Expect frequent breaking changes and bugs.                                                                            |
| Beta      | Refining   | Settled enough for real use. Breaking changes and bugs are occasional. We aim to announce breaking changes ahead of time, but can't always.             |
| GA        | Stable     | Generally available and stable. It keeps working as it does today. Breaking changes are rare, announced ahead of time, and come with time to move over. |

- **A level describes how much you can depend on the work, not how good it
  is.** A prototype that answers its question quickly is good work.
- **Stability isn't perfection.** GA software still has bugs, and it can still
  have known gaps.

### Stability checklist

[`stability-checklist.yaml`](stability-checklist.yaml) says what each level
generally includes, in 117 items across areas such as tests, security, and
release and rollback. It's part of the spec, so it's the same for every project
and every tool that reads Docket: a project doesn't copy it, change it or
configure it. It's guidance, not a gate. Work fits a level when it generally
meets that level's items, and each item that applies is usually met, not
applicable, or a known gap.

- **An item that applies is met unless a gap names it.** Declaring a level
  claims what that level includes, except the gaps written down, so only
  what isn't met is recorded. An item that doesn't apply counts as met too.
- **An item's ID** is its area's ID and its own, as `<area>/<item>`:
  `tests/edge-cases-checked`. IDs are never renamed, since gaps refer to them.
  Rewording an item is fine.
- **An item belongs to the lowest level that includes it,** and every higher
  level includes it too, unless `until` names the last level it applies to.
  The Alpha-only `release/opt-in` is replaced at Beta by
  `release/normal-pipeline`.
- **`baseline` items** are the security and privacy baseline. They start at
  Prototype, hold at every level, and are never a known gap.

## Features and maturity

A **feature** is a named product function that fulfills a distinct user or
business job, such as Reservations. It keeps its identity as its capabilities
and implementation change. A **capability** is something a feature can do as
part of its job, such as cancelling a booking. Features gain and lose
capabilities over time without becoming new features, and each capability has
its own stability level.

To tell them apart, ask whether the work helps an existing feature do its job,
or gives the product a new job. The first is a capability of that feature, and
the second is a new feature. Work that only changes how something is built is
neither.

A feature's doc lists its capabilities, in the order to show them:

```yaml
---
capabilities:
  - room-booking
  - cancellations
  - group-bookings
---

# Reservations

Taking bookings and handling changes to them, before the guest arrives.
```

- **A capability is in at most one feature.** One in none is allowed, and
  shows on its own.
- **A feature has no stability level.** It has a maturity instead, which the
  indexer works out from its capabilities' levels. Nobody writes it down.

A feature can span domains: each domain a project writes a feature doc in
contributes that domain's part of the job. Front desk is in Guest stays, with
check-in and check-out, and in Billing, with settling the bill at check-out.

### What maturity is

A feature's, a domain's or a project's **maturity** says how far along it is:
how close the work under way is to being stable and supported. It's a
percentage.

- **Higher means more of it is stable and supported.** 75% or more,
  Established, is healthy for most businesses.
- **New work shows on its feature.** Starting a new capability lowers that
  feature's maturity. An established domain moves only a little, because what's
  already stable counts most.
- **It's about the whole, not each part.** It's an indication, not a verdict.
  Before depending on something, check the stability level of the capability
  you need.

### How maturity is worked out

Each capability has a score for how far along it is, and a weight for how much
it counts. The more stable it is, the more it counts: one GA capability counts
as much as 1.5 Betas, 2 Alphas or 3 Prototypes. That's enough that dependable
work lifts a feature, but not so much that a little of it carries a feature
that's mostly early work.

| Level     | Score | Weight |
| --------- | ----- | ------ |
| Prototype | 15%   | 2      |
| Alpha     | 35%   | 3      |
| Beta      | 60%   | 4      |
| GA        | 100%  | 6      |

A **feature's maturity** is the weighted average of its capabilities' scores,
rounded to a whole percentage. Each score sits inside its level's band (below),
so a feature whose capabilities are all at Alpha is 35%, in Alpha's band, and
never shows as more mature than it is. A feature with no capabilities has no
maturity. Every Docket capability has a level, so there are no drafts to leave
out.

For example, Reservations has room booking at Beta, cancellations at Alpha, and
group bookings at Prototype, so its maturity is (60 × 4 + 35 × 3 + 15 × 2) ÷
(4 + 3 + 2) = 375 ÷ 9 ≈ 42%. Without group bookings it would be 345 ÷ 7 ≈ 49%.
Starting group bookings lowered it, but nothing got worse: something new
started.

A maturity sits in one of four **bands**, a quarter of the scale each, named
for a level and shown in its color. Each band says how far along the feature,
domain or project is as a whole, and what to expect from it:

| Band         | From | Level     | What it tells you                                                                                      |
| ------------ | ---- | --------- | ------------------------------------------------------------------------------------------------------ |
| Experimental | 0%   | Prototype | Early days. Much of it is still being explored, and could change completely or be dropped.             |
| Emerging     | 25%  | Alpha     | Taking shape. Some of it works, but much is still changing often, so expect bugs and breaking changes. |
| Promising    | 50%  | Beta      | Firming up. Enough of it is settled or stable for real use, while other parts are still changing.      |
| Established  | 75%  | GA        | Well established. Most of it is stable and supported, while any newer parts settle in.                 |

A band is about the whole, so it never says what every part is: a few
established capabilities can carry a feature into a higher band.

A **domain's maturity** is the weighted average of its parts of features'
maturities, worked out the same way:

- **Its part of a feature** is the capabilities in that feature that the domain
  builds, at their levels in that domain. Its maturity is worked out as a
  feature's is, from those levels alone, so a capability that spans domains
  counts once in each, at that domain's level.
- **Each part counts as a capability in its band would,** so an Established
  part counts for a lot and an Experimental one for little, however many
  capabilities it has.
- **Parts with no maturity don't count.**
- **A domain with no part that has a maturity has none.**

In the hotel example, Guest stays has Reservations (42%, Emerging), which
weighs 3, and Front desk (84%, Established), which weighs 6, so it's (42 × 3 +
84 × 6) ÷ (3 + 6) = 630 ÷ 9 = 70%, Promising. Property has only Housekeeping,
so it's 15%, Experimental. A feature's maturity counts every domain's part:
shown with Hotel Billing, Front desk has check-out at GA in Guest stays and at
Alpha in Billing.

A **project's maturity** is worked out the same way from its parts of
features: each feature's part in each domain the project works in, as the
project declares it. Hotel Bookings has Reservations (42%), Front desk (84%)
and Housekeeping (15%), so it's (42 × 3 + 84 × 6 + 15 × 2) ÷ (3 + 6 + 2) =
660 ÷ 11 = 60%, Promising. Several projects shown together have a maturity
too, worked out from all their parts the same way, as if they were one
project. Showing only some projects works out each feature's and domain's
maturity from the capabilities those projects declare.

Maturity isn't a finish line, and 100% isn't the goal. It means everything
under way is GA. Software that keeps growing usually has newer parts settling
in, and stays Established as it does.

### Readiness

A persona has a **readiness** instead of a maturity: how ready the software is
for them, from the maturity of what they need. What they need is every
capability that lists them, so their readiness is worked out as a feature's
maturity is, from those capabilities' levels in each domain that builds part of
them. In Hotel Bookings, the front desk clerk has room booking and check-in at
Beta, cancellations at Alpha, check-out at GA, and group bookings and room
status at Prototype, so they're (60 × 4 × 2 + 35 × 3 + 100 × 6 + 15 × 2 × 2) ÷
(4 × 2 + 3 + 6 + 2 × 2) = 1245 ÷ 21 ≈ 59% ready.

- **A feature's readiness for a persona** is worked out the same way, from just
  the capabilities in it that serve them. Front desk is 84% mature, and 84%
  ready for the front desk clerk, since both its capabilities serve them.
- **A persona no capability lists has no readiness.**
- **Readiness counts toward nothing else.** A domain's or project's maturity
  comes from its features, never from personas.

Readiness has its own scale, so it's never mistaken for maturity, though it's
worked out from it. It's a quarter of the scale each, as maturity's bands are,
with names of its own, and readers show it as a straight bar, not as a ring in
a level's color:

| Readiness     | From | What it tells you                                                       |
| ------------- | ---- | ----------------------------------------------------------------------- |
| Not ready yet | 0%   | Most of what they need is still being explored.                         |
| Partly ready  | 25%  | Some of it works, but much of what they need is still taking shape.     |
| Mostly ready  | 50%  | Enough is settled or stable for them to rely on day to day.             |
| Ready         | 75%  | What they need is mostly stable and supported.                          |

## Evidence

A rule or a capability can have **evidence**: places in the repository that
say they verify it, or implement it. Evidence is optional at every level, and
there's no limit to how much there is. Docket doesn't care what a place is,
whether a test, code, a migration or anything else, or what language or
framework it's in, and it doesn't run anything. It shows where the evidence
is, so a reader can go from a rule or capability to what's about it.

A place gives evidence with an annotation, written in a comment, the same in
every language:

```text
docket:<verb> <type>:<id> [<type>:<id> ...]
```

- **`<verb>`** is the kind of evidence, `verifies` or `implements`.
  - **`verifies`** says this place checks that the rule holds, or that the
    capability works, such as
    [a unit test](examples/hotel-bookings/src/booking/stay.test.ts) or
    [a Gherkin `Rule:`](examples/hotel-bookings/features/booking.feature).
  - **`implements`** says this place makes it so, such as
    [`assertRoomFree`](examples/hotel-bookings/src/booking/availability.ts), or
    the [constraint](examples/hotel-bookings/db/migrations/001_bookings.sql)
    in a database migration.
- **`<type>`** is `rule` or `capability`. An annotation can name several,
  of either type:
  `docket:verifies capability:deposits rule:payments/deposit-counts-towards-the-bill`.

```ts
// docket:verifies rule:booking/minimum-stay
it("rejects a stay that ends the day it starts", () => {
```

```gherkin
  # docket:verifies rule:booking/no-double-booking
  Rule: A room can't be double-booked
```

- **The indexer doesn't parse anything.** It looks for `docket:verifies` and
  `docket:implements` in every file in the repository outside `docs/product/`,
  in whatever comment syntax the file uses.
- **An annotation is on the first line below it** that isn't blank or another
  annotation. The indexer records the file, the annotation's line, and that
  line's text as written, every time it runs. Nobody writes a line number
  down, and readers can tell what it's on without knowing the language.
- **Readers point out what has none.** A rule or capability with nothing
  verifying it, or nothing implementing it, shows a warning where that
  evidence would be. It's a prompt, not a problem: nothing requires evidence.

Annotations are claims. The indexer catches one that names a rule or
capability that doesn't exist. It can't catch a missing annotation, or one
left behind on something that's no longer about what it names.

## Config

[`docket.yaml`](examples/hotel-bookings/docket.yaml) at the repository root
marks the repository as a Docket **project**: a place where software is
defined, and usually implemented.

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
```

- **`project`** is metadata, not a boundary: it says where each doc comes
  from, so readers can see who said what and show only what some projects
  define.
  - **`id`** names the project wherever several are shown together, so it's
    unique among them. It's lowercase, with hyphens, like a doc's ID.
  - **`name`** is what people see, named for the software: Hotel Bookings,
    not Guest stays.

A doc's domain is the folder under `docs/product/domains/` it's in, so
nothing in a doc says it. Moving a doc to another folder moves it. Both hotel examples work
in two domains each.

## Domains

A **domain** is a part of the business with a language of its own: a business
area and a bounded context, in domain-driven design's terms, as one. Every doc
but a persona is written in exactly one domain, the one whose folder it's in.
A project works in as many domains as it has folders under
`docs/product/domains/`, and projects
that work in the same part of the business use the same domain ID.

A domain's `domain.md` gives its name and summary, and anything worth saying
about it:

```markdown
# Guest stays

Looking after guests from their booking to their check-out.
```

Booking is "a guest's hold on one room for a stay" in Guest stays, and "what a
guest is charged for a stay" in Billing, and both are right.

Every project contributes what it knows to one picture of the product. How a doc
is put together with others of the same ID depends on its type:

| Type | Is one across | The same ID elsewhere |
| --- | --- | --- |
| domain, feature, capability, persona | everything | A contribution to the same one. Its links are put together, and its name and summary should match. |
| rule, concept | its domain | Another definition, shown beside this one. Within the same domain, it's a contribution, as above. |

Putting contributions together:

- **Features and capabilities span domains.** A feature or capability written
  in several domains is in each of them. Each domain's part is the
  capabilities that domain builds.
- **Links are combined**: a feature's capabilities, a capability's personas,
  rules, concepts, code and gaps, and a rule's or capability's evidence. Each
  contribution's order is kept, in the order the projects are read.
- **A body is each contribution's own.** Readers show each, labelled with its
  project and domain.
- **A capability's `stability` is per domain.** Each contribution declares the
  level of its own part. Where they differ, the capability's level in short is
  the lowest, and readers show each.

### Which rule or concept a link means

A capability's or rule's link to a rule or concept means, in order:

1. The one named, when the link says `@<domain>`.
2. Its own domain's.
3. The only one with that ID, when just one domain has it.

Otherwise the link is ambiguous: two or more domains have that ID, and neither
is the link's own. That's a problem, and the link names its domain to fix it.

In the examples, Billing's check-out uses `booking`, and gets Billing's
definition, since that's its own domain's. Were Billing to have no `booking`,
it would get Guest stays', the only one. An annotation in code resolves the
same way, from the domains of the repository it's in.

### Contradictions

Two contributions that should agree and don't are a **contradiction**, shown
as a problem naming the projects involved:

- **A domain's, feature's, capability's or persona's name or summary
  differs** between projects.
- **A capability is in two features**, whichever projects list them.
- **A rule or concept differs within one domain**, when more than one project
  declares it there.

A feature or capability in several domains isn't a contradiction, and neither
are different levels for a capability, or different definitions of a concept
in different domains.

In the examples, Hotel Billing writes check-out in Billing, the settling of the
bill, and its summary isn't Hotel Bookings': that's a contradiction. It puts
check-out in Front desk, as Hotel Bookings does, so Front desk is one feature
in two domains, Guest stays and Billing, with check-out in both. Check-out is
GA in Guest stays and Alpha in Billing, so it's Alpha in short.

### Combining

Each project's `state.json` is indexed from its own repository, so it only
knows its own contributions. Showing several projects together **combines**
their states:

1. Put each doc's contributions together by type and ID, as above.
2. Resolve links to rules and concepts across every domain showing.
3. Work out the reverse links, maturity and bands again across everything.
   A capability counts once per domain that builds part of it, at that
   domain's level, since each part is work under way.
4. Add the problems combining finds: contradictions and ambiguous links. Drop
   an `unknown-id` problem when the link resolves to another project's doc.

## Index output

`docket index` writes `.docket/state.json` ([example](examples/hotel-bookings/.docket/state.json)).
It holds everything the UI shows, so the UI never reads the repository itself,
and showing several projects together means reading each one's state.json.

- **Header**: the `project` (its ID and name), and the commit indexed.
- **`summary`**: the project's maturity and band, how many domains and
  features there are, capabilities per level, how many rules, how many gaps
  and how many problems. This is the
  at-a-glance view.
- **`domains`**: each of the project's `domain.md` files, with the domain's
  maturity worked out from what this project declares in it.
- **`features`**: each with its capabilities and its maturity worked out. Each
  capability names the feature it's in, or `null`.
- **`personas`**: each with the capabilities that list them, the features
  those are in, and their `readiness` worked out. Personas aren't in a domain, so
  these have no `domain`.
- **One list per doc type**: each entry has its ID, its `domain`, file, name,
  summary and links, in both directions, and its body as Markdown: everything
  after the title and summary. A doc declared in two of the project's domains
  has an entry for each. Links are written as declared,
  with `@<domain>` where the doc named one.
- **Evidence**: each rule's and capability's entry also has `evidence`, with
  `verifies` and `implements` lists of each place's `file`, `line` and
  `text`, as [Evidence](#evidence) describes. Both are empty when it has none.
- **`gaps`**: every gap from every capability, each with its `domain`, and
  the checklist `item` it names, or `null`.
- **`problems`**: everything the indexer found wrong, each about a doc with
  that doc's `domain`.
- **`checklist`**: the stability checklist the project was indexed against,
  so the UI can show it beside each capability. It's the YAML's groups, areas
  and items, with each item's full `<area>/<item>` ID, `until` as `null` where
  it has none, and `baseline` as `true` or `false`.

### Problems

| Type                   | Raised when                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `unknown-id`           | A link or annotation names a doc that doesn't exist.           |
| `invalid-frontmatter`  | A required field is missing, or a value isn't allowed.         |
| `code-matches-nothing` | A `code` glob matches no files.                                |
| `broken-link`          | A relative link in a doc's body doesn't resolve.               |
| `unlinked-rule`        | No capability follows a rule.                                  |
| `in-two-features`      | More than one feature lists the same capability.               |
| `contradiction`        | Contributions that should agree don't, as Domains describes.   |
| `ambiguous-link`       | A link could mean the rule or concept of two or more domains.  |
| `unknown-item`         | A gap's `item` isn't in the stability checklist.               |
| `baseline-gap`         | A gap's `item` is a baseline item, which is never a known gap. |

`in-two-features` is a contradiction too, when the listings
are in different projects. Combining raises `contradiction` and
`ambiguous-link`, and those.

## Open decisions

- **The stability checklist is fixed.** It becomes configurable once someone
  adopting Docket needs different items.
- **Met is assumed.** An item counts as met unless a gap names it, so nothing
  says which items someone actually looked at, and an item added to the
  checklist counts as met everywhere at once. A record of when someone last
  went through the list, and against which version of it, would show both.
  Items not applicable, with why, items Docket can work out itself, such as
  `tests/main-path-automated` from its rules' evidence, and items a whole
  project meets, such as CI, would also make met mean more.
