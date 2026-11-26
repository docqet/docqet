import { ReadinessMark, StillNeeds } from "../Readiness";
import { startedOf, type Readiness, type DocketState } from "../../state";
import { useStatusFor } from "../../model";
import { Section, Stat } from "../shell/layout";
import { tabHref } from "./DocPage";

/* How ready it is, as a figure in the header, as its pie, linking to what it still needs on its first tab. `of` heads its popover. */
export function ReadinessStat({ readiness, tab, of }: { readiness: Readiness; tab: string; of: string }) {
  const note = [
    ...(readiness.notReady.length ? [`${readiness.notReady.length} with something left`] : []),
    ...(readiness.notStarted.length ? [`${readiness.notStarted.length} not started`] : []),
  ].join(" · ");
  return (
    <Stat
      label="Readiness"
      term="readiness"
      value={readiness.percent === null ? "Nothing started" : <ReadinessMark readiness={readiness} of={of} inButton />}
      note={note || (readiness.percent === null ? "Drafts don't count" : "Nothing left on any capability")}
      href={`${tabHref(tab)}#still-needs`}
    />
  );
}

/* What it still needs before people can use it, as a section of its first tab. */
export function StillNeedsSection({ readiness, readyText }: { readiness: Readiness; readyText: string }) {
  return (
    <Section id="still-needs" title="What it still needs" term="readiness" note="What would make it more ready: each capability with something left, and what.">
      <StillNeeds readiness={readiness} readyText={readyText} />
    </Section>
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
  state: DocketState;
  forRef: string;
  initiative?: string;
  of: string;
  started?: boolean;
}) {
  const status = useStatusFor(state, forRef, initiative);
  if (!status || (started && !startedOf(status.readiness))) return null;
  return <ReadinessMark readiness={status.readiness} of={of} />;
}
