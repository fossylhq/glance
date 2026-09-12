/* ============================================================
   OVERVIEW PAGE
   ============================================================ */
function Overview() {
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-[0.4rem]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-end justify-between gap-4 flex-wrap",
    style: { marginBottom: "1rem" }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "tracking-tight text-ink leading-none",
    style: { fontSize: "2rem" }
  }, "Overview")),

  /* KPI row — trend deltas vs prior 30 days */
  /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 lg:grid-cols-4 gap-[0.4rem]"
  }, /*#__PURE__*/React.createElement(Kpi, {
    label: "Total Visitors",
    value: KPIS.totalVisitors,
    icon: "users-three",
    hint: "this month",
    trend: TRENDS.visitors
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Total Sessions",
    value: KPIS.totalSessions,
    icon: "eye",
    hint: "this month",
    trend: TRENDS.sessions
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Avg Session Duration",
    value: KPIS.avgActive,
    icon: "timer",
    hint: "this month",
    trend: TRENDS.avgActive
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Avg Session Interactions",
    value: KPIS.avgInteractions,
    icon: "cursor-click",
    hint: "this month",
    trend: TRENDS.avgInteractions
  })),

  /* map + top properties */
  /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-[1.6fr_1fr] gap-[0.4rem]"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Visitor Origins",
    sub: "Where sessions are coming from",
    fill: true
  }, /*#__PURE__*/React.createElement(WorldMap, { geo: GEO })), /*#__PURE__*/React.createElement(Panel, {
    title: "Top Properties",
    sub: "By visit count"
  }, /*#__PURE__*/React.createElement(HBars, {
    rows: TOP_PROPERTIES
  }))),

  /* weekly activity + engagement gauge */
  /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-[1.6fr_1fr] gap-[0.4rem]"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Weekly Session Activity",
    sub: "Sessions per week, last 8 weeks"
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: WEEKLY
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Engagement Events",
    sub: "Across all properties"
  }, /*#__PURE__*/React.createElement(RadialGauge, {
    items: [{
      label: "Hotspot views",
      value: ENGAGEMENT.hotspotViews
    }, {
      label: "View mode switches",
      value: ENGAGEMENT.viewModeSwitches
    }, {
      label: "Fullscreen toggles",
      value: ENGAGEMENT.fullscreenToggles
    }]
  }))));
}
