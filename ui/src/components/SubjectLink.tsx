import { NAMES, TECHNICAL_NAMES } from "../Explore";
import { DomainIcon } from "../FeatureMap";
import { CapabilityStability } from "./CapabilityLabel";
import { docHref, type DocKind } from "../routes";
import { find, technicalDoc, type Capability, type Doc, type DocketState } from "../state";

const KIND_NAMES = { ...NAMES, ...TECHNICAL_NAMES };

/* What a gap, tradeoff or decision is on, as a link to its page, with its icon, and with `withLevel`, a capability's stability. */
export function SubjectLink({ state, type, id, withLevel = false }: { state: DocketState; type: string; id: string; withLevel?: boolean }) {
  const technical = type === "mechanism" || type === "component";
  const doc: Doc | undefined = technical
    ? technicalDoc(state, `${type}:${id}`)
    : find<Doc>(type === "domain" ? state.domains : type === "feature" ? state.features : state.capabilities, id);
  if (!doc) return <span className="lf-subject">{id}</span>;
  const icon = type === "domain" ? <DomainIcon size={15} /> : KIND_NAMES[type as keyof typeof KIND_NAMES]?.icon;
  return (
    <span className="lf-subject-wrap">
      <a className="lf-subject" href={docHref(type as DocKind, id)}>
        {icon}
        {doc.name}
      </a>
      {withLevel && type === "capability" ? <CapabilityStability level={(doc as Capability).stability} name={doc.name} focusable={false} /> : null}
    </span>
  );
}
