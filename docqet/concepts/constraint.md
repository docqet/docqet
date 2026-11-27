---
docqet: concept
id: constraint
name: Constraint
description: >-
  Something imposed from outside that any solution must respect, and that
  nobody on the team can change: a law, a contract, a policy set elsewhere, or
  a fact of the world. Problems name the constraints they're subject to, and
  what keeps to one says it respects it.
confused-with:
  - concept: "concept:rule"
    summary: >-
      a promise the software keeps, often a choice. A rule can respect a constraint, but the constraint would hold whatever the rules said.
  - concept: "concept:problem"
    summary: >-
      a pain the software is there to solve. A constraint is what any solution must keep to.
  - term: "A budget, deadline or technology choice"
    summary: >-
      a limit on the project, not on the solution, or a choice the team made. Neither is a constraint.
---

The tax office requires invoice numbers to run in sequence, with none
missing. That's a constraint on the hotel's billing. The rule "invoice
numbers run in sequence" respects it, and so would any other way of billing
the hotel chose.

- **It's imposed from outside.** Ask whether it would still apply if the
  software were rebuilt from scratch, by a different team, any way they
  liked. A law, a provider's or client's terms, a policy set by someone the
  team answers to, or a fact such as a room holding one stay a night passes.
  A budget, a deadline, or a technology the team picked doesn't.
- **It never names the software.** Like a [problem](problem.md), it's in the
  problem space: it says what any solution must keep to, not how this one
  does.
- **It can be written before any solution.** Whoever knows a
  [problem](problem.md) can say what no way of solving it may break: the
  problem names the constraints it's subject to, with `subject-to`. A
  constraint that bounds everything, such as a privacy law, says so instead,
  with `applies: project` or `applies: product`, and no problem needs to name
  it. One that does neither applies to nothing, and `docqet check` reports it
  as an advisory [finding](finding.md).
- **What keeps to it says so, with `respects`**: a [rule](rule.md), a
  [capability](capability.md), a [mechanism](mechanism.md) or a
  [component](component.md). A constraint lists none of them: they're worked
  out. A capability or component that keeps to it respects it directly, so
  no rule is written only to say the constraint again. A rule respects one
  when the software promises something of its own to keep to it, more
  specific than the constraint: "card numbers go straight to the payment
  provider". Many rules respect none, since they're choices the business
  made.
- **A constraint nothing respects is shown as one**, so nobody assumes the
  software keeps to it. `docqet check` reports it as an advisory
  [finding](finding.md), which doesn't fail the check.
- **Each problem shows the constraints that apply to it**, and what among
  what solves it respects each. A constraint the problem names that nothing
  solving it respects is unaddressed: nothing says the solution keeps to it.
  One that applies to everything is kept to wherever it's respected.
- **It has evidence, as a rule does.** A test, audit or config check of the
  obligation itself says `docqet:verifies constraint:<id>`, whatever respects
  it, and a [gap](gap.md) can affect it where it isn't kept to yet. Nothing
  implements a constraint: what keeps to it respects it.
- **It's one across the product**, as a problem is, and projects
  bound by the same constraint share its ID.
- **It has no stability level.** It has a
  [readiness](readiness.md): how ready the capabilities it bears on are:
  those that respect it, follow a rule respecting it, or rely on a component
  respecting it, with those the mechanisms respecting it apply to.

Capabilities solve problems; what keeps to a constraint respects it. Both
point toward why, as
[problem space and solution space](../areas/authoring.md#problem-space-and-solution-space)
sets out.

## How it's written

A constraint is a doc whose `docqet` is `constraint`. Its frontmatter, in order, is `docqet`, `id`, `name`, `description`, `source` and `applies`:

- **`name`** is the constraint in a few words: `Invoice numbers run in
  sequence for the tax office`.
- **`description`** says what must be kept to, and why it can't be changed.
- **`source`**, optional, says where it comes from: a law, a contract, a
  policy and who sets it, or a fact.
- **`applies`**, optional, is `project` or `product` when it applies to
  every problem in its project or product. Leave it out when the problems it
  bounds name it.

Its body, which can be left out, is anything more, such as the clause or
article, or what happens if it's broken.
[`invoice-numbers-in-sequence.md`](../../examples/hotel-billing/docqet/constraints/invoice-numbers-in-sequence.md):

```markdown
---
docqet: constraint
id: invoice-numbers-in-sequence
name: Invoice numbers run in sequence for the tax office
description: >-
  The tax office requires the hotel's invoices to be numbered in one
  sequence, with no number missing or used twice.
source: Tax law
applies: project
---
```

A rule links it with `respects: [constraint:invoice-numbers-in-sequence]`,
and a problem it bounds alone would name it with
`subject-to: [constraint:invoice-numbers-in-sequence]`.
