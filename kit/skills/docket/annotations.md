# Annotations

An annotation is a comment in code, tests or config that ties a place in the
repository to Docket, in whatever comment syntax the file uses:

```text
docket:<verb> <type>:<id> [<type>:<id> ...]
```

| Verb         | Says                                                               | Names                                                              |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `implements` | This place makes it so                                             | `rule:`, `capability:`, `mechanism:`, `component:`                 |
| `verifies`   | This place checks that it holds or works                           | `rule:`, `capability:`, `mechanism:`, `component:`                 |
| `gap`        | A known gap shows here, in place of a bare TODO                    | A gap's ID, such as `component:bookings#clashes-logged-as-unknown` |
| `tradeoff`   | This is deliberate, though it may look wrong, so nobody "fixes" it | A tradeoff's ID                                                    |

One annotation can name several things:

```ts
// docket:implements capability:room-booking component:bookings
export async function saveBooking(db: Pool, booking: Booking): Promise<void> {
```

```sql
  -- docket:implements rule:no-double-booking@guest-stays component:bookings
  -- docket:tradeoff component:bookings#constraint-not-lock
  EXCLUDE USING gist (room_id WITH =, nights WITH &&) WHERE (status <> 'cancelled')
```

```gherkin
  # docket:verifies rule:no-double-booking@guest-stays
  Rule: A room can't be double-booked
```

- **It's on the first line below it** that isn't blank or another annotation.
  Put it directly above the function, test, constraint or step it's about.
  One at the top of a file stands for the whole file.
- **A rule always names its domain**, as `rule:<id>@<domain>`:
  `docket:verifies rule:closed-bills-dont-change@billing`. Code is in no
  domain, so a rule without one is a problem, even in a repository with one
  domain.
- **Annotations are claims.** Add one only where it's true: a test that
  verifies a rule actually checks it, and code that implements one actually
  enforces it.
- **None is fine.** Something with no evidence holds on trust. Don't annotate
  for the sake of it, and don't report missing evidence as a gap.
- **A component's or mechanism's `implements` places are where it is in the
  code.** Annotate its entry points, where someone changing it should start
  reading, and anything else that's part of it, such as a migration or a
  workflow. Where only part of a file is its, annotate only that part.
- **Annotations go in code, tests and config, never in a Docket doc.** The
  indexer doesn't look in docs for them.

## Keeping them true

The indexer will catch an annotation naming something that doesn't exist. It
can't catch one that's missing, or one left on code that's no longer about
what it names. So whenever you:

- **write code that enforces a rule, or a test that checks one**, annotate it;
- **move or delete annotated code**, move or delete its annotation with it;
- **change what annotated code does**, check the annotation is still true;
- **change a doc's ID**, update every annotation naming its old ID
  (`grep -rn "<type>:<old-id>"`);
- **close a gap**, remove its `docket:gap` annotations.
