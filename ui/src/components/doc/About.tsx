import { type ReactNode } from "react";
import { Facets, facets } from "../Fields";
import { Body } from "../markdown/Markdown";
import { DomainIcon } from "../names";
import { ProjectIcon } from "../shell/ProductFilter";
import { domainName, projectName, type Contribution, type Doc, type DocketState } from "../../state";
import { Section } from "../shell/layout";
import { type DocGo } from "./DocPage";

/* Above what a source says, where several define it: the domain, where they differ, and the project it's from. */
export function SourceFrom({ state, doc, from }: { state: DocketState; doc: Doc; from: Contribution }) {
  return (
    <div className="page-source-from">
      {doc.from.some((o) => o.domain !== from.domain) ? (
        <span className="explore-crumb">
          <DomainIcon size={14} />
          {domainName(state, from.domain)}
        </span>
      ) : null}
      <span className="explore-crumb">
        <ProjectIcon size={14} />
        {projectName(state, from.project)}
      </span>
    </div>
  );
}

/*
 * What a doc is, beyond its name and description: its fields, by its type, as
 * cards side by side. Where several sources define it, each gets a column,
 * headed by where it's from, with its own description, so they can be
 * compared. Nothing when no source has any.
 */
export function Sources({ kind, doc, title, aside, ...go }: DocGo & { kind: string; doc: Doc; title: ReactNode; aside?: ReactNode }) {
  const { state } = go;
  const several = doc.from.length > 1;
  const fielded = doc.from.filter((f) => facets(kind, f, go).length || (several && f.description));
  if (!fielded.length) return null;
  return (
    <Section title={title} aside={aside}>
      {several ? (
        <div className="page-sources">
          {fielded.map((f, i) => (
            <div key={i} className="page-source">
              <SourceFrom state={state} doc={doc} from={f} />
              {f.description ? <p className="page-source-summary">{f.description}</p> : null}
              <Facets items={facets(kind, f, go)} />
            </div>
          ))}
        </div>
      ) : (
        <Facets items={facets(kind, fielded[0], go)} />
      )}
    </Section>
  );
}

export const hasBody = (doc: Doc) => doc.from.some((f) => f.body.trim());

/* On a tab of its own, a body is shown nearly whole: only a very long one is cut short. */
export const BODY_LIMIT = 2400;

/* A doc's body, as written, or each source's, side by side, where several wrote one. */
export function Bodies({ doc, ...go }: DocGo & { doc: Doc }) {
  const written = doc.from.filter((f) => f.body.trim());
  if (!written.length) return null;
  if (written.length === 1)
    return (
      <div className="page-about">
        <Body from={written[0]} go={go} limit={BODY_LIMIT} />
      </div>
    );
  return (
    <div className="page-sources">
      {written.map((f, i) => (
        <div key={i} className="page-source">
          <SourceFrom state={go.state} doc={doc} from={f} />
          <Body from={f} go={go} limit={BODY_LIMIT} />
        </div>
      ))}
    </div>
  );
}
