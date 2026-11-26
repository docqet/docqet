# Docqet's principles

_Why Docqet exists, what it is and isn't, and how to tell whether an idea
belongs in it._

**Contents:** [Software engineering](#how-it-supports-software-engineering) · [What Docqet isn't](#what-docqet-isnt) · [Does it belong in Docqet?](#does-it-belong-in-docqet)

## How it supports software engineering

Docqet defines software engineering as the discipline of applying
engineering craft and judgment to build software that delivers value to
people, consistently behaves as intended, and evolves gracefully. These ideas
take inspiration from
[Exalynt's thinking on software engineering](https://readme.exalynt.com/how-it-works/software-engineering),
but Docqet defines them for itself, along with its stability levels, maturity,
readiness and the rest of its concepts.

A discipline is a set of shared standards that people hold each other to.
Docqet gives a project's standards somewhere to live: an open format for
writing intention down, the stability rubric that says what each level means,
and every change to either reviewed in a pull request alongside the code.

### What the software should do

| The definition says the software…                                                                       | Docqet gives it                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Delivers value to people**                                                                            | Personas and the capabilities that serve them, written down before the code so the people affected can say whether it's the right problem, and how ready the software is for each of them            |
| **Consistently behaves as intended**: does what it's meant to do and avoids what it isn't               | The intention itself, what it should do and must never do, with the code and tests linked to it as evidence. Behavior can't be checked against an intention nobody wrote down                        |
| **Evolves gracefully**: changes with confidence, without breaking what works, with effort in proportion | The rules a change must keep, and the tests that check them, visible before the change is made. Stability levels, so people know what they can depend on and effort stays in proportion to the level |

### Judgment

Docqet defines judgment as the ability to evaluate tradeoffs amid
uncertainty, decide at the right moment, and take responsibility for the
outcomes. Docqet gives each part somewhere to be written down:

| Judgment means…                            | Docqet records                                                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Evaluating tradeoffs**                   | Tradeoffs: what we chose instead of what, with its benefit and drawback                                                           |
| **Amid uncertainty**                       | Known gaps, open decisions, drafts, and Prototype and Alpha levels, so what isn't known or done yet is said plainly               |
| **Deciding at the right moment**           | Open decisions, held where their answer will go until it's time to settle them                                                    |
| **Deciding how much is enough**            | Each capability's stability level, and the stability rubric: what that level generally expects, and what would be overengineering |
| **Taking responsibility for the outcomes** | Every decision made in a commit and reviewed in a pull request. Intention an agent writes counts only once a person confirms it   |

Docqet can't show whether a decision was made with integrity, or with the
people affected at its center. That's up to the people making it.

### Craft

Craft is how well the software is built: clear, simple, secure, dependable
and maintainable. Docqet can't judge code. It holds the team's intention
about how the software is built, and shows where the build falls short:

- **Tradeoffs made on purpose**, with their benefit and drawback, and what
  would make us look again, so a shortcut someone chose isn't mistaken for
  one someone missed.
- **Deliberate code, marked.** A `docqet:tradeoff` comment says code that
  looks wrong is meant to be that way, so neither a person nor an agent
  "fixes" it.
- **Technical gaps**, marked where they are in the code instead of as bare
  TODOs, and shown on every capability that relies on that code.
- **The standard each stability level expects**, grouped by qualities such
  as reliability and security, with each outcome met, not met, or not met by
  choice.

What Docqet shows about craft is still mostly what people declare. It makes
that declaration specific, and puts it beside the code it's about.

### Agents

AI's judgments often lack the circumstances behind a decision, and the
discipline supplies them: what the AI needs to know, and whether what comes
back is right. Docqet gives agents the first, the declared intention, before
they change code. It leaves the second with people: nothing an agent writes
counts until a person confirms it.

Docqet informs judgment and shows the standard of craft, but does neither.
People decide what to build, what level a capability is at, and when a gap
is acceptable. Docqet makes those decisions, and the evidence behind them,
visible to everyone.

## What Docqet isn't

- **A task tracker or roadmap.** It shows what's missing and what each level
  expects, never who will do the work or when.
- **A test runner or a quality gate.** It doesn't run tests or decide whether
  the software passes. It shows the evidence for people to judge. It does
  check that the Docqet docs themselves hold together.
- **A guarantee of accuracy.** People write intention and annotations, and
  people make mistakes. Docqet gets you closer to the truth, and points out
  what it can tell is wrong.
- **A copy of what the code already says.** Lists of endpoints, tables or
  services, and diagrams drawn from the code, stay in the code. Runbooks
  belong wherever a team keeps them.
- **A score to maximize.** Maturity is an indication, not a target: starting
  new work lowers it, and 100% isn't the goal. Readiness is a recommendation,
  and comes with what's left.
- **A place to change intention outside the repository.** Intention is only
  changed in a repository, so it's reviewed with the code. Servers and other
  tools read it and show it, never edit it.

## Does it belong in Docqet?

Before adding something to Docqet, ask:

1. **Does it make the software's intention, state or evidence easier to see,
   understand or keep accurate**, for someone who builds the software or has
   a stake in it?
2. **Does it keep the repository as the only place intention is declared?**
   Tools can read, show and combine it, never become a second place to
   change it.
3. **Does it inform judgment, rather than make the decision?**
4. **Is it intention the code can't show?** Not what a reader could learn
   from the code in a few minutes.

Something that answers yes to all four probably belongs. Something that fails
one probably belongs in another tool, which Docqet can link to:

| Idea                                                                                    | Belongs?   | Why                                                                                         |
| --------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| A pull request comment previewing what the change does to the state                     | Yes        | Makes intention and evidence easier to see, in the review itself                            |
| An API agents query for a capability's rules and level before changing its code         | Yes        | Keeps agents' work tied to the declared intention                                           |
| A history of each capability's level, and of maturity, over time                        | Yes        | Shows where the software is going, all derived from the repository                          |
| Release notes for stakeholders, written from what changed in the state                  | Yes        | Makes the state easy to take in for people who don't read code                              |
| An editor that lets people who don't use git propose a change, as a pull request        | Yes, later | Opens intention to more people, and the change still lands in the repository                |
| A CI check that fails when the Docqet docs are broken, such as a link to a missing rule | Yes, later | Keeps the docs correct. It checks the docs, never the software                              |
| Notifying people when a capability they depend on is demoted or its rules change        | Yes, later | Tells people when what they rely on changes                                                 |
| A known gap linking to the issue where its fix is tracked                               | Yes        | Connects the gap to the work, while planning stays in the tracker                           |
| A tradeoff, with its benefit and drawback, beside the code it explains                  | Yes        | Intention about how it's built that the code can't show                                     |
| A read-only view a team shares with its product's customers                             | Yes, later | Customers have a stake too, and see only what they're allowed to                            |
| Owners, estimates and due dates on known gaps                                           | No         | Planning the work is a task tracker's job (fails 1 and 3)                                   |
| Diagrams of services and components drawn from the code                                 | No         | The code already shows it (fails 4)                                                         |
| A coverage percentage on each capability                                                | No         | A score that stands in for judgment (fails 3)                                               |
| A complexity score for each component                                                   | No         | Measures the code rather than stating intention, and stands in for judgment (fails 3 and 4) |
| A form on the server that changes a capability without a commit                         | No         | Makes the server a second place to declare intention (fails 2)                              |
