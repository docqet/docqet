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
  desk, a feature that's mostly Guest stays'. Both are part of the Hotel
  platform.

## Principles

- **The repo is the source of truth.** Everything is declared in the
  repository or derived from it.
- **Declared vs. derived.** People and agents write the declared parts:
  stability, rules, open decisions, gaps, tradeoffs and links. The indexer
  computes the derived parts: maturity, readiness, evidence, reverse links and
  problems. Readers work out what depends on other projects, such as when a
  gap is due. Nobody edits derived state by hand.
- **Intention about the product, and about how it's built.** Product docs say
  what the software does, in the domain's words, and never name its
  implementation. Technical docs say how it's meant to be built, in the
  code's words, and link to the product, never the other way.
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
└── technical/
    ├── systems/<slug>.md                how something overarching is built
    └── components/<slug>.md             how one area of the code is built
<code and tests, anywhere>               docket:implements, verifies, gap and tradeoff comments
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
- A capability can be a draft: declared, with no work started.
- A gap has `until` instead of a kind, and a tradeoff is a list of its own,
  with its cost. A feature can have tradeoffs and open decisions, and a
  domain open decisions.

Technical docs are forge's `engineering-docs` layout, with these changes:

- `docs/engineering/` is `docs/technical/`, to say what the docs hold, how
  the software is meant to be built, rather than who writes them.
- `architecture/systems/` is `systems/`, and `architecture/features/` is
  `components/`, since a feature is a job the product does in Docket.
- Links, gaps and tradeoffs are frontmatter, not sections. How it works,
  Gotchas and Open decisions stay prose in the body.
- A gap's `Until` is `until`, and a tradeoff's `Costs` and `Revisit when` are
  `cost` and `revisit`.
- A system or component can say which checklist outcomes it meets.
- Providers and runbooks aren't read. A repository can keep them anywhere.

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
| system     | `docs/technical/systems/`                     | `deployment`                |
| component  | `docs/technical/components/`                  | `bookings`                  |

- **IDs, links and values are kebab case**: lowercase words joined by
  hyphens, such as `room-booking`, `not-decided` or `ga`.
  Tools show values with their own labels, such as GA for `ga`.
- **No `id:` field.** The path is the ID, so there's nothing to drift. Renaming
  a file renames the doc, and the indexer reports every link and annotation the
  rename left dangling.
- **Where the type isn't obvious, the ID carries it**, as `<type>:<id>`, such
  as `rule:booking/no-double-booking` in an annotation or a problem's
  `subject` in `state.json`. In frontmatter the field name gives the
  type, so links there are bare: `rules: [booking/no-double-booking]`.
- **A gap's or tradeoff's ID** is its doc's ID plus its key:
  `capability:room-booking#calendar-needs-a-mouse`,
  `feature:reservations#front-desk-bookings-only` or
  `system:ledger#balance-worked-out-on-read`.
- **What an ID names depends on the type** (see [Domains](#domains)). A
  domain, feature, capability, persona, system or component ID names one
  thing across every project. A rule or concept ID names one definition
  within a domain.
- **A link to another domain's rule or concept** adds `@<domain>`:
  `concepts: [booking@guest-stays]`, or
  `docket:verifies rule:bills/closed-bills-dont-change@billing`.

## Doc types

Every doc starts with its frontmatter, if it has any, then a `#` title, which
is its name. The paragraph under the title is its summary. The UI shows both.

| Type | Frontmatter | Body | Example |
| --- | --- | --- | --- |
| domain | none | Anything worth saying about the part of the business, as prose; Open decisions | [guest-stays](examples/hotel-bookings/docs/product/domains/guest-stays/domain.md) |
| feature | `capabilities` (required), `tradeoffs` | Anything worth saying about the job, as prose; Open decisions | [reservations](examples/hotel-bookings/docs/product/domains/guest-stays/features/reservations.md) |
| capability | `stability` (required), `personas`, `rules`, `concepts`, `code`, `gaps`, `tradeoffs` | Covers, Learning, Success, Open decisions | [room-booking](examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/room-booking.md) |
| rule | `concepts` | The rule, Why | [same-day-turnover](examples/hotel-bookings/docs/product/domains/guest-stays/rules/booking/same-day-turnover.md) |
| concept | none | Details, Lifecycle, Not to be confused with | [booking](examples/hotel-bookings/docs/product/domains/guest-stays/concepts/booking.md) |
| persona | `image` (required) | Needs, Knows, Context, Expects, Cares about | [front-desk-clerk](examples/hotel-bookings/docs/product/personas/front-desk-clerk.md) |
| system | `capabilities`, `code`, `meets`, `gaps`, `tradeoffs` | A `**Code:**` line, How it works, Gotchas, Open decisions | [ledger](examples/hotel-billing/docs/technical/systems/ledger.md) |
| component | `capabilities`, `code`, `meets`, `gaps`, `tradeoffs` | A `**Code:**` line, How it works, Gotchas, Open decisions | [bookings](examples/hotel-bookings/docs/technical/components/bookings.md) |

- **`stability`** is `draft`, `prototype`, `alpha`, `beta` or `ga`, which
  tools show as Draft, Prototype, Alpha, Beta and GA. Only capabilities have
  one. A feature's maturity is worked out from its capabilities' levels, and a
  domain's from its parts of features (see
  [Features and maturity](#features-and-maturity)).
- **`code`** is a list of path globs for where it lives. What verifies or
  implements it is found through [annotations](#evidence) instead.
- **`personas`** lists the personas a capability serves: who does it, or who
  it's done for when the software does it.
- **`capabilities`** on a system or component lists the capabilities that rely
  on it. It's the only link between the technical docs and the product.
- **`meets`** lists the [stability checklist](#stability-checklist) outcomes a
  system or component meets for the capabilities it lists, as
  `<quality>/<level>/<id>`. Its evidence is the proof.
- **Open decisions** is a body section on a domain, feature, capability,
  system or component: a list of questions, each led by a bold topic. A
  question sits where its answer will go: on a domain when it'll be a rule or
  concept, on a feature when it'll add a capability or rule one out, on a
  capability when it'll change what it does, and on a system or component when
  it'll be a tradeoff.
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
- **What's missing for now** is a gap: "the room calendar can't be used from
  the keyboard".
- **What's limited by choice** is a tradeoff: "a booking holds one room, not
  several".
- **A whole result it doesn't produce yet** is another capability, as a draft
  until work starts on it: the waitlist, beside room booking.

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

### Systems and components

A system or component says how part of the software is built, in the code's
words, for the engineer or agent about to change it. A **system** is
something overarching that several features rely on, such as Hotel Billing's
[ledger](examples/hotel-billing/docs/technical/systems/ledger.md) or Hotel
Bookings' [deployment](examples/hotel-bookings/docs/technical/systems/deployment.md).
A **component** is one area of the code, named as the code names it, such as
Hotel Bookings' [bookings](examples/hotel-bookings/docs/technical/components/bookings.md).

```yaml
---
capabilities: [extra-charges, split-bills, deposits, check-out, direct-billing]
code: [src/ledger/**]
meets: [reliability/beta/data-kept]
gaps:
  - id: corrections-of-corrections-untested
    until: extra-charges@ga
    outcome: maintainability/ga/others-can-change
    text: >-
      Nothing tests correcting a line that is itself a correction, so a change
      to `correct` could stop a twice-corrected charge netting to zero without
      anything failing.
tradeoffs:
  - id: balance-worked-out-on-read
    text: >-
      A bill's balance is added up from its lines every time it's asked for,
      not stored on the bill.
    cost: Opening a bill gets slower as lines are added to it.
    revisit: a bill passes 1,000 lines
---

# Ledger

Every amount a guest owes or pays, as lines on their bill that are only ever
added, never changed.

**Code:** `src/ledger/ledger.ts`, starting at `post`
```

- **Only what the code can't say.** Leave out what a competent reader learns
  from the code in a few minutes, such as lists of endpoints, tables or
  functions. Most code has no doc.
- **No stability level, and no domain.** One doc can serve capabilities at
  different levels, and it's written in the code's words. The same ID in
  several projects is contributions to one, as for a feature.
- **Its body** is a `**Code:**` line saying where to start reading, How it
  works, Gotchas (what's correct but will surprise whoever changes it) and Open
  decisions, each only where there's something to say.

## Links

Every link points one way and is written once:

```text
feature                    → capabilities
capability                 → personas, rules, concepts, code
rule                       → concepts
gap                        → an outcome, a rule        (outcome, rule)
system, component          → capabilities, code, outcomes (meets)
annotation                 → rules, capabilities, systems, components    (docket:verifies, docket:implements)
                           → gaps, tradeoffs           (docket:gap, docket:tradeoff)
```

The indexer computes the other direction, such as which capabilities a rule
applies to, which feature a capability is in, which domains a feature spans,
or which systems a capability relies on, so the UI can show both sides.
Product docs never link to technical docs.

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

## Gaps and tradeoffs

Gaps and tradeoffs live in frontmatter, so the UI can count and group them.
Each has a key that's unique within its doc, and is recorded in exactly one
place: the doc it's about.

| Declared on | Gaps | Tradeoffs |
| --- | --- | --- |
| Capability | What someone using the product would notice | Limits it has by choice |
| Feature | None: a capability it lacks is a draft capability | Non-goals: capabilities we've decided never to build |
| System or component | What only someone working on the code would notice | Technical choices |

Domains, rules, concepts and personas have neither. A limit across a whole
domain is a rule, or a tradeoff on the system that causes it. When a gap has a
visible effect and a technical cause, the effect is the capability's gap, and
the cause is a gotcha in the technical doc.

### Gaps

A **gap** is something we intend to close. It has an `id`, `until`, a sentence
or two of `text`, and optionally the `outcome` or `rule` it falls short of:

```yaml
gaps:
  - id: calendar-needs-a-mouse
    until: ga
    outcome: usability/beta/everyone
    text: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
```

- **`until`** says when it's to close, as one of:
  - a level, such as `beta`: before the capability it's on reaches it. On a
    system or component, before any capability it serves reaches it, since
    the strictest applies.
  - `<capability>@<level>`, on a system or component, for one capability it
    serves: `until: extra-charges@ga`.
  - `not-decided`, so nobody invents a trigger.
  - anything else, as an event in words: `until: the second server is added`.
- **`outcome`** names the [stability checklist](#stability-checklist) outcome
  it falls short of, as `<quality>/<level>/<id>`. Most gaps are limits on what
  the capability does and match none. A gap can't name a baseline outcome,
  since the security and privacy baseline is never a known gap.
- **`rule`** names a rule the capability follows but doesn't hold to yet.
  Readers show it on the rule too:

```yaml
gaps:
  - id: children-corrected-by-hand
    until: beta
    rule: tax/children-pay-no-city-tax
    text: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
```

Readers work out when each gap is **due**, from its `until` and the levels of
the capabilities it affects. It isn't in `state.json`, since those levels can
come from another project:

| Due | When |
| --- | --- |
| Due | The capability is already at the `until` level, or past it, so its level expects the gap closed |
| Before the next level | `until` is the capability's next level |
| Later | `until` is a level further on |
| When … | `until` is an event |
| Not decided | `until` is `not-decided` |

A gap on a system or component takes the most pressing of the capabilities it
serves, each at the level of the part its own project builds, since that's the
part it serves. Check-out is GA in Hotel Bookings and Alpha in Hotel Billing,
so Hotel Bookings' deployment gap, `until: ga`, is due. A draft has no level,
so nothing on it is due.

### Tradeoffs

A **tradeoff** is something we chose over an alternative and decided to live
with. It has an `id`, `text` saying what we chose and not what, its `cost`,
and optionally `revisit`, a concrete trigger to look at it again. One we expect
to keep forever leaves `revisit` off:

```yaml
tradeoffs:
  - id: front-desk-bookings-only
    text: >-
      Bookings are taken at the front desk, not from online travel agencies.
    cost: >-
      Clerks enter each agency booking by hand, as it arrives by email.
    revisit: agency bookings pass a fifth of all bookings
```

A gap we decide never to close becomes a tradeoff, with its cost. Neither a
gap nor a tradeoff can excuse the security and privacy baseline.

## Stability levels

Every capability that's been started is at one of four stability levels. The
level says how stable the work is right now, so people know what they can rely
on before they rely on it.

A capability declared but not started is a **draft**, `stability: draft`, such
as the [waitlist](examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/waitlist.md)
or [refunds](examples/hotel-billing/docs/product/domains/billing/capabilities/refunds.md).
It isn't a level: it promises nothing, claims nothing on the checklist, and
counts toward no maturity or readiness. Readers show it as the word Draft,
with no level's mark.

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

A stability level says in one word how stable something is.
[`stability/checklist.yml`](stability/checklist.yml) describes what each level
generally means and expects, so the people depending on a capability and the
people and agents building it share the same picture of it. It's part of the
spec, so it's the same for every project and every tool that reads Docket: a
project doesn't copy it, change it or configure it.

It's a guideline, not a gate:

- **Not every box needs checking.** Work can be called a level, GA included,
  with outcomes unmet. What's unmet is written down as a known gap, so
  everyone can see it.
- **It doesn't replace engineering judgment.** The engineer decides what fits
  the work, and judgment about the work wins over the wording of any outcome.
- **It applies differently to every project.** What an outcome takes, and
  whether it applies at all, depends on the software, who uses it, and the
  circumstances.

The one exception is the security and privacy baseline, which holds at every
level and is never a known gap.

It has ten qualities, each a question someone asks before depending on the
work. Lower levels ask for little, enough to learn whether the work is worth
doing, and each level adds to the ones below it as more people come to rely on
the work:

| Quality         | The question it answers                                       |
| --------------- | ------------------------------------------------------------- |
| Utility         | Is it worth building, and is this the right way to build it?  |
| Usability       | Can its users learn and use it on their own?                  |
| Functionality   | Does it do what it should, and keep doing it?                 |
| Reliability     | Does it keep working when something goes wrong?               |
| Efficiency      | Is it fast enough, at a cost that makes sense?                |
| Security        | Is it protected, and does it follow the rules?                |
| Compatibility   | Does it fit with what's around it?                            |
| Observability   | When something goes wrong, does someone find out and see why? |
| Maintainability | Is it easy to understand and change?                          |
| Supportability  | Who's responsible, and where do people turn?                  |

They draw on ISO/IEC 25010, Kubernetes' feature graduation and production
readiness review, Google's SRE practice, AWS Well-Architected and FURPS+.
Practices and artifacts, such as tests, docs, logs and CI, aren't qualities:
they're ways a quality might be met, so they appear in `implementation`.

Each quality has a `question`, `why` it matters, and an entry for every level:

- **`summary`** says in a sentence how much that level asks of the quality. An
  entry without one expects nothing at that level. Efficiency, for example,
  expects nothing before Beta.
- **`outcomes`** are what should be true of the work at that level, each
  something someone can call met or not, worded to fit any kind of software,
  from a web app to a CLI, an HTTP API, a background job or a library.

Each outcome has two lists of examples, to help judge how to meet it at that
level, or whether to at all. They're illustrations, not instructions,
requirements or complete lists:

- **`implementation`** is how meeting it might look, which tools show as "How
  it might look". There are other ways to meet it.
- **`overengineering`** is work that may be overengineering at that level. It
  may be in scope at another level, or never needed for the project at all,
  so it isn't a to-do list for the next level. It's there to help judge where
  a level's work stops.

An example is its text alone, or its `text` and `kinds`: the kinds of software
it may suit, from the file's `kinds` list: web app, mobile app, desktop app,
HTTP API, CLI, background job and library. Kinds are indications, not rules: a
project can be several kinds, an untagged example may not suit it, and one
tagged for another kind may suit it well.

An entry without outcomes can still have `implementation` and
`overengineering`, for what work on the quality might look like at that level.

How outcomes combine:

- **An outcome that applies is met unless a gap names it.** Declaring a level
  claims what that level expects, except the gaps written down, so only what
  isn't met is recorded. An outcome that doesn't apply, such as accessibility
  for an API with no screens, counts as met too.
- **Each outcome a capability's level expects has a standing:** not met, when
  a gap on the capability, or on a system or component it relies on, names it;
  met with evidence, when a system or component it relies on `meets` it; or
  met on trust, when nothing names it. A gap wins over `meets`.
- **An outcome's ID** is its quality, level and own ID, as
  `<quality>/<level>/<id>`: `reliability/beta/data-kept`.
- **A level includes every outcome the levels below it expect,** unless
  `until` names the last level an outcome applies to.
  `compatibility/prototype/opt-in`, which keeps it to those who chose to try
  it, applies through Alpha, and Beta's normal release replaces it.
- **`baseline` outcomes,** Security's at Prototype, are the security and
  privacy baseline. They hold at every level, and are never a known gap.

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
never shows as more mature than it is. Drafts are left out, since no work has
started on them. A feature with no capabilities but drafts has no maturity.

For example, Reservations has room booking at Beta, cancellations at Alpha,
group bookings at Prototype, and the waitlist as a draft, so its maturity is
(60 × 4 + 35 × 3 + 15 × 2) ÷ (4 + 3 + 2) = 375 ÷ 9 ≈ 42%. Without group bookings it would be 345 ÷ 7 ≈ 49%.
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
them, drafts left out. In Hotel Bookings, the front desk clerk has room booking
and check-in at Beta, cancellations at Alpha, check-out at GA, group bookings
and room status at Prototype, and the waitlist as a draft, so they're (60 × 4 × 2 + 35 × 3 + 100 × 6 + 15 × 2 × 2) ÷
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

A rule, capability, system or component can have **evidence**: places in the
repository that say they verify it, or implement it. Evidence is optional at
every level, and there's no limit to how much there is. Docket doesn't care
what a place is, whether a test, code, a migration, a workflow or anything
else, or what language or framework it's in, and it doesn't run anything. It
shows where the evidence is, so a reader can go from what's intended to
what's about it.

A place gives evidence, or marks a gap or tradeoff, with an annotation,
written in a comment, the same in every language:

```text
docket:<verb> <type>:<id> [<type>:<id> ...]
```

- **`<verb>`** is one of four:
  - **`verifies`** says this place checks that the rule holds, the capability
    works, or the system or component does what it says, such as
    [a unit test](examples/hotel-bookings/src/booking/stay.test.ts),
    [a Gherkin `Rule:`](examples/hotel-bookings/features/booking.feature) or
    [the rollback job](examples/hotel-bookings/.github/workflows/deploy.yml)
    in a deploy workflow.
  - **`implements`** says this place makes it so, such as
    [`assertRoomFree`](examples/hotel-bookings/src/booking/availability.ts), or
    the [constraint](examples/hotel-bookings/db/migrations/001_bookings.sql)
    in a database migration.
  - **`gap`** says this is where a gap shows in the code: tracked technical
    debt, in place of a bare TODO.
  - **`tradeoff`** says this code is deliberate, though it may look wrong, so
    nobody "fixes" it.
- **`<type>:<id>`** is a `rule`, `capability`, `system` or `component` for
  `verifies` and `implements`, and a gap's or tradeoff's ID for `gap` and
  `tradeoff`. An annotation can name several, of any of its types:
  `docket:implements capability:room-booking component:bookings`.

```ts
// docket:verifies rule:booking/minimum-stay
it("rejects a stay that ends the day it starts", () => {
```

```gherkin
  # docket:verifies rule:booking/no-double-booking
  Rule: A room can't be double-booked
```

```ts
// docket:tradeoff system:ledger#balance-worked-out-on-read
export function balance(bill: Bill): number {
```

- **The indexer doesn't parse anything.** It looks for the four verbs in every
  file in the repository outside `docs/`, in whatever comment syntax the file
  uses.
- **An annotation is on the first line below it** that isn't blank or another
  annotation. The indexer records the file, the annotation's line, and that
  line's text as written, every time it runs. Nobody writes a line number
  down, and readers can tell what it's on without knowing the language.
- **Readers point out what has none.** A rule or capability with nothing
  verifying it, or nothing implementing it, shows a warning where that
  evidence would be. It's a prompt, not a problem: nothing requires evidence.
  A gap or tradeoff with no annotation is fine.
- **A system's or component's evidence** is also the evidence for the
  checklist outcomes it `meets`.

Annotations are claims. The indexer catches one that names something that
doesn't exist, such as a gap left behind after it closed. It can't catch a
missing annotation, or one left behind on something that's no longer about
what it names.

## Config

[`docket.yaml`](examples/hotel-bookings/docket.yaml) at the repository root
marks the repository as a Docket **project**: a place where software is
defined, and usually implemented.

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
platform:
  id: hotel
  name: Hotel
```

- **`project`** is metadata, not a boundary: it says where each doc comes
  from, so readers can see who said what and show only what some projects
  define.
  - **`id`** names the project wherever several are shown together, so it's
    unique among them. It's lowercase, with hyphens, like a doc's ID.
  - **`name`** is what people see, named for the software: Hotel Bookings,
    not Guest stays.
- **`platform`**, optional, says which **platform** the project is part of:
  the projects that make up one product together, such as its web, mobile and
  desktop apps, or the services behind it. Projects with the same platform
  `id` are shown together and their docs combined; projects on different
  platforms never are. A project that names no platform is a platform of its
  own.
  - **`id`** is lowercase, with hyphens, and the same in every project on the
    platform.
  - **`name`** is what people see, named for the product: Hotel, not Hotel
    Bookings. Every project on the platform should give the same one; readers
    use the first project's.

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
| domain, feature, capability, persona, system, component | everything | A contribution to the same one. Its links are put together, and its name and summary should match. |
| rule, concept | its domain | Another definition, shown beside this one. Within the same domain, it's a contribution, as above. |

Putting contributions together:

- **Features and capabilities span domains.** A feature or capability written
  in several domains is in each of them. Each domain's part is the
  capabilities that domain builds.
- **Links are combined**: a feature's capabilities and tradeoffs, a
  capability's personas, rules, concepts, code, gaps and tradeoffs, a system's
  or component's capabilities, code, outcomes, gaps and tradeoffs, and
  everything's evidence. Each
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

- **A domain's, feature's, capability's, persona's, system's or component's
  name or summary differs** between projects.
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
knows its own contributions. Showing several projects of one platform
together **combines** their states. Projects on different platforms are never
combined, since they're different products and the same ID can mean
different things in each:

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

- **Header**: the `project` (its ID and name), its `platform` (ID and name)
  when `docket.yaml` declares one, and the commit indexed.
- **`summary`**: the project's maturity and band, how many domains and
  features there are, capabilities per level with `draft` among them, how
  many rules, gaps, tradeoffs, systems, components and problems. This is the
  at-a-glance view.
- **`domains`**: each of the project's `domain.md` files, with the domain's
  maturity worked out from what this project declares in it.
- **`features`**: each with its capabilities, its `tradeoffs` and its
  maturity worked out. Each capability names the feature it's in, or `null`,
  and lists its `gaps` and `tradeoffs`, by ID. Its `stability` can be
  `"draft"`.
- **`personas`**: each with the capabilities that list them, the features
  those are in, and their `readiness` worked out. Personas aren't in a domain, so
  these have no `domain`.
- **One list per doc type**: each entry has its ID, its `domain`, file, name,
  summary and links, in both directions, and its body as Markdown: everything
  after the title and summary. A doc declared in two of the project's domains
  has an entry for each. Links are written as declared,
  with `@<domain>` where the doc named one.
- **`systems`** and **`components`**: each with its ID, file, name, summary,
  `capabilities`, `code` with how many files each glob matches, `meets`, its
  `gaps` and `tradeoffs` by ID, its `evidence`, and its body. They're in no
  domain, so they have no `domain`.
- **Evidence**: each rule's, capability's, system's and component's entry also
  has `evidence`, with `verifies` and `implements` lists of each place's
  `file`, `line` and `text`, as [Evidence](#evidence) describes. Both are
  empty when it has none.
- **`gaps`**: every gap from every doc, each with its ID, its `domain` when
  it's a capability's, `until` as written, the `outcome` and `rule` it names
  or `null`, its `text`, and `places`: where `docket:gap` annotations mark it,
  in the same shape as evidence. When it's due isn't stored: readers work it
  out, since it depends on levels another project may declare.
- **`tradeoffs`**: every tradeoff from every doc, each with its ID, its
  `domain` when it's a feature's or capability's, `text`, `cost`, `revisit` or
  `null`, and `places`, from `docket:tradeoff` annotations.
- **`problems`**: everything the indexer found wrong, each about a doc with
  that doc's `domain`.
- **`checklist`**: the stability checklist the project was indexed against, so
  the UI can show it beside each capability. It's the YAML's `kinds`, and its
  `qualities`, each with its `levels` as a list in level order. Each level has
  its `level`, `summary` as `null` where it has none, and its `outcomes`,
  `implementation` and `overengineering`, each a list, empty where it has
  none. Each outcome has its full `<quality>/<level>/<id>` ID, its `level`,
  `text`, `until` as `null` where it has none, `baseline` as `true` or
  `false`, and its own `implementation` and `overengineering`. Every example
  in either is its `text` and `kinds`, with `kinds` empty where it isn't
  tagged.

### Problems

| Type                   | Raised when                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `unknown-id`           | A link, annotation, `until` or `rule` names a doc, gap or tradeoff that doesn't exist. |
| `invalid-frontmatter`  | A required field is missing, or a value isn't allowed.                                 |
| `code-matches-nothing` | A `code` glob matches no files.                                                        |
| `broken-link`          | A relative link in a doc's body doesn't resolve.                                       |
| `unlinked-rule`        | No capability follows a rule.                                                          |
| `in-two-features`      | More than one feature lists the same capability.                                       |
| `contradiction`        | Contributions that should agree don't, as Domains describes.                           |
| `ambiguous-link`       | A link could mean the rule or concept of two or more domains.                          |
| `unknown-outcome`      | A gap's `outcome`, or an entry in `meets`, isn't a checklist outcome.                  |
| `baseline-gap`         | A gap's `outcome` is a baseline outcome, never a known gap.                            |
| `until-not-served`     | A system's or component's gap has an `until` naming a capability it doesn't list.      |

`in-two-features` is a contradiction too, when the listings
are in different projects. Combining raises `contradiction` and
`ambiguous-link`, and those.

## Open decisions

- **The stability checklist is fixed.** It becomes configurable once someone
  adopting Docket needs different outcomes.
- **Met is mostly assumed.** An outcome counts as met unless a gap names it.
  A system or component that `meets` it adds evidence, but everything else is
  met on trust, so nothing says which outcomes someone actually looked at, and
  an outcome added to the checklist counts as met everywhere at once. A record
  of when someone last went through the list, and against which version of
  it, would show both. Outcomes not applicable, with why, and outcomes Docket
  can work out itself, such as `functionality/alpha/main-path` from its rules'
  evidence, would also make met mean more.
- **A system every capability relies on lists them all.** Deployment serves
  every capability a repository has, but `capabilities` has to name each one,
  and a new capability is easy to leave off. A way to say "every capability in
  this project" may be worth it once a project has more than a few.
