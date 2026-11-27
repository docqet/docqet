---
docqet: capability
id: improvements
domain: understanding
name: Improvements
description: >-
  What would make it more ready, and by how much? Everyone sees which gap to
  close, decision to answer or capability to promote would raise the readiness
  of a capability, feature, domain, product, persona or initiative most, in
  that order.
stability: prototype
personas: [persona:product-owner, persona:engineer]
concepts: [concept:readiness@understanding, concept:maturity@understanding, concept:exposure@understanding, concept:risk@understanding]
rules:
  - rule:drafts-claim-nothing@understanding
decisions:
  - topic: Promoting with a gap against the new level
    question: >-
      Promoting a capability whose gap breaks a claim the new level makes can
      lower its readiness, through exposure. Is that shown as one improvement,
      closing the gap and then promoting, or as the gap alone, with the
      promotion listed once it would help?
---

It answers one question for anyone looking at the software: what would make
this more ready? It's asked of whatever they're looking at, whether that's
one capability, a feature, a domain, a project or the whole product, what
serves a persona, or an initiative, and the improvements count the same
capabilities its readiness does.

It replaces what was shown as what's left everywhere: a list of every open
gap and decision says what's open, not what would help, and what's left
read as a finish line. Every open gap and decision is still listed, under
the improvements.

It's not a finish line or a to-do list. Software that keeps growing is never
done, and readiness is a recommendation that people judge. Improvements say
what could be done and what each would change. Whether any of it is worth
doing, and when to stop, is for people to decide.

## Includes

- Everyone sees, for each improvement, how much it would raise readiness,
  and whether it does that by lowering exposure or raising maturity.
- Promoting a capability to its next level is an improvement, raising
  maturity.
- Closing the riskiest gap on a capability is an improvement, lowering
  exposure by the difference between it and the next riskiest gap or
  decision.
- Answering the riskiest rated open decision on a capability is an
  improvement too, lowering exposure the same way. It says what's at stake
  in the answer changing what people rely on, not something falling short,
  and what the answer becomes, such as a new gap, would count on its own. A
  decision with no ratings raises nothing, so it's never an improvement.
- A gap or decision that isn't the riskiest on any capability raises
  nothing yet, so it isn't listed until it is.
- One gap or decision that's the riskiest on several capabilities, such as
  one on a mechanism they're built on, or a decision on a feature or
  domain, is one improvement, counting all of them.
- Improvements are ordered by how much each would raise readiness, most
  first, and say when one would move it into the next quarter, such as from
  Partial to Viable.
- In a list of capabilities, features or domains, each shows the
  improvement that would raise its readiness most, and how many more there
  are.
- With one initiative showing, improvements count only what's in it, as
  every other figure does.
- Something with nothing that would raise its readiness, such as a feature
  whose capabilities are all GA with no gaps, shows no improvements, without
  saying it's done.
