# Gaps, tradeoffs and decisions

These are where intention and reality differ, each declared in frontmatter on
the one doc it's about:

| Declared on            | Gaps                                               | Tradeoffs                              | Decisions |
| ---------------------- | -------------------------------------------------- | -------------------------------------- | --------- |
| Capability             | What someone using it would notice                 | Limits it has by choice                | Yes       |
| Feature                | None: a missing capability is a draft              | Non-goals: capabilities never to build | Yes       |
| Domain                 | None                                               | None                                   | Yes       |
| Mechanism or component | What only someone working on the code would notice | Technical choices                      | Yes       |

Rules, concepts and personas have none of them. A limit across a whole domain
is a rule, or a tradeoff on the mechanism that causes it.

Neither a gap nor a tradeoff can excuse the security and privacy baseline.
Meet it instead.

## Gaps

A gap is something we intend to close. Docket lists it so people know about
it. When and how it's closed is up to them, so a gap never says.

```yaml
gaps:
  - id: calendar-needs-a-mouse        # unique in this doc
    name: Calendar needs a mouse      # what falls short, in a few words
    outcome: usability/beta/everyone  # optional: the checklist outcome it falls short of
    rule: booking/minimum-stay        # optional: a rule the capability follows but doesn't hold yet
    impact: blocking                  # see below
    description: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
    when: A clerk can't use a mouse.  # optional: what makes it bite, if it isn't already
```

A gap's ID is its doc's ID plus its key:
`capability:room-booking#calendar-needs-a-mouse`.

- **Most gaps name no outcome.** They're limits on what the capability does.
  Name an outcome only when the gap is the reason the capability's level falls
  short of it. Never name a `baseline` outcome. IDs are in
  [checklist.yml](checklist.yml), as `<quality>/<level>/<id>`.
- **A rule written before it's built** is followed by its capabilities, each
  with a gap naming it in `rule`, since following a rule otherwise claims it
  holds.
- **When a gap has a visible effect and a technical cause**, the gap goes on
  the capability, and the component's body explains the cause. A gap is never
  in both.
- **Mark where it shows in the code** with `docket:gap <gap ID>` when there's
  a clear place, instead of a bare TODO.
- **Closing a gap** removes it, its `docket:gap` annotations, and its key from
  any open decision's `gaps`.
- **A gap we decide never to close** becomes a tradeoff, with its drawback.
  That's a person's decision.

### Rating impact

Impact is what happens to whoever relies on the thing the gap is in, when it
bites: the people who use the software, run it, build on it, or depend on what
it produces. Rate the consequence, never how likely it is.

Ask in order, and stop at the first yes:

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
between two, pick the lower unless the higher one's test is plainly met. A gap
that only bites in some conditions, such as untested code, is rated by what
would happen if it bit. `when` says what those conditions are, in terms of the
design, not of how the system is used.

Readers order gaps by risk, worked out from the impact, the level of each
capability the gap is on, and whether it breaks that level's promise. Rate
each gap you add, and say in your report how you rated it, so a person can
correct it.

## Tradeoffs

A tradeoff is something chosen over an alternative and lived with. One
tradeoff is one choice.

```yaml
tradeoffs:
  - id: constraint-not-lock
    name: Database constraint, not an app lock   # what we chose, in a few words
    outcome: reliability/beta/data-kept          # optional: an outcome it falls short of on purpose
    impact: inconvenient                         # rates its drawback, as a gap's impact does
    description: >-
      The database refuses overlapping bookings with an exclusion constraint,
      rather than the app locking the room while it checks.
    benefit: >-
      No two bookings can overlap, however they arrive, without the app having
      to get locking right.
    drawback: >-
      Bookings need Postgres with `btree_gist`, so they can't move to a
      database without it.
    when: Bookings move to another database.
```

- **Always write the `benefit`.** A choice whose reason isn't written down
  can't be weighed against its drawback.
- **The description says what was chosen, and instead of what.**
- **Mark the code** with `docket:tradeoff <tradeoff ID>` where it looks wrong
  on purpose, so nobody "fixes" it.
- **A technical tradeoff you made while building is yours to record.** A limit
  on what a capability does, or a non-goal on a feature, is a product choice:
  record it once a person has made it.

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
    gaps: [late-cancellations-refunded-in-full]   # optional: gaps whose cost depends on the answer
  - topic: Groups
    question: Should a group be able to book several rooms under one name?
    status: closed
    answer: Yes, as a capability of its own, explored as a prototype first.
    became: [capability:group-bookings]
```

- **Open** is the default, so an open decision has no `status`. Only open
  decisions count as what's left.
- **Record one** when a question about intention comes up that nobody has
  answered and you didn't need answered to go on. Write the question so that
  someone without your context can answer it, and put any options in it.
- **Close one** only with a person's answer: set `status: closed`, write the
  `answer` in a sentence or two, and list in `became` what it was written as:
  docs as `<type>:<id>`, or gaps' and tradeoffs' own IDs. Write those in the
  same change. A decision answered with nothing to write down, such as "no",
  has an `answer` and no `became`.
- **Stay on the decision's side.** A decision on a domain, feature or
  capability becomes product docs, or their gaps or tradeoffs. One on a
  mechanism or component becomes technical docs, or theirs.
- **Remove `gaps`** from a decision when you close it.
