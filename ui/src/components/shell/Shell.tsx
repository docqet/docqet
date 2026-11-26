import type { ReactNode } from "react";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import { ConceptIcon } from "../Concepts";
import { GapIcon } from "../left/LeftMark";
import { Tip } from "../Tip";
import Logo from "./Logo";
import { PersonaIcon } from "../Personas";
import ProductFilter, { type ProductChoice } from "./ProductFilter";
import ScopeFilter, { InitiativeIcon } from "./ScopeFilter";
import type { Scope } from "../../scope";
import { followLink, navigate, sectionHref, sectionOf, docHref, type Route, type Section } from "../../routes";
import Search, { type Selection } from "./Search";
import { openDecisions, pageHref, type DocketState, type Product } from "../../state";
import "./shell.css";

/*
 * Every view's frame: a bar across the top that says where the reader is and
 * lets them find anything (the product and its projects, search, the
 * glossary), a nav down the side for which question they're asking, and the
 * view itself filling the rest. Clicks on in-app links anywhere inside move
 * without reloading.
 */
export default function Shell({
  state,
  product,
  products,
  scope,
  route,
  onProduct,
  onProjects,
  children,
}: {
  state: DocketState;
  product: Product;
  products: ProductChoice[];
  scope: Scope;
  route: Route;
  onProduct: (id: string) => void;
  onProjects: (ids: string[]) => void;
  children: ReactNode;
}) {
  const select = (s: Selection) => {
    if ("pick" in s) navigate(pageHref(s.pick));
    else if ("rule" in s) navigate(docHref("rule", s.rule));
    else onProjects([s.project]);
  };
  return (
    <div className="shell" onClick={followLink}>
      <header className="shell-top">
        <a className="shell-brand" href={sectionHref("overview")} aria-label="Overview">
          <Logo />
        </a>
        <span className="shell-divider" aria-hidden />
        <ProductFilter showing={state.projects} product={product} products={products} onProduct={onProduct} onProjects={onProjects} />
        <ScopeFilter scope={scope} initiatives={state.initiatives} />
        <div className="shell-search">
          <Search state={state} all={product.projects} onSelect={select} />
        </div>
        <Tip title="What Docket's words mean">
          <a
            className="shell-icon-link"
            href={sectionHref("glossary")}
            aria-label="Glossary"
            aria-current={route.kind === "section" && route.section === "glossary" ? "page" : undefined}
          >
            <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
          </a>
        </Tip>
      </header>
      <SideNav state={state} at={sectionOf(route)} />
      <main className="shell-main">{children}</main>
    </div>
  );
}

type NavItem = { section: Section; label: string; icon: ReactNode; question: string; count?: number };

function SideNav({ state, at }: { state: DocketState; at: Section }) {
  const decisions = [...state.domains, ...state.features, ...state.capabilities, ...state.mechanisms, ...state.components].reduce(
    (n, doc) => n + openDecisions(doc).length,
    0,
  );
  const groups: { label?: string; items: NavItem[] }[] = [
    {
      items: [
        { section: "overview", label: "Overview", icon: <InsightsOutlinedIcon />, question: "How is it doing?" },
        { section: "map", label: "Map", icon: <HubOutlinedIcon />, question: "How does it all fit together?" },
      ],
    },
    {
      label: "Product",
      items: [
        {
          section: "features",
          label: "Features",
          icon: <WidgetsOutlinedIcon />,
          question: "What can it do? Domains, features and capabilities",
          count: state.features.length,
        },
        {
          section: "personas",
          label: "Personas",
          icon: <PersonaIcon size={20} />,
          question: "Who it serves, and how ready it is for them",
          count: state.personas.length,
        },
        ...(state.initiatives.length
          ? [
              {
                section: "initiatives" as const,
                label: "Initiatives",
                icon: <InitiativeIcon size={20} />,
                question: "Bodies of work, such as the MVP, and how ready each is",
                count: state.initiatives.length,
              },
            ]
          : []),
        {
          section: "language",
          label: "Language",
          icon: <ConceptIcon size={20} />,
          question: "What the words mean, and the rules that must hold",
          count: state.concepts.length + state.rules.length,
        },
      ],
    },
    {
      label: "Engineering",
      items: [
        {
          section: "built",
          label: "How it's built",
          icon: <BuildOutlinedIcon />,
          question: "Mechanisms and components",
          count: state.mechanisms.length + state.components.length,
        },
      ],
    },
    {
      label: "State",
      items: [
        { section: "left", label: "What's left", icon: <GapIcon />, question: "Gaps and open decisions, riskiest first", count: state.gaps.length + decisions },
        { section: "decided", label: "Decided", icon: <TaskAltRoundedIcon />, question: "Tradeoffs and non-goals", count: state.tradeoffs.length },
        {
          section: "problems",
          label: "Doc problems",
          icon: <WarningAmberRoundedIcon />,
          question: "Contradictions and mistakes in the docs",
          count: state.problems.length,
        },
      ],
    },
  ];
  return (
    <nav className="shell-side" aria-label="Sections">
      {groups.map((g, i) => (
        <div key={i} className="shell-side-group">
          {g.label ? <div className="shell-side-label">{g.label}</div> : null}
          {g.items.map((item) => (
            <Tip key={item.section} title={item.question} placement="right">
              <a className="shell-side-item" href={sectionHref(item.section)} aria-current={at === item.section ? "page" : undefined}>
                <span className="shell-side-icon" aria-hidden>
                  {item.icon}
                </span>
                <span className="shell-side-name">{item.label}</span>
                {item.count ? <span className="shell-side-count">{item.count}</span> : null}
              </a>
            </Tip>
          ))}
        </div>
      ))}
    </nav>
  );
}
