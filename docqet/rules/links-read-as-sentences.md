---
docqet: rule
id: links-read-as-sentences
name: Every link reads as a plain sentence
uses: [concept:link]
why: >-
  Links are how people who don't read code learn what relates to what. A link
  that reads as a sentence, in plain words, says what the relationship means
  without a glossary, and makes clear which doc writes it.
---

Each link field is named for the relationship, from the doc that writes it:
a capability is *within* a feature, *solves* a problem, *follows* a rule and
*uses* a concept; a problem is *felt by* personas; a component *serves*
capabilities. Read aloud with the two docs' names, a link is a sentence
anyone could follow: "Room booking follows no double-booking."

A new link field is named the same way: one plain word, or a short phrase,
never a technical term.
