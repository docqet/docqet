---
docqet: rule
id: links-point-toward-why
name: Every link points toward why
uses: [concept:link]
why: >-
  Each link has one place to be written, in the doc that changes when it
  does, so keeping links true is one edit to one file, and nobody has to
  remember which side holds it. Product docs stay true however the software
  is built, and problems stay true whatever solves them.
---

A link is written in the more concrete doc and names the more general one.
Across the spaces that's toward why: code to technical docs, to product
docs, to problem docs, skipping a space when there's nothing between.
Within a space it's up: a capability is within a feature, a feature within
an area, and a component within a bigger component.

So product docs never link to technical docs, and problem docs never link to
product docs. Docqet works out every reverse link, so each doc shows both
directions.
