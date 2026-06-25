/* ============================================================
   LOGIN  (magic-link, Supabase OTP flow)
   ============================================================ */
function Login({
  onAuthed,
  theme,
  toggleTheme
}) {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("idle"); // idle | checking | sent | error
  const [err, setErr] = useState("");
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const submit = async () => {
    if (!valid) {
      setErr("Enter a valid email address.");
      setStage("error");
      return;
    }
    setErr("");
    setStage("checking");
    try {
      const emailVal = email.trim().toLowerCase();
      const { data: isAllowed } = await supabaseClient.rpc("is_allowed_agent", { p_email: emailVal });
      if (!isAllowed) {
        setStage("error");
        setErr("This email is not enrolled. Ask your administrator for access.");
        return;
      }
      const { error } = await supabaseClient.auth.signInWithOtp({ email: emailVal });
      if (error) {
        setStage("error");
        setErr(error.message);
        return;
      }
      setStage("sent");
    } catch (e) {
      setStage("error");
      setErr("Something went wrong. Please try again.");
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "relative min-h-[100dvh] grid lg:grid-cols-[1.05fr_1fr]"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: toggleTheme,
    "aria-label": "Toggle theme",
    className: "absolute top-5 right-5 z-10 grid place-items-center h-9 w-9 rounded-ctl border hairline text-ink tap surface"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === "dark" ? "sun" : "moon",
    className: "text-base"
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative hidden lg:flex flex-col justify-between p-10 border-r hairline",
    style: {
      backgroundImage: "url('https://files.catbox.moe/o4n14s.png')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "self-start flex items-baseline gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "leading-none tracking-tight",
    style: {
      fontSize: "28px",
      color: "#ffffff"
    }
  }, "Glance"), /*#__PURE__*/React.createElement("span", {
    className: "leading-none tracking-tight",
    style: {
      fontSize: "12px",
      color: "#ffffff"
    }
  }, "by fossyl")), /*#__PURE__*/React.createElement("div", {
    className: "self-start frost p-7 max-w-md"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-4xl font-extrabold tracking-tight leading-[1.05] text-ink max-w-[18ch]"
  }, "Read the room before you make the call."), /*#__PURE__*/React.createElement("p", {
    className: "mt-4 text-[15px] leading-relaxed max-w-[44ch]",
    style: {
      color: "var(--rail-text)"
    }
  }, "Fossyl Glance turns site visits into intent. See which leads are warming up, which properties pull attention, and where the next conversation should go."), /*#__PURE__*/React.createElement("dl", {
    className: "mt-8 grid grid-cols-3 gap-5 max-w-md"
  }, [["gauge", "Priority score", "0 to 100 per lead"], ["ranking", "Top properties", "ranked by visits"], ["pulse", "Weekly pulse", "sessions at a glance"]].map(([ic, t, s]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: "flex flex-col items-center text-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    className: "text-ink",
    style: {
      fontSize: "42px"
    }
  }), /*#__PURE__*/React.createElement("dt", {
    className: "mt-2 text-sm font-bold text-ink"
  }, t), /*#__PURE__*/React.createElement("dd", {
    className: "text-xs text-ink2 mt-0.5"
  }, s)))))), /*#__PURE__*/React.createElement("div", {
    className: "relative flex items-center justify-center p-6 lg:p-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-sm fade-up"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:hidden mb-8 flex flex-col items-center text-center"
  }, /*#__PURE__*/React.createElement(LogoMark, {
    size: 48
  })), stage !== "sent" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-extrabold tracking-tight text-ink"
  }, "Sign in"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1.5 text-sm text-ink2"
  }, "We will email you a one-time magic link. No password."), /*#__PURE__*/React.createElement("div", {
    className: "mt-7"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "email",
    className: "block text-[13px] font-semibold text-ink mb-2"
  }, "Work email"), /*#__PURE__*/React.createElement("input", {
    id: "email",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    value: email,
    onChange: e => {
      setEmail(e.target.value);
      if (stage === "error") setStage("idle");
    },
    onKeyDown: e => e.key === "Enter" && submit(),
    placeholder: "you@company.com",
    className: "w-full rounded-ctl bg-transparent px-3.5 py-3 text-[15px] text-ink ring-ink surface tnum",
    style: {
      borderColor: stage === "error" ? "var(--ink)" : "var(--line-2)"
    },
    "aria-invalid": stage === "error",
    "aria-describedby": "email-help"
  }), /*#__PURE__*/React.createElement("p", {
    id: "email-help",
    className: "mt-2 text-xs min-h-[1rem]",
    style: {
      color: stage === "error" ? "var(--ink)" : "var(--ink-3)"
    }
  }, stage === "error" ? err : "Only enrolled agents can sign in.")), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: stage === "checking",
    className: "mt-2 w-full rounded-ctl px-4 py-3 text-sm font-bold tap transition disabled:opacity-60 flex items-center justify-center gap-2",
    style: {
      background: "var(--accent)",
      color: "var(--on-accent)"
    }
  }, stage === "checking" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Spinner, null), " Checking enrollment") : /*#__PURE__*/React.createElement(React.Fragment, null, "Send magic link ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    weight: "bold"
  }))), /*#__PURE__*/React.createElement("p", {
    className: "mt-6 text-xs text-ink3 leading-relaxed"
  })) : /*#__PURE__*/React.createElement("div", {
    className: "fade-up"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-12 w-12 rounded-ctl surface flex items-center justify-center mb-5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "paper-plane-tilt",
    weight: "bold",
    className: "text-xl text-ink"
  })), /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-extrabold tracking-tight text-ink"
  }, "Check your inbox"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 text-sm text-ink2 leading-relaxed"
  }, "A magic link is on its way to ", /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-ink"
  }, email), ". It expires in 10 minutes and signs you in on tap."), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setStage("idle");
    },
    className: "mt-7 w-full rounded-ctl px-4 py-2.5 text-sm font-semibold text-ink2 hairline border tap"
  }, "Use a different email")))));
}
