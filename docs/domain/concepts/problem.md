# Problem

Something the indexer, or combining, found wrong in the docs, such as a link
to a doc that doesn't exist, a capability in two features, or a
[contradiction](contradiction.md) between projects.

## Details

Problems are about the docs, never the software: Docket checks that the docs
hold together, since they're only useful if they do. They're always derived,
and can be about anything. The spec lists
[every kind](../../../spec/README.md#problems), such as:

- `unknown-id`: a link or annotation names a doc, gap or tradeoff that doesn't
  exist, such as a `docket:gap` left behind after its gap was closed.
- `unlinked-rule`: no capability follows a rule.
- `until-not-served`: a technical gap's `until` names a capability its system
  or component doesn't list.
- `contradiction`: contributions that should agree don't.

## In the spec

Each is in the project's [state](state.md), with its type, what it's about,
the capabilities it affects, and a message. Hotel Billing had this one until
the refunds draft started following the rule:

```json
{
  "type": "unlinked-rule",
  "subject": "rule:payments/overpayments-are-refunded",
  "capabilities": [],
  "message": "No capability follows this rule.",
  "domain": "billing"
}
```

## Not to be confused with

- [Gap](gap.md): something the software doesn't do yet, declared on purpose.
  A problem is a mistake in the docs.
- No evidence: a rule or capability nothing points at. That's a prompt, not a
  problem, since nothing requires evidence.
