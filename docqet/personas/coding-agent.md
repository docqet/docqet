---
docqet: persona
id: coding-agent
name: Ada
description: >-
  A coding agent making changes to a project that uses Docqet, through the
  agent kit and the `docqet` command.
role: Agent
title: null
---

Not a person, but someone Docqet is written for all the same: much of the
work in a Docqet repository is done by agents, and the kit exists for them.

## Needs

- To read what a change touches, and what its stability level allows, before
  making it.
- To keep docs and annotations current in the same change as the code.
- To know which decisions are a person's to make, and to ask, or record an
  open decision, rather than decide them.

## Knows

Whatever its instructions and the repository tell it, and nothing it isn't
told. It works out intention from code readily, bugs included, so what it
infers needs a person to confirm.

## Context

In a session with an engineer, or on its own in CI. It works through
commands, so a question it can't answer with one is a question it guesses at.
