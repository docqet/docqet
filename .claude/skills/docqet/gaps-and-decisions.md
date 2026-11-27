# Gaps, tradeoffs and decisions

These are where intention and reality differ, each declared in frontmatter on
the one doc it's about:

| Declared on            | Gaps                                               | Tradeoffs                              | Decisions |
| ---------------------- | -------------------------------------------------- | -------------------------------------- | --------- |
| Capability             | What someone using it would notice                 | Limits it has by choice                | Yes       |
| Feature                | None: a missing capability is a draft              | Non-goals: capabilities never to build | Yes       |
| Area                   | None                                               | None                                   | Yes       |
| Mechanism or component | What only someone working on the code would notice | Technical choices                      | Yes       |

Rules, concepts, personas, problems, constraints and initiatives have none of
them. A limit across a whole area is a rule, or a tradeoff on the mechanism
that causes it.

## Gaps

A gap is something we intend to close. Docqet lists it so people know about
it. When and how it's closed is up to them, so a gap never says.

```yaml
gaps:
  - id: calendar-needs-a-mouse        # unique on this doc, in every project that writes it
    name: Calendar needs a mouse      # what falls short, in a few words
    affects:                          # optional: the claims it's why aren't true yet, see below
      - outcome:usability/beta/everyone
    impact: blocking                  # see below: how bad it is for those it reaches
    likelihood: possible              # see below: how likely it is to bite within a year
    reach: few                        # see below: how many of the people served it would reach
    description: >-
      The room calendar can't be used from the keyboard, so a clerk who can't
      use a mouse can't pick dates. None of the clerks needs to today.
```

A gap's ID is its doc's reference plus its key:
`capability:room-booking#calendar-needs-a-mouse`.
A doc written in several projects, such as a capability, is still
one doc, so check the keys it already has before choosing one:
`docqet show <reference> --product` lists its gaps and tradeoffs from every
project.

- **Most gaps affect nothing.** They're limits on what the capability does.
  A gap affects an outcome only when it's the reason the capability's level
  falls short of it, a rule only when the capability follows it and
  doesn't hold to it yet, or a constraint only when what it's on respects it
  and doesn't keep to it yet. See [What `affects` says](#what-affects-says).
- **A rule written before it's built** is followed by its capabilities, each
  with a gap affecting it, since following a rule otherwise claims it holds.
- **When a gap has a visible effect and a technical cause**, the gap goes on
  the capability, and the component's body explains the cause. A gap is never
  in both.
- **Relying on something less stable isn't a gap.** When a capability, or
  part of one, depends on a capability at a lower level, that capability's
  level already says how much can be counted on, so don't write a gap saying
  so. A gap is what falls short in the thing itself.
- **A gap is never just what its own level already says.** Being behind a
  flag, opt-in, not yet in production, or still changing is what Prototype
  and Alpha mean, so don't write it as a gap. It's a gap only once the level
  says otherwise, such as a Beta capability still not available to the people
  it serves.
- **A bug usually isn't a gap.** When the software is meant to do something
  and simply doesn't, fixing the code closes it, so it goes in the issue
  tracker. A gap needs work nobody has done yet: building, deciding,
  designing or testing. Write a known bug as a gap only when it won't be fixed
  soon and changes what people can rely on.
- **Mark where it shows in the code** with `docqet:gap <gap ID>` when there's
  a clear place, instead of a bare TODO.
- **Closing a gap** removes it and its `docqet:gap` annotations, which
  `docqet show <gap ID>` lists.
- **A gap we decide never to close** becomes a tradeoff, with its drawback.
  That's a person's decision. Under the same key, it's the same thing, now a
  tradeoff. Under another key, nothing in the docs links the two, and the
  commit says what the gap became with a `Docqet-Became` trailer (see
  [SKILL.md](SKILL.md#committing)).

### Rating impact, likelihood and reach

Three ratings say what a gap could do, each by judgement about this
software's circumstances. Every gap has all three: none has a default, and
leaving one out is a finding `docqet check` reports. None needs to be exact: they make the judgement
visible, so a person can see it and correct it. Never lower any of them
because the capability is early: rate them as if people relied on the
capability, since risk weighs them by its level already, and nobody re-rates
them when it's promoted.

**Impact** is how bad it is for those it reaches, if it bit. Never lower it
for being unlikely or reaching few: that's what the other two are for. Ask in
order, and stop at the first yes:

1. Could it leave something wrong that can't be fully put right, or that
   someone acts on without knowing, at a cost? Data lost or kept wrong, money
   moved wrongly, legal or financial exposure, someone able to do what they
   shouldn't. **`damaging`**
2. Could it stop someone from getting done what they rely on it for, by any
   route, until it's closed? **`blocking`**
3. Does it cost time, a step by hand, or a workaround, while the result still
   comes out right? **`inconvenient`**
4. Otherwise, **`negligible`**: nothing anyone relies on changes.

A wrong result someone notices and puts right is `inconvenient`. When torn
between two, pick the lower unless the higher one's test is plainly met.

**Likelihood** is how likely it is to bite within the next year. When torn,
pick the higher:

- `certain`: it's happening, or it definitely will within a year.
- `expected`: you'd bet on it happening within a year.
- `possible`: it could happen, but you wouldn't bet on it.
- `unlikely`: it would surprise you.

A gap that only bites in some conditions, such as untested code, says what
they are in its description, in terms of the design, not of how the system is
used, and its likelihood says how likely they are.

**Reach** is how many of the people the software serves it would reach, if it
bit: who its capabilities' personas stand for, and whoever runs it, builds on
it, or depends on what it produces. When torn, pick the higher:

- `all`: everyone the software serves.
- `most`: most of them, the usual case.
- `some`: a real share of them, but not the usual case.
- `few`: a small group with a particular need or situation.

Read the personas before rating anything about who can use it: the same gap
can reach differently in different software. Legal or contractual exposure
the business really has, and anyone able to do what they shouldn't, are
always `all`.

`docqet` orders gaps by risk, worked out from the three ratings, the level of
each capability the gap is on, and whether it breaks a claim made there.
`docqet show` and `docqet list gaps --sort risk` show it. Rate each gap you
add, and say in your report how you rated it, so a person can correct it.

## Tradeoffs

A tradeoff is something chosen over an alternative and lived with. One
tradeoff is one choice.

```yaml
tradeoffs:
  - id: constraint-not-lock
    name: Database constraint, not an app lock   # what we chose, in a few words
    affects:                                     # optional: outcomes it falls short of on purpose
      - outcome:reliability/beta/data-kept
    description: >-
      The database refuses overlapping bookings with an exclusion constraint,
      rather than the app locking the room while it checks.
    benefit: >-
      No two bookings can overlap, however they arrive, without the app having
      to get locking right.
    drawback: >-
      Bookings need Postgres with `btree_gist`, so they can't move to a
      database without it, should they ever need to.
```

- **Always write the `benefit`.** A choice whose reason isn't written down
  can't be weighed against its drawback.
- **The description says what was chosen, and instead of what.**
- **Mark the code** with `docqet:tradeoff <tradeoff ID>` where it looks wrong
  on purpose, so nobody "fixes" it.
- **A technical tradeoff you made while building is yours to record.** A limit
  on what a capability does, or a non-goal on a feature, is a product choice:
  record it once a person has made it.
- **A tradeoff isn't rated.** It carries no risk: someone already weighed its
  drawback and chose to live with it. A drawback that's worth worrying about
  means the choice isn't settled: record an open decision that affects it,
  which reopens it, or turn it back into a gap.

## Decisions

A decision is a question about what's intended, on the doc it's about. That
includes questions that building something is meant to answer, which are most
common while a capability is a prototype.

```yaml
decisions:
  - topic: No-shows                   # optional, a few words
    question: >-
      Is a guest who never arrives treated as a late cancellation, or charged
      for the whole stay?
    affects:                          # optional: what's waiting on the answer
      - capability:cancellations#no-shows-charged-nothing
    impact: inconvenient              # optional, all three or none: see below
    likelihood: certain               # either answer charges no-shows, who are charged nothing now
    reach: few
```

- **Every decision written down is open**, and shows with the gaps as
  what's open.
- **Record one** when a question about intention comes up that nobody has
  answered and you didn't need answered to go on. Write the question so that
  someone without your context can answer it, and put any options in it.
- **Answer one** only with a person's answer: delete it, and write the answer
  where it belongs, as a rule, concept, capability, gap, tradeoff or whatever
  it became, in the same change. Nothing links back to the question; git has
  its history. A decision answered with nothing to write down, such as "no",
  is just deleted.
- **Stay on the decision's side.** A decision on an area, feature or
  capability becomes product docs, or their gaps or tradeoffs. One on a
  mechanism or component becomes technical docs, or theirs.

### Rating a decision

A decision uses a gap's three ratings, `impact`, `likelihood` and `reach`,
and has a risk worked out from them the same way, which counts in exposure
and so lowers readiness. Answering it is then one of the improvements that
would raise readiness. The ratings are optional, but all three or none:

- **Rate it when its answer could change what people rely on now.** Leave
  it unrated when it couldn't, such as what something is called, or a
  question about something nobody relies on yet. An unrated decision has
  no risk. Never leave one unrated to keep it out of exposure.
- **What it `affects` never gives it risk.** It shows what's waiting on the
  answer, and a gap it affects keeps its own risk. A gap that's really an
  unsettled question is still written as both, each rated for itself: the
  gap as what the software does while it's open, the decision as what its
  answer could change.

The scales are a gap's, with the same values, but **read about the change
its answer could bring, not about something biting**:

**Impact** is how bad it is for those it reaches if the answer changes what
they rely on. Ask a gap's questions in order of that change, and stop at the
first yes:

1. Could it leave something wrong that can't be fully put right, or that
   someone acted on without knowing, at a cost, such as data kept in a shape
   the answer rules out, or money worked out on terms it reverses?
   **`damaging`**
2. Could it stop someone getting done what they relied on it for, until
   something else is built? **`blocking`**
3. Would people adapt, with extra time, a new step or a new way of working,
   while what they get still comes out right? **`inconvenient`**
4. Otherwise, **`negligible`**. A decision that's `negligible` is usually
   better left unrated.

**Likelihood** is how likely it is that the answer changes what the software
does now, whenever it's given, with no year. When torn, pick the higher:

- `certain`: whatever the answer, what it does now changes, such as a
  placeholder or a stopgap.
- `expected`: you'd bet the answer changes what it does now.
- `possible`: it could go either way.
- `unlikely`: you'd expect the answer to confirm what it does now.

**Reach** is a gap's, of the people the change would reach.

As with a gap, rate as if people relied on the capability, never lower for
its level: risk weighs a decision by the level of each capability it counts
on, so the same question costs little on a Prototype and a lot on GA. A
decision counts on the capability it's on, every capability of the feature
or area it's on, the capabilities relying on the component it's on, or
every capability the mechanism it's on applies to. Say in your report how
you rated each decision you add, so a person can correct it.

## What `affects` says

Declaring a level claims every outcome the rubric lists at it, and
following a rule claims the rule holds. A gap, a tradeoff and a decision are
the three ways of saying "except here", and `affects` says which claim, or
which other item, each is about. Its meaning comes from what's doing the
affecting:

| `affects` → | An outcome | A rule | A constraint | A gap | A tradeoff |
| --- | --- | --- | --- | --- | --- |
| **Gap** | Not met yet | Not held yet | Not kept to yet | | |
| **Tradeoff** | Not met, by choice | | | | |
| **Decision** | Open: neither claimed nor short | | | Waits on its answer | Reopened |

- **Write references**: `outcome:<quality>/<level>/<id>` (`docqet rubric`
  lists them), `rule:<id>`, `constraint:<id>` from a gap, or a gap's or
  tradeoff's ID.
- **A gap affecting a constraint** says where the software doesn't keep to it
  yet. It shows on the constraint; its risk is its own, on the doc it's on.
- **Never anything else.** The doc an item is on is already what it's about,
  so it never affects a capability, feature or persona. A gap never affects a
  gap: which to close first is for a task tracker. A tradeoff never affects a
  rule: a rule can't be broken by choice, so either the rule changes or it's
  a gap.
- **A gap affecting a claim raises its risk** on each capability where the
  claim is made: one whose level expects the outcome, or that follows the
  rule. It raises it more the higher the level, and not at all on a
  Prototype.
- **A rated decision affecting an outcome breaks a claim** on each capability
  whose level expects it, as a gap does, since nobody can vouch for it while
  it's open. Its risk comes from its own ratings, never from a gap or
  tradeoff it affects.
- **A gap that's really an unsettled question** is written as both: the
  consequence as the gap, and the question as a decision that affects it.
- **Stay on its side.** Product items affect product gaps and tradeoffs;
  technical ones affect technical gaps and tradeoffs. Both can affect
  outcomes.
- **Closing, reversing or answering** deletes the item with its `affects`, so
  nothing is left pointing anywhere.
