# Annotations

An annotation is a comment in code, tests or config that ties a place in the
repository to Docqet, in whatever comment syntax the file uses:

```text
docqet:<verb> <type>:<id> [<type>:<id> ...]
```

| Verb         | Says                                                               | Names                                                              |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `implements` | This place makes it so                                             | `rule:`, `capability:`, `mechanism:`, `component:`                 |
| `verifies`   | This place checks that it holds or works                           | `rule:`, `capability:`, `mechanism:`, `component:`                 |
| `gap`        | A known gap shows here, in place of a bare TODO                    | A gap's ID, such as `component:bookings#clashes-logged-as-unknown` |
| `tradeoff`   | This is deliberate, though it may look wrong, so nobody "fixes" it | A tradeoff's ID                                                    |

One annotation can name several things:

```ts
// docqet:implements capability:room-booking component:bookings
export async function saveBooking(db: Pool, booking: Booking): Promise<void> {
```

```sql
  -- docqet:implements rule:no-double-booking@guest-stays component:bookings
  -- docqet:tradeoff component:bookings#constraint-not-lock
  EXCLUDE USING gist (room_id WITH =, nights WITH &&) WHERE (status <> 'cancelled')
```

```gherkin
  # docqet:verifies rule:no-double-booking
  Rule: A room can't be double-booked
```

- **It's on the first line below it** that isn't blank or another annotation.
  Put it directly above the function, test, constraint or step it's about.
  One at the top of a file stands for the whole file.
- **Annotations are claims.** Add one only where it's true: a test that
  verifies a rule actually checks it, and code that implements one actually
  enforces it.
- **None is fine.** Something with no evidence holds on trust. Don't annotate
  for the sake of it, and don't report missing evidence as a gap.
- **A component's or mechanism's `implements` places are where it is in the
  code.** Annotate its entry points, where someone changing it should start
  reading, and anything else that's part of it, such as a migration or a
  workflow. Where only part of a file is its, annotate only that part.
- **Annotations go in code, tests and config, never in a Docqet doc.**
  `docqet` doesn't look in docs for them.
- **`docqet touches <file>`** shows what each annotation in a file names, and
  where it lands, so you can see it's on what you meant.

## Keeping them true

`docqet check` catches an annotation naming something that doesn't exist. It can't catch one that's missing, or one left on
code that's no longer about what it names. So whenever you:

- **write code that enforces a rule, or a test that checks one**, annotate it;
- **move or delete annotated code**, move or delete its annotation with it;
- **change what annotated code does**, check the annotation is still true;
- **change a doc's ID**, use `docqet rename`, which updates every annotation
  naming its old ID;
- **close a gap**, remove its `docqet:gap` annotations, which
  `docqet show <gap ID>` lists.
