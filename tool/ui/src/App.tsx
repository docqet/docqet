import { useEffect, useMemo, useState, type ReactNode } from "react";
import Logo from "./Logo";
import DetailPage from "./Page";
import BuiltPage from "./pages/BuiltPage";
import DecidedPage from "./pages/DecidedPage";
import FeaturesPage from "./pages/FeaturesPage";
import GapPage from "./pages/GapPage";
import GlossaryPage from "./pages/GlossaryPage";
import LanguagePage from "./pages/LanguagePage";
import LeftPage from "./pages/LeftPage";
import MapPage from "./pages/MapPage";
import OverviewPage from "./pages/OverviewPage";
import InitiativesPage from "./pages/InitiativesPage";
import PersonasPage from "./pages/PersonasPage";
import ProblemsPage from "./pages/ProblemsPage";
import RulePage from "./pages/RulePage";
import type { ProductChoice } from "./ProductFilter";
import { navigate, routeOf, useSearch, type Route } from "./routes";
import { scopeFiles, scopeOf } from "./scope";
import Shell from "./shell/Shell";
import { combine, loadProjects, loadState, productsOf, projectOf, type DocketState, type PageAt, type StateFile } from "./state";

/* The product and projects named in the address, as `?product=<id>&project=<id>,<id>`. */
const showingIn = (search: string) => {
  const params = new URLSearchParams(search);
  return { product: params.get("product"), projects: (params.get("project") ?? "").split(",").filter(Boolean) };
};

/*
 * Docket: one product's projects at a time, in the shell's frame, at the view
 * or doc page the address names. `projects.json` lists the projects' state,
 * or else there's the one `state.json`. The page can be filtered to some of
 * the product's projects; the address says which.
 */
export default function App() {
  const [files, setFiles] = useState<StateFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const search = useSearch();
  const wanted = useMemo(() => showingIn(search), [search]);
  const route = useMemo(() => routeOf(search), [search]);
  const scope = useMemo(() => scopeOf(search), [search]);

  useEffect(() => {
    loadProjects()
      .then((paths) => Promise.all(paths.length ? paths.map((p) => loadState(p)) : [loadState()]))
      .then(setFiles, (e: unknown) => setError(String(e)));
  }, []);

  /* Each project's state with only the capabilities in scope, so everything below, maturity included, counts only those. */
  const scoped = useMemo(() => scopeFiles(files ?? [], scope), [files, scope]);
  /* Each product, and its projects, to choose from. */
  const products: ProductChoice[] = useMemo(() => productsOf((files ?? []).map(projectOf)), [files]);
  /*
   * The product showing: the one the address names, or else the one its
   * first named project is in, or else the first. And its projects showing:
   * those the address names, or else all of them.
   */
  const product = useMemo(() => {
    const named = products.find((p) => p.id === wanted.product) ?? products.find((p) => p.projects.some((x) => x.id === wanted.projects[0]));
    return named ?? products[0];
  }, [products, wanted]);
  const chosen = useMemo(() => {
    const known = product?.projects.map((p) => p.id) ?? [];
    const named = wanted.projects.filter((id) => known.includes(id));
    return named.length ? named : known;
  }, [product, wanted]);
  const state = useMemo(() => files && combine(scoped.filter((f) => chosen.includes(f.project.id))), [files, scoped, chosen]);

  /*
   * Show a product, and some of its projects, or all of them with none
   * named, staying on the same view. The address names the product only
   * when there's a choice of them. Another product has different docs, so
   * a doc's page goes back to the overview.
   */
  const choose = (productId: string, ids: string[] = []) => {
    const of = products.find((p) => p.id === productId);
    if (!of) return;
    const projects = ids.length === of.projects.length ? [] : ids;
    const params = new URLSearchParams(window.location.search);
    if (productId !== product?.id) for (const key of [...params.keys()]) if (key !== "view") params.delete(key);
    params.delete("product");
    params.delete("project");
    if (products.length > 1) params.set("product", productId);
    if (projects.length) params.set("project", projects.join(","));
    navigate(params.size ? `?${params}` : window.location.pathname);
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
  if (!state || !files || !product) return <div className="message faint">Loading…</div>;

  /* Keyed by the product's projects, so each product has a canvas of its own and a different set starts it afresh. */
  const layoutKey = product.projects.map((p) => p.id).join(",");
  return (
    <Shell
      state={state}
      product={product}
      products={products}
      scope={scope}
      route={route}
      onProduct={(id) => choose(id)}
      onProjects={(ids) => choose(product.id, ids)}
    >
      {content(state, route, layoutKey)}
    </Shell>
  );
}

/* The view or doc page the address names. */
function content(state: DocketState, route: Route, layoutKey: string): ReactNode {
  if (route.kind === "doc") {
    const { doc, id } = route;
    if (doc === "rule") return <RulePage key={id} state={state} id={id} route={route} />;
    if (doc === "gap") return <GapPage key={id} state={state} id={id} route={route} />;
    const page = { kind: doc, id } as PageAt;
    return <DetailPage key={`${doc}:${id}`} state={state} page={page} route={route} />;
  }
  switch (route.section) {
    case "overview":
      return <OverviewPage state={state} route={route} />;
    case "map":
      return <MapPage key={layoutKey} state={state} layoutKey={layoutKey} />;
    case "features":
      return <FeaturesPage state={state} route={route} />;
    case "personas":
      return <PersonasPage state={state} route={route} />;
    case "initiatives":
      return <InitiativesPage state={state} route={route} />;
    case "language":
      return <LanguagePage state={state} route={route} />;
    case "built":
      return <BuiltPage state={state} route={route} />;
    case "left":
      return <LeftPage state={state} route={route} />;
    case "decided":
      return <DecidedPage state={state} route={route} />;
    case "problems":
      return <ProblemsPage state={state} route={route} />;
    case "glossary":
      return <GlossaryPage state={state} route={route} />;
  }
}
