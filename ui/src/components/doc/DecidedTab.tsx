import { LeftLabel } from "../left/LeftMark";
import { tradeoffsById, type Doc } from "../../state";
import { TradeoffRows } from "../TradeoffRows";
import { Section } from "../shell/layout";
import { type DocGo } from "./DocPage";

/* The Decided tab: tradeoffs, chosen on purpose with their benefit and drawback. */
export function DecidedTab({
  doc,
  tradeoffs,
  tradeoffTitle,
  tradeoffNote,
  ...go
}: DocGo & { doc: Doc; tradeoffs: string[]; tradeoffTitle?: string; tradeoffNote: string }) {
  const { state } = go;
  return (
    <Section
      title={
        <LeftLabel kind="tradeoff" size={16}>
          {tradeoffTitle}
        </LeftLabel>
      }
      count={tradeoffs.length}
      note={tradeoffNote}
    >
      <TradeoffRows state={state} tradeoffs={tradeoffsById(state, tradeoffs)} here={doc} />
    </Section>
  );
}
