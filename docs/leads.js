/* ============================================================
   LEADS TABLE  (search + property filter + stage tracking + broadcast)
   ============================================================ */

// lightweight fuzzy: ordered subsequence match
function fuzzy(needle, hay) {
  if (!needle) return true;
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) {
    if (hay[j] === needle[i]) i++;
  }
  return i === needle.length;
}
function PropertyFilter({
  selected,
  onToggle,
  onClear
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "relative sm:w-auto",
    ref: ref
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    className: "flex items-center gap-2 w-full sm:w-auto rounded-ctl border hairline px-3 py-2.5 text-sm font-semibold text-ink tap surface"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "funnel",
    className: "text-ink2"
  }), "Filter", selected.length > 0 && /*#__PURE__*/React.createElement("span", {
    className: "ml-0.5 grid place-items-center h-5 min-w-5 px-1 rounded-chip text-[11px] font-bold tnum",
    style: {
      background: "var(--accent)",
      color: "var(--on-accent)"
    }
  }, selected.length)), open && /*#__PURE__*/React.createElement("div", {
    className: "absolute z-20 mt-2 left-0 sm:left-auto sm:right-0 w-[calc(100vw-2.5rem)] max-w-[16rem] surface rounded-card p-2 shadow-xl",
    style: {
      boxShadow: "0 12px 40px rgba(0,0,0,0.18)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between px-2 py-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold tracking-tight text-ink2"
  }, "Filter by Property")), /*#__PURE__*/React.createElement("ul", {
    className: "max-h-60 overflow-auto"
  }, PROPERTIES.map(p => {
    const on = selected.includes(p);
    return /*#__PURE__*/React.createElement("li", {
      key: p
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onToggle(p),
      className: "flex w-full items-center gap-2.5 rounded-ctl px-2 py-2 text-sm text-ink tap hover:well"
    }, /*#__PURE__*/React.createElement("span", {
      className: "grid place-items-center h-4 w-4 rounded-[4px] border hairline",
      style: on ? {
        background: "var(--accent)",
        borderColor: "var(--accent)"
      } : {}
    }, on && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      weight: "bold",
      className: "text-[10px]",
      style: {
        color: "var(--on-accent)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "truncate"
    }, p)));
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 pt-2 border-t hairline"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClear,
    disabled: selected.length === 0,
    className: "flex w-full items-center justify-center gap-2 rounded-ctl px-2 py-2 text-sm font-semibold text-ink tap hover:well disabled:opacity-40 disabled:hover:bg-transparent"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-counter-clockwise"
  }), " Clear filters"))));
}

/* ============================================================
   STAGE CELL  (Notion-style stage selector per lead row)
   ============================================================ */
const DEFAULT_STAGES = [
  { label: "Site Visit Scheduled", color: "#C9A227" },
  { label: "Brochure Sent", color: "#7D5BC0" },
  { label: "Closed", color: "#4D9E6B" }
];
const STAGE_COLORS = [
  { name: "Default", value: "#6B6B71" },
  { name: "Gray", value: "#9B9B9B" },
  { name: "Brown", value: "#9B7545" },
  { name: "Orange", value: "#D47D3D" },
  { name: "Yellow", value: "#C9A227" },
  { name: "Green", value: "#4D9E6B" },
  { name: "Blue", value: "#4A7DC0" },
  { name: "Purple", value: "#7D5BC0" },
  { name: "Pink", value: "#C0528A" },
  { name: "Red", value: "#C05252" }
];
function StageCell({
  leadId,
  stages,
  leadStatus,
  setLeadStatus,
  setStages,
  stageOpen,
  setStageOpen,
  stageQuery,
  setStageQuery
}) {
  const ref = useRef(null);
  const [optionsOpen, setOptionsOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  useEffect(() => {
    if (stageOpen !== leadId) {
      setOptionsOpen(null);
      setDeleteConfirm(null);
    }
  }, [stageOpen, leadId]);
  useEffect(() => {
    if (stageOpen !== leadId) return;
    const handler = e => {
      if (deleteConfirm) return;
      if (ref.current && !ref.current.contains(e.target)) {
        setStageOpen(null);
        setStageQuery("");
        setOptionsOpen(null);
        setDeleteConfirm(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [stageOpen, leadId, deleteConfirm]);
  const currentStage = leadStatus[leadId] || null;
  const currentStageObj = currentStage ? stages.find(s => s.label === currentStage) : null;
  const isOpen = stageOpen === leadId;
  const filtered = stages.filter(s => !stageQuery.trim() || s.label.toLowerCase().includes(stageQuery.toLowerCase()));
  const showCreate = stageQuery.trim() && stageQuery.trim().length <= 30 && !stages.some(s => s.label.toLowerCase() === stageQuery.trim().toLowerCase());
  const handleSelect = label => {
    setLeadStatus(prev => ({ ...prev, [leadId]: prev[leadId] === label ? null : label }));
    setStageOpen(null);
    setStageQuery("");
  };
  const handleCreate = () => {
    const newLabel = stageQuery.trim();
    setStages(prev => [...prev, { label: newLabel, color: "#6B6B71" }]);
    setLeadStatus(prev => ({ ...prev, [leadId]: newLabel }));
    setStageOpen(null);
    setStageQuery("");
  };
  const handleColorChange = (stageLabel, colorValue) => {
    setStages(prev => prev.map(s => s.label === stageLabel ? { ...s, color: colorValue } : s));
  };
  const handleDeleteConfirmed = label => {
    setStages(prev => prev.filter(s => s.label !== label));
    setLeadStatus(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => { if (next[id] === label) delete next[id]; });
      return next;
    });
    setDeleteConfirm(null);
    setOptionsOpen(null);
    setStageOpen(null);
    setStageQuery("");
  };
  const chipStyle = color => ({
    background: color + "22",
    color,
    border: `1px solid ${color}55`,
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "12px",
    lineHeight: "1.5",
    display: "inline-block",
    whiteSpace: "nowrap"
  });
  const optStage = optionsOpen ? stages.find(s => s.label === optionsOpen) : null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("td", {
    className: "py-3.5 px-4 align-middle text-center",
    style: { width: "140px", minWidth: "140px" },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    ref,
    className: "relative inline-block"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      if (isOpen) {
        setStageOpen(null);
        setStageQuery("");
      } else {
        setStageOpen(leadId);
        setStageQuery("");
      }
    },
    className: "tap"
  }, currentStageObj ? /*#__PURE__*/React.createElement("span", {
    style: chipStyle(currentStageObj.color)
  }, currentStageObj.label) : /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center justify-center text-ink3 rounded-ctl border hairline transition-colors hover:text-ink hover:border-ink3",
    style: { padding: "7px 9px" }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    className: "text-[11px]"
  }))), isOpen && !deleteConfirm && /*#__PURE__*/React.createElement("div", {
    className: "absolute z-30 mt-1 left-0 surface rounded-card",
    style: {
      minWidth: "14rem",
      boxShadow: "0 12px 40px rgba(0,0,0,0.18)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-1.5 border-b hairline"
  }, /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    value: stageQuery,
    onChange: e => setStageQuery(e.target.value),
    maxLength: 30,
    placeholder: "Search or create…",
    className: "w-full text-sm px-2 py-1.5 rounded-ctl surface ring-ink text-ink outline-none",
    onClick: e => e.stopPropagation()
  })), /*#__PURE__*/React.createElement("ul", {
    className: "max-h-64 overflow-auto py-1"
  }, filtered.map(s => /*#__PURE__*/React.createElement("li", {
    key: s.label,
    className: "group flex items-center"
  }, /*#__PURE__*/React.createElement("button", {
    className: "flex-1 flex items-center gap-2 px-2 py-1.5 tap text-left min-w-0",
    onClick: e => { e.stopPropagation(); handleSelect(s.label); }
  }, /*#__PURE__*/React.createElement("span", {
    style: chipStyle(s.color)
  }, s.label), currentStage === s.label && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    className: "ml-auto text-ink2 text-xs shrink-0"
  })), /*#__PURE__*/React.createElement("button", {
    className: "shrink-0 px-2 py-1.5 text-ink3 opacity-0 group-hover:opacity-100 tap",
    onClick: e => { e.stopPropagation(); setOptionsOpen(optionsOpen === s.label ? null : s.label); }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "dots-three",
    className: "text-sm"
  })))), showCreate && /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
    className: "flex items-center w-full gap-2 px-2 py-1.5 tap text-left text-sm text-ink2",
    onClick: e => { e.stopPropagation(); handleCreate(); }
  }, "Create ", /*#__PURE__*/React.createElement("span", {
    style: chipStyle("#6B6B71")
  }, stageQuery.trim())))),
  optStage && /*#__PURE__*/React.createElement("div", {
    className: "absolute z-40 surface rounded-card",
    style: { left: "calc(100% + 6px)", top: 0, minWidth: "13rem", boxShadow: "0 8px 32px rgba(0,0,0,0.24)" },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between px-3 py-2 border-b hairline"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-ink font-semibold truncate flex-1 mr-2"
  }, optStage.label), /*#__PURE__*/React.createElement("button", {
    className: "tap text-ink3 hover:text-ink shrink-0",
    onClick: e => { e.stopPropagation(); setOptionsOpen(null); }
  }, /*#__PURE__*/React.createElement(Icon, { name: "x", className: "text-sm" }))), /*#__PURE__*/React.createElement("button", {
    className: "flex items-center gap-2 w-full px-3 py-2 text-sm tap border-b hairline",
    style: { color: "#DC2626" },
    onClick: e => { e.stopPropagation(); setDeleteConfirm(optStage.label); setOptionsOpen(null); }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    className: "text-sm"
  }), "Delete"), /*#__PURE__*/React.createElement("div", {
    className: "p-2"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-ink3 font-semibold px-1 pt-1 pb-1.5"
  }, "Colors"), STAGE_COLORS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.name,
    className: "flex items-center gap-2 w-full px-2 py-1.5 tap rounded-ctl text-sm text-ink",
    onClick: e => { e.stopPropagation(); handleColorChange(optStage.label, c.value); }
  }, /*#__PURE__*/React.createElement("span", {
    style: { width: "12px", height: "12px", borderRadius: "3px", background: c.value, flexShrink: 0, display: "inline-block" }
  }), c.name, optStage.color === c.value && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    className: "ml-auto text-ink2 text-xs shrink-0"
  })))))))),
  deleteConfirm && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" },
    onClick: e => { e.stopPropagation(); setDeleteConfirm(null); }
  }, /*#__PURE__*/React.createElement("div", {
    style: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "10px", padding: "28px 24px 20px", width: "272px", boxShadow: "0 24px 64px rgba(0,0,0,0.32)", display: "flex", flexDirection: "column", alignItems: "center" },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: { width: "42px", height: "42px", borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", flexShrink: 0 }
  }, /*#__PURE__*/React.createElement(Icon, { name: "trash", style: { color: "#DC2626", fontSize: "18px" } })),
  /*#__PURE__*/React.createElement("p", {
    style: { fontSize: "15px", fontWeight: 600, color: "var(--ink)", marginBottom: "8px", textAlign: "center" }
  }, "Delete stage?"),
  /*#__PURE__*/React.createElement("p", {
    style: { fontSize: "12px", color: "var(--ink-3)", marginBottom: "22px", textAlign: "center", lineHeight: 1.6 }
  }, "Removes this stage from all leads. This cannot be undone."),
  /*#__PURE__*/React.createElement("button", {
    style: { width: "100%", padding: "9px 0", borderRadius: "6px", background: "#DC2626", color: "#fff", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer", marginBottom: "8px" },
    onClick: e => { e.stopPropagation(); handleDeleteConfirmed(deleteConfirm); }
  }, "Delete"),
  /*#__PURE__*/React.createElement("button", {
    style: { width: "100%", padding: "9px 0", borderRadius: "6px", background: "transparent", color: "var(--ink-2)", fontSize: "13px", fontWeight: 400, border: "1px solid var(--line)", cursor: "pointer" },
    onClick: e => { e.stopPropagation(); setDeleteConfirm(null); }
  }, "Cancel"))), document.body));
}

/* ============================================================
   BROADCAST COMPOSER  (WhatsApp 1:1 broadcast modal)
   ============================================================ */
function BroadcastComposer({
  leads,
  onClose
}) {
  const [text, setText] = useState("Hi {name}, thanks for your interest in our projects. Would you like to schedule a site visit this week?");
  const [media, setMedia] = useState(null); // { url, type:'image'|'video', name }
  const [phase, setPhase] = useState("compose"); // compose | sending | done
  const [sent, setSent] = useState(0);
  const fileRef = useRef(null);
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape" && phase !== "sending") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, onClose]);
  useEffect(() => () => {
    if (media?.url) URL.revokeObjectURL(media.url);
  }, [media]);
  const pickFile = e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (media?.url) URL.revokeObjectURL(media.url);
    const type = f.type.startsWith("video") ? "video" : "image";
    setMedia({
      url: URL.createObjectURL(f),
      type,
      name: f.name
    });
  };
  const removeMedia = () => {
    if (media?.url) URL.revokeObjectURL(media.url);
    setMedia(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  const canSend = (text.trim().length > 0 || media) && leads.length > 0;
  const preview = text.replace(/\{name\}/g, leads[0]?.name?.split(" ")[0] || "there");
  const send = () => {
    setPhase("sending");
    setSent(0);
    let n = 0;
    const tick = () => {
      n += 1;
      setSent(n);
      if (n >= leads.length) {
        setTimeout(() => setPhase("done"), 280);
        return;
      }
      setTimeout(tick, 240);
    };
    setTimeout(tick, 240);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4",
    style: {
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(2px)"
    },
    onMouseDown: e => {
      if (e.target === e.currentTarget && phase !== "sending") onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-lg surface rounded-card overflow-hidden fade-up",
    style: {
      boxShadow: "0 24px 70px rgba(0,0,0,0.45)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between px-5 py-4 border-b hairline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grid place-items-center h-8 w-8 rounded-ctl",
    style: {
      background: "var(--wa-bg)"
    }
  }, /*#__PURE__*/React.createElement(WaLogo, {
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[15px] text-ink leading-tight"
  }, "WhatsApp Broadcast"), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-ink2 leading-tight tnum"
  }, leads.length, " ", leads.length === 1 ? "lead" : "leads", " \xB7 sent individually"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => phase !== "sending" && onClose(),
    "aria-label": "Close",
    className: "grid place-items-center h-8 w-8 rounded-ctl text-ink2 hover:text-ink hover:well tap disabled:opacity-40",
    disabled: phase === "sending"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x"
  }))), phase === "done" ? /*#__PURE__*/React.createElement("div", {
    className: "px-6 py-10 text-center fade-up"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto h-12 w-12 rounded-ctl grid place-items-center",
    style: {
      background: "var(--accent)",
      color: "var(--on-accent)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    weight: "bold",
    className: "text-xl"
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 text-lg text-ink"
  }, "Broadcast sent"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-sm text-ink2"
  }, "Delivered an individual message to ", leads.length, " ", leads.length === 1 ? "lead" : "leads", "."), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "mt-6 rounded-ctl px-5 py-2.5 text-sm tap",
    style: {
      background: "var(--accent)",
      color: "var(--on-accent)"
    }
  }, "Done")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "px-5 py-4 space-y-4 max-h-[60vh] overflow-auto"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-ink2 mb-1.5"
  }, "Recipients"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5 max-h-20 overflow-auto"
  }, leads.map(l => /*#__PURE__*/React.createElement("span", {
    key: l.id,
    className: "inline-flex items-center gap-1.5 rounded-chip well px-2 py-1 text-xs text-ink"
  }, l.name ? /*#__PURE__*/React.createElement(React.Fragment, null, l.name, /*#__PURE__*/React.createElement("span", {
    className: "text-ink3 tnum"
  }, l.phone.replace("+91 ", ""))) : /*#__PURE__*/React.createElement("span", {
    className: "tnum"
  }, l.phone))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-ink2"
  }, "Message"), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-ink3 tnum"
  }, text.length, " chars")), /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => setText(e.target.value),
    rows: 4,
    className: "w-full rounded-ctl border hairline px-3 py-2.5 text-sm text-ink ring-ink surface resize-none",
    placeholder: "Type your message..."
  }), /*#__PURE__*/React.createElement("p", {
    className: "mt-1.5 text-[11px] text-ink2"
  }, "Use ", /*#__PURE__*/React.createElement("code", {
    className: "text-ink"
  }, "{name}"), " to personalise. Preview: ", /*#__PURE__*/React.createElement("span", {
    className: "text-ink"
  }, preview.slice(0, 80), preview.length > 80 ? "…" : ""))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-ink2 mb-1.5"
  }, "Attachment (image or video)"), media ? /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 rounded-ctl border hairline p-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-14 w-14 rounded-[4px] overflow-hidden well grid place-items-center shrink-0"
  }, media.type === "image" ? /*#__PURE__*/React.createElement("img", {
    src: media.url,
    alt: "",
    className: "h-full w-full object-cover"
  }) : /*#__PURE__*/React.createElement(Icon, {
    name: "video-camera",
    className: "text-xl text-ink2"
  })), /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-ink truncate"
  }, media.name), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-ink2 capitalize"
  }, media.type)), /*#__PURE__*/React.createElement("button", {
    onClick: removeMedia,
    className: "grid place-items-center h-8 w-8 rounded-ctl text-ink2 hover:text-ink hover:well tap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash"
  }))) : /*#__PURE__*/React.createElement("button", {
    onClick: () => fileRef.current && fileRef.current.click(),
    className: "flex w-full items-center justify-center gap-2 rounded-ctl border border-dashed hairline px-3 py-4 text-sm text-ink2 hover:well tap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "paperclip"
  }), " Attach image or video"), /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: "image/*,video/*",
    className: "hidden",
    onChange: pickFile
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-3 px-5 py-4 border-t hairline sm:flex-row sm:items-center sm:justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 order-1 sm:order-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    disabled: phase === "sending",
    className: "flex-1 sm:flex-none rounded-ctl border hairline px-4 py-2.5 text-sm text-ink tap surface disabled:opacity-40"
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: send,
    disabled: !canSend || phase === "sending",
    className: "flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-ctl px-4 py-2.5 text-sm tap disabled:opacity-40",
    style: {
      background: "var(--accent)",
      color: "var(--on-accent)"
    }
  }, phase === "sending" ? /*#__PURE__*/React.createElement(Spinner, null) : /*#__PURE__*/React.createElement(Icon, {
    name: "paper-plane-tilt",
    weight: "bold"
  }), phase === "sending" ? "Sending" : `Send to ${leads.length}`)), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-ink2 order-2 sm:order-1 text-center sm:text-left"
  }, phase === "sending" ? /*#__PURE__*/React.createElement("span", {
    className: "tnum"
  }, "Sending ", sent, " / ", leads.length, "…") : "Each lead receives a separate 1:1 message.")))));
}

/* ============================================================
   LEADS TABLE
   ============================================================ */
function LeadsTable() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedProps, setSelectedProps] = useState([]);

  useEffect(() => {
    if (query === debounced) return;
    setSearching(true);
    const t = setTimeout(() => {
      setDebounced(query);
      setSearching(false);
    }, 380);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line

  const serverFiltered = useMemo(() => {
    const raw = debounced.trim().toLowerCase();
    if (!raw) return LEADS;
    const digits = raw.replace(/\D/g, "");
    return LEADS.filter(l => {
      const nameHit = l.name ? fuzzy(raw.replace(/\s+/g, ""), l.name.toLowerCase().replace(/\s+/g, "")) : false;
      const phoneHit = digits.length > 0 && fuzzy(digits, l.phone.replace(/\D/g, ""));
      return nameHit || phoneHit;
    });
  }, [debounced]);

  const rows = useMemo(() => {
    if (selectedProps.length === 0) return serverFiltered;
    return serverFiltered.filter(l => {
      const names = new Set(l.properties.map(p => p.name));
      return selectedProps.every(p => names.has(p));
    });
  }, [serverFiltered, selectedProps]);
  const toggleProp = p => setSelectedProps(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p]);

  const [sel, setSel] = useState(() => new Set());
  const [composer, setComposer] = useState(false);
  const allSelected = rows.length > 0 && rows.every(r => sel.has(r.id));
  const someSelected = rows.some(r => sel.has(r.id)) && !allSelected;
  const toggleAll = () => setSel(prev => {
    const next = new Set(prev);
    if (allSelected) rows.forEach(r => next.delete(r.id));else rows.forEach(r => next.add(r.id));
    return next;
  });
  const toggleOne = id => setSel(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const clearSel = () => setSel(new Set());
  const selectedLeads = LEADS.filter(l => sel.has(l.id));
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [leadStatus, setLeadStatus] = useState({});
  const [stageOpen, setStageOpen] = useState(null);
  const [stageQuery, setStageQuery] = useState("");
  return /*#__PURE__*/React.createElement(Panel, {
    title: "Leads",
    right: /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-2.5 w-full sm:w-auto"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-ink2 tnum whitespace-nowrap order-1"
    }, rows.length, " of ", LEADS.length, " shown"), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto order-2"
    }, /*#__PURE__*/React.createElement(PropertyFilter, {
      selected: selectedProps,
      onToggle: toggleProp,
      onClear: () => setSelectedProps([])
    }), /*#__PURE__*/React.createElement("div", {
      className: "relative sm:flex-none"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: searching ? "circle-notch" : "magnifying-glass",
      className: `absolute left-3 top-1/2 -translate-y-1/2 text-ink3 text-sm ${searching ? "animate-spin" : ""}`
    }), /*#__PURE__*/React.createElement("input", {
      value: query,
      onChange: e => setQuery(e.target.value),
      placeholder: "Search name or phone",
      className: "w-full sm:w-60 rounded-ctl border hairline pl-9 pr-8 py-2.5 text-sm text-ink ring-ink surface",
      inputMode: "search"
    }), query && /*#__PURE__*/React.createElement("button", {
      onClick: () => setQuery(""),
      "aria-label": "Clear search",
      className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-ink3 hover:text-ink"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      className: "text-sm"
    })))))
  }, selectedProps.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-2 pb-3 -mt-1"
  }, selectedProps.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => toggleProp(p),
    className: "inline-flex items-center gap-1.5 rounded-chip well px-2.5 py-1 text-xs font-semibold text-ink tap"
  }, p, " ", /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    className: "text-[11px] text-ink3"
  })))), !searching && sel.size > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-ink tnum"
  }, sel.size, " selected"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setComposer(true),
    className: "flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-ctl px-3.5 py-2 text-sm tap surface border hairline text-ink ring-ink"
  }, /*#__PURE__*/React.createElement(WaLogo, {
    size: 16
  }), " ", /*#__PURE__*/React.createElement("span", {
    className: "truncate"
  }, "Send WhatsApp broadcast")), /*#__PURE__*/React.createElement("button", {
    onClick: clearSel,
    className: "rounded-ctl border hairline px-3 py-2 text-sm text-ink2 hover:text-ink tap surface"
  }, "Clear"))), searching ? /*#__PURE__*/React.createElement(TableSkeleton, null) : rows.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    query: debounced,
    props: selectedProps,
    onReset: () => {
      setQuery("");
      setSelectedProps([]);
    }
  }) : /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto -mx-5 px-5"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full border-collapse text-sm",
    style: { tableLayout: "fixed", minWidth: "800px" }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "text-left text-[14px] tracking-tight text-ink2"
  }, /*#__PURE__*/React.createElement("th", {
    className: "pb-3 pr-3 align-middle",
    style: { width: "40px" }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: allSelected,
    indeterminate: someSelected,
    onChange: toggleAll,
    label: "Select all leads"
  })), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3 pr-4",
    style: { width: "180px" }
  }, "Lead"), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3 pr-4 whitespace-nowrap text-center",
    style: { width: "200px" }
  }, "Stage"), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3 pr-4 whitespace-nowrap",
    style: { width: "185px" }
  }, "Priority"), /*#__PURE__*/React.createElement("th", {
    className: "font-bold pb-3"
  }, "Likely to Buy"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((l, i) => {
    const checked = sel.has(l.id);
    return /*#__PURE__*/React.createElement("tr", {
      key: l.id,
      onClick: () => toggleOne(l.id),
      className: "align-top row-hover transition-colors cursor-pointer",
      style: {
        borderTop: "1px solid var(--line)",
        background: checked ? "var(--surface-2)" : undefined
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-3 align-middle"
    }, /*#__PURE__*/React.createElement(Checkbox, {
      checked: checked,
      onChange: e => {
        e && e.stopPropagation && e.stopPropagation();
        toggleOne(l.id);
      },
      label: `Select ${l.name || l.phone}`
    })), /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-ink tnum truncate"
    }, l.name || l.phone), l.name && /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-ink2 tnum mt-0.5"
    }, l.phone)), /*#__PURE__*/React.createElement(StageCell, {
      leadId: l.id,
      stages,
      leadStatus,
      setLeadStatus,
      setStages,
      stageOpen,
      setStageOpen,
      stageQuery,
      setStageQuery
    }), /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 pr-4 whitespace-nowrap"
    }, /*#__PURE__*/React.createElement(PriorityMeter, {
      score: l.intent
    })), /*#__PURE__*/React.createElement("td", {
      className: "py-3.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1.5"
    }, [...l.properties].sort((a, b) => b.intent - a.intent).map(p => {
      const active = selectedProps.includes(p.name);
      return /*#__PURE__*/React.createElement("span", {
        key: p.name,
        className: "inline-flex items-center gap-1.5 rounded-chip px-2 py-1 text-xs",
        style: {
          background: "var(--surface-2)",
          boxShadow: active ? "inset 0 0 0 1.5px var(--ink)" : "inset 0 0 0 1px var(--line)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "font-medium text-ink"
      }, p.name), /*#__PURE__*/React.createElement(PriorityScore, {
        score: p.intent,
        className: "text-[11px]"
      }));
    }))));
  })))), composer && /*#__PURE__*/React.createElement(BroadcastComposer, {
    leads: selectedLeads,
    onClose: () => setComposer(false)
  }));
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
  query,
  props,
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
  }, "No leads match"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-sm text-ink2 max-w-sm mx-auto"
  }, query && /*#__PURE__*/React.createElement(React.Fragment, null, "No phone number contains ", /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-ink tnum"
  }, "\"", query, "\""), ". "), props.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, "No lead touched all ", props.length, " selected ", props.length === 1 ? "property" : "properties", ".")), /*#__PURE__*/React.createElement("button", {
    onClick: onReset,
    className: "mt-5 inline-flex items-center gap-2 rounded-ctl border hairline px-3.5 py-2 text-sm font-semibold text-ink tap surface"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-counter-clockwise"
  }), " Reset filters"));
}
