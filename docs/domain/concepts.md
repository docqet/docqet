# Docket concepts

What the words mean in Docket. When a term here and a word in the code, the
spec or the UI disagree, this is the meaning we intend, and the other one is
wrong.

The [spec](../../spec/README.md) says how each of these is written down: file
layout, frontmatter, IDs and the `state.json` schema. This doc says what they
are. Examples come from the spec's [examples](../../spec/examples/): a hotel's
booking app and its billing service.

## The big picture

A **project** is a place where software is defined in **docs**, and usually
implemented, such as the hotel's booking app: one repository. Each project
works in one or more **domains**: parts of the business, each with its own
language, such as Guest stays or Billing. Every doc but a persona is written in
exactly one domain. Every project contributes what it knows to one picture of
the whole product, and where two of them say different things, Docket shows the
**contradiction** rather than picking one.

A **feature** is a job the product does, and it groups the **capabilities**
that do that job. Features and capabilities can span domains: each domain that
does part of the work contributes its part. Each capability has a **stability
level** in each domain that builds it, follows **rules**, uses **concepts**,
and lists its **known gaps**. Rules and concepts belong to a domain, and mean
what they say there. A capability refers to the ones it follows and uses, so
one rule can apply to many capabilities, in different features and domains.

A **persona** is a type of person the software serves, such as a front desk
clerk. Each capability says which personas it serves, so Docket can show, for
each of them, what the software does for them and how ready it is for them.

Anything in the repository can point at a rule or capability with an
**annotation**, as **evidence** that it verifies or implements it. The
**indexer** reads all of it, and works out each one's evidence, each
feature's, domain's and project's **maturity**, each persona's
**readiness**, and any **problems**.

```text
project ──────────────────── where software is defined; metadata, not a boundary; maturity (derived)

domain ───────────────────── a part of the business and its language; maturity (derived)
├── its part of features ─── a feature can span domains
│   └── its part of capabilities ── stability level (declared, per domain), known gaps, evidence
│       ├──► personas ────── who it serves
│       ├──► rules ───────── its domain's, unless it names another
│       ├──► concepts ────── its domain's, unless it names another
│       └── code
├── rule ─────────────────── evidence (derived from annotations), if it has any
└── concept ──────────────── what a word means in this domain

feature ──────────────────── one across every domain: maturity (derived) from every part
persona ──────────────────── one across every domain: readiness (derived) from its capabilities
```

## Project

A place where software is defined, and usually implemented: one repository,
such as a GitHub repository, marked by a `docket.yaml` at its root that gives
the project's ID and name. Its docs say what the software can do and the rules
it follows, and its code and tests, when it has them, do it and prove it.

Hotel Bookings is a project: the hotel's booking app, where guests' stays are
booked, changed and checked in. Hotel Billing is another: the same hotel's
billing service, in a repository of its own, where guests' bills are kept and
paid.

- **It's metadata, not a boundary.** It says where each part of the picture
  comes from, so you can see who said what and show only what some projects
  define. It doesn't decide what words mean, which is a domain's job, and it
  groups nothing for its own sake.
- **Everything in its repository is its own**: every doc and annotation.
- **It works in one or more domains**, and contributes what it knows about
  each to the overall view. No project owns a domain, a feature or a
  capability. Docket puts every project's contributions together by ID. Hotel
  Bookings works in Guest stays and Property, and Hotel Billing in Billing and
  Finance. Both say something about check-out: bookings that clerks check
  guests out, billing that the guest's bill is settled as they go.
- **Moving docs between projects changes no product doc.** Splitting a service
  out into a repository of its own makes a new project, but it creates,
  removes or renames no domain, feature or capability.
- **It has no stability level.** It has a **maturity**, worked out from its
  parts of features. Several projects shown together have one too, worked out
  from all their parts the same way, as if they were one project. Showing
  only some projects works out each feature's and domain's maturity from what
  those projects say.

### Contradiction

Two contributions that should agree and don't, such as two projects describing
check-out differently, or listing the same capability under different
features. Docket shows contradictions as problems, naming the projects involved,
instead of choosing one. Duplicates will happen as several projects describe
one product. Visible, they can be fixed.

What should agree:

- **A domain's, feature's, capability's or persona's name and summary**, in every project
  that declares it. Its body is each project's own notes, so bodies are shown
  side by side.
- **Which feature a capability is in.**
- **A rule or concept within one domain**, when more than one project
  declares it there.

What isn't a contradiction:

- **A feature or capability in several domains.** Work crosses domains, and
  each domain contributes its part.
- **A capability's levels.** Each domain that builds it says how far along its
  part is.
- **The same word meaning different things in different domains.** That's
  what domains are for.

## Product

### Agnostic of implementation

Domains, features and capabilities say what value the software provides, never
how it's built or delivered. A capability is the same capability whether people use it
through a web page, a mobile app, an API or a command line, whether it runs as
one service or ten, and whatever language, framework or vendor is behind it.

- **They're described in the domain's words.** Their names, summaries and what
  they cover name no screens, buttons, endpoints, services, tables,
  functions, technologies or vendors. "Clerks book a room for a guest's stay",
  not "clerks submit the booking form" or "the bookings API creates a
  reservation".
- **Changing the implementation doesn't change them.** A rewrite, a new
  framework, splitting or merging services, or moving to another vendor never
  creates, removes, renames or splits a domain, feature or capability. If the
  software produces the same results of value afterwards, they're the same
  ones.
- **Delivery isn't a capability.** Offering room booking through an app as
  well as the web is another way to reach the same result, so it's part of
  room booking. It becomes a capability of its own only if it produces a result
  of value that wasn't possible before.
- **Implementation and value don't line up one to one.** One capability can be
  built from code in several places, and one piece of code can serve several
  capabilities.

A capability's `code` says where its code lives. That's all Docket records
about how the software is built.

### Domain

A part of the business the software serves, with a language of its own: within
a domain, each word means one thing. It's a business area and a bounded
context, in domain-driven design's terms, as one. Guest stays is a domain:
"looking after guests from their booking to their check-out". Billing is
another: "charging guests for their stays and getting paid". Booking means a
guest's hold on one room in Guest stays, and what a guest is charged for a stay
in Billing. Both are right, each in its domain.

- **It's named for the part of the business it serves**, not for an app, a
  service or a team: Guest stays, not "the guest app" or "the front-office
  suite".
- **It doesn't follow how the software is packaged.** Several projects can work
  in one domain, and one project can work in several. Repackaging the software,
  or reorganizing the teams that build it, never creates, removes or splits a
  domain.
- **Every doc but a persona is written in exactly one domain**: the one whose
  words it uses. A project's docs for each domain are in a folder of their
  own.
- **Domains are shared by ID.** Projects that work in the same part of the
  business use the same domain ID, and their contributions to it are one
  domain.
- **Features and capabilities can span domains.** Front desk is in Guest stays,
  where clerks check guests in and out, and in Billing, where the bill is
  settled at check-out. Each domain's part is its own, and the feature is one.
- **Rules and concepts are the domain's own.** The same ID in two domains is two
  definitions, shown side by side, and that's not a problem. A capability uses
  its own domain's rules and concepts, unless it names another domain's, or
  only one domain defines that ID.
- **It provides value only through its features.** A domain with no features
  is a part of the business the software doesn't serve yet.
- **It's one level.** A domain holds its parts of features, never other
  domains.
- **It has no stability level.** It has a **maturity**, worked out from its
  parts of features.

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

A capability is stated in one sentence, its summary, in one of two forms:

- **Who does what**: "Clerks book a free room for a guest's stay."
- **What the software does**: "The software reminds each guest of their stay
  the day before they arrive."

The sentence can add a condition that limits it, or to what end, when that
helps: "Clerks move a guest's bill to their company's account at check-out, so
the guest leaves without paying." It names the people the business's way, and
the capability links the personas it serves: who does it, or who it's done
for. What it doesn't do is said elsewhere. What must always or never happen is
a rule it follows, and what's missing or limited, for now or by choice, is a
known gap. Anything else it includes, when the sentence doesn't show it, is
listed under what it covers, each a sentence of its own.

Something is a capability when:

- **It produces a result of value on its own.** If it were the only thing that
  shipped, someone would be better off, or the software would get something
  done for them.
- **Its result is distinct.** The actions that lead to the same result are
  part of one capability. Seeing which rooms are free, booking one, and moving
  a booking to new dates all lead to a guest with a room held for their stay,
  under the same rules. So they're all room booking, listed under what it
  covers. Cancelling leads to a different result under different rules, so
  it's a capability of its own.
- **It can be depended on by itself.** People can rely on room booking while
  group bookings is still a prototype. That's why the stability level belongs
  to the capability and not to the feature.

The capability is Docket's unit of dependability:

- **It's the only thing with a stability level.** When you need to know
  whether you can rely on something, you check the capability.
- **It has a level in each domain that builds part of it.** A capability that
  spans domains can be further along in one than another: check-out is GA in
  Guest stays, where clerks check guests out, and Alpha in Billing, where
  settling the bill is still taking shape. Where they differ, its level in
  short is the lowest, since that's what you can count on everywhere.
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
What they get done while they're there is a capability. The parts of the
business whose language they're in are its domains.

Some things are never features or capabilities:

- **A step or action**, such as picking dates or seeing which rooms are free,
  is part of a capability, unless it produces a result of value by itself.
- **A screen, page, endpoint or service** is how a capability is delivered,
  not what it is.
- **A rule** is a constraint capabilities do their jobs under: something that
  must always be true, or must never happen.
- **A quality**, such as being fast, accessible or secure, is how well
  capabilities do their job. Where one falls short, that's a gap in the
  capability.

### Rule

A business rule of the domain: a constraint the business and its software
operate under. It's something that must always be true, or must never happen,
in the domain's words, such as "a room can't be double-booked" or "cancelling
48 hours ahead is free". Each rule says what it is and why, and nothing about
how the code enforces it.

A rule isn't a preference, a default or a guideline. It holds every time, for
everyone it covers, and software that lets it be broken is wrong. Something
that's only usually true, that someone can choose to override, or that's
still being decided isn't a rule. Write it as what the capability does, or as
an open decision, until the business commits to it. When the business does
allow an exception, such as a manager waiving a cancellation fee, the
exception is part of the rule, and the rule still holds every time.

A rule belongs to the domain, not to a capability or a feature:

- **Capabilities refer to the rules they follow.** A rule is written once and
  applies to every capability that lists it. No double-booking applies to room
  booking and group bookings in Reservations, and to check-in in Front desk.
- **Features reach rules only through their capabilities.** A feature's rules
  are the rules its capabilities follow. Nobody lists them on the feature.
- **Its evidence is the rule's, wherever it applies.** What verifies no
  double-booking is about every capability that follows it, even if it only
  goes through room booking.
- **It's its domain's.** A rule holds within the domain that declares it, in
  that domain's words. A capability in another domain can still follow it, by
  naming its domain, so one rule can govern work that crosses domains. Another
  domain can have a rule with the same ID that says something else.

A rule is decided once its doc exists. Places in the repository can point at
it as evidence, but nothing requires them to.

### Concept

What a term in the domain means, such as a booking: "a guest's hold on one
room for a stay". A concept says what something is, what it's made of, how it
relates to other concepts and what states it moves through.

A concept means what it says within its domain. Billing's booking is "what a
guest is charged for a stay", and that's a second definition of the word, not
a mistake in Guest stays' or Billing's.

### Persona

A type of person the software serves, written as one invented person so it's
easy to picture: Maria, front desk clerk, "runs the front desk: takes bookings,
and checks guests in and out". A persona says who they are, what they need the
software to do for them, what they know, the context they work in, what they
expect, and what they care about.

- **Capabilities link to the personas they serve**: whoever does it, or whoever
  it's done for when the software does it on its own. Room status serves the
  housekeeper who marks rooms clean and the clerk who sees which are ready.
  Night audit runs by itself, and serves the night auditor and the manager.
- **What it relates to is worked out from those links**: its capabilities, the
  features they're in, and the domains those are in. Nobody lists them on the
  persona.
- **It's one across every domain.** People work across the parts of the
  business, so a persona is written for the whole project, not in a domain,
  and projects that serve the same people share its ID.
- **It isn't a role or a permission.** It says who someone is and what they
  need, not what they're allowed to do.
- **It has no stability level or maturity.** It has a **readiness**: how
  ready the software is for them, worked out from the maturity of what they
  need.

### Open decision

A question about a capability that hasn't been settled. It's recorded in the
capability so it isn't lost or quietly decided in code. Once it's settled, it
becomes a rule, or a change to what the capability does.

## Known gaps

### Gap

Something the software doesn't do, or doesn't do well, that someone using the
product would notice and that we've chosen to write down rather than hide,
such as there being no waitlist when every room is taken. It's recorded on the
capability, and is one of two kinds:

- **To close later**: we intend to fix it.
- **Accepted tradeoff**: we've decided to live with it.

A gap can name the stability checklist item it falls short of, such as the
room calendar not being usable from the keyboard. Most gaps are limits on
what the capability does, like the waitlist, and name none.

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

### Stability checklist

The qualities a capability is expected to have at each stability level, such
as functionality, reliability and usability: automated tests of the main path
from Alpha, say, or a tested rollback at GA. Each level of each quality has
what it expects, examples of what that might look like for different kinds of
software, and what to leave until later. It's the same for every project,
whatever kind of software it is, and it's guidance, not a gate: each item that
applies is usually met, not applicable, or a known gap. Docket counts an item
as met unless a known gap names it. Its security and privacy baseline holds at
every level and is never a known gap.

### Maturity

How far along a feature, a domain or a project is: how much of the work under way
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

### Readiness

How ready the software is for a persona: a percentage worked out from the
maturity of what they need, which is every capability that serves them, as a
feature's maturity is worked out from its capabilities. A feature has a
readiness for each persona it serves too, from just its capabilities that serve
them. Readiness is about the people, so it never counts toward a domain's or
project's maturity.

It has a scale of its own, so it's never mistaken for maturity: Not ready yet,
Partly ready, Mostly ready and Ready, a quarter each.

The spec has [how it's worked out](../../spec/README.md#readiness).

### Band

The quarter of the maturity scale a feature, domain or project falls in, named for the
level it's closest to: **Experimental** (Prototype), **Emerging** (Alpha),
**Promising** (Beta) and **Established** (GA). A band tells you what to expect
from the whole, never from every part.

## Evidence

### Evidence

Places in the repository that say they verify or implement a rule or a
capability, so you can go from it to what's about it. There are two kinds:

- **Verifies**: this place checks that the rule holds, or that the capability
  works.
- **Implements**: this place makes it so.

It's optional: a rule or capability with none is still one, and nothing at any
level requires any, though Docket points out what has none. There's no limit
to how much there is. No double-booking is verified in four places and
implemented in two, one of them a database constraint. Docket doesn't care
whether a place is a test or code, what language it's in, or whether anything
has run.

### Annotation

A comment that makes a place evidence: `docket:verifies` or
`docket:implements`, then the rules and capabilities it's about. It's the
same in any language or framework.

Annotations are claims. Docket can tell when one names a rule or capability
that doesn't exist, but not when one is missing or has been left on something
that's no longer about what it names.

## Docket itself

### Doc

One Markdown file describing one thing: a domain, feature, capability, rule or
concept. Its frontmatter holds what tools
compute with, such as levels, links and gaps. Its body holds what people read. No fact
is in both.

A doc's **ID** is its path within its type's folder, so it can't drift from the
file. What it identifies depends on the doc's type:

- **Domains, features and capabilities**: one thing across every project. The
  same ID anywhere is a contribution to the same one.
- **Rules and concepts**: one definition within a domain. The same ID in two
  domains is two definitions.

### Link

A relationship between two things, written once, in one direction: a feature
lists its capabilities, a capability its rules, a test the rule it verifies.
Docket works out the other direction, so nobody has to keep both sides in step.

### Declared and derived

Everything in Docket is one or the other:

- **Declared**: written by people and agents. Docs, stability levels, rules,
  gaps, links and annotations.
- **Derived**: worked out by the indexer. Evidence, maturity, bands,
  reverse links and problems. Nobody edits it by hand.

### Indexer

The program that reads a project's docs and annotations, and
writes down everything derived about them, as the project's **state**, for a
particular commit. `docket index` is Docket's indexer, but the format belongs
to no one tool.

### State

What the indexer writes: a snapshot of a project at one commit, with
everything declared and derived. The UI shows only the state and never reads
the repository itself. To show several projects together, it reads each one's
state and **combines** them: it puts each product doc's contributions
together, works out maturity again across them, and finds the contradictions
between them. Showing only some projects combines just what they define.

### Problem

Something the indexer, or combining, found wrong, such as a link to a doc
that doesn't exist, a capability in two features, or a contradiction
between projects. The spec lists
[every kind](../../spec/README.md#problems).
