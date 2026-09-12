/* ============================================================
   TIMELINE CONTROLS  (presets + custom range + lifetime)
   ============================================================ */
function TimelineControls({ range, onChange }) {
  const presets = [
    { key: "7d", label: "7D" },
    { key: "30d", label: "30D" },
    { key: "q1", label: "Q1" },
    { key: "q2", label: "Q2" },
    { key: "q3", label: "Q3" },
    { key: "q4", label: "Q4" },
    { key: "1y", label: "Last 1Y" },
    { key: "lifetime", label: "Lifetime" },
    { key: "custom", label: "Custom" }
  ];
  /* current financial year runs Apr 1 - Mar 31; Q1 Apr-Jun, Q2 Jul-Sep, Q3 Oct-Dec, Q4 Jan-Mar (next calendar year) */
  const fyQuarter = q => {
    const now = new Date();
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const startMonth = [3, 6, 9, 0][q - 1];
    const calYear = fyStartYear + (q === 4 ? 1 : 0);
    const from = new Date(calYear, startMonth, 1);
    const to = new Date(calYear, startMonth + 3, 0, 23, 59, 59);
    return { from, to };
  };
  const setPreset = key => {
    if (key === "custom") { onChange({ mode: "custom", from: range.from, to: range.to }); return; }
    if (key === "lifetime") { onChange({ mode: "lifetime", from: null, to: null }); return; }
    if (key === "q1" || key === "q2" || key === "q3" || key === "q4") {
      const { from, to } = fyQuarter(Number(key[1]));
      onChange({ mode: key, from, to });
      return;
    }
    if (key === "1y") {
      const to = new Date();
      const from = new Date(to.getTime() - 365 * 86400000);
      onChange({ mode: key, from, to });
      return;
    }
    const days = { "7d": 7, "30d": 30 }[key];
    const to = new Date();
    const from = new Date(to.getTime() - days * 86400000);
    onChange({ mode: key, from, to });
  };
  const toInputVal = d => d ? d.toISOString().slice(0, 10) : "";
  const today = new Date();
  const handleFromChange = v => {
    const from = v ? new Date(v) : null;
    /* if the new "from" would land after the current "to", pull "to" up to match instead of allowing an inverted range */
    const to = from && range.to && from > range.to ? from : range.to;
    onChange({ ...range, from, to });
  };
  const handleToChange = v => {
    const to = v ? new Date(v) : null;
    /* if the new "to" would land before the current "from", pull "from" back to match instead of allowing an inverted range */
    const from = to && range.from && to < range.from ? to : range.from;
    onChange({ ...range, from, to });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-2 rounded-ctl border hairline surface p-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, presets.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.key,
    onClick: () => setPreset(p.key),
    className: "rounded-ctl px-3 py-1.5 text-xs font-semibold tap transition-colors border hairline",
    style: {
      background: range.mode === p.key ? "var(--surface-2)" : "transparent",
      color: range.mode === p.key ? "var(--ink)" : "var(--ink-2)",
      borderColor: range.mode === p.key ? "var(--ink-3)" : "var(--line)"
    }
  }, p.label))), range.mode === "custom" && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: toInputVal(range.from),
    max: toInputVal(range.to || today),
    onChange: e => handleFromChange(e.target.value),
    className: "rounded-ctl border hairline surface px-2.5 py-1.5 text-xs text-ink ring-ink"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-ink3 text-xs"
  }, "to"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: toInputVal(range.to),
    min: toInputVal(range.from),
    max: toInputVal(today),
    onChange: e => handleToChange(e.target.value),
    className: "rounded-ctl border hairline surface px-2.5 py-1.5 text-xs text-ink ring-ink"
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-ink3 ml-auto"
  }, range.mode === "lifetime" ? "All-time data" : range.from && range.to ? `${range.from.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${range.to.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""));
}

/* ============================================================
   ANALYTICS TAB  (per-property)
   ============================================================ */
function PropertyAnalyticsTab({ propertyId }) {
  const [range, setRange] = useState({ mode: "30d", from: new Date(Date.now() - 30 * 86400000), to: new Date() });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    /* a custom range with a missing or inverted bound has no valid window to query —
       fetching it anyway would send a null bound and silently widen the result to
       everything, which reads as "data" for a period that has none */
    const invalidCustomRange = range.mode === "custom" && (!range.from || !range.to || range.from > range.to);
    if (invalidCustomRange) {
      setData({ totalVisitors: 0, totalSessions: 0, avgActive: fmtMs(0), avgInteractions: 0, dailyViews: [], topHotspots: [] });
      setLoading(false);
      return () => { cancelled = true; };
    }

    setLoading(true);
    loadPropertyAnalytics(propertyId, range.mode === "lifetime" ? null : range.from, range.mode === "lifetime" ? null : range.to).then(d => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [propertyId, range.mode, range.from, range.to]);

  const views = data ? data.dailyViews : [];
  const hotspots = data ? data.topHotspots : [];

  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-[0.4rem] lg:flex-1 lg:min-h-0"
  },
  /*#__PURE__*/React.createElement(TimelineControls, { range: range, onChange: setRange }),
  /*#__PURE__*/React.createElement(Panel, {
    title: "Views",
    sub: "Sessions over the selected period"
  }, loading ? /*#__PURE__*/React.createElement("div", { className: "h-[150px] skel rounded-ctl" }) : views.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "h-[150px] grid place-items-center text-sm text-ink3"
  }, "No sessions in this period") : /*#__PURE__*/React.createElement(AreaChart, {
    data: views,
    rangeLabel: range.mode === "lifetime" ? "Lifetime" : range.from && range.to ? `${range.from.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} – ${range.to.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "",
    hoverPrefix: ""
  })),
  /*#__PURE__*/React.createElement(Panel, {
    title: "Top Hotspots Visited",
    sub: "By total dwell time"
  }, loading ? /*#__PURE__*/React.createElement("div", { className: "h-[120px] skel rounded-ctl" }) : hotspots.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "py-8 text-center text-sm text-ink3"
  }, "No hotspot activity in this period") : /*#__PURE__*/React.createElement(HBars, {
    rows: hotspots.map(h => ({ name: h.title, visits: h.views }))
  })),
  /*#__PURE__*/React.createElement("div", {
    className: "property-analytics-kpis grid grid-cols-2 lg:grid-cols-4 gap-[0.4rem] lg:flex-1"
  }, /*#__PURE__*/React.createElement(Kpi, {
    label: "Total Visitors",
    value: loading ? "—" : data.totalVisitors,
    icon: "users-three"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Total Sessions",
    value: loading ? "—" : data.totalSessions,
    icon: "eye"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Avg Session Interactions",
    value: loading ? "—" : data.avgInteractions,
    icon: "cursor-click"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Avg Session Duration",
    value: loading ? "—" : data.avgActive,
    icon: "timer"
  })));
}

/* ============================================================
   PROPERTY ANALYTICS PAGE
   ============================================================ */
function PropertyAnalyticsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(PROPERTY_LIST[0]?.propertyId || null);
  const [tab, setTab] = useState("analytics");

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROPERTY_LIST;
    return PROPERTY_LIST.filter(p => p.name.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!selected && PROPERTY_LIST.length) setSelected(PROPERTY_LIST[0].propertyId);
  }, []);

  const activeProperty = PROPERTY_LIST.find(p => p.propertyId === selected);

  const desktopListEl = /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto surface rounded-card p-1.5"
  }, PROPERTY_LIST.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "px-3 py-6 text-center text-sm text-ink3"
  }, "No properties yet") : filteredList.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "px-3 py-6 text-center text-sm text-ink3"
  }, "No match") : filteredList.map(p => {
    const isActive = p.propertyId === selected;
    return /*#__PURE__*/React.createElement("button", {
      key: p.propertyId,
      onClick: () => setSelected(p.propertyId),
      className: "flex w-full flex-col items-start rounded-ctl px-3 py-2.5 text-left tap transition-colors",
      style: isActive ? { background: "var(--surface-2)", boxShadow: "inset 2px 0 0 var(--ink)", color: "var(--ink)", borderRadius: 0 } : { color: "var(--ink)" }
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold truncate w-full"
    }, p.name), /*#__PURE__*/React.createElement("span", {
      className: "text-xs mt-0.5",
      style: { color: "var(--ink-3)" }
    }, p.sessions, " sessions · ", p.visitors, " visitors"));
  }));

  const mobileChipsEl = /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 overflow-x-auto -mx-5 px-5 pb-1"
  }, PROPERTY_LIST.length === 0 ? /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-ink3 py-2"
  }, "No properties yet") : filteredList.length === 0 ? /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-ink3 py-2"
  }, "No match") : filteredList.map(p => {
    const isActive = p.propertyId === selected;
    return /*#__PURE__*/React.createElement("button", {
      key: p.propertyId,
      onClick: () => setSelected(p.propertyId),
      className: "shrink-0 rounded-ctl px-3.5 py-2 text-left tap transition-colors border",
      style: isActive ? { background: "var(--surface-2)", color: "var(--ink)", borderColor: "var(--ink-3)", borderRadius: 0 } : { color: "var(--ink)", borderColor: "var(--line)" }
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-semibold whitespace-nowrap"
    }, p.name));
  }));

  const searchInput = /*#__PURE__*/React.createElement("div", {
    className: "relative shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "magnifying-glass",
    className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink3"
  }), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Search properties…",
    className: "w-full rounded-ctl border hairline surface pl-9 pr-3 py-2.5 text-sm text-ink ring-ink"
  }));

  const leftCol = /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-[0.4rem] lg:w-60 lg:shrink-0 lg:h-full lg:min-h-0"
  }, searchInput, /*#__PURE__*/React.createElement("div", {
    className: "hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0"
  }, desktopListEl), /*#__PURE__*/React.createElement("div", {
    className: "lg:hidden"
  }, mobileChipsEl));

  const rightHeader = !activeProperty ? null : /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-3 shrink-0"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-[20px] tracking-tight text-ink truncate"
  }, activeProperty.name), /*#__PURE__*/React.createElement(PillTabs, {
    tabs: [{ value: "analytics", label: "Analytics" }, { value: "sessions", label: "Sessions" }],
    value: tab,
    onChange: setTab
  }));

  const rightBody = !activeProperty ? /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    className: "py-10 text-center text-sm text-ink3"
  }, "Select a property to see its analytics.")) : tab === "analytics" ? /*#__PURE__*/React.createElement(PropertyAnalyticsTab, {
    key: activeProperty.propertyId,
    propertyId: activeProperty.propertyId
  }) : /*#__PURE__*/React.createElement(PropertySessionsTab, {
    key: activeProperty.propertyId,
    propertyId: activeProperty.propertyId
  });

  const rightCol = /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-[0.4rem] min-w-0 lg:flex-1 lg:h-full lg:min-h-0"
  }, rightHeader, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-[0.4rem] lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1"
  }, rightBody));

  return /*#__PURE__*/React.createElement("div", {
    className: "lg:h-[calc(100vh-11.5rem)] flex flex-col lg:min-h-0"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "tracking-tight text-ink leading-none shrink-0",
    style: { fontSize: "2rem", marginBottom: "1rem" }
  }, "Property Analytics"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-[0.4rem] lg:flex-row lg:flex-1 lg:min-h-0"
  }, leftCol, rightCol));
}
