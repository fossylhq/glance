/* ============================================================
   DEMO APP (real Supabase auth, local customer-facing fixtures)
   ============================================================ */
function seedDemoData() {
  COMPANY = "Aster House Hospitality";
  KPIS = { totalSessions: 56, totalVisitors: 42, avgActive: "1m 52s", avgInteractions: 2.5 };
  TRENDS = {
    sessions: { pct: 18.4, isNew: false },
    visitors: { pct: 11.8, isNew: false },
    avgActive: { pct: -8.6, isNew: false },
    avgInteractions: { pct: 14.7, isNew: false }
  };
  ENGAGEMENT = { hotspotViews: 98, viewModeSwitches: 71, fullscreenToggles: 25 };
  WEEKLY = [
    { date: new Date("2026-08-03"), sessions: 3 },
    { date: new Date("2026-08-10"), sessions: 5 },
    { date: new Date("2026-08-17"), sessions: 4 },
    { date: new Date("2026-08-24"), sessions: 6 },
    { date: new Date("2026-08-31"), sessions: 7 },
    { date: new Date("2026-09-07"), sessions: 9 },
    { date: new Date("2026-09-14"), sessions: 11 },
    { date: new Date("2026-09-21"), sessions: 11 }
  ];
  TOP_PROPERTIES = [
    { name: "Aster House Mumbai", visits: 16 },
    { name: "The Canopy, Goa", visits: 13 },
    { name: "Mistral House, Lisbon", visits: 11 },
    { name: "Northbank Kyoto", visits: 9 },
    { name: "Palm Court, Dubai", visits: 7 }
  ];
  GEO = [
    { city: "Mumbai", country: "India", lat: 19.076, lng: 72.8777, sessions: 10 },
    { city: "Pune", country: "India", lat: 18.5204, lng: 73.8567, sessions: 5 },
    { city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946, sessions: 9 },
    { city: "Panaji", country: "India", lat: 15.4909, lng: 73.8278, sessions: 5 },
    { city: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393, sessions: 4 },
    { city: "Porto", country: "Portugal", lat: 41.1579, lng: -8.6291, sessions: 4 },
    { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038, sessions: 3 },
    { city: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681, sessions: 3 },
    { city: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023, sessions: 3 },
    { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, sessions: 3 },
    { city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708, sessions: 3 },
    { city: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lng: 54.3773, sessions: 2 },
    { city: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753, sessions: 2 }
  ];
  PROPERTY_LIST = [
    { propertyId: "ASTER-MUM", name: "Aster House Mumbai", sessions: 16, visitors: 12, firstSeen: new Date("2026-09-01"), lastSeen: new Date("2026-09-04") },
    { propertyId: "CANOPY-GOA", name: "The Canopy, Goa", sessions: 13, visitors: 10, firstSeen: new Date("2026-09-01"), lastSeen: new Date("2026-09-04") },
    { propertyId: "MISTRAL-LIS", name: "Mistral House, Lisbon", sessions: 11, visitors: 8, firstSeen: new Date("2026-09-01"), lastSeen: new Date("2026-09-04") },
    { propertyId: "NORTHBANK-KYO", name: "Northbank Kyoto", sessions: 9, visitors: 7, firstSeen: new Date("2026-09-01"), lastSeen: new Date("2026-09-04") },
    { propertyId: "PALM-DXB", name: "Palm Court, Dubai", sessions: 7, visitors: 5, firstSeen: new Date("2026-09-01"), lastSeen: new Date("2026-09-04") }
  ];
}

const DEMO_PROPERTY_DATA = {
  "ASTER-MUM": { totalVisitors: 12, totalSessions: 16, avgActive: "1m 51s", avgInteractions: 2.5, dailyViews: [2, 2, 2, 2, 2, 2, 2, 2].map((sessions, i) => ({ date: new Date(new Date("2026-09-01T12:00:00Z").getTime() + i * 86400000), sessions })), topHotspots: [{ title: "Ocean View Suite", views: 7 }, { title: "Rooftop Bar", views: 6 }, { title: "Lobby Atrium", views: 5 }] },
  "CANOPY-GOA": { totalVisitors: 10, totalSessions: 13, avgActive: "1m 58s", avgInteractions: 2.5, dailyViews: [2, 2, 2, 2, 2, 1, 1, 1].map((sessions, i) => ({ date: new Date(new Date("2026-09-01T12:00:00Z").getTime() + i * 86400000), sessions })), topHotspots: [{ title: "Garden Villas", views: 6 }, { title: "Pool Deck", views: 5 }, { title: "Sunset Lounge", views: 4 }] },
  "MISTRAL-LIS": { totalVisitors: 8, totalSessions: 11, avgActive: "2m 12s", avgInteractions: 2.5, dailyViews: [2, 2, 2, 1, 1, 1, 1, 1].map((sessions, i) => ({ date: new Date(new Date("2026-09-01T12:00:00Z").getTime() + i * 86400000), sessions })), topHotspots: [{ title: "Riverside Terrace", views: 5 }, { title: "Penthouse", views: 4 }, { title: "Wine Cellar", views: 3 }] },
  "NORTHBANK-KYO": { totalVisitors: 7, totalSessions: 9, avgActive: "1m 50s", avgInteractions: 2.6, dailyViews: [2, 1, 1, 1, 1, 1, 1, 1].map((sessions, i) => ({ date: new Date(new Date("2026-09-01T12:00:00Z").getTime() + i * 86400000), sessions })), topHotspots: [{ title: "Tea Garden", views: 4 }, { title: "Ryokan Suite", views: 3 }, { title: "Courtyard", views: 2 }] },
  "PALM-DXB": { totalVisitors: 5, totalSessions: 7, avgActive: "1m 13s", avgInteractions: 2.6, dailyViews: [1, 1, 1, 1, 1, 1, 1, 0].map((sessions, i) => ({ date: new Date(new Date("2026-09-01T12:00:00Z").getTime() + i * 86400000), sessions })), topHotspots: [{ title: "Sky Pool", views: 3 }, { title: "Desert Suite", views: 2 }, { title: "Majlis", views: 2 }] }
};

loadPropertyAnalytics = async (propertyId, fromDate, toDate) => {
  const base = DEMO_PROPERTY_DATA[propertyId] || DEMO_PROPERTY_DATA["ASTER-MUM"];
  const allSessions = makeDemoSessions(propertyId);
  const sessions = allSessions.filter(session => {
    if (fromDate && session.startedAt < fromDate) return false;
    if (toDate && session.startedAt > toDate) return false;
    return true;
  });

  if (!fromDate && !toDate) return base;

  const activeTotal = sessions.reduce((total, session) => total + session.activeMs, 0);
  const interactionTotal = sessions.reduce((total, session) => total + session.totalInteractions, 0);
  const hotspotViews = new Map();
  sessions.forEach(session => session.hotspots.forEach(hotspot => hotspotViews.set(hotspot.title, (hotspotViews.get(hotspot.title) || 0) + 1)));
  const dailyViews = sessions.reduce((days, session) => {
    const day = session.startedAt.toISOString().slice(0, 10);
    days.set(day, (days.get(day) || 0) + 1);
    return days;
  }, new Map());

  return {
    propertyName: PROPERTY_LIST.find(property => property.propertyId === propertyId)?.name || propertyId,
    totalVisitors: Math.min(base.totalVisitors, sessions.length),
    totalSessions: sessions.length,
    avgActive: fmtMs(sessions.length ? activeTotal / sessions.length : 0),
    avgInteractions: sessions.length ? Math.round(interactionTotal / sessions.length * 10) / 10 : 0,
    dailyViews: Array.from(dailyViews, ([date, count]) => ({ date: new Date(`${date}T12:00:00Z`), sessions: count })).sort((a, b) => a.date - b.date),
    topHotspots: Array.from(hotspotViews, ([title, views]) => ({ title, views })).sort((a, b) => b.views - a.views).slice(0, 3)
  };
};

const DEMO_PROPERTY_SESSIONS = {
  "ASTER-MUM": { sessions: 16, visitors: 12, locations: [{ city: "Mumbai", region: "Maharashtra", country: "India" }, { city: "Pune", region: "Maharashtra", country: "India" }, { city: "Bengaluru", region: "Karnataka", country: "India" }], hotspots: ["Ocean View Suite", "Rooftop Bar", "Lobby Atrium"] },
  "CANOPY-GOA": { sessions: 13, visitors: 10, locations: [{ city: "Panaji", region: "Goa", country: "India" }, { city: "Mumbai", region: "Maharashtra", country: "India" }, { city: "Bengaluru", region: "Karnataka", country: "India" }], hotspots: ["Garden Villas", "Pool Deck", "Sunset Lounge"] },
  "MISTRAL-LIS": { sessions: 11, visitors: 8, locations: [{ city: "Lisbon", region: "Lisbon", country: "Portugal" }, { city: "Porto", region: "Porto", country: "Portugal" }, { city: "Madrid", region: "Madrid", country: "Spain" }], hotspots: ["Riverside Terrace", "Penthouse", "Wine Cellar"] },
  "NORTHBANK-KYO": { sessions: 9, visitors: 7, locations: [{ city: "Kyoto", region: "Kyoto", country: "Japan" }, { city: "Osaka", region: "Osaka", country: "Japan" }, { city: "Tokyo", region: "Tokyo", country: "Japan" }], hotspots: ["Tea Garden", "Ryokan Suite", "Courtyard"] },
  "PALM-DXB": { sessions: 7, visitors: 5, locations: [{ city: "Dubai", region: "Dubai", country: "United Arab Emirates" }, { city: "Abu Dhabi", region: "Abu Dhabi", country: "United Arab Emirates" }, { city: "Riyadh", region: "Riyadh Province", country: "Saudi Arabia" }], hotspots: ["Sky Pool", "Desert Suite", "Majlis"] }
};

const DEMO_SESSION_PROFILES = [
  { device: "mobile", viewportW: 390, viewportH: 844, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile Safari/604.1", language: "en-IN", referrerDomain: "google.com", entryPoint: "Homepage" },
  { device: "desktop", viewportW: 1536, viewportH: 864, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36", language: "en-US", referrerDomain: "instagram.com", entryPoint: "Instagram campaign" },
  { device: "tablet", viewportW: 1024, viewportH: 1366, userAgent: "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1", language: "en-GB", referrerDomain: "booking.com", entryPoint: "Room detail" },
  { device: "mobile", viewportW: 412, viewportH: 915, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/127.0.0.0 Mobile Safari/537.36", language: "hi-IN", referrerDomain: null, entryPoint: "Direct link" },
  { device: "desktop", viewportW: 1440, viewportH: 900, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15", language: "pt-PT", referrerDomain: "google.com", entryPoint: "Gallery" },
  { device: "mobile", viewportW: 375, viewportH: 812, userAgent: "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36", language: "ar-AE", referrerDomain: "tripadvisor.com", entryPoint: "Experience detail" }
];

const DEMO_SESSION_DURATIONS = [18, 46, 74, 129, 212, 31, 387, 96, 154, 23, 278, 63];

function makeDemoSessions(propertyId) {
  const property = DEMO_PROPERTY_SESSIONS[propertyId] || DEMO_PROPERTY_SESSIONS["ASTER-MUM"];
  const now = new Date("2026-09-04T18:00:00Z").getTime();
  return Array.from({ length: property.sessions }, (_, index) => {
    const profile = DEMO_SESSION_PROFILES[index % DEMO_SESSION_PROFILES.length];
    const location = property.locations[index % property.locations.length];
    const activeMs = DEMO_SESSION_DURATIONS[index] * 1000;
    const startedAt = new Date(now - (index * 7 + 2) * 60 * 60 * 1000 - (index * 13 + 8) * 60 * 1000);
    const interactionCounts = {
      view_mode_switch: index % 4 === 0 ? 2 : index % 3,
      fullscreen_toggle: index % 5 === 0 ? 2 : index % 2,
      toggleWalk: index % 3 === 0 ? 1 : 0,
      interrupt: index === 3 || index === 9 ? 1 : 0
    };
    return {
      id: `${propertyId}-demo-${index + 1}`,
      propertyId,
      property: PROPERTY_LIST.find(p => p.propertyId === propertyId)?.name || propertyId,
      country: location.country,
      region: location.region,
      city: location.city,
      device: profile.device,
      viewportW: profile.viewportW,
      viewportH: profile.viewportH,
      userAgent: profile.userAgent,
      referrerDomain: profile.referrerDomain,
      entryPoint: profile.entryPoint,
      language: profile.language,
      isReturning: index % 4 === 0 || index === 7,
      startedAt,
      endedAt: new Date(startedAt.getTime() + activeMs),
      loadTimeMs: 480 + (index * 173) % 1100,
      activeMs,
      idleMs: index % 4 === 0 ? 0 : Math.min(activeMs * 0.35, (index * 11 + 7) * 1000),
      interactionCounts,
      totalInteractions: Object.values(interactionCounts).reduce((total, count) => total + count, 0),
      hotspots: property.hotspots.slice(0, index % 4 === 0 ? 1 : 1 + (index % property.hotspots.length)).map((title, hotspotIndex) => ({
        title,
        dwellMs: Math.max(5000, Math.round(activeMs * (0.22 - hotspotIndex * 0.04)))
      }))
    };
  });
}

loadPropertySessions = async propertyId => makeDemoSessions(propertyId);

function DemoApp() {
  const [theme, toggleTheme] = usePersistentTheme();
  const [phase, setPhase] = useState("booting");
  const [email, setEmail] = useState(null);

  useEffect(() => {
    seedDemoData();
    async function initSession(session) {
      if (!session) { setPhase("login"); return; }
      const userEmail = session.user.email?.trim().toLowerCase();
      const { data: isGod, error } = await supabaseClient.rpc("is_god_user", { p_email: userEmail });
      if (error || !isGod) {
        await supabaseClient.auth.signOut();
        setPhase("login");
        return;
      }
      setEmail(userEmail);
      setPhase("app");
    }
    supabaseClient.auth.getSession().then(({ data: { session } }) => initSession(session));
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) await initSession(session);
      if (event === "SIGNED_OUT") { setEmail(null); setPhase("login"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    setEmail(null);
    setPhase("login");
  };

  if (phase === "booting") return /*#__PURE__*/React.createElement(Boot, null);
  if (phase === "login") return /*#__PURE__*/React.createElement(Login, { theme, toggleTheme, onAuthed: () => {}, accessRpc: "is_god_user" });
  return /*#__PURE__*/React.createElement(Dashboard, { email, theme, toggleTheme, onSignOut: signOut });
}

ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(DemoApp, null));
