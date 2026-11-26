import { Places } from "./Places";
import { type Capability, type DocketState } from "../../state";

/* Where the code says it implements or verifies something, from its annotations. */
export function EvidencePair({ state, doc }: { state: DocketState; doc: { evidence: Capability["evidence"] } }) {
  return (
    <div className="page-card">
      <div className="page-evidence-pair">
        <div>
          <span className="page-label">Implemented by</span>
          {doc.evidence.implements.length ? <Places state={state} places={doc.evidence.implements} label="" detailed /> : <span className="faint">None</span>}
        </div>
        <div>
          <span className="page-label">Verified by</span>
          {doc.evidence.verifies.length ? <Places state={state} places={doc.evidence.verifies} label="" detailed /> : <span className="faint">None</span>}
        </div>
      </div>
    </div>
  );
}
