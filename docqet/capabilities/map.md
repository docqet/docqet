---
docqet: capability
id: map
name: The map
description: >-
  Everyone sees every feature and capability on one canvas, in its area, with
  the personas each serves, and how each relates to the rest.
stability: prototype
within: feature:seeing-it-whole
solves:
  - problem:work-not-tied-to-a-need
  - problem:newcomers-cant-find-their-way
  - problem:no-shared-picture-of-how-its-built
included-in: [initiative:why-first-class]
uses: [concept:area, concept:feature, concept:capability, concept:persona]
gaps:
  - id: no-problems
    name: Problems aren't on it
    impact: inconvenient
    likelihood: certain
    reach: most
    description: >-
      The map shows personas beside capabilities, but not the problems
      between them, so it can't show which pain each capability answers, or
      which pains nothing answers.
  - id: no-technical-layer
    name: How it's built isn't on it
    impact: inconvenient
    likelihood: certain
    reach: some
    description: >-
      Components, their archetypes and the big components they're within
      can't be shown, so the map stops at what the product does and never
      reaches how it's built.
  - id: no-lens
    name: Nothing lights up what's in a problem, persona or initiative
    impact: inconvenient
    likelihood: certain
    reach: most
    description: >-
      Picking a problem, persona or initiative doesn't light up everything in
      it across features, so seeing what serves one means reading every card.
---
