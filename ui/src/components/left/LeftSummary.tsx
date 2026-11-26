import { LeftCounts, type LeftKind } from "./LeftMark";
import { type Capability, type Left } from "../../state";

/* What's left about a capability, as counts, each with its mark. */
export function LeftSummary({ left }: { left: Left }) {
  const counts: [LeftKind, number][] = [
    ["decision", left.decisions.length],
    ["product-gap", left.gaps.length],
    ["technical-gap", left.technical.length],
  ];
  return <LeftCounts counts={counts} />;
}

/* What's left about a capability, as the server has it: with `technical` false, as for a persona, only what someone using the product would notice. */
export const leftOf = (capability: Capability, technical = true): Left => (technical ? capability.left : { ...capability.left, technical: [] });
