import { LeftCounts, type LeftKind } from "./LeftMark";
import { type Capability, type Open } from "../../state";

/* What's open on a capability, as counts, each with its mark. */
export function OpenSummary({ open }: { open: Open }) {
  const counts: [LeftKind, number][] = [
    ["decision", open.decisions.length],
    ["product-gap", open.gaps.length],
    ["technical-gap", open.technical.length],
  ];
  return <LeftCounts counts={counts} />;
}

/* What's open on a capability, as the server has it: with `technical` false, as for a persona, only what someone using the product would notice. */
export const openOf = (capability: Capability, technical = true): Open => (technical ? capability.open : { ...capability.open, technical: [] });
