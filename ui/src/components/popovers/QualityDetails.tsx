import type { RubricQuality } from "../../state";
import { StabilityMark } from "../stability/StabilityMark";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";

/* What a quality of the rubric is about, and how much each level asks of it. */
export function QualityDetails({ quality }: { quality: RubricQuality }) {
  return (
    <DetailsCard card width={380}>
      <DetailsEyebrow>Quality</DetailsEyebrow>
      <strong>{quality.question}</strong>
      <p className="sc-why">{quality.why}</p>
      <ul className="sc-summaries">
        {quality.levels.map((l) => (
          <li key={l.level} data-empty={!l.summary || undefined}>
            <StabilityMark level={l.level} statement={false} focusable={false} />
            <span>{l.summary ?? "Nothing expected."}</span>
          </li>
        ))}
      </ul>
    </DetailsCard>
  );
}
