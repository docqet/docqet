import { InlineMarkdown } from "../design/markdown/Markdown";
import { DOC_KINDS, type DocKind, type Route } from "../routes";
import { Empty, PageHeader, Section, View } from "../shell/layout";
import { find, type Doc, type DocketState, type Problem } from "../state";
import { DocLink } from "./indexParts";

/*
 * What's wrong in the docs, as the indexer and combining found it, grouped by
 * kind: contradictions first, since two projects disagreeing is the one to
 * settle before anything else reads true, then the other kinds, the most
 * common first. Each says what's wrong and links to what it's about.
 */
export default function ProblemsPage({ state }: { state: DocketState; route: Route }) {
  const types = [...new Set(state.problems.map((p) => p.type))].sort((a, b) => rank(a) - rank(b) || count(state, b) - count(state, a) || a.localeCompare(b));
  return (
    <View title="Doc problems" wide>
      <PageHeader
        title="Doc problems"
        lede="What's wrong in the docs? Contradictions between projects first, then mistakes such as links to things that don't exist."
      />
      {!types.length ? (
        <Empty>No problems: the docs hold together.</Empty>
      ) : (
        types.map((type) => {
          const problems = state.problems.filter((p) => p.type === type).sort((a, b) => a.subject.localeCompare(b.subject));
          return (
            <Section key={type} title={TYPES[type]?.name ?? type} count={problems.length} note={TYPES[type]?.note}>
              <table className="view-table ix-table">
                <thead>
                  <tr>
                    <th className="ix-col-subject">About</th>
                    <th>What's wrong</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((p, i) => (
                    <tr key={`${p.subject}:${i}`}>
                      <td className="ix-col-subject">
                        <Subject state={state} problem={p} />
                      </td>
                      <td>{p.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          );
        })
      )}
    </View>
  );
}

/* Each kind of problem, as the spec lists them, named and said in a line. */
const TYPES: Record<string, { name: string; note: string }> = {
  contradiction: { name: "Contradictions", note: "Projects that should agree about a doc say different things." },
  "in-two-features": { name: "In two features", note: "More than one feature lists the same capability." },
  "duplicate-id": { name: "Duplicate IDs", note: "Two docs, gaps or tradeoffs that should each have their own ID share one." },
  "unknown-id": { name: "Links to nothing", note: "A link, annotation or a gap's rule names a doc, gap or tradeoff that doesn't exist." },
  "invalid-frontmatter": { name: "Invalid fields", note: "A required field is missing, or a value isn't allowed, such as a link of the wrong type." },
  "broken-link": { name: "Broken links", note: "A relative link in a doc's body or a text value doesn't resolve." },
  "unlinked-rule": { name: "Rules nothing follows", note: "No capability follows the rule." },
  "unknown-outcome": {
    name: "Unknown outcomes",
    note: "An outcome that a gap, tradeoff or decision affects, or that a mechanism or component says it meets, isn't in the rubric.",
  },
};

/* Contradictions, and the problems that are contradictions too, before the rest. */
const FIRST = ["contradiction", "in-two-features", "duplicate-id"];
const rank = (type: string) => (FIRST.includes(type) ? FIRST.indexOf(type) : FIRST.length);
const count = (state: DocketState, type: string) => state.problems.filter((p) => p.type === type).length;

/* What a problem is about, linking to its page when it's showing; else as written. */
function Subject({ state, problem }: { state: DocketState; problem: Problem }) {
  const colon = problem.subject.indexOf(":");
  const type = problem.subject.slice(0, colon);
  const id = problem.subject.slice(colon + 1);
  /* A gap: `capability:x#key`, which is its project's in state. */
  if (id.includes("#")) {
    const gap = state.gaps.find((g) => g.id.startsWith(`${problem.subject}@`));
    if (gap) return <DocLink kind="gap" id={gap.id} name={<InlineMarkdown text={gap.name} />} />;
  } else if ((DOC_KINDS as string[]).includes(type)) {
    const doc = find(docsOf(state, type as DocKind), id);
    if (doc) return <DocLink kind={type as DocKind} id={doc.id} name={doc.name} />;
  }
  return <code className="ix-raw">{problem.subject}</code>;
}

function docsOf(state: DocketState, kind: DocKind): Doc[] {
  switch (kind) {
    case "domain":
      return state.domains;
    case "feature":
      return state.features;
    case "capability":
      return state.capabilities;
    case "concept":
      return state.concepts;
    case "persona":
      return state.personas;
    case "initiative":
      return state.initiatives;
    case "mechanism":
      return state.mechanisms;
    case "component":
      return state.components;
    case "rule":
      return state.rules;
    case "gap":
      return [];
  }
}
