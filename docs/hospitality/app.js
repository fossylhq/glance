/* ============================================================
   DASHBOARD  (shell: header + left icon rail + page switch)
   ============================================================ */
function Dashboard({
  email,
  theme,
  toggleTheme,
  onSignOut
}) {
  const [page, setPage] = useState("overview"); // overview | properties
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-[100dvh]"
  }, /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-30 surface border-x-0 border-t-0",
    style: {
      backdropFilter: "saturate(180%) blur(6px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-[1280px] mx-auto px-5 h-16 flex items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 min-w-0"
  }, /*#__PURE__*/React.createElement(BrandMark, null), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:block h-5 w-px",
    style: {
      background: "var(--line-2)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "hidden sm:flex items-center gap-2 min-w-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "buildings",
    className: "text-ink3",
    style: {
      fontSize: "x-large"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-ink truncate"
  }, COMPANY))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hidden md:inline text-xs text-ink3 tnum"
  }, email), /*#__PURE__*/React.createElement("button", {
    onClick: toggleTheme,
    "aria-label": "Toggle theme",
    className: "grid place-items-center h-9 w-9 rounded-ctl border hairline text-ink tap surface"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === "dark" ? "sun" : "moon",
    className: "text-base"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onSignOut,
    className: "flex items-center gap-2 rounded-ctl border hairline px-3 h-9 text-sm font-semibold text-ink tap surface"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sign-out"
  }), " ", /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "Sign out"))))),
  /* mobile page switch (icon rail is lg+ only) */
  /*#__PURE__*/React.createElement("div", {
    className: "lg:hidden sticky top-16 z-20 surface border-b hairline px-5 py-2.5 flex justify-center"
  }, /*#__PURE__*/React.createElement(PillTabs, {
    tabs: [{ value: "overview", label: "Overview" }, { value: "properties", label: "Property Analytics" }],
    value: page,
    onChange: setPage
  })),
  /*#__PURE__*/React.createElement(NavRail, {
    page: page,
    onChange: setPage
  }), /*#__PURE__*/React.createElement("main", {
    className: "max-w-[1280px] mx-auto px-5 pt-7 pb-4"
  }, page === "overview" ? /*#__PURE__*/React.createElement(Overview, null) : /*#__PURE__*/React.createElement(PropertyAnalyticsPage, null)), /*#__PURE__*/React.createElement("footer", {
    className: "pb-3 pt-1 text-center text-xs text-ink2 tracking-tight"
  }, "capture.preserve.experience"));
}

/* ============================================================
   ROOT  (session check on load -> login or dashboard)
   ============================================================ */
function App() {
  const [theme, toggleTheme] = usePersistentTheme();
  const [phase, setPhase] = useState("booting"); // booting | login | app
  const [email, setEmail] = useState(null);

  useEffect(() => {
    async function initSession(session) {
      if (!session) { setPhase("login"); return; }
      const userEmail = session.user.email?.trim().toLowerCase();
      const { data: isAllowed } = await supabaseClient.rpc("is_allowed_agent", { p_email: userEmail });
      if (!isAllowed) { await supabaseClient.auth.signOut(); setPhase("login"); return; }
      await loadAppData();
      setEmail(userEmail);
      setPhase("app");
    }

    supabaseClient.auth.getSession().then(({ data: { session } }) => initSession(session));

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await initSession(session);
      } else if (event === "SIGNED_OUT") {
        setEmail(null);
        setPhase("login");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    setEmail(null);
    setPhase("login");
  };

  if (phase === "booting") return /*#__PURE__*/React.createElement(Boot, null);
  if (phase === "login") return /*#__PURE__*/React.createElement(Login, {
    onAuthed: () => {},
    theme: theme,
    toggleTheme: toggleTheme
  });
  return /*#__PURE__*/React.createElement(Dashboard, {
    email: email,
    theme: theme,
    toggleTheme: toggleTheme,
    onSignOut: signOut
  });
}
function Boot() {
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-[100dvh] grid place-items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center gap-4 fade-up"
  }, /*#__PURE__*/React.createElement(LogoMark, {
    size: 40
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 text-ink2 text-sm font-semibold"
  }, /*#__PURE__*/React.createElement(Spinner, null), " Restoring session")));
}
if (!window.__GLANCE_DEMO__) {
  ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
}
