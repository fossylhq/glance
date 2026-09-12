/* ============================================================
   SESSIONS TAB  (Property Analytics > Sessions)
   Scoped to one property. Filter bar + sortable columns + pagination.
   Anonymous visits — no name/phone identity, no CRM stage, no
   outbound contact. Fully read-only.
   ============================================================ */

const PAGE_SIZE = 10;

/* ============================================================
   FORMAT HELPERS  (session-specific)
   ============================================================ */
function fmtDuration(ms) {
  if (ms == null || ms <= 0) return "0s";
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
function fmtStarted(d) {
  if (!d) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  });
}
function fmtClock(d) {
  if (!d) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" });
}
function durationBucket(ms) {
  const s = (ms || 0) / 1000;
  if (s < 30) return "short";
  if (s < 120) return "medium";
  return "long";
}
function interactionsBucket(n) {
  if (n <= 10) return "low";
  if (n <= 25) return "medium";
  return "high";
}
const DURATION_BUCKET_LABEL = { short: "Short (<30s)", medium: "Medium (30-120s)", long: "Long (>120s)" };
const INTERACTIONS_BUCKET_LABEL = { low: "Low (0-10)", medium: "Medium (11-25)", high: "High (26+)" };
const DEVICE_ICON = { desktop: "desktop", mobile: "device-mobile", tablet: "device-tablet" };
const INTERACTION_LABEL = {
  interrupt: "Interruptions",
  toggleWalk: "Walk mode toggles",
  view_mode_switch: "View mode switches",
  fullscreen_toggle: "Fullscreen toggles"
};
function fingerprint(s) {
  const { browser, os } = parseUserAgent(s.userAgent);
  const dev = s.device ? s.device[0].toUpperCase() + s.device.slice(1) : "Unknown";
  return `${dev} · ${browser} · ${os}`;
}

/* ============================================================
   SESSION DETAIL TOOLTIP CONTENT  ("all possible data, collated")
   ============================================================ */
function SessionDetailContent({ s }) {
  const row = (label, value) => /*#__PURE__*/React.createElement("div", {
    key: label,
    className: "flex items-center justify-between gap-4 py-0.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-ink3"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "text-ink font-medium tnum text-right"
  }, value ?? "—"));
  return /*#__PURE__*/React.createElement("div", {
    className: "text-xs w-60"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-ink text-[13px] mb-1.5"
  }, "Session detail"),
  row("Viewport", s.viewportW && s.viewportH ? `${s.viewportW}×${s.viewportH}` : "—"),
  row("Language", s.language || "—"),
  row("Referrer", s.referrerDomain || "Direct"),
  row("Entry point", s.entryPoint || "—"),
  row("Returning visitor", s.isReturning ? "Yes" : "No"),
  /*#__PURE__*/React.createElement("div", {
    className: "my-1.5 border-t hairline"
  }),
  row("Starting time", fmtStarted(s.startedAt)),
  row("Ending time", s.endedAt ? fmtClock(s.endedAt) : "—"),
  row("Active time", fmtDuration(s.activeMs)),
  row("Idle time", fmtDuration(s.idleMs)));
}

/* ============================================================
   SESSIONS TAB
   ============================================================ */
function PropertySessionsTab({ propertyId }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [locFilter, setLocFilter] = useState([]);
  const [durFilter, setDurFilter] = useState([]);
  const [fpFilter, setFpFilter] = useState([]);
  const [returningFilter, setReturningFilter] = useState([]);
  const [interFilter, setInterFilter] = useState([]);
  const [sortCol, setSortCol] = useState("started");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadPropertySessions(propertyId).then(rows => {
      if (!cancelled) { setSessions(rows); setLoading(false); setPage(1); }
    });
    return () => { cancelled = true; };
  }, [propertyId]);

  const locOptions = useMemo(() => {
    const set = new Map();
    sessions.forEach(s => { if (s.city) set.set(s.city, `${s.city}, ${s.country || "—"}`); });
    return Array.from(set, ([value, label]) => ({ value, label }));
  }, [sessions]);
  const fpOptions = useMemo(() => {
    const set = new Set();
    sessions.forEach(s => set.add(fingerprint(s)));
    return Array.from(set).sort().map(v => ({ value: v, label: v }));
  }, [sessions]);

  const toggle = (setFn) => (v) => setFn(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (locFilter.length && !locFilter.includes(s.city)) return false;
      if (durFilter.length && !durFilter.includes(durationBucket(s.activeMs))) return false;
      if (fpFilter.length && !fpFilter.includes(fingerprint(s))) return false;
      if (returningFilter.length && !returningFilter.includes(s.isReturning ? "returning" : "new")) return false;
      if (interFilter.length && !interFilter.includes(interactionsBucket(s.totalInteractions))) return false;
      return true;
    });
  }, [sessions, locFilter, durFilter, fpFilter, returningFilter, interFilter]);

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const sorted = useMemo(() => {
    const rows = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      if (sortCol === "duration") return (a.activeMs - b.activeMs) * dir;
      if (sortCol === "interactions") return (a.totalInteractions - b.totalInteractions) * dir;
      const at = a.startedAt ? a.startedAt.getTime() : 0;
      const bt = b.startedAt ? b.startedAt.getTime() : 0;
      return (at - bt) * dir;
    });
    return rows;
  }, [filtered, sortCol, sortDir]);

  useEffect(() => { setPage(1); }, [locFilter, durFilter, fpFilter, returningFilter, interFilter]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => { setLocFilter([]); setDurFilter([]); setFpFilter([]); setReturningFilter([]); setInterFilter([]); };
  const anyFilter = locFilter.length || durFilter.length || fpFilter.length || returningFilter.length || interFilter.length;

  const SortIcon = ({ col }) => /*#__PURE__*/React.createElement(Icon, {
    name: sortCol === col ? (sortDir === "asc" ? "caret-up" : "caret-down") : "caret-up-down",
    className: "text-base",
    style: sortCol === col ? { color: "var(--accent)" } : { color: "var(--ink-3)" }
  });

  const headerRow = /*#__PURE__*/React.createElement("tr", {
    className: "text-left text-ink3"
  }, /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3 pr-2",
    style: { width: "36px" }
  }), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3 pr-4",
    style: { width: "190px" }
  }, "Visitor"), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3 pr-4",
    style: { width: "170px" }
  }, "Location"), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3 pr-4",
    style: { width: "140px" }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleSort("started"),
    className: "inline-flex items-center gap-2 tap hover:text-ink2"
  }, "Visit Time", /*#__PURE__*/React.createElement(SortIcon, { col: "started" }))), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3 pr-4",
    style: { width: "100px" }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleSort("duration"),
    className: "inline-flex items-center gap-2 tap hover:text-ink2"
  }, "Duration", /*#__PURE__*/React.createElement(SortIcon, { col: "duration" }))), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3 pr-4",
    style: { width: "100px" }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleSort("interactions"),
    className: "inline-flex items-center gap-2 tap hover:text-ink2"
  }, "Interactions", /*#__PURE__*/React.createElement(SortIcon, { col: "interactions" }))), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3",
    style: { width: "260px" }
  }, "Hotspots Viewed"));

  const bodyRows = pageRows.map(s => {
    const loc = [s.city, s.region, s.country].filter(Boolean);
    const { browser, os } = parseUserAgent(s.userAgent);
    const sortedHotspots = [...s.hotspots].sort((a, b) => b.dwellMs - a.dwellMs);
    const visible = sortedHotspots.slice(0, 1);
    const hidden = sortedHotspots.slice(1);

    const infoCell = /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-2",
      style: { verticalAlign: "middle" }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center h-full"
    }, /*#__PURE__*/React.createElement(Tooltip, {
      place: "right",
      content: /*#__PURE__*/React.createElement(SessionDetailContent, { s: s })
    }, /*#__PURE__*/React.createElement("button", {
      "aria-label": "Full session detail",
      className: "grid place-items-center h-8 w-8 rounded-full tap",
      style: { background: "var(--surface-2)", color: "var(--ink-2)" }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      style: { fontSize: "1.15rem" }
    })))));

    const visitorCell = /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: DEVICE_ICON[s.device] || "monitor",
      className: "text-ink3 shrink-0",
      style: { fontSize: "1.5rem" }
    }), /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-ink truncate"
    }, s.device ? s.device[0].toUpperCase() + s.device.slice(1) : "Unknown device"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-ink2 mt-0.5 truncate"
    }, browser, " · ", os, s.isReturning && " · returning"))));

    const locationCell = /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-4"
    }, loc.length === 0 ? /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-ink3"
    }, "Unknown location") : /*#__PURE__*/React.createElement("div", {
      className: "text-ink"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-medium truncate"
    }, s.city || "—"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-ink2 mt-0.5 truncate"
    }, [s.region, s.country].filter(Boolean).join(", ") || "—")));

    const visitTimeCell = /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-4 tnum text-ink"
    }, fmtStarted(s.startedAt));

    const durationCell = /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-4 tnum text-ink"
    }, fmtDuration(s.activeMs));

    const interactionsCell = /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-4 tnum text-ink"
    }, s.totalInteractions);

    let hotspotsContent;
    if (sortedHotspots.length === 0) {
      hotspotsContent = /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-ink3"
      }, "None");
    } else {
      const visibleChips = visible.map(h => /*#__PURE__*/React.createElement("span", {
        key: h.title,
        className: "inline-flex items-center gap-1.5 rounded-chip px-2 py-1 text-xs",
        style: { background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line)" }
      }, /*#__PURE__*/React.createElement("span", {
        className: "font-medium text-ink",
        style: { maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
      }, h.title), /*#__PURE__*/React.createElement("span", {
        className: "text-[11px] text-ink2 tnum"
      }, (h.dwellMs / 1000).toFixed(1), "s")));
      const overflowChip = hidden.length === 0 ? null : /*#__PURE__*/React.createElement(Tooltip, {
        key: "__overflow",
        place: "top",
        content: /*#__PURE__*/React.createElement("div", {
          className: "text-xs space-y-1"
        }, hidden.map(h => /*#__PURE__*/React.createElement("div", {
          key: h.title,
          className: "flex items-center justify-between gap-4"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-ink"
        }, h.title), /*#__PURE__*/React.createElement("span", {
          className: "text-ink2 tnum"
        }, (h.dwellMs / 1000).toFixed(1), "s"))))
      }, /*#__PURE__*/React.createElement("span", {
        className: "inline-flex items-center rounded-chip px-2 py-1 text-xs shrink-0 tap",
        style: { background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--line)", color: "var(--ink-3)" }
      }, "+", hidden.length));
      hotspotsContent = [...visibleChips, overflowChip];
    }
    const hotspotsCell = /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex gap-1.5 min-w-0 items-center flex-wrap"
    }, hotspotsContent));

    return /*#__PURE__*/React.createElement("tr", {
      key: s.id,
      className: "align-top row-hover transition-colors",
      style: { borderTop: "1px solid var(--line)" }
    }, infoCell, visitorCell, locationCell, visitTimeCell, durationCell, interactionsCell, hotspotsCell);
  });

  return /*#__PURE__*/React.createElement(Panel, {
    fill: true,
    right: /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-2"
    },
    /*#__PURE__*/React.createElement(FilterDropdown, { label: "Location", icon: "map-pin", options: locOptions, selected: locFilter, onToggle: toggle(setLocFilter) }),
    /*#__PURE__*/React.createElement(FilterDropdown, { label: "Session Duration", icon: "timer", options: Object.entries(DURATION_BUCKET_LABEL).map(([value, label]) => ({ value, label })), selected: durFilter, onToggle: toggle(setDurFilter) }),
    /*#__PURE__*/React.createElement(FilterDropdown, { label: "Device Fingerprint", icon: "fingerprint", options: fpOptions, selected: fpFilter, onToggle: toggle(setFpFilter) }),
    /*#__PURE__*/React.createElement(FilterDropdown, { label: "Returning User", icon: "arrow-clockwise", multi: false, options: [{ value: "new", label: "New" }, { value: "returning", label: "Returning" }], selected: returningFilter, onToggle: toggle(setReturningFilter) }),
    /*#__PURE__*/React.createElement(FilterDropdown, { label: "Interactions", icon: "cursor-click", options: Object.entries(INTERACTIONS_BUCKET_LABEL).map(([value, label]) => ({ value, label })), selected: interFilter, onToggle: toggle(setInterFilter) }))
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 flex flex-col"
  }, loading ? /*#__PURE__*/React.createElement(TableSkeleton, null) : sorted.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    hasFilter: !!anyFilter,
    onReset: resetFilters
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto overflow-x-auto -mx-5 px-5"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-sm border-collapse"
  }, /*#__PURE__*/React.createElement("thead", null, headerRow), /*#__PURE__*/React.createElement("tbody", null, bodyRows))), /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    pageCount: pageCount,
    onChange: setPage
  }))));
}

/* ============================================================
   TABLE SKELETON / EMPTY STATE
   ============================================================ */
function TableSkeleton() {
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-3 py-1"
  }, Array.from({
    length: 6
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "grid grid-cols-[1fr_auto_2fr] gap-4 items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "skel h-4 w-32"
  }), /*#__PURE__*/React.createElement("div", {
    className: "skel h-3 w-28"
  })), /*#__PURE__*/React.createElement("div", {
    className: "skel h-6 w-20 rounded-chip"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "skel h-6 w-28 rounded-chip"
  }), /*#__PURE__*/React.createElement("div", {
    className: "skel h-6 w-24 rounded-chip"
  })))));
}
function Empty({
  hasFilter,
  onReset
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "py-14 text-center fade-up"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto h-12 w-12 rounded-ctl well grid place-items-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "magnifying-glass",
    weight: "bold",
    className: "text-xl text-ink3"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "mt-4 text-base font-bold text-ink"
  }, "No sessions match"), hasFilter && /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-sm text-ink2"
  }, "Try clearing a filter."), /*#__PURE__*/React.createElement("button", {
    onClick: onReset,
    className: "mt-5 inline-flex items-center gap-2 rounded-ctl border hairline px-3.5 py-2 text-sm font-semibold text-ink tap surface"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-counter-clockwise"
  }), " Reset filters"));
}
