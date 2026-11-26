---
docqet: concept
id: evidence
domain: authoring
name: Evidence
description: >-
  Places in the repository that say they verify or implement a rule, a
  capability, a mechanism or a component, so you can go from it to what's about
  it.
confused-with:
  - concept: "concept:annotation"
    summary: >-
      the comment that claims a place is evidence. Evidence is what the indexer finds from them.
  - term: "A test result"
    summary: >-
      Docqet doesn't run anything. Evidence says where the checks are, not whether they pass.
---

There are two kinds:

- **Verifies**: this place checks that the rule holds, that the capability
  works, or that the mechanism or component does what it says.
- **Implements**: this place makes it so.

Docqet doesn't care what a place is, whether a test, code, a migration, a
workflow or anything else, what language or framework it's in, or whether
anything has run. It shows where the evidence is, so a reader can go from
what's intended to what's about it. There's no limit to how much there is.
No double-booking is verified in four places and implemented in two, one of
them a database constraint.

- **A place becomes evidence with an [annotation](annotation.md)**: a
  comment above it naming what it verifies or implements, the same in every
  language. Nobody writes evidence down: the indexer finds it.
- **It's optional at every level.** A rule or capability with none still
  holds, on trust, unless a [gap](gap.md) says it doesn't. Missing evidence
  is neither a problem nor something left to do.
- **A rule's evidence is about every capability that follows it.**
- **A mechanism's or component's evidence is also the evidence for the
  [stability rubric](rubric.md) outcomes it `meets`.**

## How it's written

The indexer records each place's file, the annotation's line, and the line
it's on, as [Annotation](annotation.md#what-the-indexer-records) describes.
No double-booking's evidence, in Hotel Bookings' [state](state.md),
shortened:

```json
"evidence": {
  "implements": [
    {
      "file": "db/migrations/001_bookings.sql",
      "line": 10,
      "text": "EXCLUDE USING gist (room_id WITH =, nights WITH &&) WHERE (status <> 'cancelled')"
    },
    {
      "file": "src/booking/availability.ts",
      "line": 9,
      "text": "export function assertRoomFree(roomId: string, stay: Stay, existing: Booking[]): void {"
    }
  ],
  "verifies": [
    {
      "file": "features/booking.feature",
      "line": 3,
      "text": "Rule: A room can't be double-booked"
    }
  ]
}
```

A rule or capability with none has both lists empty, and readers say plainly
that it holds on trust, without a warning.
