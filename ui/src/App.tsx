import { useMemo, type ReactNode } from "react";
import Logo from "./components/shell/Logo";
import BuiltPage from "./pages/built/List";
import DecidedPage from "./pages/decided/List";
import FeaturesPage from "./pages/features/List";
import GapPage from "./pages/gaps/View";
import GlossaryPage from "./pages/glossary/View";
import LanguagePage from "./pages/language/List";
import LeftPage from "./pages/left/List";
import MapPage from "./pages/map/View";
import OverviewPage from "./pages/overview/View";
import InitiativesPage from "./pages/initiatives/List";
import PersonasPage from "./pages/personas/List";
import ProblemsPage from "./pages/problems/List";
import RulePage from "./pages/rules/View";
import CapabilityView from "./pages/capabilities/View";
import ConceptView from "./pages/concepts/View";
import DomainView from "./pages/domains/View";
import FeatureView from "./pages/features/View";
import InitiativeView from "./pages/initiatives/View";
import PersonaView from "./pages/personas/View";
import TechnicalView from "./pages/built/View";
import type { ProductChoice } from "./components/shell/ProductFilter";
import { navigate, routeOf, useSearch, type Route } from "./routes";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ReadError, useDelayed } from "./components/ReadFallback";
import { ShellSkeleton } from "./components/shell/ShellSkeleton";
import { loadProduct, useRead } from "./model";
import { listProducts, type ProductResource } from "./services/docket/products";
import { scopeOf, scopeParam } from "./scope";
import Shell from "./components/shell/Shell";
import type { DocketState, Product } from "./state";

/* The product and projects named in the address, as `?product=<id>&project=<id>,<id>`. */
const showingIn = (search: string) => {
  const params = new URLSearchParams(search);
  return { product: params.get("product"), projects: (params.get("project") ?? "").split(",").filter(Boolean) };
};

/* A product and its projects, as the product filter offers them. */
const choiceOf = (p: ProductResource): ProductChoice => ({
  id: p.id,
  name: p.name,
  projects: p.projects.map((x) => ({ ...x, maturity: x.maturity?.percent ?? null, band: (x.maturity?.band ?? null) as Product["projects"][number]["band"] })),
});

/*
 * Docket: one product's projects at a time, in the shell's frame, at the view
 * or doc page the address names, all of it read from the server's API. The
 * page can be filtered to some of the product's projects, and to one
 * initiative; the address says which, and the server narrows what it serves
 * to them.
 */
export default function App() {
  const search = useSearch();
  const wanted = useMemo(() => showingIn(search), [search]);
  const route = useMemo(() => routeOf(search), [search]);
  const scope = useMemo(() => scopeOf(search), [search]);

  const listed = useRead("products", (signal) => listProducts(signal));
  const all = listed.data;

  /* Each product, and its projects, to choose from. */
  const products: ProductChoice[] = useMemo(() => (all ?? []).map(choiceOf), [all]);
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
  /* Some of the product's projects, or all of them, as the server is asked for them. */
  const projects = chosen.length === product?.projects.length ? "" : chosen.join(",");
  const initiative = scopeParam(scope);
  const loaded = useRead(product ? `${product.id}|${projects}|${initiative ?? ""}` : null, (signal) =>
    loadProduct({ product: product!.id, projects: projects ? projects.split(",") : [], initiative }, signal),
  );
  /*
   * What shows: the product as read for what's showing, or, while another
   * set of its projects or another initiative is read, what was showing
   * before, marked as refreshing. Another product's docs never show under
   * this one's frame while its own are read.
   */
  const state = loaded.data ?? (loaded.previous?.showing.product === product?.id ? loaded.previous : null);
  const refreshing = useDelayed(loaded.loading && state !== null);
  const slow = useDelayed(!state && !listed.error && !loaded.error);

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

  if (listed.error || (loaded.error && !state)) {
    return (
      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 640 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={listed.error ? listed.retry : loaded.retry}>
              Retry
            </Button>
          }
        >
          <AlertTitle>The server couldn&rsquo;t be read</AlertTitle>
          Docket reads everything it shows from the server&rsquo;s API, under <code>/api/v1</code>. Check that the server is running, then try again.
        </Alert>
      </Box>
    );
  }
  if (all && !all.length) {
    return (
      <Box sx={{ height: "100%", display: "grid", placeContent: "center", justifyItems: "start", gap: 1.5, p: 3, maxWidth: 520, mx: "auto" }}>
        <Logo />
        <Box component="h1" sx={{ fontSize: 20, fontWeight: "bold", letterSpacing: "-0.02em" }}>
          Nothing to show yet
        </Box>
        <p>
          No project has been applied to this server. Run <code>docket apply</code> in one, then reload.
        </p>
      </Box>
    );
  }
  if (!state || !product) return slow ? <ShellSkeleton /> : null;

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
      {refreshing ? <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: "appBar" }} /> : null}
      {loaded.error ? <ReadError what="what's showing now. What you see is from before" onRetry={loaded.retry} /> : null}
      <ErrorBoundary key={pageKey(route)}>{content(state, route, layoutKey)}</ErrorBoundary>
    </Shell>
  );
}

/*
 * Which page is showing, and which of its tabs: what a crash is contained to.
 * Not the whole address, since a page changes its own params, such as a
 * filter, or the map forgetting `show` once it has opened what it named, and
 * remounting it then would throw away what it just did.
 */
const pageKey = (route: Route) => (route.kind === "doc" ? `${route.doc}:${route.id}` : route.section) + `|${route.tab ?? ""}`;

/* The view or doc page the address names. */
function content(state: DocketState, route: Route, layoutKey: string): ReactNode {
  if (route.kind === "doc") {
    const { doc, id } = route;
    const props = { state, id, route };
    switch (doc) {
      case "rule":
        return <RulePage key={id} {...props} />;
      case "gap":
        return <GapPage key={id} {...props} />;
      case "capability":
        return <CapabilityView key={id} {...props} />;
      case "feature":
        return <FeatureView key={id} {...props} />;
      case "domain":
        return <DomainView key={id} {...props} />;
      case "persona":
        return <PersonaView key={id} {...props} />;
      case "initiative":
        return <InitiativeView key={id} {...props} />;
      case "concept":
        return <ConceptView key={id} {...props} />;
      case "mechanism":
      case "component":
        return <TechnicalView key={`${doc}:${id}`} kind={doc} {...props} />;
    }
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
