# Annotation

A comment in the repository, the same in any language or framework, that says
what a place is about.

## Details

It has one of four verbs:

- **`docket:verifies`** and **`docket:implements`** make a place
  [evidence](evidence.md) for the rules, capabilities, mechanisms and components
  it names.
- **`docket:gap`** marks where a [gap](gap.md) shows in the code. It's tracked
  technical debt, in place of a bare TODO.
- **`docket:tradeoff`** marks code that's deliberate, though it may look
  wrong, so nobody "fixes" it. It points at its [tradeoff](tradeoff.md).

Annotations are claims. Docket can tell when one names something that doesn't
exist, such as a gap that's been closed, but not when one is missing or has
been left on something that's no longer about what it names.

## In the spec

```text
docket:<verb> <type>:<id> [<type>:<id> ...]
```

`implements` and `verifies` take `rule`, `capability`, `mechanism` and
`component`, and can name several at once. A rule always names its domain, as
`rule:<id>@<domain>`, since code is in no domain. A mechanism's or component's
`implements` annotations are how it's found in the code, since its doc names
no paths. `gap` and `tradeoff` take the ID of
one, as `<type>:<id>#<key>`. An annotation is on the first line below it
that isn't blank or another annotation, in whatever comment syntax the file
uses.

A unit test:

```ts
// docket:verifies rule:minimum-stay@guest-stays
it("rejects a stay that ends the day it starts", () => {
```

A database constraint, which also marks the tradeoff behind it:

```sql
  -- docket:implements rule:no-double-booking@guest-stays component:bookings
  -- docket:tradeoff component:bookings#constraint-not-lock
  EXCLUDE USING gist (room_id WITH =, nights WITH &&) WHERE (status <> 'cancelled')
```

Code that implements a capability and a component, where a known gap shows:

```ts
// docket:implements capability:room-booking component:bookings
// docket:gap component:bookings#clashes-logged-as-unknown
export async function saveBooking(db: Pool, booking: Booking): Promise<void> {
```

A deploy workflow, as evidence for a mechanism:

```yaml
  # docket:implements mechanism:deployment
  deploy:
```

## Not to be confused with

- [Evidence](evidence.md): what the indexer works out from annotations, for
  each rule, capability, mechanism and component.
