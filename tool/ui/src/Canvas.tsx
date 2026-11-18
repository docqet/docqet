import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 1.6;
/* How far apart the background's dots are, at 100%. */
const DOT = 22;
/* Room around the content when fitting it, and below the floating header. */
const PAD = 40;
/* How far a press moves before it's a drag rather than a click. */
const DRAG_FROM = 3;
/* How long the camera takes to glide to a card, and how long the card stays lit. */
const GLIDE_MS = 320;
const FLASH_MS = 1800;

export type Pos = { x: number; y: number };
export type Size = { w: number; h: number };
export type CanvasItem = { id: string; node: ReactNode };

type View = { x: number; y: number; zoom: number };

/* What the page can ask of the canvas. */
export type CanvasHandle = {
  /*
   * Bring a card into view and light it up for a moment, and with `row`, the
   * element inside it that matches, such as one capability in a feature.
   */
  show: (id: string, row?: string) => void;
};
type Saved = { positions: Record<string, Pos>; view?: View };

const clamp = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

/*
 * A canvas of cards: drag a card to move it, or drag the background, or
 * scroll, to move around; Ctrl/⌘ + scroll or a pinch zooms around the
 * pointer, and the buttons and + - 0 zoom around the middle or fit
 * everything in view. Tidy puts every card back where `tidy` lays it out.
 *
 * Where the cards are and where the canvas is looking are kept in this
 * browser's localStorage under `storageKey`, so they survive a reload. Only
 * this browser sees them, and a card with no saved place goes where `tidy`
 * puts it. Fitting keeps the content below `clearOf`, the header floating
 * over the top of it. Through `ref`, the page can bring a card into view.
 */
export default function Canvas({
  items,
  tidy,
  storageKey,
  clearOf,
  ref,
}: {
  items: CanvasItem[];
  tidy: (sizes: Record<string, Size>) => Record<string, Pos>;
  storageKey: string;
  clearOf: RefObject<HTMLElement | null>;
  ref?: Ref<CanvasHandle>;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const pan = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; from: Pos; moved: boolean } | null>(null);

  const [saved] = useState<Saved>(() => readSaved(storageKey));
  const [view, setView] = useState<View>(saved.view ?? { x: PAD, y: PAD, zoom: 1 });
  const [moved, setMoved] = useState<Record<string, Pos>>(saved.positions);
  const [sizes, setSizes] = useState<Record<string, Size> | null>(null);
  const [panning, setPanning] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  /* The card moved last sits on top. */
  const [top, setTop] = useState<string | null>(null);
  /* The card just brought into view, lit up for a moment. */
  const [flash, setFlash] = useState<string | null>(null);
  const viewNow = useRef(view);
  viewNow.current = view;
  const glide = useRef(0);

  const tidied = sizes ? tidy(sizes) : null;
  const place = (id: string): Pos => moved[id] ?? tidied?.[id] ?? { x: 0, y: 0 };

  /* The box around every card, in canvas coordinates. */
  const bounds = useCallback(
    (positions: (id: string) => Pos) => {
      if (!sizes || !items.length) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const { id } of items) {
        const p = positions(id);
        const s = sizes[id] ?? { w: 0, h: 0 };
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x + s.w);
        maxY = Math.max(maxY, p.y + s.h);
      }
      return { minX, minY, width: maxX - minX, height: maxY - minY };
    },
    [items, sizes],
  );

  /* Everything in view, no larger than 100%. `readable` keeps it at least 75% on a narrow screen. */
  const fit = useCallback(
    (positions: (id: string) => Pos, readable = false) => {
      const f = frame.current;
      const b = bounds(positions);
      if (!f || !b) return;
      const top = (clearOf.current?.getBoundingClientRect().bottom ?? 0) + PAD / 2;
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
    setSizes(next);
  }, [items]);

  /* The first view, once the cards are measured: the saved one, or everything fitted. */
  const placed = useRef(false);
  useLayoutEffect(() => {
    if (!sizes || placed.current) return;
    placed.current = true;
    if (!saved.view) fit(place, true);
  }, [sizes]);

  /* Keep where the cards are and where the canvas is looking, a moment after they change. */
  useEffect(() => {
    if (!placed.current) return;
    const timer = setTimeout(() => writeSaved(storageKey, { positions: moved, view }), 250);
    return () => clearTimeout(timer);
  }, [storageKey, moved, view]);

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

  useImperativeHandle(ref, () => ({
    show(id, row) {
      const f = frame.current;
      const s = sizes?.[id];
      if (!f || !s) return;
      const p = place(id);
      const zoom = clamp(Math.min(Math.max(viewNow.current.zoom, 0.85), 1));
      const top = (clearOf.current?.getBoundingClientRect().bottom ?? 0) + PAD / 2;
      const room = f.clientHeight - top - PAD;
      const y = top + Math.max(0, (room - s.h * zoom) / 2) - p.y * zoom;
      glideTo({ zoom, x: f.clientWidth / 2 - (p.x + s.w / 2) * zoom, y });
      setTop(id);
      setFlash(id);
      const el = row ? nodes.current.get(id)?.querySelector(row) : null;
      el?.classList.add("flash-row");
      setTimeout(() => {
        setFlash((current) => (current === id ? null : current));
        el?.classList.remove("flash-row");
      }, FLASH_MS);
    },
  }));

  const tidyUp = () => {
    setMoved({});
    if (tidied) fit((id) => tidied[id] ?? { x: 0, y: 0 });
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

  /* Dragging a card. The press is held, so the card follows the pointer even past the canvas's edge. */
  const startDrag = (id: string) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    drag.current = { id, sx: e.clientX, sy: e.clientY, from: place(id), moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.sx) / view.zoom;
    const dy = (e.clientY - d.sy) / view.zoom;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < DRAG_FROM) return;
      d.moved = true;
      setDragging(d.id);
      setTop(d.id);
    }
    setMoved((m) => ({ ...m, [d.id]: { x: Math.round(d.from.x + dx), y: Math.round(d.from.y + dy) } }));
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(null);
  };

  return (
    <div
      ref={frame}
      className={`canvas${panning || dragging ? " dragging" : ""}`}
      style={{
        backgroundSize: `${DOT * view.zoom}px ${DOT * view.zoom}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
      onPointerDown={(e) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest("[data-no-pan]")) return;
        cancelAnimationFrame(glide.current);
        pan.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
        e.currentTarget.setPointerCapture(e.pointerId);
        setPanning(true);
      }}
      onPointerMove={(e) => {
        const p = pan.current;
        if (p) setView((v) => ({ ...v, x: p.vx + e.clientX - p.x, y: p.vy + e.clientY - p.y }));
      }}
      onPointerUp={() => {
        pan.current = null;
        setPanning(false);
      }}
      onPointerCancel={() => {
        pan.current = null;
        setPanning(false);
      }}
    >
      <div className="world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
        {items.map(({ id, node }) => {
          const p = place(id);
          return (
            <div
              key={id}
              ref={(el) => {
                if (el) nodes.current.set(id, el);
                else nodes.current.delete(id);
              }}
              className={`item${dragging === id ? " lifted" : ""}${flash === id ? " flash" : ""}`}
              style={{
                transform: `translate(${p.x}px, ${p.y}px)`,
                visibility: tidied ? undefined : "hidden",
                zIndex: dragging === id ? 3 : top === id ? 2 : 1,
              }}
              onPointerDown={startDrag(id)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {node}
            </div>
          );
        })}
      </div>

      <div className="zoom panel" data-no-pan>
        <button type="button" onClick={() => zoomMiddle((z) => z / 1.2)} aria-label="Zoom out">
          −
        </button>
        <button type="button" className="zoom-level" onClick={() => zoomMiddle(() => 1)} title="Back to 100%">
          {Math.round(view.zoom * 100)}%
        </button>
        <button type="button" onClick={() => zoomMiddle((z) => z * 1.2)} aria-label="Zoom in">
          +
        </button>
        <span className="zoom-divider" aria-hidden />
        <button type="button" className="text-button" onClick={fitAll}>
          Fit
        </button>
        <button
          type="button"
          className="text-button"
          onClick={tidyUp}
          title="Put every card back in its tidy place"
        >
          Tidy
        </button>
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
      return { positions: parsed.positions, view: valid ? { ...v, zoom: clamp(v.zoom) } : undefined };
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
