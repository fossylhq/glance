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
function StackedIntentBar({
  b
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
    label: "High",
    fg: "var(--pri-high-fg)",
    bg: "var(--pri-high-bg)"
  }, {
    k: "mid",
    v: b.mid,
    label: "Mid",
    fg: "var(--pri-mid-fg)",
    bg: "var(--pri-mid-bg)"
  }, {
    k: "low",
    v: b.low,
    label: "Low",
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
  }, (s.v / total * 100).toFixed(1), "% of leads")))));
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

function Kpi({
  label,
  value,
  icon,
  hint
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "surface rounded-card p-5 fade-up"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[12px] tracking-tight text-ink2"
  }, label), /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    className: "text-ink3",
    style: {
      fontSize: "2rem"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 tnum tracking-tight text-ink leading-none",
    style: {
      fontSize: "3rem"
    }
  }, value), hint && /*#__PURE__*/React.createElement("div", {
    className: "mt-2 text-xs text-ink2"
  }, hint));
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
