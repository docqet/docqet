# Evidence

Places in the repository that say they verify or implement a rule, a
capability, a system or a component, so you can go from it to what's about
it.

## Details

There are two kinds:

- **Verifies**: this place checks that the rule holds, that the capability
  works, or that the system does what it says.
- **Implements**: this place makes it so.

It's optional: a rule or capability with none is still one, and nothing at any
level requires any, though Docket points out what has none. There's no limit
to how much there is. No double-booking is verified in four places and
implemented in two, one of them a database constraint. Docket doesn't care
whether a place is a test, code, a workflow or anything else, what language
it's in, or whether anything has run.

- **A place becomes evidence with an [annotation](annotation.md).** Nobody
  writes evidence down: the indexer finds it.
- **A rule's evidence is about every capability that follows it.**
- **A system's or component's evidence is also the evidence for the
  [checklist outcomes](stability-checklist.md) it says it meets.**

## In the spec

The indexer records each place's file, the annotation's line, and the first
line below it as written, so readers can tell what it's on without knowing the
language. No double-booking's evidence, in Hotel Bookings'
[state](state.md), shortened:

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

A rule or capability with none has both lists empty, and readers show a
warning where the evidence would be.

## Not to be confused with

- [Annotation](annotation.md): the comment that claims a place is evidence.
  Evidence is what the indexer finds from them.
- A test result: Docket doesn't run anything. Evidence says where the checks
  are, not whether they pass.
