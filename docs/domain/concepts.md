# Docket concepts

What the words mean in Docket. When a term here and a word in the code, the
spec or the UI disagree, this is the meaning we intend, and the other one is
wrong.

The [spec](../../spec/README.md) says how each of these is written down: file
layout, frontmatter, IDs and the `state.json` schema. This doc says what they
are. Examples come from the spec's hotel-booking
[example](../../spec/examples/hotel-bookings/).

## The big picture

A **project** describes its software in **docs**. On the product side, an
**area** is a part of the business the software serves, and it groups the
**features** that serve it. A feature is a job the product does, and it groups
the **capabilities** that do that job. Each capability has a **stability level**, follows **rules**, uses
**concepts**, and lists its **known gaps**. Rules and concepts belong to the
**domain**, not to any capability or feature. A capability refers to the ones
it follows and uses, so one rule can apply to many capabilities, in different
features. **Flows** show **personas** getting work done across capabilities. On
the engineering side, **systems** and **components** explain how the code
behind capabilities works.

Code and tests point at rules with **annotations**. The **indexer** reads all
of it, plus the latest **test results**, and works out each rule's **status**,
each area's and feature's **maturity**, and any **problems**.

```text
project
└── area ─────────────────── maturity (derived)
    └── feature ──────────── maturity (derived)
        └── capability ───── stability level (declared), product gaps
            ├──► rules ───── refers to the domain's
            ├──► concepts ── refers to the domain's
            └── code ◄────── system, component ── technical gaps

domain
├── rule ─────────────── status (derived from annotations and test results),
│                        applies to every capability that refers to it
└── concept

flow ──► personas, capabilities
```

## Product

Areas, features and capabilities describe one thing: the value the software
provides.
Software provides value in one of two ways:

- **It does something of value itself**, such as reminding each guest of their
  stay the day before they arrive.
- **It lets someone do something of value**, such as a clerk booking a room for
  a guest.

Features and capabilities are always described as one of those.

### Agnostic of implementation

Areas, features and capabilities say what value the software provides, never
how it's built or delivered. A capability is the same capability whether people use it
through a web page, a mobile app, an API or a command line, whether it runs as
one service or ten, and whatever language, framework or vendor is behind it.

- **They're described in the domain's words.** Their names, summaries and what
  people can do name no screens, buttons, endpoints, services, tables,
  functions, technologies or vendors. "Clerks book a room for a guest's stay",
  not "clerks submit the booking form" or "the bookings API creates a
  reservation".
- **Changing the implementation doesn't change them.** A rewrite, a new
  framework, splitting or merging services, or moving to another vendor never
  creates, removes, renames or splits an area, feature or capability. If the
  software produces the same results of value afterwards, they're the same
  ones.
- **Delivery isn't a capability.** Offering room booking through an app as
  well as the web is another way to reach the same result, so it's part of
  room booking. It becomes a capability of its own only if it produces a result
  of value that wasn't possible before.
- **Implementation and value don't line up one to one.** One capability can be
  built from several components, and one component or system can serve several
  capabilities.

How the software is built has its own place. A capability's `code` says where
its code lives. Systems and components explain how that code works, and their
technical gaps say what only someone working on the code would notice.

### Area

A part of the business that the software serves, made up of the features that
serve it. Guest stays is an area: "looking after guests from their booking to
their check-out". It groups Reservations and Front desk. Property is another:
"keeping the hotel ready for guests". It groups Housekeeping, and would group
Maintenance once the software takes on that job.

- **It's named for the part of the business it serves**, not for an app, a
  product, a service or a team: Guest stays, not "the guest app" or "the
  front-office suite".
- **It doesn't follow how the software is packaged.** Its features can be
  delivered by different apps, services or products, and one app can deliver
  features from several areas. Repackaging the software, or reorganizing the
  teams that build it, never creates, removes or splits an area.
- **It provides value only through its features.** An area with no features is
  a part of the business the software doesn't serve yet.
- **It's one level.** An area holds features, never other areas.
- **A feature is in at most one area.** A feature in no area is allowed, and
  shows on its own. Capabilities belong to an area only through their feature.
- **It has no stability level.** It has a **maturity**, worked out from its
  features' maturities the same way a project's is.

### Feature

A job the software does for its users or the business: an outcome of value
that someone comes to the software for. Reservations is a feature: "taking
bookings and handling changes to them, before the guest arrives". So is
Housekeeping: "keeping rooms ready for the next guest".

- **It's named for its outcome**, not for how it's delivered: Reservations,
  not "the booking screen" or "the bookings service".
- **It provides value only through its capabilities.** The feature is the job,
  and its capabilities are what the software can do toward it. A feature with
  no capabilities is a job the software doesn't do yet.
- **It keeps its identity** as its capabilities come, go and change. Adding
  group bookings means Reservations does more of its job. It's still
  Reservations.
- **It has no stability level.** It has a **maturity**, worked out from its
  capabilities' levels.

### Capability

The software's ability to produce one particular result of value, either by
itself or by letting someone produce it, as part of a feature's job.

Room booking is a capability of Reservations. Its result is a guest with a
room held for their stay. Cancellations is another, and its result is a
booking ended and the guest refunded what the policy allows.

A capability can always be stated in one sentence in one of two forms:

- **Who can do what, and to what end**: "Clerks book a room for a guest's
  stay, so that each room has at most one guest on any night."
- **What the software does, and to what end**: "The software reminds each
  guest of their stay the day before they arrive, so fewer guests forget."

Something is a capability when:

- **It produces a result of value on its own.** If it were the only thing that
  shipped, someone would be better off, or the software would get something
  done for them.
- **Its result is distinct.** The actions that lead to the same result are
  part of one capability. Seeing which rooms are free, booking one, and moving
  a booking to new dates all lead to a guest with a room held for their stay,
  under the same rules. So they're all room booking, listed under what people
  can do. Cancelling leads to a different result under different rules, so
  it's a capability of its own.
- **It can be depended on by itself.** People can rely on room booking while
  group bookings is still a prototype. That's why the stability level belongs
  to the capability and not to the feature.

The capability is Docket's unit of dependability:

- **It's the only thing with a stability level.** When you need to know
  whether you can rely on something, you check the capability.
- **It's in at most one feature.** A capability in no feature is allowed, and
  shows on its own.
- **It's what connects rules, concepts and code to the product.** A capability
  lists the rules it must follow, the concepts it works with, and where its
  code lives. Rules and concepts aren't the capability's own: other
  capabilities can list the same ones.
- **It holds the product's known gaps** and its **open decisions**.

### Feature, capability or neither?

Ask what value the work adds:

| The work                                                              | Is                                                         |
| --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Gives the software a job it didn't do at all                          | A new feature, with the capabilities that start doing it   |
| Produces a new result of value toward a job the software already does | A new capability of that feature                           |
| Adds another way to reach a result a capability already produces      | Part of that capability                                    |
| Makes a capability better at what it does                             | A change to that capability, often closing one of its gaps |
| Only changes how something is built                                   | Neither                                                    |

A rough check: the reason someone uses part of the software is a feature.
What they get done while they're there is a capability. The part of the
business that reason belongs to is an area.

Some things are never features or capabilities:

- **A step or action**, such as picking dates or seeing which rooms are free,
  is part of a capability, unless it produces a result of value by itself.
- **A screen, page, endpoint or service** is how a capability is delivered.
  Systems and components describe those.
- **A rule** is what must or can't happen while capabilities do their jobs.
- **A quality**, such as being fast, accessible or secure, is how well
  capabilities do their job. Where one falls short, that's a gap in the
  capability.

### Rule

A business rule of the domain: something that must or can't happen, in the
domain's words, such as "a room can't be double-booked" or "cancelling 48
hours ahead is free". Each rule says what it is and why, and nothing about how
the code enforces it.

A rule belongs to the domain, not to a capability or a feature:

- **Capabilities refer to the rules they follow.** A rule is written once and
  applies to every capability that lists it. No double-booking applies to room
  booking and group bookings in Reservations, and to check-in in Front desk.
- **Features reach rules only through their capabilities.** A feature's rules
  are the rules its capabilities follow. Nobody lists them on the feature.
- **Its status is the rule's, wherever it applies.** A passing test for no
  double-booking counts for every capability that follows it, even if the test
  only goes through room booking. That holds up when the rule is enforced in
  one place that every capability goes through, and it's worth checking when
  it isn't.

A rule is one of two kinds, the same for every capability that follows it:

- **Core**: the main workflow of the capabilities that follow it depends on
  it. Break it and they don't do their job. No double-booking is core to room
  booking.
- **Edge case**: it covers a boundary, an unusual state or a failure around a
  core rule. A stay starting the day another ends is an edge case of no
  double-booking.

A rule is decided once its doc exists. Whether it's actually enforced is its
**status**, which comes from evidence, not from the doc.

### Concept

What a term in the domain means, such as a booking: "a guest's hold on one
room for a stay". A concept says what something is, what it's made of, how it
relates to other concepts and what states it moves through.

### Flow

How a piece of work gets done from start to finish, by one or more personas,
across one or more capabilities, such as a guest's change of plans. A flow has
a clear start and a clear finish, and the steps and variations between them.

### Persona

One kind of person who uses the product, written as a single representative
person: who they are, what they know, where they work, what they expect and
what they care about. Flows say which personas take part.

### Open decision

A question about a capability that hasn't been settled. It's recorded in the
capability so it isn't lost or quietly decided in code. Once it's settled, it
becomes a rule, or a change to what the capability does.

## Engineering

### System

How something overarching in the software works, used across many
capabilities, such as authentication. A system doc explains what the code
can't: how it works, its tradeoffs and gotchas, and what to know before
changing it.

### Component

How one part of the software works, serving one or more capabilities, such as
refunds. A component may use systems. It gets a doc only when there's
something to say that the code can't.

## Known gaps

### Gap

Something the software doesn't do, or doesn't do well, that we've chosen to
write down rather than hide. Each gap is recorded in exactly one place, and
which place depends on who would notice it.

- **Product gap**: someone using the product would notice it, such as there
  being no waitlist when every room is taken. It's recorded on the capability,
  and is one of two kinds:
  - **To close later**: we intend to fix it.
  - **Accepted tradeoff**: we've decided to live with it.
- **Technical gap**: only someone working on the code would notice it, such as
  availability checks loading every booking for a room. It's recorded on the
  system or component, and says what closes it.

### Until and due

What closes a technical gap. It's one of:

- **A capability reaching a level**, such as "until room booking reaches GA".
  The gap becomes **due** once that capability is at that level or above, and
  a due gap is a problem.
- **A concrete event**, such as "the second instance is deployed".
- **Not decided.**

## Stability and maturity

### Stability level

How much people can depend on a capability right now. It's declared by the
people building it, and only changes when someone decides to promote or
demote it.

| Level     | How stable | In short                                                                       |
| --------- | ---------- | ------------------------------------------------------------------------------ |
| Prototype | Exploring  | Explores an idea. May change completely or be thrown away.                     |
| Alpha     | Developing | Works, but still taking shape. Frequent breaking changes and bugs.             |
| Beta      | Refining   | Settled enough for real use. Occasional breaking changes, usually announced.   |
| GA        | Stable     | Keeps working as it does today. Breaking changes are rare and come with time.  |

- **A level is about dependability, not quality.** A prototype that answers its
  question quickly is good work.
- **Stability isn't perfection.** A GA capability can still have bugs and known
  gaps.
- **A level sets expectations Docket can check.** From Alpha, a capability's
  core rules must be passing. From Beta, its edge-case rules must be too. And
  none of its technical gaps may be due.

### Maturity

How far along a feature, an area or a whole project is: how much of the work under way
is stable and supported. It's a percentage, derived from capabilities'
stability levels, and nobody writes it down. Stable capabilities count for
more than early ones.

- **It's about the whole, not each part.** It's an indication, not a verdict.
  Before depending on something, check the stability level of the capability
  you need.
- **Starting new work lowers it**, without anything having got worse.
- **100% isn't the goal.** Software that keeps growing always has newer parts
  settling in.

The spec has [how it's worked out](../../spec/README.md#how-maturity-is-worked-out).

### Band

The quarter of the maturity scale a feature, area or project falls in, named for the
level it's closest to: **Experimental** (Prototype), **Emerging** (Alpha),
**Promising** (Beta) and **Established** (GA). A band tells you what to expect
from the whole, never from every part.

## Evidence

### Annotation

A comment in code or a test that points at a rule. There are two:

- **Implements** marks the code that enforces a rule. It's a pointer for
  finding your way around, nothing more.
- **Verifies** marks a test that proves a rule.

Annotations are claims. Docket can tell when one names a rule that doesn't
exist, but not when one is missing or has been left on code that no longer
enforces the rule.

### Test results

The reports a test run produces, which the indexer reads to see which tests
passed. Results belong to the commit they were run on. When that isn't the
commit being indexed, they're **stale**.

### Evidence

What it takes for Docket to count a rule as enforced: a test that verifies the
rule, passing in the results for the commit being described. Docs, annotations
and implementing code are all claims. Only a passing test is evidence.

### Rule status

How far a rule has got from decided to proven, worked out from annotations and
test results:

| Status      | Meaning                                                     |
| ----------- | ----------------------------------------------------------- |
| Decided     | The rule is written down, and no code or test points at it. |
| Implemented | Code says it enforces the rule, and no test verifies it.    |
| Tested      | A test verifies it, but the results don't include that test. |
| Passing     | Every test that verifies it passed.                         |
| Failing     | At least one test that verifies it failed.                  |

## Docket itself

### Project

One codebase described with Docket, marked by a `docket.yaml` at the root of
its repository. A project has a maturity, worked out from its features'.

### Doc

One Markdown file describing one thing: an area, feature, capability, rule,
concept, flow, persona, system or component. Its frontmatter holds what tools
compute with, such as levels, links and gaps. Its body holds what people read. No fact
is in both.

A doc's **ID** is its path within its type's folder, so it can't drift from the
file.

### Link

A relationship between two things, written once, in one direction: an area
lists its features, a feature its capabilities, a capability its rules, a test the rule it verifies.
Docket works out the other direction, so nobody has to keep both sides in step.

### Declared and derived

Everything in Docket is one or the other:

- **Declared**: written by people and agents. Docs, stability levels, rules,
  gaps, links and annotations.
- **Derived**: worked out by the indexer. Rule statuses, maturity, bands,
  reverse links, whether gaps are due, and problems. Nobody edits it by hand.

### Indexer

The program that reads a project's docs, annotations and test results, and
writes down everything derived about them, as the project's **state**, for a
particular commit. `docket index` is Docket's indexer, but the format belongs
to no one tool.

### State

What the indexer writes: a snapshot of the project at one commit, with
everything declared and derived. The UI shows only the state and never reads
the repository itself.

### Problem

Something the indexer found wrong, such as a link to a doc that doesn't exist,
a capability in two features, a rule whose status is below what its
capability's level needs, or a technical gap that's due. The spec lists
[every kind](../../spec/README.md#problems).
