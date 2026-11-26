import {
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { Grip } from "./design/Grip";
import { Tip } from "./design/Tip";

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 1.6;
/* How far apart the background's dots are, at 100%. */
const DOT = 22;
/* Room around the content when fitting it, and below the floating header. */
const PAD = 40;
/* How far a press moves before it's a drag rather than a click. */
const DRAG_FROM = 3;
/* How small a region can be resized to, though never smaller than around its cards. */
const MIN_GROUP = 160;
/* How long the camera takes to glide to a card, and how long the card stays lit. */
const GLIDE_MS = 320;
const FLASH_MS = 1800;

export type Pos = { x: number; y: number };
export type Size = { w: number; h: number };
export type CanvasItem = { id: string; node: ReactNode };
/*
 * A region drawn behind some of the cards, such as a domain behind its
 * features. It wraps wherever its cards are, so it stretches to follow one
 * dragged away, and can be resized larger than that. Dragging its grip moves
 * it with its cards. `label` sits in the room above them, and clicking the
 * region calls `onOpen`.
 */
export type CanvasGroup = { id: string; items: string[]; label: ReactNode; onOpen?: () => void };
/* The room a group leaves around its cards, and above them for its label. */
export const GROUP_PAD = 18;
export const GROUP_HEAD = 44;

type Box = { x: number; y: number; w: number; h: number };

type View = { x: number; y: number; zoom: number };

/* Which edges a resize handle moves: -1 the left or top, 1 the right or bottom. */
const EDGES: Record<string, [number, number]> = {
  n: [0, -1],
  ne: [1, -1],
  e: [1, 0],
  se: [1, 1],
  s: [0, 1],
  sw: [-1, 1],
  w: [-1, 0],
  nw: [-1, -1],
};
const RESIZE_CURSORS: Record<string, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

/* A press on the canvas, until it's let go: it pans, or moves a card or a group by its grip, or resizes a group. */
type Gesture = { sx: number; sy: number; moved: boolean } & (
  | { kind: "pan"; from: View }
  | { kind: "card"; id: string; from: Pos }
  | { kind: "group"; id: string; from: Record<string, Pos>; box?: Box }
  | { kind: "resize"; id: string; edge: string; box: Box }
);

/* What the page can ask of the canvas. */
export type CanvasHandle = {
  /*
   * Bring cards or groups into view, all of them together, and light them up
   * for a moment, and with `row`, the elements inside them that match, such
   * as one capability in a feature. Those not on the map are left out.
   */
  show: (ids: string[], row?: string) => void;
};
/* `groups` are the regions resized, each at least this box. */
type Saved = { positions: Record<string, Pos>; groups?: Record<string, Box>; view?: View };

/* How far down the frame the content has to stay below `over`, such as a bar floating over its top, or 0 with none. */
const clearBelow = (frame: HTMLElement, over: HTMLElement | null) =>
  over ? Math.max(0, over.getBoundingClientRect().bottom - frame.getBoundingClientRect().top) : 0;

const clamp = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

/*
 * A canvas of cards: drag a card or a group by its grip to move it, drag a
 * group's edge to resize it, and click either to open it. Drag anywhere
 * else, or scroll, to move around; Ctrl/⌘ + scroll or a pinch zooms around the
 * pointer, and the buttons and + - 0 zoom around the middle or fit
 * everything in view. Tidy puts every card back where `tidy` lays it out.
 *
 * Where the cards are and where the canvas is looking are kept in this
 * browser's localStorage under `storageKey`, so they survive a reload. Only
 * this browser sees them, and a card with no saved place goes where `tidy`
 * puts it. Fitting keeps the content below `clearOf`, the header floating
 * over the top of it. Through `ref`, the page can bring a card into view.
 * `groups` are regions behind cards, each wrapping its own, and `show` can
 * bring one of them into view too. `links` draws a line from one card to each
 * of some others, under the cards, such as from a persona to what serves them.
 * `lens` is set on the canvas as `data-lens`, for the page's styles to color
 * the cards by, without them rebuilding.
 */
export default function Canvas({
  items,
  groups = [],
  tidy,
  storageKey,
  clearOf,
  fitKey,
  links,
  clearRight = 0,
  lens,
  ref,
}: {
  items: CanvasItem[];
  groups?: CanvasGroup[];
  tidy: (sizes: Record<string, Size>) => Record<string, Pos>;
  storageKey: string;
  clearOf: RefObject<HTMLElement | null>;
  /* When this changes, such as when a filter does, everything left is fitted into view. */
  fitKey?: string;
  /* Lines from one card to others, or null for none. Those not on the map are left out. */
  links?: { from: string; to: string[] } | null;
  /* How much of the frame's right edge a panel floating over it covers, so what's shown is centered in the rest. */
  clearRight?: number;
  lens?: string;
  ref?: Ref<CanvasHandle>;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const gesture = useRef<Gesture | null>(null);
  /* Set as a drag ends, so the click its release makes doesn't open what's under it. */
  const dragged = useRef(false);

  const [saved] = useState<Saved>(() => readSaved(storageKey));
  const [view, setView] = useState<View>(saved.view ?? { x: PAD, y: PAD, zoom: 1 });
  const [moved, setMoved] = useState<Record<string, Pos>>(saved.positions);
  const [resized, setResized] = useState<Record<string, Box>>(saved.groups ?? {});
  const [sizes, setSizes] = useState<Record<string, Size> | null>(null);
  /* What's being dragged now, for its look and the cursor. */
  const [active, setActive] = useState<{ kind: Gesture["kind"]; id?: string; edge?: string } | null>(null);
  /* The card moved last sits on top, and the group moved last over the other groups and their cards. */
  const [top, setTop] = useState<string | null>(null);
  const [topGroup, setTopGroup] = useState<string | null>(null);
  /* The cards just brought into view, lit up for a moment. */
  const [flash, setFlash] = useState<string[]>([]);
  const viewNow = useRef(view);
  viewNow.current = view;
  const glide = useRef(0);

  const tidied = sizes ? tidy(sizes) : null;
  const place = (id: string): Pos => moved[id] ?? tidied?.[id] ?? { x: 0, y: 0 };

  /* A group's box: around those of its cards that are drawn, and at least as large as it was resized to, or null with none drawn. */
  const groupBox = useCallback(
    (group: CanvasGroup, positions: (id: string) => Pos, own: Record<string, Box> = resized): Box | null => {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const id of group.items) {
        const s = sizes?.[id];
        if (!s) continue;
        const p = positions(id);
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x + s.w);
        maxY = Math.max(maxY, p.y + s.h);
      }
      if (minX === Infinity) return null;
      minX -= GROUP_PAD;
      minY -= GROUP_HEAD;
      maxX += GROUP_PAD;
      maxY += GROUP_PAD;
      const r = own[group.id];
      if (r) {
        minX = Math.min(minX, r.x);
        minY = Math.min(minY, r.y);
        maxX = Math.max(maxX, r.x + r.w);
        maxY = Math.max(maxY, r.y + r.h);
      }
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    },
    [sizes, resized],
  );

  /* The box around every card and group, in canvas coordinates. */
  const bounds = useCallback(
    (positions: (id: string) => Pos, own?: Record<string, Box>) => {
      if (!sizes || !items.length) return null;
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      const add = (b: Box) => {
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.w);
        maxY = Math.max(maxY, b.y + b.h);
      };
      for (const { id } of items) {
        const s = sizes[id] ?? { w: 0, h: 0 };
        add({ ...positions(id), ...s });
      }
      for (const group of groups) {
        const b = groupBox(group, positions, own);
        if (b) add(b);
      }
      return { minX, minY, width: maxX - minX, height: maxY - minY };
    },
    [items, groups, sizes, groupBox],
  );

  /* Where a card or a group is now, or null if it isn't drawn. */
  const boxOf = (id: string): Box | null => {
    const s = sizes?.[id];
    if (s) return { ...place(id), ...s };
    const group = groups.find((g) => g.id === id);
    return group ? groupBox(group, place) : null;
  };

  /* Everything in view, no larger than 100%. `readable` keeps it at least 75% on a narrow screen. */
  const fit = useCallback(
    (positions: (id: string) => Pos, readable = false, own?: Record<string, Box>) => {
      const f = frame.current;
      const b = bounds(positions, own);
      if (!f || !b) return;
      const top = clearBelow(f, clearOf.current) + PAD / 2;
      const across = (f.clientWidth - PAD * 2) / b.width;
      const down = (f.clientHeight - top - PAD) / b.height;
      const zoom = readable ? clamp(Math.max(Math.min(across, 1), 0.75)) : clamp(Math.min(across, down, 1));
      const x = b.width * zoom < f.clientWidth ? (f.clientWidth - b.width * zoom) / 2 : PAD / 4;
      setView({ zoom, x: x - b.minX * zoom, y: top - b.minY * zoom });
    },
    [bounds, clearOf],
  );

  /* Measure every card once it's drawn, so `tidy` knows how tall each is. */
  useLayoutEffect(() => {
    const next: Record<string, Size> = {};
    for (const { id } of items) {
      const el = nodes.current.get(id);
      if (el) next[id] = { w: el.offsetWidth, h: el.offsetHeight };
    }
    // Measuring what was just drawn, then laying out by it, is what a layout effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSizes(next);
  }, [items]);

  /* The first view, once the cards are measured: the saved one, or everything fitted. */
  const placed = useRef(false);
  const firstView = useEffectEvent(() => {
    if (!saved.view) fit(place, true);
  });
  useLayoutEffect(() => {
    if (!sizes || placed.current) return;
    placed.current = true;
    firstView();
  }, [sizes]);

  /*
   * Once the cards a new `fitKey` leaves are measured, fit them into view,
   * then show the card asked for while it was still off the map, if any.
   */
  const fittedFor = useRef(fitKey);
  const pending = useRef<{ ids: string[]; row?: string } | null>(null);
  const measured = useEffectEvent(() => {
    if (fittedFor.current !== fitKey) {
      fittedFor.current = fitKey;
      fit(place);
    }
    const p = pending.current;
    if (p && p.ids.some((id) => boxOf(id))) {
      pending.current = null;
      showNow(p.ids, p.row);
    }
  });
  useLayoutEffect(() => {
    if (!sizes || !placed.current) return;
    measured();
  }, [sizes]);

  /* Keep where the cards are and where the canvas is looking, a moment after they change. */
  useEffect(() => {
    if (!placed.current) return;
    const timer = setTimeout(() => writeSaved(storageKey, { positions: moved, groups: resized, view }), 250);
    return () => clearTimeout(timer);
  }, [storageKey, moved, resized, view]);

  const zoomAt = useCallback((px: number, py: number, to: (zoom: number) => number) => {
    setView((v) => {
      const zoom = clamp(to(v.zoom));
      const k = zoom / v.zoom;
      return { zoom, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  const zoomMiddle = useCallback(
    (to: (zoom: number) => number) => {
      const f = frame.current;
      if (f) zoomAt(f.clientWidth / 2, f.clientHeight / 2, to);
    },
    [zoomAt],
  );

  /* Move the camera to `to`, easing there unless the reader prefers less motion. */
  const glideTo = useCallback((to: View) => {
    cancelAnimationFrame(glide.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setView(to);
      return;
    }
    const from = viewNow.current;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min((now - start) / GLIDE_MS, 1);
      const e = 1 - (1 - k) ** 3;
      setView({
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
        zoom: from.zoom + (to.zoom - from.zoom) * e,
      });
      if (k < 1) glide.current = requestAnimationFrame(step);
    };
    glide.current = requestAnimationFrame(step);
  }, []);

  /* Bring cards or groups into view, as `show` does, once they're measured. */
  function showNow(ids: string[], row?: string) {
    const f = frame.current;
    const drawn = ids.filter((id) => boxOf(id));
    if (!f || !drawn.length) return;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const id of drawn) {
      const b = boxOf(id)!;
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.w);
      maxY = Math.max(maxY, b.y + b.h);
    }
    const b = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    const top = clearBelow(f, clearOf.current) + PAD / 2;
    const room = f.clientHeight - top - PAD;
    /*
     * One card: close enough to read. Several, or a group: far enough out to
     * take them all in, where they fit.
     */
    const width = Math.max(f.clientWidth - clearRight, f.clientWidth / 2);
    const fits = Math.min((width - PAD * 2) / b.w, room / b.h);
    const floor = drawn.length > 1 || !sizes?.[drawn[0]] ? Math.min(0.85, fits) : 0.85;
    const zoom = clamp(Math.min(Math.max(Math.min(viewNow.current.zoom, fits), floor), 1));
    const y = top + Math.max(0, (room - b.h * zoom) / 2) - b.y * zoom;
    glideTo({ zoom, x: width / 2 - (b.x + b.w / 2) * zoom, y });
    if (drawn.length === 1) setTop(drawn[0]);
    setFlash(drawn);
    const rows = row ? drawn.flatMap((id) => [...(nodes.current.get(id)?.querySelectorAll(row) ?? [])]) : [];
    for (const el of rows) el.classList.add("flash-row");
    setTimeout(() => {
      setFlash((current) => (current === drawn ? [] : current));
      for (const el of rows) el.classList.remove("flash-row");
    }, FLASH_MS);
  }

  useImperativeHandle(ref, () => ({
    show(ids, row) {
      /* Not on the map yet, such as when the page has just cleared a filter to show it: show it once it's drawn. */
      if (!ids.some((id) => boxOf(id))) pending.current = { ids, row };
      else showNow(ids, row);
    },
  }));

  const tidyUp = () => {
    setMoved({});
    setResized({});
    if (tidied) fit((id) => tidied[id] ?? { x: 0, y: 0 }, false, {});
  };

  /* Wheel events have to be non-passive to keep the page itself from scrolling or zooming. */
  useEffect(() => {
    const f = frame.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 33 : 1;
      if (e.ctrlKey || e.metaKey) {
        const r = f.getBoundingClientRect();
        zoomAt(e.clientX - r.left, e.clientY - r.top, (z) => z * Math.exp(-e.deltaY * scale * 0.0025));
      } else {
        const dx = (e.shiftKey ? e.deltaY : e.deltaX) * scale;
        const dy = (e.shiftKey ? 0 : e.deltaY) * scale;
        setView((v) => ({ ...v, x: v.x - dx, y: v.y - dy }));
      }
    };
    f.addEventListener("wheel", onWheel, { passive: false });
    return () => f.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const fitAll = () => fit(place);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "+" || e.key === "=") zoomMiddle((z) => z * 1.2);
      else if (e.key === "-") zoomMiddle((z) => z / 1.2);
      else if (e.key === "0") fitAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /*
   * Every press on the canvas: on a resize handle it resizes that group, on a
   * grip it moves that card or group, and anywhere else it pans once it moves,
   * so a click on a card or group still reaches it. Buttons, such as a
   * maturity ring, take their own presses, as does anything in a popover,
   * which React bubbles here though it's drawn elsewhere.
   */
  const press = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (e.button !== 0 || !e.currentTarget.contains(target) || target.closest("[data-no-pan]")) return;
    cancelAnimationFrame(glide.current);
    const at = { sx: e.clientX, sy: e.clientY, moved: false };
    const group = target.closest<HTMLElement>(".group")?.dataset.id;
    const card = target.closest<HTMLElement>(".item")?.dataset.id;
    const edge = target.closest<HTMLElement>("[data-resize]")?.dataset.resize;
    if (edge && !EDGES[edge]) return;
    const grip = target.closest(".grip");
    const box = group ? boxOf(group) : null;
    if (group && edge && box) gesture.current = { ...at, kind: "resize", id: group, edge, box };
    else if (card && grip) gesture.current = { ...at, kind: "card", id: card, from: place(card) };
    else if (group && grip) {
      const members = groups.find((g) => g.id === group)?.items.filter((id) => sizes?.[id]) ?? [];
      gesture.current = { ...at, kind: "group", id: group, from: Object.fromEntries(members.map((id) => [id, place(id)])), box: resized[group] };
    } else gesture.current = { ...at, kind: "pan", from: view };
    /* Dragging something holds the press at once, so it follows the pointer even past the canvas's edge. A pan waits until it moves. */
    if (gesture.current.kind !== "pan") e.currentTarget.setPointerCapture(e.pointerId);
  };

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    if (!g.moved) {
      if (Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < DRAG_FROM) return;
      g.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setActive({ kind: g.kind, id: "id" in g ? g.id : undefined, edge: g.kind === "resize" ? g.edge : undefined });
      if (g.kind === "card") setTop(g.id);
      if (g.kind === "group" || g.kind === "resize") setTopGroup(g.id);
    }
    if (g.kind === "pan") {
      setView((v) => ({ ...v, x: g.from.x + e.clientX - g.sx, y: g.from.y + e.clientY - g.sy }));
      return;
    }
    const dx = (e.clientX - g.sx) / view.zoom;
    const dy = (e.clientY - g.sy) / view.zoom;
    const by = (p: Pos) => ({ x: Math.round(p.x + dx), y: Math.round(p.y + dy) });
    if (g.kind === "card") setMoved((m) => ({ ...m, [g.id]: by(g.from) }));
    else if (g.kind === "group") {
      setMoved((m) => ({ ...m, ...Object.fromEntries(Object.entries(g.from).map(([id, p]) => [id, by(p)])) }));
      const box = g.box;
      if (box) setResized((r) => ({ ...r, [g.id]: { ...box, ...by(box) } }));
    } else {
      /* Each edge being dragged moves by as far as the pointer has, and the opposite one stays put. */
      const [ex, ey] = EDGES[g.edge];
      let { x, y, w, h } = g.box;
      if (ex) {
        const to = Math.max(MIN_GROUP, Math.round(w + ex * dx));
        if (ex < 0) x += w - to;
        w = to;
      }
      if (ey) {
        const to = Math.max(MIN_GROUP, Math.round(h + ey * dy));
        if (ey < 0) y += h - to;
        h = to;
      }
      setResized((r) => ({ ...r, [g.id]: { x, y, w, h } }));
    }
  };

  const release = () => {
    if (gesture.current?.moved) {
      dragged.current = true;
      setTimeout(() => (dragged.current = false));
    }
    gesture.current = null;
    setActive(null);
  };

  const cursor = !active ? undefined : active.kind === "resize" ? RESIZE_CURSORS[active.edge!] : "grabbing";

  /* Each line, from the bottom of `links.from` to the top of a card it links to, curving between them. */
  const linkFrom = tidied && links ? boxOf(links.from) : null;
  const linkPaths = linkFrom
    ? links!.to.flatMap((id) => {
        const b = boxOf(id);
        if (!b) return [];
        const x1 = linkFrom.x + linkFrom.w / 2;
        const y1 = linkFrom.y + linkFrom.h;
        const x2 = b.x + b.w / 2;
        const y2 = b.y;
        const bend = Math.max(48, Math.abs(y2 - y1) / 2);
        return [{ id, d: `M${x1},${y1} C${x1},${y1 + bend} ${x2},${y2 - bend} ${x2},${y2}`, x2, y2 }];
      })
    : [];

  /* The cards of the group moved last, which sit over the other groups with it. */
  const inTopGroup = new Set(groups.find((g) => g.id === topGroup)?.items ?? []);

  return (
    <div
      ref={frame}
      className={`canvas${active ? " dragging" : ""}`}
      data-lens={lens}
      style={{
        backgroundSize: `${DOT * view.zoom}px ${DOT * view.zoom}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
        cursor,
      }}
      onPointerDown={press}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={release}
      onClickCapture={(e) => {
        if (dragged.current) e.stopPropagation();
      }}
    >
      {/*
        Moved by whole pixels, and zoomed with CSS zoom rather than a scale
        transform: the cards are laid out at the size they're shown, so their
        text is drawn as crisply as the rest of the page's, not shrunk from
        another size. Inside, everything is in canvas units, placed by left
        and top, which the zoom scales.
      */}
      <div className="world" style={{ transform: `translate(${Math.round(view.x)}px, ${Math.round(view.y)}px)` }}>
        {/* --zoom lets what keeps its size on screen, such as a resize handle, undo the zoom. */}
        <div className="world-zoom" style={{ zoom: view.zoom, "--zoom": view.zoom } as CSSProperties}>
          {tidied
            ? groups.map((group) => {
                const b = groupBox(group, place);
                return b ? (
                  <div
                    key={group.id}
                    data-id={group.id}
                    className={`group${group.onOpen ? " openable" : ""}${active?.id === group.id ? " lifted" : ""}${flash.includes(group.id) ? " flash" : ""}`}
                    style={{
                      left: b.x,
                      top: b.y,
                      width: b.w,
                      height: b.h,
                      zIndex: topGroup === group.id ? 2 : 0,
                    }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!e.currentTarget.contains(target) || target.closest(".grip, [data-resize], [data-no-pan]")) return;
                      group.onOpen?.();
                    }}
                  >
                    <div className="group-label">
                      <Grip />
                      {group.label}
                    </div>
                    {Object.keys(EDGES).map((edge) => (
                      <div key={edge} className="resize" data-resize={edge} />
                    ))}
                  </div>
                ) : null;
              })
            : null}
          {linkPaths.length ? (
            <svg className="links" aria-hidden>
              {linkPaths.map((l) => (
                <g key={l.id}>
                  <path d={l.d} />
                  <circle cx={l.x2} cy={l.y2} r={4} />
                </g>
              ))}
            </svg>
          ) : null}
          {items.map(({ id, node }) => {
            const p = place(id);
            const lifted = active?.kind === "card" && active.id === id;
            return (
              <div
                key={id}
                ref={(el) => {
                  if (el) nodes.current.set(id, el);
                  else nodes.current.delete(id);
                }}
                data-id={id}
                className={`item${lifted ? " lifted" : ""}${flash.includes(id) ? " flash" : ""}`}
                style={{
                  left: p.x,
                  top: p.y,
                  visibility: tidied ? undefined : "hidden",
                  zIndex: lifted ? 5 : top === id ? 4 : topGroup && inTopGroup.has(id) ? 3 : 1,
                }}
              >
                {node}
              </div>
            );
          })}
        </div>
      </div>

      <div className="zoom panel" data-no-pan>
        <button type="button" onClick={() => zoomMiddle((z) => z / 1.2)} aria-label="Zoom out">
          −
        </button>
        <Tip title="Back to 100%">
          <button type="button" className="zoom-level" onClick={() => zoomMiddle(() => 1)}>
            {Math.round(view.zoom * 100)}%
          </button>
        </Tip>
        <button type="button" onClick={() => zoomMiddle((z) => z * 1.2)} aria-label="Zoom in">
          +
        </button>
        <span className="zoom-divider" aria-hidden />
        <button type="button" className="text-button" onClick={fitAll}>
          Fit
        </button>
        <Tip title="Put every card back in its tidy place">
          <button type="button" className="text-button" onClick={tidyUp}>
            Tidy
          </button>
        </Tip>
      </div>
    </div>
  );
}

/* The saved layout. Storage can be unavailable or hold anything, so a failure just means none. */
function readSaved(key: string): Saved {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as Saved) : null;
    if (parsed && typeof parsed.positions === "object" && parsed.positions) {
      const v = parsed.view;
      const valid = v && [v.x, v.y, v.zoom].every((n) => typeof n === "number" && Number.isFinite(n));
      const groups = parsed.groups && typeof parsed.groups === "object" ? parsed.groups : undefined;
      return { positions: parsed.positions, groups, view: valid ? { ...v, zoom: clamp(v.zoom) } : undefined };
    }
  } catch {
    /* No storage, or something unreadable in it: start tidy. */
  }
  return { positions: {} };
}

function writeSaved(key: string, saved: Saved) {
  try {
    localStorage.setItem(key, JSON.stringify(saved));
  } catch {
    /* No storage: the layout just won't survive a reload. */
  }
}
