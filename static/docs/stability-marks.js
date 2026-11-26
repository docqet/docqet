// Draws stability the way Docket's UI does (its StabilityMark and
// MaturityRing), each with a popover (hover, focus, or tap) saying what it
// means:
//
//   - Scalar's stability badge on each operation becomes a StabilityMark: the
//     Track and the level's name, in the level's color. Scalar draws an
//     x-badges badge as a plain pill; the docs bundler ends each stability
//     badge's name with STABILITY_MARK, so this finds exactly those, and
//     leaves Scalar's own pill in place if it cannot.
//   - Each operation in the navigation gets a short StabilityMark, the Track
//     alone, and each tag a MaturityRing worked out from its operations'
//     levels. The docs page puts every level in window.DOCKET_STABILITY,
//     since the navigation only draws a tag's operations once it's opened.
//   - The introduction's Maturity section gets an overview: the whole API's
//     maturity, how many endpoints are at each level, and every tag's
//     MaturityRing, each linking to its tag.
//
// The levels and maturity's rules are Docket's own, as the UI's stability.ts
// and maturity.ts define them; keep this in step with those.
(() => {
  // U+2060 WORD JOINER: invisible, so a badge reads normally if this script
  // never runs. Keep in step with stabilityMark in internal/handlers.
  const STABILITY_MARK = "⁠";

  const STABILITY_DOCS_URL = "https://github.com/exalynt/docket/blob/main/docket/domains/authoring/concepts/stability-level.md";
  const MATURITY_DOCS_URL = "https://github.com/exalynt/docket/blob/main/docket/domains/reporting/concepts/maturity.md";

  const { operations = {}, tags = {}, order = [] } = window.DOCKET_STABILITY || {};

  // Each level, and the maturity band named for it, which takes its color.
  const LEVELS = [
    {
      id: "prototype",
      name: "Prototype",
      fullName: "Prototype",
      stability: "Exploring",
      summary:
        "Explores an idea so we can choose a direction. Its data may be fake, and it may change completely or be thrown away.",
      colors: { light: "#6d6a7c", dark: "#aeabbe" },
      band: "Experimental",
      bandSummary:
        "Early days. Much of it is still being explored, and could change completely or be dropped.",
    },
    {
      id: "alpha",
      name: "Alpha",
      fullName: "Alpha",
      stability: "Developing",
      summary: "Works, but is still taking shape. Expect frequent breaking changes and bugs.",
      colors: { light: "#9c4f6c", dark: "#de9cb6" },
      band: "Emerging",
      bandSummary:
        "Taking shape. Some of it works, but much is still changing often, so expect bugs and breaking changes.",
    },
    {
      id: "beta",
      name: "Beta",
      fullName: "Beta",
      stability: "Refining",
      summary:
        "Settled enough for real use. Breaking changes and bugs are occasional. We aim to announce breaking changes ahead of time, but can't always.",
      colors: { light: "#3f6f88", dark: "#8ab4cc" },
      band: "Promising",
      bandSummary:
        "Firming up. Enough of it is settled or stable for real use, while other parts are still changing.",
    },
    {
      id: "ga",
      name: "GA",
      fullName: "General Availability",
      stability: "Stable",
      summary:
        "Generally available and stable. It keeps working as it does today. Breaking changes are rare, announced ahead of time, and come with time to move over.",
      colors: { light: "#4c7a58", dark: "#94bd9f" },
      band: "Established",
      bandSummary: "Well established. Most of it is stable and supported, while any newer parts settle in.",
    },
  ];

  const STABILITY_ABOUT =
    "Stability is how much something will still change, and how far you can rely on it today. It moves up from Prototype through Alpha and Beta to General Availability as it’s proven in real use.";

  const MATURITY_ABOUT =
    "Maturity is how far along this group of endpoints is: how close it is to being stable and supported. Before relying on an endpoint, check its own stability.";

  // The level's position, 1 (Prototype) to 4 (GA), or 0 if it's unknown.
  const stepOf = (id) => LEVELS.findIndex((l) => l.id === id) + 1;

  // What an operation at each level adds to its tag's maturity: its score,
  // and how much weight that score carries in the average. One GA weighs as
  // much as 1.5 Betas, 2 Alphas, or 3 Prototypes, and each score sits inside its
  // level's band, so a tag whose operations are all at one level shows in that
  // level's band. Matches MATURITY_LEVELS in the UI's maturity.ts.
  const MATURITY_LEVELS = {
    prototype: { score: 15, weight: 2 },
    alpha: { score: 35, weight: 3 },
    beta: { score: 60, weight: 4 },
    ga: { score: 100, weight: 6 },
  };

  // A tag's maturity: the weighted average of its operations' scores,
  // rounded. Every operation has a level; the docs bundler rejects one
  // without, so a level this doesn't know is skipped rather than counted.
  function maturity(levels) {
    let total = 0;
    let weights = 0;
    for (const id of levels) {
      const level = MATURITY_LEVELS[id];
      if (!level) continue;
      total += level.score * level.weight;
      weights += level.weight;
    }
    return weights === 0 ? 0 : Math.round(total / weights);
  }

  // The level whose band a maturity is in, a quarter of the scale each:
  // 0–24% is Prototype's, 25–49% Alpha's, 50–74% Beta's, and 75–100% GA's.
  const bandOf = (progress) => LEVELS[Math.min(Math.floor(progress / 25), 3)];

  function el(tag, className, ...children) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children);
    return node;
  }

  const SVG = "http://www.w3.org/2000/svg";

  function svg(tag, attributes) {
    const node = document.createElementNS(SVG, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }

  function setColors(node, level) {
    node.style.setProperty("--stability-light", level.colors.light);
    node.style.setProperty("--stability-dark", level.colors.dark);
  }

  // cells returns one element per level, lit up to step.
  function cells(className, step) {
    return LEVELS.map((_, i) => el("span", i < step ? `${className} lit` : className));
  }

  // mark draws a StabilityMark: long, with the level's name, or short, the
  // Track alone, named for assistive tech. `feature` is what it's on, for
  // the popover to say "Make an estimate is in Alpha."
  function mark(level, { short = false, feature = "" } = {}) {
    const track = el("span", "stability-track", ...cells("stability-cell", stepOf(level.id)));
    track.setAttribute("aria-hidden", "true");
    const node = el("span", "stability-mark", track);
    if (short) {
      node.setAttribute("role", "img");
      node.setAttribute("aria-label", `${level.name} stability`);
    } else {
      node.append(level.name);
    }
    node.dataset.stability = level.id;
    if (feature) node.dataset.feature = feature;
    setColors(node, level);
    return node;
  }

  // ringGlyph draws maturity's one look: a ring in four quarter arcs,
  // clockwise from the top (Prototype, Alpha, Beta, GA), each filled as far
  // as the maturity reaches into it, in the band's color, with the
  // percentage inside from 40px across, and beside it below that.
  function ringGlyph(progress, size) {
    const stroke = Math.max(3, Math.round(size / 11));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const quarter = circumference / 4;
    const gap = stroke * 0.9;
    const arc = quarter - gap;
    const inside = size >= 40;

    const ring = svg("svg", { viewBox: `0 0 ${size} ${size}`, width: size, height: size });
    LEVELS.forEach((_, index) => {
      const fill = Math.min(Math.max((progress - index * 25) / 25, 0), 1);
      const common = {
        cx: size / 2,
        cy: size / 2,
        r: radius,
        fill: "none",
        "stroke-width": stroke,
        "stroke-dashoffset": -(index * quarter + gap / 2),
      };
      ring.append(
        svg("circle", { ...common, class: "maturity-track", "stroke-dasharray": `${arc} ${circumference}` }),
      );
      if (fill > 0) {
        ring.append(
          svg("circle", {
            ...common,
            stroke: "currentColor",
            "stroke-dasharray": `${arc * fill} ${circumference}`,
          }),
        );
      }
    });

    const figure = el("span", "maturity-figure", `${progress}%`);
    const disc = el("span", "maturity-disc", ring);
    disc.style.width = disc.style.height = `${size}px`;
    if (inside) {
      figure.style.fontSize = `${Math.round(size * 0.26)}px`;
      disc.append(figure);
    }
    const glyph = el("span", "maturity-glyph", disc);
    if (!inside) glyph.append(figure);
    glyph.setAttribute("aria-hidden", "true");
    setColors(glyph, bandOf(progress));
    return glyph;
  }

  function maturityRing(name, levels, size = 18) {
    const progress = maturity(levels);
    const node = el("span", "maturity-ring", ringGlyph(progress, size));
    node.setAttribute("role", "img");
    node.setAttribute("aria-label", `${name} maturity: ${progress}%, ${bandOf(progress).band}`);
    node.dataset.progress = progress;
    node.dataset.count = levels.length;
    return node;
  }

  // The popover, shared by every mark and ring, filled for whichever one
  // opened it.
  const details = el("div", "stability-details");
  details.id = "stability-details";
  details.setAttribute("role", "tooltip");
  details.hidden = true;
  document.body.append(details);

  function link(href, text) {
    const node = el("a", "stability-details-link", `${text} ↗`);
    node.href = href;
    node.target = "_blank";
    node.rel = "noopener noreferrer";
    return node;
  }

  // fillStability says how stable a mark's level is, like StabilityDetails.
  function fillStability(target) {
    const step = stepOf(target.dataset.stability);
    const level = LEVELS[step - 1];
    const { feature } = target.dataset;
    setColors(details, level);
    const levels = el(
      "div",
      "stability-details-levels",
      el("div", "stability-details-boxes", ...cells("", step)),
      el(
        "div",
        "stability-details-names",
        ...LEVELS.map((l) => el("span", l === level ? "current" : "", l.name)),
      ),
    );
    levels.setAttribute("aria-hidden", "true");
    details.replaceChildren(
      el("div", "stability-details-eyebrow", "Stability"),
      el("div", "stability-details-title", level.fullName, el("span", "", level.stability)),
      levels,
      ...(feature
        ? [el("div", "stability-details-statement", el("strong", "", feature), ` is in ${level.fullName}.`)]
        : []),
      el("div", feature ? "stability-details-definition" : "stability-details-summary", level.summary),
      el("div", "stability-details-about", STABILITY_ABOUT),
      link(`${STABILITY_DOCS_URL}#stability-${level.id}`, "How stability levels work"),
    );
  }

  // fillMaturity says how mature a ring's tag is, like MaturityDetails.
  function fillMaturity(target) {
    const progress = Number(target.dataset.progress);
    const count = Number(target.dataset.count);
    const band = bandOf(progress);
    setColors(details, band);
    details.replaceChildren(
      el("div", "stability-details-eyebrow", "Maturity"),
      el(
        "div",
        "maturity-details-head",
        ringGlyph(progress, 56),
        el(
          "div",
          "",
          el("div", "maturity-details-band", band.band),
          el("div", "maturity-details-basis", `Based on its ${count} ${count === 1 ? "endpoint" : "endpoints"}`),
        ),
      ),
      el("div", "stability-details-summary", band.bandSummary),
      el("div", "stability-details-about", MATURITY_ABOUT),
      link(MATURITY_DOCS_URL, "How maturity works"),
    );
  }

  let openFor = null;
  let closeTimer = 0;

  // place puts the popover below its target, or above it where there's no
  // room below, centred on it and kept 12px inside the window.
  function place(target) {
    const gap = 8;
    const margin = 12;
    // The window less its scrollbars.
    const { clientWidth, clientHeight } = document.documentElement;
    const anchor = target.getBoundingClientRect();
    const { width, height } = details.getBoundingClientRect();
    let top = anchor.bottom + gap;
    if (top + height > clientHeight - margin && anchor.top - gap - height >= margin) {
      top = anchor.top - gap - height;
    }
    const centred = anchor.left + anchor.width / 2 - width / 2;
    const left = Math.min(Math.max(centred, margin), clientWidth - width - margin);
    details.style.top = `${top}px`;
    details.style.left = `${left}px`;
  }

  function open(target) {
    clearTimeout(closeTimer);
    if (openFor === target) return;
    if (openFor) openFor.removeAttribute("aria-describedby");
    if (target.classList.contains("maturity-ring")) fillMaturity(target);
    else fillStability(target);
    // The popover sits outside Scalar's app, so it takes Scalar's font from
    // its target.
    details.style.fontFamily = getComputedStyle(target).fontFamily;
    details.hidden = false;
    place(target);
    target.setAttribute("aria-describedby", details.id);
    openFor = target;
  }

  function close() {
    clearTimeout(closeTimer);
    if (!openFor) return;
    openFor.removeAttribute("aria-describedby");
    details.hidden = true;
    openFor = null;
  }

  // closeSoon leaves time to move the pointer from the target into the
  // popover, so its link can be followed.
  function closeSoon() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 150);
  }

  const targetOf = (event) => event.target.closest?.(".stability-mark, .maturity-ring");

  document.addEventListener("pointerover", (event) => {
    const target = targetOf(event);
    if (target && event.pointerType === "mouse") open(target);
    else if (details.contains(event.target)) clearTimeout(closeTimer);
  });
  document.addEventListener("pointerout", (event) => {
    if (targetOf(event) || details.contains(event.target)) closeSoon();
  });
  document.addEventListener("focusin", (event) => {
    const target = targetOf(event);
    if (target) open(target);
    else if (!details.contains(event.target)) close();
  });
  // A tap opens the popover, and a tap anywhere else closes it.
  document.addEventListener("click", (event) => {
    const target = targetOf(event);
    if (target) open(target);
    else if (!details.contains(event.target)) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("scroll", close, true);
  window.addEventListener("resize", close);

  // upgradeBadges replaces the text of every marked badge under root with a
  // long stability mark, and strips the pill Scalar drew around it.
  function upgradeBadges(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const marked = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeValue.includes(STABILITY_MARK)) marked.push(node);
    }
    for (const node of marked) {
      const name = node.nodeValue.replace(STABILITY_MARK, "").trim();
      const level = LEVELS.find((l) => l.name === name);
      const host = node.parentElement;
      if (!level || !host) continue;
      host.style.background = "none";
      host.style.border = "0";
      host.style.boxShadow = "none";
      host.style.padding = "0";
      const replacement = mark(level);
      replacement.tabIndex = 0;
      node.replaceWith(replacement);
    }
  }

  // upgradeNav marks each operation in the navigation after its name, and
  // puts each tag's maturity beside its name, both outside the name, so a
  // long name wraps without leaving the mark on a line of its own. Scalar links an operation to
  // "#tag/<tag>/<METHOD>/<path>" and a tag to "#tag/<tag>". Neither takes
  // focus: each is inside a link, which already does.
  function upgradeNav(root) {
    for (const item of root.querySelectorAll('li[data-sidebar-id] > a[href^="#tag/"], li[data-sidebar-id] > div > a[href^="#tag/"]')) {
      if (item.querySelector(".stability-mark, .maturity-ring")) continue;
      const label = item.querySelector('[class~="group/button-label"]');
      if (!label) continue;
      const name = label.textContent.trim();
      const [, , method, ...path] = item.getAttribute("href").split("/");
      if (method) {
        const level = LEVELS.find((l) => l.id === operations[`${method} /${path.join("/")}`]);
        if (level && level.id !== "ga") {
          label.after(mark(level, { short: true, feature: name }));
        }
      } else if (tags[name]?.length) {
        label.after(maturityRing(name, tags[name]));
      }
    }
  }

  // Scalar links a tag to "#tag/<slug>": its name in lower case, with a
  // hyphen for each run of anything else.
  const tagHref = (name) => `#tag/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

  // overview draws the Maturity section's overview: the whole API's ring
  // and band, a count of endpoints at each level, then each tag's ring,
  // band, and endpoint count, in the navigation's order.
  function overview() {
    const all = Object.values(operations);
    const progress = maturity(all);
    const ring = maturityRing("Docket API", all, 56);
    ring.tabIndex = 0;
    const counts = el(
      "div",
      "maturity-overview-counts",
      ...LEVELS.filter((level) => all.includes(level.id)).map((level) => {
        const count = all.filter((id) => id === level.id).length;
        const levelMark = mark(level);
        levelMark.tabIndex = 0;
        return el("span", "maturity-overview-count", levelMark, ` ${count}`);
      }),
    );
    const head = el(
      "div",
      "maturity-overview-head",
      ring,
      el(
        "div",
        "",
        el("div", "maturity-details-band", bandOf(progress).band),
        el("div", "maturity-details-basis", `The whole API, based on its ${all.length} endpoints`),
        counts,
      ),
    );
    setColors(head, bandOf(progress));

    const groups = el(
      "ul",
      "maturity-overview-groups",
      ...order
        .filter((name) => tags[name]?.length)
        .map((name) => {
          const levels = tags[name];
          const band = bandOf(maturity(levels));
          const link = el(
            "a",
            "",
            maturityRing(name, levels),
            el(
              "span",
              "maturity-overview-group",
              el("span", "maturity-overview-name", name),
              el(
                "span",
                "maturity-overview-basis",
                `${band.band} · ${levels.length} ${levels.length === 1 ? "endpoint" : "endpoints"}`,
              ),
            ),
          );
          link.href = tagHref(name);
          return el("li", "", link);
        }),
    );
    return el("div", "maturity-overview", head, groups);
  }

  // upgradeIntro puts the overview at the end of the introduction's Maturity
  // section. Scalar draws each of the introduction's headings, with an id
  // ending "/description/<slug>", in a block of its own, and the section's
  // text in the next.
  function upgradeIntro(root) {
    const heading = root.querySelector('h2[id$="/description/maturity"]');
    const block = heading?.closest(".introduction-description > *")?.nextElementSibling;
    const section = block?.querySelector(".markdown") || block;
    if (!section || section.querySelector(".maturity-overview")) return;
    section.append(overview());
  }

  function upgrade() {
    upgradeBadges(document.body);
    upgradeNav(document.body);
    upgradeIntro(document.body);
  }

  // Scalar renders, and re-renders as you navigate, after this runs, so
  // badges and navigation items are upgraded as they appear.
  new MutationObserver(upgrade).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  upgrade();
})();
