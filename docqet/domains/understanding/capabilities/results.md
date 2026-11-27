---
docqet: capability
id: results
domain: understanding
name: Test and QA results
description: >-
  CI sends each commit's test and QA results to the server, beside its state.
stability: draft
solves: [problem:knowledge-stuck-in-the-repository]
decisions:
  - topic: Matching tests to evidence
    question: >-
      JUnit names a test by its class or file and its name, while an
      annotation is on a file and line. How roughly does that match on real
      projects, and does it need an annotation format that names the test?
---

Today it's `docqet results`.
