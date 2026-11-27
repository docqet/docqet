---
docqet: concept
id: constraint
domain: authoring
name: Constraint
description: >-
  Something imposed from outside that any solution must respect, and that
  nobody on the team can change: a law, a contract, a policy set elsewhere, or
  a fact of the world. Rules and mechanisms say which constraints they
  respect.
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
- **[Rules](rule.md) and [mechanisms](mechanism.md) say which constraints
  they respect**, with `respects`. A constraint lists none of them: they're
  worked out. A rule that respects one is the software's promise to keep to
  it. Many rules respect none, since they're choices the business made. A
  mechanism respects one when how something is built is what keeps to it,
  such as data staying in one country.
- **A constraint nothing respects is shown as one**, so nobody assumes the
  software keeps to it. `docqet check` reports it as an advisory
  [finding](finding.md), which doesn't fail the check.
- **It's one across every project and domain**, as a problem is, and projects
  bound by the same constraint share its ID.
- **It has no stability level.** It has a
  [readiness](../../understanding/concepts/readiness.md): how ready the
  capabilities following the rules that respect it are, with those the
  mechanisms respecting it apply to.

Capabilities solve problems. Rules and mechanisms respect constraints. Both
point toward why, as
[problem space and solution space](../domain.md#problem-space-and-solution-space)
sets out.

## How it's written

A constraint is a doc whose `docqet` is `constraint`, outside any domain. Its
frontmatter, in order, is `docqet`, `id`, `name`, `description` and `source`:

- **`name`** is the constraint in a few words: `Invoice numbers run in
  sequence for the tax office`.
- **`description`** says what must be kept to, and why it can't be changed.
- **`source`**, optional, says where it comes from: a law, a contract, a
  policy and who sets it, or a fact.

Its body, which can be left out, is anything more, such as the clause or
article, or what happens if it's broken.
[`invoice-numbers-in-sequence.md`](../../../../examples/hotel-billing/docqet/constraints/invoice-numbers-in-sequence.md):

```markdown
---
docqet: constraint
id: invoice-numbers-in-sequence
name: Invoice numbers run in sequence for the tax office
description: >-
  The tax office requires the hotel's invoices to be numbered in one
  sequence, with no number missing or used twice.
source: Tax law
---
```

A rule links it with `respects: [constraint:invoice-numbers-in-sequence]`.
