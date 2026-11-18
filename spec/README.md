# Spec

The Docket format: how a repository records the state of its software so that
people, agents and tools can all read it. The spec belongs to no particular
tool. Anyone can adopt the format or write their own indexer for it.

**Status: draft for review.** Nothing implements it yet. Each project in
[`examples/`](examples/) is laid out as its own repository root, with the
`state.json` an indexer would produce from it:

- **[`hotel-bookings`](examples/hotel-bookings/)** is a small hotel-booking app
  that uses every part of the spec, code and tests included. The examples
  below come from it.
- **[`exalynt`](examples/exalynt/)** is Exalynt's API, its docs converted from
  forge's format, to show the spec at a real project's size. Its code and
  tests stay in the API's repository, which its `code` globs and links point
  into. Its rules' acceptance tests are the scenarios their docs linked to,
  standing in for `docket:verifies` tags. With no test results, none of its
  rules is `passing`, so every rule a capability's level needs shows as a
  problem. Forge's provider docs and runbooks weren't brought over, since
  Docket doesn't read them.

## Principles

- **The repo is the source of truth.** Everything is declared in the
  repository or derived from it.
- **Declared vs. derived.** People and agents write the declared parts:
  stability, rules, gaps and links. The indexer computes the derived parts:
  coverage, test results, reverse links and problems. Nobody edits derived
  state by hand.
- **Evidence over claims.** A rule counts as enforced only when a test that
  verifies it passes on the indexed commit.
- **Frontmatter for tools, prose for people.** Each doc is Markdown. Its YAML
  frontmatter holds what a tool computes with: levels, kinds, links and gaps.
  Its body holds what people read. No fact is in both.

## What's in a repository

```text
docket.yaml                              config: project name, where test results land
docs/
├── product/
│   ├── personas/<slug>.md
│   ├── features/<slug>.md               the product's jobs, each grouping capabilities
│   ├── capabilities/<slug>.md           the only docs with a stability level
│   ├── flows/<slug>.md
│   └── domain/
│       ├── rules/<area>/<slug>.md       one rule per file, grouped by domain area
│       └── concepts/<slug>.md
└── engineering/
    └── architecture/
        ├── systems/<slug>.md
        └── components/<slug>.md
<code and tests, anywhere>               docket:implements and docket:verifies comments
.docket/state.json                       written by `docket index`, gitignored
```

This is the layout forge's `docs` and `engineering-docs` skills use today, with
these changes:

- Features are new. A feature is a job the product does, and it groups the
  capabilities that do it.
- Engineering feature docs are called components, so "feature" means only the
  product's kind.

- Frontmatter replaces bold-label lines such as `**Stability:** Alpha`.
- Rules are one per file instead of one file per area.
- A rule no longer links to its acceptance test. The test points at the rule
  instead.
- There are no provider or runbook types. A third-party service is described
  in the system or component doc that uses it. A project can keep runbooks and
  other docs anywhere under `docs/`, but Docket doesn't read them.

In the examples, `.docket/state.json` is checked in so you can read it. In a
real repository it's gitignored.

## IDs

A doc's ID is its path under its type's folder, without `.md`:

| Type       | Folder                                      | Example ID                  |
| ---------- | ------------------------------------------- | --------------------------- |
| persona    | `docs/product/personas/`                    | `front-desk-clerk`          |
| feature    | `docs/product/features/`                    | `reservations`              |
| capability | `docs/product/capabilities/`                | `room-booking`              |
| flow       | `docs/product/flows/`                       | `change-of-plans`           |
| rule       | `docs/product/domain/rules/`                | `booking/no-double-booking` |
| concept    | `docs/product/domain/concepts/`             | `booking`                   |
| system     | `docs/engineering/architecture/systems/`    | `authentication`            |
| component  | `docs/engineering/architecture/components/` | `bookings`                  |

- **No `id:` field.** The path is the ID, so there's nothing to drift. Renaming
  a file renames the doc, and the indexer reports every link and annotation the
  rename left dangling.
- **Where the type isn't obvious, the ID carries it**, as `<type>:<id>`, such
  as `rule:booking/no-double-booking` in an annotation or
  `component:bookings` in `state.json`. In frontmatter the field name gives the
  type, so links there are bare: `rules: [booking/no-double-booking]`.
- **A gap's ID** is its doc's ID plus the gap's key:
  `capability:room-booking#no-waitlist`.

## Doc types

Every doc starts with its frontmatter, if it has any, then a `#` title, which
is its name. The paragraph under the title is its summary. The UI shows both.

| Type | Frontmatter | Body | Example |
| --- | --- | --- | --- |
| feature | `capabilities` (required) | Anything worth saying about the job, as prose | [reservations](examples/hotel-bookings/docs/product/features/reservations.md) |
| capability | `stability` (required), `rules`, `concepts`, `code`, `gaps` | What people can do, Learning, Success, Open decisions | [room-booking](examples/hotel-bookings/docs/product/capabilities/room-booking.md) |
| rule | `kind` (required: `core` or `edge-case`), `concepts` | The rule, Why | [same-day-turnover](examples/hotel-bookings/docs/product/domain/rules/booking/same-day-turnover.md) |
| concept | none | Details, Lifecycle, Not to be confused with | [booking](examples/hotel-bookings/docs/product/domain/concepts/booking.md) |
| flow | `personas`, `capabilities` (required) | People, Starts when, Done when, Steps, Variations | [change-of-plans](examples/hotel-bookings/docs/product/flows/change-of-plans.md) |
| persona | none | Who, Knows, Context, Expects, Cares about, Based on | [front-desk-clerk](examples/hotel-bookings/docs/product/personas/front-desk-clerk.md) |
| system | `capabilities`, `code`, `gaps` | How it works, Tradeoffs, Gotchas, Changing it | [authorization](examples/exalynt/docs/engineering/architecture/systems/authorization.md) |
| component | `capabilities`, `code`, `systems`, `gaps` | How it works, Tradeoffs, Gotchas | [refunds](examples/hotel-bookings/docs/engineering/architecture/components/refunds.md) |

- **`stability`** is `Prototype`, `Alpha`, `Beta` or `GA`. Only capabilities
  have one. A feature's maturity is worked out from its capabilities' levels
  (see [Features and maturity](#features-and-maturity)), and an engineering doc
  serves capabilities, which may be at different levels.
- **`code`** is a list of path globs for where it lives. Tests aren't listed:
  they're found through `docket:verifies`.
- The body sections keep their meaning from forge's formats. The spec will
  carry their full descriptions once the frontmatter settles.

## Links

Every link points one way and is written once:

```text
feature                    → capabilities
flow                       → personas, capabilities
capability                 → rules, concepts, code
rule                       → concepts
system                     → capabilities, code
component                  → capabilities, systems, code
technical gap              → the capability whose level closes it
code                       → rules    (docket:implements)
test                       → rules    (docket:verifies)
```

The indexer computes the other direction, such as which capabilities a rule
applies to, which feature a capability is in, or which components use a
system, so the UI can show both sides.

### Rules belong to the domain

Rules and concepts belong to the domain, not to any capability or feature. A
capability refers to the rules it follows, and that's the only link between a
rule and the product:

- **A rule can apply to many capabilities**, in one feature or several. In the
  example, `booking/no-double-booking` applies to room booking and group
  bookings in Reservations, and to check-in in Front desk.
- **A feature has no rules of its own.** Its rules are the ones its
  capabilities follow. Features don't list rules, and `state.json` doesn't
  either: a reader works them out from the feature's capabilities.
- **A rule's `<area>` is a part of the domain**, such as `booking`, never a
  capability. A rule keeps its ID as capabilities start or stop following it.

Links in the body are ordinary relative Markdown links, for readers. The
indexer reports any that are broken, but only frontmatter and annotations count
as relationships.

## Gaps

Gaps live in frontmatter so the UI can count, group and check them. Each one
has a key that's unique within its doc, and a sentence or two of text.

**Product gaps**, in a capability: what someone using the product would notice.

```yaml
gaps:
  - id: no-waitlist
    kind: to-close-later        # or accepted-tradeoff
    text: >-
      When every room is taken there's no waitlist. Clerks note the guest's
      details outside the app and call them if a room frees up.
```

**Technical gaps**, in a system or component doc: what only someone
working on the code would see.

```yaml
gaps:
  - id: availability-loads-every-booking
    text: >-
      Checking whether a room is free loads every booking for that room and
      compares them in memory.
    until:                      # what closes it
      capability: room-booking
      reaches: GA
```

`until` is one of:

- `{ capability: <id>, reaches: <level> }`. The gap is **due** once that
  capability is at that level or above.
- A sentence describing a concrete event, such as
  `the second instance is deployed`.
- `not-decided`.

As in forge today, a gap is recorded in exactly one place. Engineering
tradeoffs stay as prose in the body.

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

### What maturity is

A feature's or a project's **maturity** says how far along it is: how close
the work under way is to being stable and supported. It's a percentage.

- **Higher means more of it is stable and supported.** 75% or more,
  Established, is healthy for most businesses.
- **New work shows on its feature.** Starting a new capability lowers that
  feature's maturity. An established project moves only a little, because
  what's already stable counts most.
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
for a level and shown in its color. Each band says how far along the feature or
project is as a whole, and what to expect from it:

| Band         | From | Level     | What it tells you                                                                                      |
| ------------ | ---- | --------- | ------------------------------------------------------------------------------------------------------ |
| Experimental | 0%   | Prototype | Early days. Much of it is still being explored, and could change completely or be dropped.             |
| Emerging     | 25%  | Alpha     | Taking shape. Some of it works, but much is still changing often, so expect bugs and breaking changes. |
| Promising    | 50%  | Beta      | Firming up. Enough of it is settled or stable for real use, while other parts are still changing.      |
| Established  | 75%  | GA        | Well established. Most of it is stable and supported, while any newer parts settle in.                 |

A band is about the whole, so it never says what every part is: a few
established capabilities can carry a feature into a higher band.

A **project's maturity** is the weighted average of its features' maturities,
worked out the same way:

- **Each feature counts as a capability in its band would,** so an Established
  feature counts for a lot and an Experimental one for little, however many
  capabilities it has.
- **Features with no maturity don't count,** and neither do capabilities in
  no feature.
- **A project with no feature that has a maturity shows none.**

In the hotel example, Reservations (42%, Emerging) weighs 3, Front desk (84%,
Established) weighs 6, and Housekeeping (15%, Experimental) weighs 2, so the
project is (42 × 3 + 84 × 6 + 15 × 2) ÷ (3 + 6 + 2) = 660 ÷ 11 = 60%,
Promising.

Maturity isn't a finish line, and 100% isn't the goal. It means everything
under way is GA. Software that keeps growing usually has newer parts settling
in, and stays Established as it does.

## Annotations

Code and tests point at rules with one comment format, the same in every
language:

```text
docket:<verb> <type>:<id> [<type>:<id> ...]
```

- **`implements`** goes on the code that enforces the rule, such as
  [`assertRoomFree`](examples/hotel-bookings/src/booking/availability.ts). It's optional at
  every level. Put it where the rule is enforced, not everywhere the rule is
  touched.
- **`verifies`** goes on a test that proves the rule, such as
  [this unit test](examples/hotel-bookings/src/booking/stay.test.ts).
- **Gherkin** uses a tag, since tags carry through to test reports:
  `@docket:verifies:rule:booking/no-double-booking` on a `Rule:` or
  `Scenario:` ([example](examples/hotel-bookings/features/booking.feature)). A tag on a `Rule:`
  covers every scenario in it.

An annotation applies to the declaration directly below it. The indexer
records the file, the line and that declaration's name every time it runs, so
nobody writes a line number down.

Annotations are claims. The indexer catches one that names a rule that doesn't
exist. It can't catch a missing annotation, or one left behind on code that no
longer enforces the rule. That's why `implementedIn` is only a pointer for
navigation, and only a passing `verifies` test counts as evidence.

## Config

[`docket.yaml`](examples/hotel-bookings/docket.yaml) at the repository root marks the repo as
using Docket:

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
results:
  - suite: acceptance
    format: cucumber-json
    path: reports/acceptance.json
  - suite: unit
    format: junit
    path: reports/unit.xml
```

Docs are always read from `docs/`. That path becomes a setting only once a
real project needs it somewhere else.

## Index output

`docket index` writes `.docket/state.json` ([example](examples/hotel-bookings/.docket/state.json)).
It holds everything the UI shows, so the UI never reads the repository itself,
and combining several repositories later means collecting their files.

- **Header**: the project, the commit indexed, and the commit the test results
  came from. If the two commits differ, the UI marks the results as stale.
  `results` is `null` when no test results were read.
- **`summary`**: the project's maturity, capabilities per level, rules per
  status, gap counts and the number of problems. This is the at-a-glance view.
- **`features`**: each with its capabilities and its maturity worked out. Each
  capability names the feature it's in, or `null`.
- **One list per doc type**: each entry has its ID, file, name, summary and
  links, in both directions, and its body as Markdown: everything after the
  title and summary.
- **`gaps`**: every gap from every doc, with `due` worked out.
- **`problems`**: everything the indexer found wrong.

### Rule status

Each rule gets one status:

| Status        | Meaning                                                       |
| ------------- | ------------------------------------------------------------- |
| `decided`     | The rule doc exists, and no code or test points at it.        |
| `implemented` | Code is annotated as enforcing it, and no test verifies it.   |
| `tested`      | A test verifies it, and the results don't include that test.  |
| `passing`     | Every verifying test passed in the results.                   |
| `failing`     | At least one verifying test failed.                           |

A rule has one status, wherever it applies. A test that verifies a rule counts
for every capability that follows it, even if the test only goes through one
of them.

### What each level needs

A capability's level sets the status its rules need. A rule that several
capabilities follow has to meet what each of them needs, so in practice it's
held to the highest level among them:

| Level     | Core rules | Edge-case rules |
| --------- | ---------- | --------------- |
| Prototype | anything   | anything        |
| Alpha     | `passing`  | anything        |
| Beta, GA  | `passing`  | `passing`       |

On top of that, no technical gap for a capability may be due. This comes from
forge's testing rule, and it's the only expectation the spec checks for now.
The rest of the stability checklist stays guidance.

### Problems

| Type                   | Raised when                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `unknown-id`           | A link or annotation names a doc that doesn't exist.           |
| `invalid-frontmatter`  | A required field is missing, or a value isn't allowed.         |
| `code-matches-nothing` | A `code` glob matches no files.                                |
| `broken-link`          | A relative link in a doc's body doesn't resolve.               |
| `unlinked-rule`        | No capability follows a rule.                                  |
| `in-two-features`      | More than one feature lists the same capability.               |
| `below-level`          | A rule's status is below what a capability following it needs. |
| `gap-due`              | A technical gap's `until` has been reached.                    |
| `stale-results`        | The test results came from a different commit.                 |

The hotel example has two problems on purpose. Room booking is Beta, but its
same-day-turnover rule is only `implemented`. And a refunds gap was due once
Cancellations reached Alpha, which it has.

## Open decisions

- **Matching tests to results.** A comment annotation gives the indexer a file
  and line, but a JUnit report identifies tests by name, so the indexer has to
  read the test's name from the line below the annotation, which varies by
  language. The alternative is putting the ID in the test name, such as
  `it("rejects a one-night stay [rule:booking/minimum-stay]")`, which reports
  carry directly but which reads worse. Gherkin tags have neither problem.
- **Where the results' commit comes from.** Test reports don't record a commit.
  The simplest option is to require `docket index` to run in the same job as
  the tests, and stamp the results with the same commit.
- **A rule's kind is the same everywhere it applies.** `kind` is on the rule,
  but whether a rule is core can depend on the capability: no double-booking
  is core to room booking, and arguably an edge case of check-in. If that
  matters in practice, `kind` moves to the capability's link, such as
  `rules: { core: [...], edge-case: [...] }`.
- **Expectations are fixed.** The level table above is forge's testing rule
  built into the spec. It becomes configurable once someone adopting Docket
  needs different rules.
