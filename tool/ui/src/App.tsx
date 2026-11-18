import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import Box from "@mui/material/Box";
import Canvas, { type CanvasHandle } from "./Canvas";
import { MaturityRing } from "./design/maturity/MaturityRing";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { STABILITY_LEVEL_IDS, levelColor } from "./design/stability/stability";
import { mapItems, tidyMap } from "./FeatureMap";
import Logo from "./Logo";
import ProjectSwitcher from "./ProjectSwitcher";
import Search, { type Target } from "./Search";
import { loadProjects, loadState, type DocketState, type ProjectEntry } from "./state";

/* The project named in the page's address, as `?project=<id>`. */
const projectInUrl = () => new URLSearchParams(window.location.search).get("project");

/*
 * Docket's one page: a project's features and their capabilities, mapped on
 * a canvas, under a header with the project's maturity. The page can show
 * any project `projects.json` lists, one at a time, and the address says
 * which. Where the cards sit is this browser's own, kept per project.
 */
export default function App() {
  const [projects, setProjects] = useState<ProjectEntry[] | null>(null);
  const [wanted, setWanted] = useState(projectInUrl);
  const [state, setState] = useState<DocketState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects().then(setProjects, (e: unknown) => setError(String(e)));
    const onPop = () => setWanted(projectInUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* No projects listed means the one state.json beside the page. */
  const current = projects?.find((p) => p.id === wanted) ?? projects?.[0];
  const path = projects === null ? null : (current?.state ?? "./state.json");

  useEffect(() => {
    if (path === null) return;
    let stale = false;
    loadState(path).then(
      (s) => {
        if (stale) return;
        setState(s);
        setError(null);
        document.title = `${s.project.name} · Docket`;
      },
      (e: unknown) => !stale && setError(String(e)),
    );
    return () => {
      stale = true;
    };
  }, [path]);

  const switchTo = (id: string) => {
    window.history.pushState(null, "", `?project=${encodeURIComponent(id)}`);
    setWanted(id);
  };

  if (error) {
    return (
      <div className="message">
        <Logo />
        <h1>The state couldn't be read</h1>
        <p>
          Docket reads <code>projects.json</code>, or else <code>state.json</code>, from beside this page.
          Run <code>docket index</code>, then reload.
        </p>
        <p className="faint">{error}</p>
      </div>
    );
  }
  if (!state || !projects) return <div className="message faint">Loading…</div>;

  /* Keyed by project, so switching starts its canvas and search afresh. */
  return <ProjectView key={state.project.id} state={state} projects={projects} onSwitch={switchTo} />;
}

function ProjectView({
  state,
  projects,
  onSwitch,
}: {
  state: DocketState;
  projects: ProjectEntry[];
  onSwitch: (id: string) => void;
}) {
  const header = useRef<HTMLDivElement>(null);
  const canvas = useRef<CanvasHandle>(null);
  const items = useMemo(() => mapItems(state), [state]);
  return (
    <>
      <Canvas
        ref={canvas}
        items={items}
        tidy={(sizes) => tidyMap(state, sizes)}
        storageKey={`docket.layout.v1:${state.project.id}`}
        clearOf={header}
      />
      <Header
        state={state}
        projects={projects}
        onSwitch={onSwitch}
        ref={header}
        onSelect={(t) => canvas.current?.show(t.item, t.row)}
      />
      <Legend />
    </>
  );
}

function Header({
  state,
  projects,
  onSwitch,
  ref,
  onSelect,
}: {
  state: DocketState;
  projects: ProjectEntry[];
  onSwitch: (id: string) => void;
  ref: Ref<HTMLDivElement>;
  onSelect: (target: Target) => void;
}) {
  const when = new Date(state.indexedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const { maturity } = state.summary;
  const started = state.features.filter((f) => f.maturity !== null);
  return (
    <div className="topbar" ref={ref}>
      <div className="panel brand" data-no-pan>
        <Logo />
        <span className="divider" aria-hidden />
        <div className="project">
          <ProjectSwitcher
            name={state.project.name}
            current={state.project.id}
            projects={projects}
            onSwitch={onSwitch}
          />
          <span className="faint">
            <code>{state.commit}</code> · {when}
          </span>
        </div>
      </div>

      <Search state={state} onSelect={onSelect} />

      <div className="panel stats" data-no-pan>
        {maturity !== null ? (
          <div className="stat stat-maturity">
            <MaturityRing
              progress={maturity}
              subject="project"
              count={started.length}
              size={40}
              breakdown={
                <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                  {[...started]
                    .sort((a, b) => b.maturity! - a.maturity!)
                    .map((f) => (
                      <Box
                        key={f.id}
                        component="li"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          py: 0.5,
                        }}
                      >
                        <span>{f.name}</span>
                        <RingGlyph progress={f.maturity!} size={20} />
                      </Box>
                    ))}
                </Box>
              }
            />
            <div>
              <Box component="span" className="stat-n" sx={levelColor(maturityBand(maturity))}>
                {MATURITY_BANDS[maturityBand(maturity)]}
              </Box>
              <span className="stat-label">project maturity</span>
            </div>
          </div>
        ) : null}
        <Stat n={state.features.length} label={state.features.length === 1 ? "feature" : "features"} />
        <Stat
          n={state.capabilities.length}
          label={state.capabilities.length === 1 ? "capability" : "capabilities"}
        />
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="stat">
      <span className="stat-n">{n}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* What the rings' colors mean: maturity's four bands, in their levels' colors. */
function Legend() {
  return (
    <div className="legend panel" data-no-pan>
      <span className="legend-title">Maturity</span>
      {STABILITY_LEVEL_IDS.map((id, i) => (
        <span key={id} className="legend-item">
          <Box component="span" className="swatch" aria-hidden sx={levelColor(id)} />
          {MATURITY_BANDS[id]}
          <span className="faint">{i * 25}%</span>
        </span>
      ))}
    </div>
  );
}
