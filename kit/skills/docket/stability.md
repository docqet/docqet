# Stability

Every capability that's been started is at one of four levels. The level says
how much people can depend on it right now, not how good it is.

| Level     | Value       | How stable  | What it means                                                                                             |
| --------- | ----------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| Draft     | `draft`     | Not started | Declared, with no work started. Not a level: it promises nothing, and claims nothing.                     |
| Prototype | `prototype` | Exploring   | Explores an idea so we can choose a direction. Data may be fake. May change completely or be thrown away. |
| Alpha     | `alpha`     | Developing  | Works, but still taking shape. Frequent breaking changes and bugs.                                        |
| Beta      | `beta`      | Refining    | Settled enough for real use. Occasional breaking changes and bugs, announced ahead when we can.           |
| GA        | `ga`        | Stable      | Keeps working as it does today. Breaking changes are rare, announced, and come with time to move over.    |

## Finding the level

1. **The user's word** wins. If it differs from the capability's `stability`,
   say so, and offer to update the doc.
2. **The capability's `stability`**, in the domain the change is in.
3. **Otherwise, infer it** from what the repository shows, tell the user the
   level and what it rests on, and offer to record it. Don't write an inferred
   level as declared.

A part several capabilities share, such as a table, an endpoint or a
component, holds to the strictest of their levels.

## What a change may break

- **Draft, Prototype, Alpha**: no compatibility promise. Take the quickest
  path, such as editing a migration and resetting the data.
- **Beta**: non-breaking, unless the user says otherwise.
- **GA**: non-breaking only. A breaking change is a new capability or version
  with its own level, while the current one keeps working. Ask before planning
  one.

A breaking change makes existing users, clients, data or deployments fail or
behave differently unless they change something: removing or renaming
something they use, changing a type or meaning, tightening validation,
reworking a workflow they've learned, or editing a migration that's already
run.

## The stability checklist

[checklist.yml](checklist.yml) describes what each level generally expects,
in ten qualities, each a question someone asks before depending on the work.
Each level includes the outcomes below it, unless an outcome's `until` names
the last level it applies to. Each outcome's ID is `<quality>/<level>/<id>`,
such as `reliability/beta/data-kept`.

- **It's a guideline, not a gate.** Work can be called a level, GA included,
  with outcomes unmet. What's unmet is a gap naming the outcome, or a tradeoff
  if it's unmet on purpose.
- **An outcome that applies is met unless a gap or tradeoff names it.**
  Declaring a level claims everything that level expects, except what's
  written down. An outcome that doesn't apply, such as accessibility for an
  API with no screens, counts as met.
- **A mechanism or component that meets an outcome** says so in `meets`. Its
  annotations are the evidence.
- **Judgment wins over wording.** What an outcome takes, and whether it
  applies, depends on the software and who relies on it.
- **The level is a ceiling as well as a floor.** Each outcome's
  `overengineering` examples show work that's likely too much at that level.
  Don't build ahead of the level without a concrete reason, such as the
  user's request, the project's own rules, or a security need.

### The security and privacy baseline

The `baseline` outcomes hold at every level, and are never a gap or a
tradeoff. In short: secrets stay out of code, version control, sample data,
logs and output; real data comes only through the real systems, never copied
into code or fixtures; only those allowed can reach real systems or data, and
one tenant or account never sees or changes another's; personal data is
collected only where needed; and untrusted input can't run as code or
commands. If work can't meet it, stop and say so.

## Promoting a capability

Only when a person tells you to. Then:

1. Confirm the capability, its current level and the target. A skip, such as
   Prototype to Beta, covers each level in between.
2. Go through what the target expects that the current level doesn't, in
   [checklist.yml](checklist.yml), against the capability and the mechanisms
   and components it relies on. Look at the gaps already on them that name an
   outcome the target expects.
3. Before changing anything, present the delta: what has to change and which
   outcome each meets, what you propose to record as gaps instead, and what
   you're deliberately not doing yet because it belongs to a later level.
4. Do the agreed work, record the agreed gaps, and change `stability` last.

Moving down is fine before GA. A level never changes as a side effect of
other work.
