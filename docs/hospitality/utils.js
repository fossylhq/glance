const {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} = React;
function WaLogo({
  size = 16,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "#25D366",
    className: className,
    style: { display: "inline-block", verticalAlign: "middle", flexShrink: 0 },
    "aria-label": "WhatsApp",
    role: "img"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
  }));
}
const LOGO_INNER = `<path d='M63.5 24.5657C28.4962 24.5657 0 41.8266 0 63.0365C0 84.2464 28.4777 101.507 63.5 101.507C98.5223 101.507 127 84.2464 127 63.0365C127 41.8266 98.5223 24.5657 63.5 24.5657ZM42.698 63.0365C42.698 76.0888 46.4431 87.5837 52.0978 94.2766C53.5625 96.0194 51.968 98.6336 49.7618 98.133C29.9053 93.6277 15.3883 79.5929 15.3883 63.0365C15.3883 46.4802 29.9053 32.4638 49.7618 27.94C51.9866 27.4394 53.581 30.0536 52.0978 31.7964C46.4431 38.4708 42.698 49.9842 42.698 63.0365ZM63.5 27.495C73.9566 27.495 82.448 43.4396 82.448 63.0365C82.448 82.6334 73.9381 98.578 63.5 98.578C53.0619 98.578 44.552 82.6334 44.552 63.0365C44.552 43.4396 53.0619 27.495 63.5 27.495ZM84.302 63.0365C84.302 49.9842 80.5569 38.4894 74.9022 31.7964C73.4375 30.0536 75.032 27.4394 77.2383 27.94C97.0947 32.4453 111.612 46.4802 111.612 63.0365C111.612 79.5929 97.0947 93.6092 77.2383 98.133C75.0134 98.6336 73.419 96.0194 74.9022 94.2766C80.5569 87.6022 84.302 76.0888 84.302 63.0365ZM1.85401 63.0365C1.85401 53.0619 8.60263 43.9958 19.5413 37.3955C21.9145 35.9494 24.4174 38.9714 22.5448 41.0294C16.8715 47.2588 13.5343 54.8603 13.5343 63.0365C13.5343 71.2127 16.8715 78.7956 22.5448 85.0437C24.4174 87.1016 21.933 90.1237 19.5413 88.6775C8.60263 82.0587 1.85401 73.0111 1.85401 63.0365ZM107.459 88.6961C105.086 90.1422 102.583 87.1202 104.455 85.0622C110.128 78.8142 113.466 71.2312 113.466 63.055C113.466 54.8788 110.128 47.2774 104.455 41.0479C102.583 38.9899 105.067 35.9679 107.459 37.414C118.397 44.0329 125.146 53.0804 125.146 63.0736C125.146 73.0667 118.397 82.1143 107.459 88.7331V88.6961Z'/><path d='M63.5 0L65.9102 55.3609C66.04 58.2161 68.3204 60.4965 71.1756 60.6263L126.536 63.0365L71.1756 65.4467C68.3204 65.5765 66.04 67.8569 65.9102 70.7121L63.5 126.073L61.0898 70.7121C60.96 67.8569 58.6796 65.5765 55.8244 65.4467L0.463501 63.0365L55.8244 60.6263C58.6796 60.4965 60.96 58.2161 61.0898 55.3609L63.5 0Z'/>`;
function LogoMark({
  size = 30
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 127 127",
    fill: "currentColor",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      color: 'var(--ink)'
    },
    dangerouslySetInnerHTML: {
      __html: LOGO_INNER
    },
    "aria-label": "Fossyl",
    role: "img"
  });
}

/* ============================================================
   SUPABASE CONFIG
   ============================================================ */
const SUPABASE_URL = "https://tgfftonqezoyuongznjn.supabase.co";
const SUPABASE_KEY = "sb_publishable_hWiwvhjHemCiYxrHfFx5MA_cAKUVPZk";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   LIVE DATA  (populated from Supabase RPCs before dashboard renders)
   ============================================================ */
let COMPANY = "—";
let KPIS = { totalSessions: "—", totalVisitors: "—", avgActive: "—", avgInteractions: "—" };
let TRENDS = { sessions: null, visitors: null, avgActive: null, avgInteractions: null }; // { pct, isNew } vs prior 30d, per KPI
let ENGAGEMENT = { hotspotViews: 0, viewModeSwitches: 0, fullscreenToggles: 0 };
let WEEKLY = [{ date: new Date(), sessions: 0 }];
let TOP_PROPERTIES = [{ name: "—", visits: 0 }];
let GEO = [];
let PROPERTY_LIST = []; // [{ propertyId, name, sessions, visitors, firstSeen, lastSeen }]

function groupWeekly(daily) {
  if (!daily || !daily.length) return [];
  const days = daily.map(d => ({ date: new Date(d.date), sessions: d.sessions || 0 }));
  const buckets = [];
  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    const sessions = week.reduce((s, d) => s + d.sessions, 0);
    buckets.push({ date: week[0].date, sessions });
  }
  return buckets.slice(-8);
}

/* percent change of cur vs prev, plus an isNew flag when there's no prior-period baseline to compare against */
function trendOf(cur, prev) {
  if (!prev) return { pct: null, isNew: cur > 0 };
  return { pct: ((cur - prev) / prev) * 100, isNew: false };
}

function fmtMs(ms) {
  const avgMin = Math.round((ms ?? 0) / 60000);
  const avgSec = Math.round((ms ?? 0) / 1000);
  return avgMin > 0 ? avgMin + "m" : (avgSec > 0 ? avgSec + "s" : "0s");
}

async function loadAppData() {
  const [analyticsRes, propsRes] = await Promise.all([
    supabaseClient.rpc("get_company_analytics"),
    supabaseClient.rpc("get_properties")
  ]);

  const d = analyticsRes.data;
  if (d) {
    COMPANY = d.company_name || "—";
    KPIS = {
      totalSessions: d.total_sessions ?? 0,
      totalVisitors: d.total_visitors ?? 0,
      avgActive: fmtMs(d.avg_active_duration_ms),
      avgInteractions: Math.round(d.avg_interactions ?? 0)
    };
    const t = d.trend || {};
    TRENDS = {
      sessions: trendOf(t.sessions?.cur ?? 0, t.sessions?.prev ?? 0),
      visitors: trendOf(t.visitors?.cur ?? 0, t.visitors?.prev ?? 0),
      avgActive: trendOf(t.avg_active_duration_ms?.cur ?? 0, t.avg_active_duration_ms?.prev ?? 0),
      avgInteractions: trendOf(t.avg_interactions?.cur ?? 0, t.avg_interactions?.prev ?? 0)
    };
    ENGAGEMENT = {
      hotspotViews: d.event_totals?.hotspot_views ?? 0,
      viewModeSwitches: d.event_totals?.view_mode_switches ?? 0,
      fullscreenToggles: d.event_totals?.fullscreen_toggles ?? 0
    };
    WEEKLY = groupWeekly(d.daily_activity);
    if (!WEEKLY.length) WEEKLY = [{ date: new Date(), sessions: 0 }];
    TOP_PROPERTIES = (d.top_properties || []).slice(0, 5).map(p => ({ name: p.name, visits: p.visits }));
    if (!TOP_PROPERTIES.length) TOP_PROPERTIES = [{ name: "—", visits: 0 }];
    GEO = d.geo || [];
  }

  PROPERTY_LIST = (propsRes.data || []).map(p => ({
    propertyId: p.property_id,
    name: p.name,
    sessions: p.sessions ?? 0,
    visitors: p.visitors ?? 0,
    firstSeen: p.first_seen ? new Date(p.first_seen) : null,
    lastSeen: p.last_seen ? new Date(p.last_seen) : null
  }));
}

/* maps a raw get_company_sessions() row into the shape the Sessions tab uses */
function mapSessionRow(r) {
  return {
    id: r.session_id,
    propertyId: r.property_id,
    property: r.property_name,
    country: r.country || null,
    region: r.region || null,
    city: r.city || null,
    device: r.device_type || null,
    viewportW: r.viewport_w || null,
    viewportH: r.viewport_h || null,
    userAgent: r.user_agent || null,
    referrerDomain: r.referrer_domain || null,
    entryPoint: r.entry_point || null,
    language: r.language || null,
    isReturning: !!r.is_returning,
    startedAt: r.started_at ? new Date(r.started_at) : null,
    endedAt: r.ended_at ? new Date(r.ended_at) : null,
    loadTimeMs: r.load_time_ms ?? null,
    activeMs: r.active_duration_ms || 0,
    idleMs: r.idle_duration_ms || 0,
    interactionCounts: r.interaction_counts || {},
    totalInteractions: Object.values(r.interaction_counts || {}).reduce((a, b) => a + (b || 0), 0),
    hotspots: (r.hotspots || []).map(h => ({ title: h.title, dwellMs: h.dwell_ms || 0 }))
  };
}

/* fetch sessions for one property (Property Analytics > Sessions tab) */
async function loadPropertySessions(propertyId) {
  const { data } = await supabaseClient.rpc("get_company_sessions", { p_property_id: propertyId });
  return (data || []).map(mapSessionRow);
}

/* fetch the Analytics tab payload for one property, optionally date-bounded; null bounds = lifetime */
async function loadPropertyAnalytics(propertyId, fromDate, toDate) {
  const { data } = await supabaseClient.rpc("get_property_analytics", {
    p_property_id: propertyId,
    p_from: fromDate ? fromDate.toISOString() : null,
    p_to: toDate ? toDate.toISOString() : null
  });
  const d = data || {};
  return {
    propertyName: d.property_name || propertyId,
    totalSessions: d.total_sessions ?? 0,
    totalVisitors: d.total_visitors ?? 0,
    avgActive: fmtMs(d.avg_active_duration_ms),
    avgInteractions: Math.round(d.avg_interactions ?? 0),
    dailyViews: (d.daily_views || []).map(v => ({ date: new Date(v.date), sessions: v.sessions })),
    topHotspots: (d.top_hotspots || []).map(h => ({ title: h.title, views: h.views, dwellMs: h.dwell_ms || 0 }))
  };
}

/* parse a compact "Browser · OS" label out of a user-agent string */
function parseUserAgent(ua) {
  if (!ua) return { browser: "Unknown", os: "Unknown" };
  let browser = "Unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  let os = "Unknown";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";
  return { browser, os };
}

/* ============================================================
   FORMAT HELPERS
   ============================================================ */
function fmtDay(d) {
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

/* decorative, theme-aware monochrome trend graph for the login rail */
function smoothPath(p) {
  if (p.length < 2) return "";
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i],
      p1 = p[i],
      p2 = p[i + 1],
      p3 = p[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6,
      c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6,
      c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
