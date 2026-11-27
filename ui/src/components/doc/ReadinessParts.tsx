import { ReadinessMark } from "../Readiness";
import { startedOf, type Readiness, type DocqetState } from "../../state";
import { useStatusFor } from "../../model";
import { Stat } from "../shell/layout";
import { tabHref } from "./DocPage";
import Skeleton from "@mui/material/Skeleton";
import { ReadFallback } from "../ReadFallback";

/* How ready it is, as a figure in the header, as its pie, linking to its improvements on `tab`. `of` heads its popover. */
export function ReadinessStat({ readiness, tab, of }: { readiness: Readiness; tab: string; of: string }) {
  const note = [
    ...(readiness.started ? [`From ${readiness.started} started`] : []),
    ...(readiness.notStarted.length ? [`${readiness.notStarted.length} not started`] : []),
  ].join(" · ");
  return (
    <Stat
      label="Readiness"
      term="readiness"
      value={readiness.percent === null ? "Nothing started" : <ReadinessMark readiness={readiness} of={of} inButton />}
      note={note || "Drafts don't count"}
      href={`${tabHref(tab)}#improvements`}
    />
  );
}

/*
 * The readiness of the capabilities `forRef` names, as the server works it
 * out, within `initiative` when given: nothing while it's read, and with
 * `started`, nothing unless something in them is started.
 */
export function ReadinessFor({
  state,
  forRef,
  initiative,
  of,
  started = false,
}: {
  state: DocqetState;
  forRef: string;
  initiative?: string;
  of: string;
  started?: boolean;
}) {
  const read = useStatusFor(state, forRef, initiative);
  if (!read.data) return <ReadFallback read={read} what="readiness" inline skeleton={<Skeleton variant="rounded" width={120} height={22} />} />;
  if (started && !startedOf(read.data.readiness)) return null;
  return <ReadinessMark readiness={read.data.readiness} of={of} />;
}
