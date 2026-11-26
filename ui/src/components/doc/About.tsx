import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { Facets, facets } from "../Fields";
import { Body } from "../markdown/Markdown";
import { DomainIcon } from "../names";
import { ProjectIcon } from "../shell/ProductFilter";
import { domainName, projectName, type Contribution, type Doc, type DocqetState } from "../../state";
import { Section } from "../shell/layout";
import { Crumb, type DocGo } from "./DocPage";

/* Several sources, a column each, to compare. */
const sourcesSx: SystemStyleObject<Theme> = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
  gap: 2.5,
};

/* A source's column, or a body on its own: its parts one under another, with the body in a panel of its own at a readable width. */
const sourceSx: SystemStyleObject<Theme> = {
  display: "grid",
  gap: 1.5,
  minWidth: 0,
  "& > .doc-body": {
    px: 2.75,
    py: 2,
    bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 2%, transparent)`,
    border: 1,
    borderColor: "divider",
    borderRadius: "10px",
  },
  "& > .doc-body .markdown": { maxWidth: "76ch", mt: 0, fontSize: 15, lineHeight: 1.6 },
};

/* Above what a source says, where several define it: the domain, where they differ, and the project it's from. */
export function SourceFrom({ state, doc, from }: { state: DocqetState; doc: Doc; from: Contribution }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 14px",
        pb: 1,
        fontSize: 13,
        fontWeight: 650,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      {doc.from.some((o) => o.domain !== from.domain) ? <Crumb icon={<DomainIcon size={14} />}>{domainName(state, from.domain)}</Crumb> : null}
      <Crumb icon={<ProjectIcon size={14} />}>{projectName(state, from.project)}</Crumb>
    </Box>
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
        <Box sx={sourcesSx}>
          {fielded.map((f, i) => (
            <Box key={i} sx={sourceSx}>
              <SourceFrom state={state} doc={doc} from={f} />
              {f.description ? (
                <Box component="p" sx={{ fontSize: 15, lineHeight: 1.5 }}>
                  {f.description}
                </Box>
              ) : null}
              <Facets items={facets(kind, f, go)} />
            </Box>
          ))}
        </Box>
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
      <Box sx={[sourceSx, { maxWidth: 820 }]}>
        <Body from={written[0]} go={go} limit={BODY_LIMIT} />
      </Box>
    );
  return (
    <Box sx={sourcesSx}>
      {written.map((f, i) => (
        <Box key={i} sx={sourceSx}>
          <SourceFrom state={go.state} doc={doc} from={f} />
          <Body from={f} go={go} limit={BODY_LIMIT} />
        </Box>
      ))}
    </Box>
  );
}
