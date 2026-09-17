/* ============================================================
   THEME  (persisted in localStorage, graceful fallback)
   ============================================================ */
function usePersistentTheme() {
  const read = () => {
    try {
      const v = localStorage.getItem("fossyl_theme");
      if (v) return v;
    } catch (_) {}
    try {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    } catch (_) {}
    return "light";
  };
  const [theme, setTheme] = useState(read);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("fossyl_theme", theme);
    } catch (_) {}
  }, [theme]);
  return [theme, () => setTheme(t => t === "dark" ? "light" : "dark")];
}

/* ============================================================
   SMALL PRIMITIVES
   ============================================================ */
const Icon = ({
  name,
  weight = "thin",
  className = "",
  style
}) => /*#__PURE__*/React.createElement("i", {
  className: `ph-thin ph-${name} ${className}`,
  style: style,
  "aria-hidden": "true"
});
function intentBucket(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}
function PriorityScore({
  score,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `tnum font-bold ${className}`,
    style: {
      color: `var(--pri-${intentBucket(score)}-fg)`
    }
  }, score);
}
function PriorityMeter({
  score,
  ticks = 10
}) {
  const fill = Math.max(1, Math.min(ticks, Math.round(score / (100 / ticks))));
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5",
    role: "img",
    "aria-label": `Priority score ${score} of 100`
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-end gap-[2px]"
  }, Array.from({
    length: ticks
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "pri-tick",
    style: {
      background: i < fill ? `var(--ramp-${i})` : "var(--tick-off)",
      opacity: i < fill ? 1 : 1
    }
  }))), /*#__PURE__*/React.createElement(PriorityScore, {
    score: score,
    className: "text-sm"
  }));
}
function Panel({
  title,
  sub,
  right,
  children,
  className = "",
  pad = "p-5",
  fill = false
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: `surface rounded-card ${fill ? "h-full flex flex-col" : ""} ${className}`
  }, (title || right) && /*#__PURE__*/React.createElement("header", {
    className: "flex flex-col gap-3 px-5 pt-4 pb-3 sm:flex-row sm:items-start sm:justify-between"
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("h2", {
    className: "text-[20px] tracking-tight text-ink"
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-ink3 mt-0.5"
  }, sub)), right), /*#__PURE__*/React.createElement("div", {
    className: `${title ? "px-5 pb-5" : pad} ${fill ? "flex-1 flex flex-col justify-end" : ""}`
  }, children));
}

/* ============================================================
   CHARTS  (hand-built SVG, theme-reactive via CSS vars)
   ============================================================ */
function BarChart({
  data,
  rangeLabel = "Last 8 weeks",
  hoverPrefix = "Week of "
}) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.map(d => d.sessions));
  return /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex items-end gap-2 h-[150px] w-full",
    onMouseLeave: () => setHover(null)
  }, data.map((d, i) => {
    const active = hover === i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "group relative flex-1 h-full flex items-end",
      onMouseEnter: () => setHover(i),
      style: {
        cursor: "crosshair"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative w-full",
      style: {
        height: `${Math.max(8, d.sessions / max * 100)}%`,
        background: "var(--bar-body)",
        borderRadius: "3px 3px 0 0",
        transition: "filter .15s ease",
        filter: active ? "brightness(1.25)" : "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "absolute left-0 right-0 top-0",
      style: {
        height: "3px",
        background: "var(--bar-cap)",
        borderRadius: "3px",
        boxShadow: active ? "0 0 10px 1px var(--bar-cap-glow)" : "0 0 6px 0 var(--bar-cap-glow)"
      }
    })));
  }), hover != null && /*#__PURE__*/React.createElement("div", {
    className: "pointer-events-none absolute -translate-x-1/2 -translate-y-2 px-2.5 py-1.5 surface text-center",
    style: {
      left: `${(hover + 0.5) / data.length * 100}%`,
      bottom: `${data[hover].sessions / max * 100}%`,
      borderRadius: "4px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
      zIndex: 5,
      minWidth: "92px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm tnum text-ink leading-none"
  }, data[hover].sessions), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-ink2 mt-1 leading-none"
  }, "sessions"))), /*#__PURE__*/React.createElement("div", {
    className: "mt-2.5 flex items-center justify-center text-[11px] text-ink2 tnum"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-ink"
  }, hover != null ? `${hoverPrefix}${fmtDay(data[hover].date)}` : rangeLabel)));
}

function AreaChart({ data, rangeLabel = "Last 8 weeks", hoverPrefix = "Week of " }) {
  const [hover, setHover] = useState(null);
  const width = 640;
  const height = 180;
  const padding = { top: 12, right: 8, bottom: 28, left: 8 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map(d => d.sessions));
  const points = data.map((d, i) => ({
    x: padding.left + (data.length === 1 ? plotWidth / 2 : i / (data.length - 1) * plotWidth),
    y: padding.top + plotHeight - d.sessions / max * plotHeight
  }));
  const linePath = smoothPath(points.map(point => [point.x, point.y]));
  const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + plotHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padding.top + plotHeight).toFixed(1)} Z` : "";
  const labelIndexes = data.length <= 4 ? data.map((_, i) => i) : [0, Math.floor((data.length - 1) / 2), data.length - 1];
  const activePoint = hover == null ? null : points[hover];

  return /*#__PURE__*/React.createElement("div", { className: "relative" }, /*#__PURE__*/React.createElement("div", {
    className: "relative w-full",
    onMouseLeave: () => setHover(null)
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    className: "block w-full",
    style: { height: "180px", overflow: "visible" },
    preserveAspectRatio: "none",
    role: "img",
    "aria-label": "Sessions over time area chart"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "propertyAreaGradient",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", { offset: "5%", stopColor: "var(--chart-ink)", stopOpacity: "0.28" }), /*#__PURE__*/React.createElement("stop", { offset: "95%", stopColor: "var(--chart-ink)", stopOpacity: "0.02" }))),
  [0, 0.5, 1].map((fraction, i) => {
    const y = padding.top + plotHeight * fraction;
    return /*#__PURE__*/React.createElement("line", { key: `grid-${i}`, x1: padding.left, x2: width - padding.right, y1: y, y2: y, stroke: "var(--chart-grid)", strokeDasharray: i === 2 ? "0" : "3 4" });
  }), /*#__PURE__*/React.createElement("path", { d: areaPath, fill: "url(#propertyAreaGradient)" }), /*#__PURE__*/React.createElement("path", {
    d: linePath,
    fill: "none",
    stroke: "var(--chart-ink)",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), points.map((point, i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: point.x - plotWidth / Math.max(data.length, 1) / 2,
    y: padding.top,
    width: plotWidth / Math.max(data.length, 1),
    height: plotHeight,
    fill: "transparent",
    onMouseEnter: () => setHover(i),
    style: { cursor: "crosshair" }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "relative mt-1 h-4 text-[11px] text-ink2 tnum"
  }, labelIndexes.map(i => /*#__PURE__*/React.createElement("span", {
    key: `label-${i}`,
    className: "absolute whitespace-nowrap",
    style: {
      left: `${points[i]?.x / width * 100 || 0}%`,
      transform: i === 0 ? "none" : i === points.length - 1 ? "translateX(-100%)" : "translateX(-50%)"
    }
  }, data[i] ? fmtDay(data[i].date) : ""))), activePoint && /*#__PURE__*/React.createElement("div", {
    className: "pointer-events-none absolute -translate-x-1/2 -translate-y-2 px-2.5 py-1.5 surface text-center",
    style: {
      left: `${activePoint.x / width * 100}%`,
      top: `${activePoint.y / height * 100}%`,
      borderRadius: "4px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
      zIndex: 5,
      minWidth: "92px"
    }
  }, /*#__PURE__*/React.createElement("div", { className: "text-sm tnum text-ink leading-none" }, data[hover].sessions), /*#__PURE__*/React.createElement("div", { className: "text-[10px] text-ink2 mt-1 leading-none" }, "sessions"))), /*#__PURE__*/React.createElement("div", {
    className: "mt-2.5 flex items-center justify-center text-[11px] text-ink2 tnum"
  }, /*#__PURE__*/React.createElement("span", { className: "text-ink" }, hover != null ? `${hoverPrefix}${fmtDay(data[hover].date)}` : rangeLabel)));
}
function StackedIntentBar({
  b,
  labels = ["High", "Mid", "Low"],
  unit = "sessions"
}) {
  const total = b.high + b.mid + b.low || 1;
  const pct = {
    high: b.high / total * 100,
    mid: b.mid / total * 100,
    low: b.low / total * 100
  };
  const cHigh = pct.high / 2;
  const cMid = pct.high + pct.mid / 2;
  const cLow = pct.high + pct.mid + pct.low / 2;
  const grad = `linear-gradient(90deg,
    var(--grad-green) 0%,
    var(--grad-green) ${cHigh.toFixed(1)}%,
    var(--grad-yellow) ${cMid.toFixed(1)}%,
    var(--grad-red) ${cLow.toFixed(1)}%,
    var(--grad-red) 100%)`;
  const seg = [{
    k: "high",
    v: b.high,
    label: labels[0],
    fg: "var(--pri-high-fg)",
    bg: "var(--pri-high-bg)"
  }, {
    k: "mid",
    v: b.mid,
    label: labels[1],
    fg: "var(--pri-mid-fg)",
    bg: "var(--pri-mid-bg)"
  }, {
    k: "low",
    v: b.low,
    label: labels[2],
    fg: "var(--pri-low-fg)",
    bg: "var(--pri-low-bg)"
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "h-1.5 w-full overflow-hidden",
    style: {
      background: grad,
      borderRadius: "4px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 grid grid-cols-3 gap-[0.4rem]"
  }, seg.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.k,
    className: "py-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "h-2.5 w-2.5",
    style: {
      background: s.fg,
      borderRadius: "3px"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-xs",
    style: {
      color: s.fg
    }
  }, s.label)), /*#__PURE__*/React.createElement("div", {
    className: "mt-1.5 text-2xl tnum text-ink"
  }, s.v), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-ink2 tnum"
  }, (s.v / total * 100).toFixed(1), "% of ", unit)))));
}

function RadialGauge({
  items
}) {
  const [hover, setHover] = useState(null);
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const cx = 100,
    cy = 96,
    r = 74,
    sw = 15,
    gap = 3;
  const pt = deg => {
    const rad = deg * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  };
  const arc = (a0, a1) => {
    const [x0, y0] = pt(a0),
      [x1, y1] = pt(a1);
    const large = a0 - a1 > 180 ? 1 : 0;
    return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };
  let cursor = 180;
  const segs = items.map((it, i) => {
    const span = it.value / total * 180;
    const a0 = cursor - (i === 0 ? 0 : gap / 2);
    const a1 = cursor - span + (i === items.length - 1 ? 0 : gap / 2);
    const mid = (a0 + a1) / 2;
    cursor -= span;
    return {
      ...it,
      a0,
      a1,
      mid,
      pct: Math.round(it.value / total * 100),
      shade: `var(--gauge-${i + 1})`
    };
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "relative mx-auto",
    style: {
      maxWidth: "220px"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 200 104",
    className: "w-full",
    style: {
      height: "auto"
    },
    onMouseLeave: () => setHover(null)
  }, /*#__PURE__*/React.createElement("path", {
    d: arc(180, 0),
    fill: "none",
    stroke: "var(--surface-2)",
    strokeWidth: sw,
    strokeLinecap: "round"
  }), segs.map((s, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: arc(s.a0, s.a1),
    fill: "none",
    stroke: s.shade,
    strokeWidth: sw,
    strokeLinecap: "round",
    style: {
      cursor: "pointer",
      opacity: hover == null || hover === i ? 1 : 0.4,
      transition: "opacity .15s"
    },
    onMouseEnter: () => setHover(i)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-x-0 pointer-events-none",
    style: {
      top: "52%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-ink2"
  }, "Total events"), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl tnum text-ink"
  }, total.toLocaleString("en-IN")))), hover != null && (() => {
    const [tx, ty] = pt(segs[hover].mid);
    return /*#__PURE__*/React.createElement("div", {
      className: "pointer-events-none absolute -translate-x-1/2 -translate-y-full px-2.5 py-1.5 surface text-center whitespace-nowrap",
      style: {
        left: `${tx / 200 * 100}%`,
        top: `${ty / 104 * 100}%`,
        marginTop: "-6px",
        borderRadius: "4px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
        zIndex: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] text-ink2 leading-none"
    }, segs[hover].label), /*#__PURE__*/React.createElement("div", {
      className: "text-sm tnum text-ink leading-none mt-1"
    }, segs[hover].value.toLocaleString("en-IN")));
  })()), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 grid grid-cols-3 divide-x",
    style: {
      borderColor: "var(--line)"
    }
  }, segs.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "px-2 text-center",
    style: {
      borderColor: "var(--line)"
    },
    onMouseEnter: () => setHover(i),
    onMouseLeave: () => setHover(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "h-2 w-2 rounded-full",
    style: {
      background: s.shade
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-ink2 leading-tight"
  }, s.label)), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-lg tnum text-ink leading-none"
  }, s.value.toLocaleString("en-IN"))))));
}
function HBars({
  rows
}) {
  const max = Math.max(...rows.map(r => r.visits));
  return /*#__PURE__*/React.createElement("ul", {
    className: "space-y-3"
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("li", {
    key: r.name,
    className: "grid grid-cols-[1.1rem_1fr_auto] items-center gap-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-ink3 tnum"
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline justify-between gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "truncate text-sm font-semibold text-ink"
  }, r.name)), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 h-[3px] w-full overflow-hidden",
    style: {
      background: "var(--surface-2)",
      borderRadius: "4px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full",
    style: {
      width: `${r.visits / max * 100}%`,
      background: "var(--bar-grad-h)",
      borderRadius: "4px"
    }
  }))), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-bold tnum text-ink w-12 text-right"
  }, r.visits))));
}
function RailGraph() {
  const w = 340,
    h = 132,
    pad = 10;
  const vals = [40, 58, 49, 70, 61, 86, 76, 102, 92, 124];
  const max = Math.max(...vals),
    min = Math.min(...vals);
  const xs = i => pad + i * (w - pad * 2) / (vals.length - 1);
  const ys = v => h - pad - (v - min) / (max - min || 1) * (h - pad * 2);
  const pts = vals.map((v, i) => [xs(i), ys(v)]);
  const line = smoothPath(pts);
  const area = `${line} L ${xs(vals.length - 1).toFixed(1)} ${h - pad} L ${xs(0).toFixed(1)} ${h - pad} Z`;
  const [ex, ey] = pts[pts.length - 1];
  const gid = "railgrad";
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${w} ${h}`,
    className: "w-full h-auto",
    style: {
      color: "var(--ink)"
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gid,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "currentColor",
    stopOpacity: "0.22"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "currentColor",
    stopOpacity: "0"
  }))), [0.25, 0.5, 0.75].map(g => /*#__PURE__*/React.createElement("line", {
    key: g,
    x1: pad,
    x2: w - pad,
    y1: pad + g * (h - pad * 2),
    y2: pad + g * (h - pad * 2),
    stroke: "currentColor",
    strokeOpacity: "0.08",
    strokeWidth: "1"
  })), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: `url(#${gid})`,
    className: "rail-area"
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    pathLength: "100",
    className: "rail-draw",
    vectorEffect: "non-scaling-stroke"
  }), /*#__PURE__*/React.createElement("g", {
    className: "rail-dot"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: ex,
    cy: ey,
    r: "7",
    fill: "currentColor",
    opacity: "0.16"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: ex,
    cy: ey,
    r: "3",
    fill: "currentColor",
    stroke: "var(--frost-bg)",
    strokeWidth: "1.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 flex items-center justify-between text-[11px] text-ink2 tracking-tight"
  }, /*#__PURE__*/React.createElement("span", null, "Lead intent trend"), /*#__PURE__*/React.createElement("span", {
    className: "tnum"
  }, "last 8 weeks")));
}

/* ============================================================
   BRAND / SPINNER / KPI
   ============================================================ */
function BrandMark({
  compact
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement(LogoMark, {
    size: 30
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[18px] tracking-tight text-ink leading-none flex items-baseline gap-1.5"
  }, "Glance", /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-ink2 lowercase"
  }, "by fossyl")));
}
const Spinner = () => /*#__PURE__*/React.createElement("svg", {
  className: "animate-spin h-4 w-4",
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9",
  stroke: "currentColor",
  strokeWidth: "3",
  opacity: "0.25"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 12a9 9 0 0 0-9-9",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeLinecap: "round"
}));

function TrendBadge({ pct, isNew }) {
  if (isNew) {
    return /*#__PURE__*/React.createElement("span", {
      className: "inline-flex items-center rounded-chip px-1.5 py-0.5 text-[11px] font-semibold tnum",
      style: { background: "var(--surface-2)", color: "var(--ink-2)" }
    }, "New");
  }
  if (pct == null || !isFinite(pct)) return null;
  const up = pct >= 0;
  return /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1 rounded-chip px-1.5 py-0.5 text-[11px] font-semibold tnum",
    style: { background: up ? "var(--pri-high-bg)" : "var(--pri-low-bg)", color: up ? "var(--pri-high-fg)" : "var(--pri-low-fg)" }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: up ? "arrow-up" : "arrow-down",
    weight: "bold",
    style: { fontSize: "0.7rem" }
  }), Math.abs(pct).toFixed(0), "%");
}

function Kpi({
  label,
  value,
  icon,
  hint,
  trend
}) {
  const hasTrend = trend !== undefined;
  const showsTrendSuffix = hasTrend && trend?.pct != null;
  return /*#__PURE__*/React.createElement("div", {
    className: "surface rounded-card p-5 fade-up"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 min-w-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[12px] tracking-tight text-ink2 truncate"
  }, label), hasTrend && /*#__PURE__*/React.createElement(TrendBadge, { pct: trend?.pct, isNew: trend?.isNew })), /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    className: "text-ink3 shrink-0",
    style: {
      fontSize: "2rem"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 flex items-baseline gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum tracking-tight text-ink leading-none",
    style: {
      fontSize: "3rem"
    }
  }, value)), hint && /*#__PURE__*/React.createElement("div", {
    className: "mt-2 text-xs text-ink2"
  }, showsTrendSuffix ? hint + " · vs last 30 days" : hint));
}

/* ============================================================
   CHECKBOX
   ============================================================ */
function Checkbox({
  checked,
  indeterminate,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "checkbox",
    "aria-checked": indeterminate ? "mixed" : checked,
    "aria-label": label,
    onClick: onChange,
    className: "grid place-items-center h-4 w-4 rounded-[4px] border hairline tap shrink-0",
    style: checked || indeterminate ? {
      background: "var(--accent)",
      borderColor: "var(--accent)"
    } : {}
  }, indeterminate ? /*#__PURE__*/React.createElement("span", {
    className: "h-[2px] w-2",
    style: {
      background: "var(--on-accent)"
    }
  }) : checked ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    weight: "bold",
    className: "text-[10px]",
    style: {
      color: "var(--on-accent)"
    }
  }) : null);
}

/* ============================================================
   NAV RAIL  (fixed left-edge icon rail — page switcher)
   ============================================================ */
function NavRail({
  page,
  onChange
}) {
  const items = [
    { key: "overview", icon: "gauge", label: "Overview" },
    { key: "properties", icon: "buildings", label: "Property Analytics" }
  ];
  return /*#__PURE__*/React.createElement("nav", {
    className: "hidden lg:flex fixed left-9 top-1/2 -translate-y-1/2 z-40 flex-col gap-3",
    "aria-label": "Sections"
  }, items.map(it => /*#__PURE__*/React.createElement(Tooltip, {
    key: it.key,
    place: "right",
    content: /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-semibold text-ink whitespace-nowrap"
    }, it.label)
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(it.key),
    "aria-label": it.label,
    "aria-current": page === it.key,
    className: "grid place-items-center h-12 w-12 rounded-ctl tap transition-colors",
    style: page === it.key ? {
      background: "var(--surface-2)",
      color: "var(--ink)",
      boxShadow: "inset 0 0 0 1.5px var(--ink-3)"
    } : {
      background: "var(--surface-2)",
      color: "var(--ink-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    style: { fontSize: "1.6rem" }
  })))));
}

/* ============================================================
   FILTER DROPDOWN  (generic — single or multi select popover)
   ============================================================ */
function FilterDropdown({
  label,
  icon = "funnel",
  options,        // [{ value, label }]
  selected,       // array of values
  onToggle,       // (value) => void
  multi = true,
  align = "left"
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const active = selected.length > 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "relative",
    ref: ref
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    className: "flex items-center gap-2 rounded-ctl border hairline px-3 py-2 text-sm font-semibold text-ink tap surface whitespace-nowrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    className: "text-ink2",
    style: { fontSize: "1.15rem" }
  }), label, active && /*#__PURE__*/React.createElement("span", {
    className: "ml-0.5 grid place-items-center h-5 min-w-5 px-1 rounded-chip text-[11px] font-bold tnum",
    style: { background: "var(--accent)", color: "var(--on-accent)" }
  }, selected.length), /*#__PURE__*/React.createElement(Icon, {
    name: "caret-down",
    className: "text-ink3",
    style: { fontSize: "0.75rem" }
  })), open && /*#__PURE__*/React.createElement("div", {
    className: `absolute z-20 mt-2 ${align === "left" ? "left-0" : "right-0"} w-64 max-w-[calc(100vw-2.5rem)] surface rounded-card p-2`,
    style: { boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }
  }, /*#__PURE__*/React.createElement("ul", {
    className: "max-h-60 overflow-auto"
  }, options.length === 0 ? /*#__PURE__*/React.createElement("li", {
    className: "px-2 py-2 text-xs text-ink3"
  }, "No options") : options.map(o => {
    const on = selected.includes(o.value);
    return /*#__PURE__*/React.createElement("li", {
      key: String(o.value)
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onToggle(o.value),
      className: "flex w-full min-w-0 items-center gap-2.5 rounded-ctl px-2 py-2 text-sm text-ink tap hover:well"
    }, /*#__PURE__*/React.createElement("span", {
      className: multi ? "grid place-items-center h-4 w-4 rounded-[4px] border hairline shrink-0" : "grid place-items-center h-4 w-4 rounded-full border hairline shrink-0",
      style: on ? { background: "var(--accent)", borderColor: "var(--accent)" } : {}
    }, on && (multi ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      weight: "bold",
      className: "text-[10px]",
      style: { color: "var(--on-accent)" }
    }) : /*#__PURE__*/React.createElement("span", {
      className: "h-1.5 w-1.5 rounded-full",
      style: { background: "var(--on-accent)" }
    }))), /*#__PURE__*/React.createElement("span", {
      className: "truncate"
    }, o.label)));
  })), selected.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-1 pt-2 border-t hairline"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => selected.forEach(v => onToggle(v)),
    className: "flex w-full items-center justify-center gap-2 rounded-ctl px-2 py-2 text-sm font-semibold text-ink tap hover:well"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-counter-clockwise"
  }), " Clear"))));
}

/* ============================================================
   PILL TABS  (Analytics / Sessions style two-way switch)
   ============================================================ */
function PillTabs({
  tabs,       // [{ value, label }]
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "inline-flex rounded-ctl border hairline p-1 surface"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.value,
    onClick: () => onChange(t.value),
    className: "px-4 py-1.5 text-sm font-semibold rounded-[3px] tap transition-colors",
    style: value === t.value ? { background: "var(--surface-2)", color: "var(--ink)" } : { color: "var(--ink-2)" }
  }, t.label)));
}

/* ============================================================
   PAGINATION
   ============================================================ */
function Pagination({
  page,
  pageCount,
  onChange
}) {
  if (pageCount <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-center gap-1.5 pt-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(Math.max(1, page - 1)),
    disabled: page === 1,
    className: "grid place-items-center h-7 w-7 rounded-ctl border hairline text-ink2 tap disabled:opacity-30"
  }, /*#__PURE__*/React.createElement(Icon, { name: "caret-left" })), nums.map((n, i) => n === "…" ? /*#__PURE__*/React.createElement("span", {
    key: "e" + i,
    className: "px-1 text-ink3 text-sm"
  }, "…") : /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => onChange(n),
    className: "grid place-items-center h-7 w-7 rounded-ctl text-sm tnum tap",
    style: n === page ? { border: "1px solid var(--ink)", color: "var(--ink)", fontWeight: 600 } : { color: "var(--ink2)" }
  }, n)), /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(Math.min(pageCount, page + 1)),
    disabled: page === pageCount,
    className: "grid place-items-center h-7 w-7 rounded-ctl border hairline text-ink2 tap disabled:opacity-30"
  }, /*#__PURE__*/React.createElement(Icon, { name: "caret-right" })));
}

/* ============================================================
  WORLD MAP  (equirectangular dot map, top-10 cities by session volume)

   Perf notes vs the previous version:
   - The ~3,600 land dots used to render as one <circle> each. They're now
     baked once into a single <path> (every dot is a tiny closed arc pair
     in one "d" string), so the base map costs 1 DOM node instead of ~3,600
     and never re-renders after mount.
   - Pan/zoom is done by mutating the SVG's own `viewBox`, not a CSS/SVG
     transform on a wrapper `<g>`. That keeps every existing coordinate
     (dots, markers, tooltip) valid as-is — no extra transform math needed
     anywhere else in the component.

   Needs `lat`/`lng` (or `latitude`/`longitude`) on each geo row from
   get_company_analytics — rows without coordinates still list in the
   legend, they just don't get a pin.
   ============================================================ */
let _landDotsCache = {};
function getLandDots(source) {
  if (!_landDotsCache[source]) {
    _landDotsCache[source] = source.split(" ").map(pair => {
      const [x, y] = pair.split(",");
      return [+x, +y];
    });
  }
  return _landDotsCache[source];
}

/* bake every land dot into one filled <path> "d" string (two semicircle
   arcs = one closed circle). Visually identical to a per-dot <circle>
   grid, but it's a single DOM node and is computed once ever per tier. */
let _landDotsPathCache = {};
function getLandDotsPath(source, r) {
  const key = source === LAND_DOTS_HIGH ? "high" : "low";
  if (_landDotsPathCache[key]) return _landDotsPathCache[key];
  const dots = getLandDots(source);
  const parts = new Array(dots.length);
  for (let i = 0; i < dots.length; i++) {
    const x = dots[i][0], y = dots[i][1];
    parts[i] = `M${(x - r).toFixed(2)},${y}a${r},${r} 0 1,0 ${(r * 2).toFixed(2)},0a${r},${r} 0 1,0 ${(-r * 2).toFixed(2)},0`;
  }
  _landDotsPathCache[key] = parts.join("");
  return _landDotsPathCache[key];
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function normalizeCoordinates(latValue, lngValue) {
  let lat = numOrNull(latValue);
  let lng = numOrNull(lngValue);
  if (lat == null || lng == null) return { lat: null, lng: null };
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) [lat, lng] = [lng, lat];
  if (Math.abs(lat) > 90) return { lat: null, lng: null };
  lng = ((lng + 180) % 360 + 360) % 360 - 180;
  return { lat, lng };
}
function mercX(lng) {
  return (lng + 180) / 360 * WORLD_MAP_VB.w;
}
function mercY(lat) {
  const clamped = Math.max(-85.0511, Math.min(85.0511, lat));
  return (90 - clamped) / 180 * WORLD_MAP_VB.h;
}

/* default view: the full world plus a small margin on every side.
   Zoom/pan work by shrinking or shifting this rect, clamped so you can
   never pan or zoom past the edges of the world map itself. */
const WORLD_MAP_DEFAULT_VB = { x: -24, y: -20, w: WORLD_MAP_VB.w + 48, h: WORLD_MAP_VB.h + 40 };
const WORLD_MAP_MAX_ZOOM = 20;
/* switch to the denser land-dot tier once zoomed in this much — below the
   threshold the sparse "world view" tier keeps the map light and stylized;
   above it, the denser tier keeps coastlines recognizable */
const WORLD_MAP_DETAIL_ZOOM_THRESHOLD = 2.5;

/* clamp just the width/height to the allowed zoom range (keeping aspect) —
   called BEFORE position is computed, so position math always uses the
   size that will actually be used, never a pre-clamp value that then gets
   silently replaced */
function clampWorldMapSize(w) {
  const minW = WORLD_MAP_DEFAULT_VB.w / WORLD_MAP_MAX_ZOOM;
  const clampedW = Math.min(WORLD_MAP_DEFAULT_VB.w, Math.max(minW, w));
  const clampedH = clampedW * (WORLD_MAP_DEFAULT_VB.h / WORLD_MAP_DEFAULT_VB.w);
  return { w: clampedW, h: clampedH };
}

/* clamp x/y (pan) for a given, already-size-clamped w/h */
function clampWorldMapPan(x, y, w, h) {
  const minX = WORLD_MAP_DEFAULT_VB.x;
  const maxX = WORLD_MAP_DEFAULT_VB.x + WORLD_MAP_DEFAULT_VB.w - w;
  const minY = WORLD_MAP_DEFAULT_VB.y;
  const maxY = WORLD_MAP_DEFAULT_VB.y + WORLD_MAP_DEFAULT_VB.h - h;
  return {
    x: maxX < minX ? minX : Math.min(maxX, Math.max(minX, x)),
    y: maxY < minY ? minY : Math.min(maxY, Math.max(minY, y))
  };
}

/* convenience wrapper for callers that don't need to distinguish the two
   steps (e.g. plain panning, where w/h never change) */
function clampWorldMapVb(next) {
  const { w, h } = clampWorldMapSize(next.w);
  const { x, y } = clampWorldMapPan(next.x, next.y, w, h);
  return { x, y, w, h };
}

function WorldMap({ geo }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [vb, setVb] = useState(WORLD_MAP_DEFAULT_VB);
  useEffect(() => { setHoverIdx(null); }, [vb.w]);
  const svgRef = useRef(null);
  const pointers = useRef(new Map()); // active pointers, for drag + pinch-zoom
  const pinchRef = useRef(null); // { dist } while a 2-finger gesture is active
  const hoverCloseTimer = useRef(null);
  const keepHover = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
  };
  const closeHover = () => {
    hoverCloseTimer.current = setTimeout(() => setHoverIdx(null), 100);
  };

  /* client px -> svg user units, via the SVG's own screen matrix so this
     stays correct regardless of preserveAspectRatio letterboxing */
  const clientToSvg = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const zoomAt = (clientX, clientY, factor) => {
    const p = clientToSvg(clientX, clientY);
    setVb(prev => {
      const relX = (p.x - prev.x) / prev.w;
      const relY = (p.y - prev.y) / prev.h;
      const { w, h } = clampWorldMapSize(prev.w / factor);
      const x = p.x - relX * w;
      const y = p.y - relY * h;
      return { ...clampWorldMapPan(x, y, w, h), w, h };
    });
  };

  /* wheel needs a non-passive native listener to preventDefault (React's
     onWheel is passive by default), otherwise the page scrolls too */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheelNative = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0018));
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, []);

  const onPointerDown = e => {
    svgRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchRef.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) };
    }
  };
  const onPointerMove = e => {
    if (!pointers.current.has(e.pointerId)) return;
    const prevPt = pointers.current.get(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchRef.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const factor = dist / (pinchRef.current.dist || dist);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, factor);
      pinchRef.current.dist = dist;
      return;
    }
    if (pointers.current.size !== 1) return;
    const svg = svgRef.current;
    const ctm = svg && svg.getScreenCTM();
    if (!ctm) return;
    const dx = (e.clientX - prevPt.x) / ctm.a;
    const dy = (e.clientY - prevPt.y) / ctm.d;
    setVb(prev => clampWorldMapVb({ ...prev, x: prev.x - dx, y: prev.y - dy }));
  };
  const onPointerUp = e => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
  };

  const resetView = () => setVb(WORLD_MAP_DEFAULT_VB);
  const zoomFromCenter = factor => {
    setVb(prev => {
      const cx = prev.x + prev.w / 2, cy = prev.y + prev.h / 2;
      const { w, h } = clampWorldMapSize(prev.w / factor);
      return { ...clampWorldMapPan(cx - w / 2, cy - h / 2, w, h), w, h };
    });
  };

  const cities = useMemo(() => (geo || [])
    .map(g => {
      const coordinates = normalizeCoordinates(
        g.lat ?? g.latitude ?? g.city_lat ?? g.city_latitude,
        g.lng ?? g.longitude ?? g.lon ?? g.city_lng ?? g.city_longitude
      );
      return {
        city: g.city ?? g.name,
        country: g.country ?? g.iso2,
        sessions: g.sessions || 0,
        lat: coordinates.lat,
        lng: coordinates.lng
      };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10), [geo]);

  const landPathLow = useMemo(() => getLandDotsPath(LAND_DOTS_LOW, 2.1), []);
  const landPathHigh = useMemo(() => getLandDotsPath(LAND_DOTS_HIGH, 1.1), []);
  const isDetailZoom = vb.w < WORLD_MAP_DEFAULT_VB.w / WORLD_MAP_DETAIL_ZOOM_THRESHOLD;
  const plottable = cities.filter(c => c.lat != null && c.lng != null);
  const clusters = useMemo(() => {
    /* 22 world-space units at the default (fully zoomed-out) view. Scaling
       it down as vb.w shrinks keeps the merge distance roughly constant in
       screen pixels, so two cities that are close in real terms but now
       far apart on screen split into their own markers as you zoom in,
       instead of staying merged forever. */
    const threshold = 22 * (vb.w / WORLD_MAP_DEFAULT_VB.w);
    const grouped = [];
    plottable.forEach(city => {
      const position = { x: mercX(city.lng), y: mercY(city.lat) };
      const match = grouped.find(cluster => {
        const dx = Math.abs(position.x - cluster.x);
        const wrappedX = Math.min(dx, WORLD_MAP_VB.w - dx);
        return Math.hypot(wrappedX, position.y - cluster.y) <= threshold;
      });
      if (match) {
        match.cities.push(city);
      } else {
        grouped.push({ x: position.x, y: position.y, cities: [city] });
      }
    });
    return grouped;
  }, [plottable, vb.w]);
  const maxSessions = Math.max(1, ...cities.map(c => c.sessions));

  if (!cities.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "h-full min-h-[220px] rounded-ctl well flex flex-col items-center justify-center gap-3 py-8"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "map-trifold",
      className: "text-ink3",
      style: { fontSize: "2.25rem" }
    }), /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-semibold text-ink2"
    }, "No visitor location data yet"));
  }

  const hoveredCluster = hoverIdx != null ? clusters[hoverIdx] : null;
  const hoveredPos = hoveredCluster ? { x: hoveredCluster.x, y: hoveredCluster.y } : null;
  /* Everything below (marker radius, label text, the tooltip) is measured in
     the same SVG user-space units as the map itself, so it would otherwise
     get magnified right along with the land dots as vb.w shrinks on zoom —
     fine for the map texture, wrong for UI chrome like pins and tooltips.
     uiScale shrinks their base sizes by exactly the zoom factor so their
     ON-SCREEN size stays constant instead of growing as you zoom in. */
  const uiScale = vb.w / WORLD_MAP_DEFAULT_VB.w;
  const labelFontSize = 19 * uiScale;
  const labelHaloWidth = 4 * uiScale;
  const dotRadius = 2;
  const isZoomed = vb.w < WORLD_MAP_DEFAULT_VB.w - 0.5;
  const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tooltipWidth = 220 * uiScale;
  const tooltipHeight = hoveredCluster ? (24 + hoveredCluster.cities.length * 28) * uiScale : 0;
  const tooltipX = hoveredPos ? Math.max(vb.x, Math.min(vb.x + vb.w - tooltipWidth, hoveredPos.x - tooltipWidth / 2)) : 0;
  const tooltipY = hoveredPos ? Math.max(vb.y, hoveredPos.y - tooltipHeight - 6 * uiScale) : 0;
  const tooltipLineHeight = 20 * uiScale;
  const tooltipTextStartY = tooltipY + (tooltipHeight - (hoveredCluster ? hoveredCluster.cities.length : 0) * tooltipLineHeight) / 2 + 14 * uiScale;

  return /*#__PURE__*/React.createElement("div", {
    className: "relative w-full h-full min-h-[220px] rounded-ctl well overflow-hidden"
  },
  /*#__PURE__*/React.createElement("svg", {
    ref: svgRef,
    viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`,
    preserveAspectRatio: "xMidYMid meet",
    className: "w-full h-full block",
    style: { touchAction: "none", cursor: pointers.current.size ? "grabbing" : "grab" },
    onPointerDown: onPointerDown,
    onPointerMove: onPointerMove,
    onPointerUp: onPointerUp,
    onPointerCancel: onPointerUp,
    onMouseLeave: () => setHoverIdx(null)
  },
  /*#__PURE__*/React.createElement("path", { d: landPathLow, fill: "var(--ink-3)", opacity: isDetailZoom ? 0 : 0.45, style: { transition: "opacity .25s ease" } }),
  /*#__PURE__*/React.createElement("path", { d: landPathHigh, fill: "var(--ink-3)", opacity: isDetailZoom ? 0.45 : 0, style: { transition: "opacity .25s ease" } }),
  clusters.map((cluster, i) => {
    const cx = cluster.x, cy = cluster.y;
    const sessions = cluster.cities.reduce((sum, city) => sum + city.sessions, 0);
    const r = (3 + Math.sqrt(sessions / maxSessions) * 5 + (cluster.cities.length > 1 ? 2 : 0)) * uiScale;
    const isCluster = cluster.cities.length > 1;
    return /*#__PURE__*/React.createElement("g", { key: cluster.cities.map(c => c.city + c.country).join("|"), "aria-label": isCluster ? `${cluster.cities.length} cities` : cluster.cities[0].city, onMouseEnter: keepHover, onMouseLeave: closeHover },
      !reduceMotion && /*#__PURE__*/React.createElement("circle", {
        cx: cx, cy: cy, r: 3 * uiScale, fill: "var(--ink)"
      }, /*#__PURE__*/React.createElement("animate", {
        attributeName: "r", values: `${3 * uiScale};${13 * uiScale}`, dur: "2.2s",
        begin: `${i * 0.18}s`, repeatCount: "indefinite", calcMode: "spline", keySplines: "0.16 1 0.3 1"
      }), /*#__PURE__*/React.createElement("animate", {
        attributeName: "opacity", values: "0.55;0", dur: "2.2s",
        begin: `${i * 0.18}s`, repeatCount: "indefinite", calcMode: "spline", keySplines: "0.16 1 0.3 1"
      })),
      /*#__PURE__*/React.createElement("circle", {
        cx: cx, cy: cy, r: r, fill: "var(--ink)",
        style: { transition: "r .15s ease", cursor: "pointer" },
        onMouseEnter: () => setHoverIdx(i)
      }),
      /*#__PURE__*/React.createElement("circle", {
        cx: cx, cy: cy, r: r + 6 * uiScale, fill: "transparent",
        style: { cursor: "pointer" },
        onMouseEnter: () => setHoverIdx(i)
      }),
      /*#__PURE__*/React.createElement("text", {
        x: cx, y: cy - r - labelFontSize * 0.6,
        textAnchor: "middle",
        style: {
          fontFamily: "Manrope, system-ui, sans-serif",
          fontWeight: 600,
          fontSize: labelFontSize,
          fill: "var(--ink)",
          stroke: "var(--surface)",
          strokeWidth: labelHaloWidth,
          strokeLinejoin: "round",
          paintOrder: "stroke",
          pointerEvents: "none"
        }
      }, isCluster ? `${cluster.cities.length} cities` : cluster.cities[0].city),
      isCluster && /*#__PURE__*/React.createElement("text", {
        x: cx, y: cy + 1,
        textAnchor: "middle",
        dominantBaseline: "middle",
        style: {
          fontFamily: "Manrope, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 10 * uiScale,
          fill: "var(--surface)",
          pointerEvents: "none"
        }
      }, cluster.cities.length));
  }),
  hoveredCluster && hoveredPos && /*#__PURE__*/React.createElement("g", {
    onMouseEnter: keepHover,
    onMouseLeave: closeHover
  }, /*#__PURE__*/React.createElement("rect", {
      key: "background",
      x: tooltipX,
      y: tooltipY,
      width: tooltipWidth,
      height: tooltipHeight,
      rx: 4 * uiScale,
      fill: "var(--surface)",
      stroke: "var(--line)",
      strokeWidth: uiScale
    }), hoveredCluster.cities.map((city, i) => /*#__PURE__*/React.createElement("text", {
      key: city.city + city.country,
      x: tooltipX + tooltipWidth / 2,
      y: tooltipTextStartY + i * tooltipLineHeight,
      textAnchor: "middle",
      style: {
        fontFamily: "Manrope, system-ui, sans-serif",
        fontSize: (i ? 12 : 14) * uiScale,
        fill: i ? "var(--ink-3)" : "var(--ink)"
      }
    }, city.city, " · ", city.sessions, " sessions")))),
  /*#__PURE__*/React.createElement("div", {
    className: "absolute right-2 top-2 flex flex-col gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => zoomFromCenter(1.6),
    "aria-label": "Zoom in",
    className: "grid place-items-center h-7 w-7 rounded-ctl border hairline surface text-ink tap"
  }, /*#__PURE__*/React.createElement(Icon, { name: "plus", className: "text-xs" })), /*#__PURE__*/React.createElement("button", {
    onClick: () => zoomFromCenter(1 / 1.6),
    "aria-label": "Zoom out",
    className: "grid place-items-center h-7 w-7 rounded-ctl border hairline surface text-ink tap"
  }, /*#__PURE__*/React.createElement(Icon, { name: "minus", className: "text-xs" })), isZoomed && /*#__PURE__*/React.createElement("button", {
    onClick: resetView,
    "aria-label": "Reset view",
    className: "grid place-items-center h-7 w-7 rounded-ctl border hairline surface text-ink tap"
  }, /*#__PURE__*/React.createElement(Icon, { name: "arrows-in", className: "text-xs" }))),
  plottable.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-x-0 bottom-2 text-center text-[11px] text-ink3"
  }, "Coordinates not available for these cities"));
}


/* ============================================================
   TOOLTIP  (custom, design-system styled — never the browser default)
   ============================================================ */
function Tooltip({
  content,
  children,
  place = "top",
  width = "max-content"
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const compute = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (place === "top") setPos({ top: r.top - 8, left: r.left + r.width / 2, transform: "translate(-50%, -100%)" });
    else if (place === "bottom") setPos({ top: r.bottom + 8, left: r.left + r.width / 2, transform: "translate(-50%, 0)" });
    else if (place === "left") setPos({ top: r.top + r.height / 2, left: r.left - 8, transform: "translate(-100%, -50%)" });
    else setPos({ top: r.top + r.height / 2, left: r.right + 8, transform: "translate(0, -50%)" });
  };
  const show = () => { compute(); setOpen(true); };
  const hide = () => setOpen(false);
  if (!content) return children;
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: "relative inline-flex",
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide
  }, children, open && pos && ReactDOM.createPortal(/*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    className: "pointer-events-none fixed z-50 surface fade-up",
    style: {
      top: pos.top,
      left: pos.left,
      transform: pos.transform,
      width: width,
      maxWidth: "min(260px, calc(100vw - 24px))",
      borderRadius: "4px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
      padding: "8px 10px",
      animationDuration: "0.12s"
    }
  }, content), document.body));
}

