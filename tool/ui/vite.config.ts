import { existsSync, readdirSync, readFileSync } from "node:fs";
import { delimiter, join, resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Connect, type Plugin } from "vite";

/*
 * The UI reads `projects.json` from beside its own page, and each project's
 * `state.json` from where that lists. While developing, both are served from
 * here: every one of the spec's examples, or the state.json files
 * DOCKET_STATE names, separated as in PATH. They're read on every request, so
 * re-indexing shows on reload.
 */
const examples = resolve(import.meta.dirname, "../../spec/examples");

function statePaths(): string[] {
  if (process.env.DOCKET_STATE) {
    return process.env.DOCKET_STATE.split(delimiter)
      .filter(Boolean)
      .map((p) => resolve(p));
  }
  return projectsIn(examples)
    .map((dir) => join(dir, ".docket/state.json"))
    .filter((p) => existsSync(p));
}

/* Every project in a folder: each folder with a docket.yaml, however deep, since one repository can hold several. */
function projectsIn(dir: string): string[] {
  const here = existsSync(join(dir, "docket.yaml")) ? [dir] : [];
  const below = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules")
    .map((e) => e.name)
    .sort()
    .flatMap((name) => projectsIn(join(dir, name)));
  return [...here, ...below];
}

const serveState: Connect.NextHandleFunction = (req, res, next) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const json = (body: string | Buffer) => {
    res.setHeader("Content-Type", "application/json");
    res.end(body);
  };
  if (pathname === "/projects.json") {
    const list = statePaths().map((_, i) => ({ state: `projects/${i}/state.json` }));
    return json(JSON.stringify({ projects: list }));
  }
  const match = pathname.match(/^\/projects\/(\d+)\/state\.json$/);
  const path = match && statePaths()[Number(match[1])];
  if (path) return json(readFileSync(path));
  next();
};

function state(): Plugin {
  return {
    name: "docket-state",
    configureServer(server) {
      server.middlewares.use(serveState);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveState);
    },
  };
}

export default defineConfig({
  plugins: [react(), state()],
  /* Relative, so the built UI works from any folder beside a state.json or projects.json. */
  base: "./",
});
