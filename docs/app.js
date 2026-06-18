const SUPABASE_URL = "https://ejypauevukftgbbbnqdg.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZmOuLTSoWD9-bj1ffZ-EWw_6chDrxZj";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function sendLoginLink() {
  const emailInput = document.getElementById("email");
  const loginBtn = document.getElementById("loginBtn");
  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  // Inject animation state rules
  loginBtn.classList.add("loading");
  loginBtn.disabled = true;

  try {
    // Check if agent is enrolled
    const { data: isAllowed, error: checkError } = await supabaseClient.rpc(
      "is_allowed_agent",
      { p_email: email }
    );

    if (checkError) {
      console.error(checkError);
      alert("Unable to verify enrollment. Please try again.");
      return;
    }

    if (!isAllowed) {
      alert("This email is not enrolled in the platform.");
      return;
    }

    // Send OTP only if enrolled
    const { error } = await supabaseClient.auth.signInWithOtp({ email });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Login link sent to your email. Please check and click the link to login.");
  } catch (err) {
    console.error(err);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    // Reset structural state
    loginBtn.classList.remove("loading");
    loginBtn.disabled = false;
  }
}

async function loadLeads() {
  const { data, error } = await supabaseClient.rpc("get_builder_leads");

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  const rows = data || [];
  document.getElementById("rowCount").textContent = `${rows.length} high intent lead${rows.length === 1 ? '' : 's'}`;
  renderTable(rows);
}

async function searchLeads() {
  const search = document.getElementById("search").value.trim();

  if (!search) {
    await loadLeads();
    return;
  }

  const { data, error } = await supabaseClient.rpc("search_builder_leads", {
    p_phone: search
  });

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  const rows = data || [];
  document.getElementById("rowCount").textContent = `${rows.length} high intent lead${rows.length === 1 ? '' : 's'}`;
  renderTable(rows);
}

function renderTable(rows) {
  const table = document.getElementById("leadTable");
  const emptyState = document.getElementById("emptyState");

  table.innerHTML = "";

  if (rows.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  rows.forEach(row => {
    const tr = document.createElement("tr");
    const properties = Array.isArray(row.properties) ? row.properties : [];

    const intentClass = row.intent_score >= 70 ? "intent-high"
                      : row.intent_score >= 40 ? "intent-mid"
                      : "intent-low";

    const chipsHtml = properties.map((p, i) => {
      const hidden = i >= 5 ? " chip-hidden" : "";
      return `<span class="chip${hidden}" data-property-code="${p.property_code}" data-property-name="${p.property_name || p.property_code}">` +
        `<span class="chip-name">${p.property_name || p.property_code}</span>` +
        `<span class="chip-score">${p.score}</span>` +
        `</span>`;
    }).join("");

    const extraCount = properties.length - 5;
    const expandBtn = extraCount > 0
      ? `<button class="chip-expand-btn" onclick="toggleExpand(this)" data-extra="${extraCount}">+${extraCount} more</button>`
      : "";

    tr.innerHTML = `
      <td>${row.phone_number}</td>
      <td>${row.name || ""}</td>
      <td><span class="intent-badge ${intentClass}">${row.intent_score}</span></td>
      <td><div class="chip-container">${chipsHtml}${expandBtn}</div></td>
    `;
    table.appendChild(tr);
  });
}

function toggleExpand(btn) {
  const container = btn.closest(".chip-container");
  const isExpanded = container.classList.toggle("expanded");
  btn.textContent = isExpanded ? "Show less" : `+${btn.dataset.extra} more`;
}

// ── Analytics ──────────────────────────────────────────────────
let _lastAnalyticsData = null;
const _charts = {};

function _isDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

function _chartColors() {
  const dark = _isDark();
  return {
    brand:    dark ? "#a78bfa" : "#5600C2",
    fill:     dark ? "rgba(167,139,250,0.22)" : "rgba(86,0,194,0.14)",
    grid:     dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
    ticks:    dark ? "#9d93b8" : "#83769c",
    ttBg:     dark ? "rgba(10,8,18,0.93)"     : "rgba(255,255,255,0.97)",
    ttText:   dark ? "#f1eeff"                : "#150a26",
    ttBorder: dark ? "rgba(167,139,250,0.20)" : "rgba(86,0,194,0.12)",
  };
}

function _ttCfg(c) {
  return {
    backgroundColor: c.ttBg, titleColor: c.ttText, bodyColor: c.ttText,
    borderColor: c.ttBorder, borderWidth: 1, padding: 10, cornerRadius: 10,
    titleFont: { family: "'Manrope', sans-serif", weight: "700", size: 12 },
    bodyFont:  { family: "'Manrope', sans-serif", size: 11 },
  };
}

async function loadAnalytics() {
  const { data, error } = await supabaseClient.rpc("get_builder_analytics");
  if (error) { console.error("Analytics:", error); return; }
  _lastAnalyticsData = data;
  renderAnalytics(data);
}

function renderAnalytics(d) {
  if (!d) return;

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  set("builderName",   d.builder_name || "—");
  set("kpiLeads",      d.total_leads ?? "—");
  set("kpiHotLeads",   d.intent_distribution?.high ?? "—");
  const avgMin = Math.round((d.avg_session_duration ?? 0) / 60);
  set("kpiAvgTime",    avgMin > 0 ? avgMin + "m" : "< 1m");
  set("kpiProperties", d.total_properties ?? "—");

  _renderIntentChart(d.intent_distribution);
  _renderActivityChart(d.daily_activity);
  _renderPropertiesChart(d.top_properties);
  _renderEventStats(d.event_totals);
}

function _renderIntentChart(dist) {
  const high = dist?.high ?? 0, mid = dist?.mid ?? 0, low = dist?.low ?? 0;
  const total = high + mid + low;

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("donutTotal", total);

  const legend = document.getElementById("intentLegend");
  if (legend) {
    legend.innerHTML = [
      { label: "High", value: high, color: "#065f46" },
      { label: "Mid",  value: mid,  color: "#92400e" },
      { label: "Low",  value: low,  color: "#991b1b" },
    ].map(it =>
      `<div class="legend-item"><span class="legend-dot" style="background:${it.color}"></span>` +
      `<span class="legend-label">${it.label}</span><span class="legend-value">${it.value}</span></div>`
    ).join("");
  }

  if (_charts.intent) _charts.intent.destroy();
  const canvas = document.getElementById("intentChart");
  if (!canvas) return;

  _charts.intent = new Chart(canvas, {
    type: "doughnut",
    data: {
      datasets: [{
        data: total > 0 ? [high, mid, low] : [1, 1, 1],
        backgroundColor: total > 0
          ? ["#065f46", "#92400e", "#991b1b"]
          : ["rgba(128,128,128,0.14)", "rgba(128,128,128,0.09)", "rgba(128,128,128,0.06)"],
        borderWidth: 0,
        hoverOffset: 0,
      }]
    },
    options: {
      cutout: "74%",
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 600, easing: "easeInOutQuart" },
      plugins: {
        legend:  { display: false },
        tooltip: {
          enabled: total > 0,
          ..._ttCfg(_chartColors()),
          callbacks: {
            label: ctx => {
              const labels = ["High Intent", "Mid Intent", "Low Intent"];
              const pct = total > 0 ? Math.round(ctx.parsed / total * 100) : 0;
              return `  ${labels[ctx.dataIndex]}: ${ctx.parsed} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

function _renderActivityChart(dailyData) {
  if (_charts.activity) _charts.activity.destroy();
  const canvas = document.getElementById("activityChart");
  if (!canvas) return;
  const c = _chartColors();

  const arr    = dailyData || [];
  const labels = arr.map(d => {
    const dt = new Date(d.date);
    return dt.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  });
  const values = arr.map(d => d.sessions);

  const ctx  = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 130);
  grad.addColorStop(0, _isDark() ? "rgba(167,139,250,0.28)" : "rgba(86,0,194,0.18)");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  _charts.activity = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: c.brand,
        backgroundColor: grad,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: c.brand,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      plugins: { legend: { display: false }, tooltip: _ttCfg(c) },
      scales: {
        x: {
          grid:   { display: false },
          border: { display: false },
          ticks:  { color: c.ticks, maxTicksLimit: 6, font: { size: 10, family: "'Manrope', sans-serif" } },
        },
        y: {
          grid:   { color: c.grid },
          border: { display: false },
          ticks:  { color: c.ticks, maxTicksLimit: 4, stepSize: 1, font: { size: 10, family: "'Manrope', sans-serif" } },
          min: 0,
        }
      }
    }
  });
}

function _renderPropertiesChart(topProps) {
  if (_charts.properties) _charts.properties.destroy();
  const canvas = document.getElementById("propertiesChart");
  if (!canvas) return;
  const c = _chartColors();

  const props  = (topProps || []).slice(0, 5);
  const labels = props.map(p => p.name.length > 20 ? p.name.slice(0, 18) + "…" : p.name);
  const values = props.map(p => p.visits);

  _charts.properties = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: c.brand,
        borderRadius: 5,
        borderSkipped: false,
        maxBarThickness: 28,
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      plugins: { legend: { display: false }, tooltip: _ttCfg(c) },
      scales: {
        x: {
          grid:   { color: c.grid },
          border: { display: false },
          ticks:  { color: c.ticks, stepSize: 1, font: { size: 10, family: "'Manrope', sans-serif" } },
          min: 0,
        },
        y: {
          grid:   { display: false },
          border: { display: false },
          ticks:  { color: c.ticks, font: { size: 10.5, family: "'Manrope', sans-serif" } },
        }
      }
    }
  });
}

function _renderEventStats(events) {
  const fp  = events?.floor_plan_views ?? 0;
  const ac  = events?.agent_card_views ?? 0;
  const wa  = events?.whatsapp_clicks  ?? 0;
  const max = Math.max(fp, ac, wa, 1);

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("eventFloorCount", fp);
  set("eventAgentCount", ac);
  set("eventWaCount",    wa);

  const setW = (id, v) => { const el = document.getElementById(id); if (el) el.style.width = (v / max * 100) + "%"; };
  setW("eventBarFloor", fp);
  setW("eventBarAgent", ac);
  setW("eventBarWa",    wa);
}

window.updateChartTheme = function() {
  if (_lastAnalyticsData) renderAnalytics(_lastAnalyticsData);
};

async function logout() {
  await supabaseClient.auth.signOut();
  location.reload();
}

(async function initialize() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    document.getElementById("loginScreen").classList.add("visible");
    return;
  }

  const email = session.user.email?.trim().toLowerCase();
  const { data: isAllowed } = await supabaseClient.rpc("is_allowed_agent", {
    p_email: email
  });

  if (!isAllowed) {
    await supabaseClient.auth.signOut();
    document.getElementById("loginScreen").classList.add("visible");
    return;
  }

  const dashboard = document.getElementById("dashboard");
  dashboard.classList.add("visible");

  loadLeads();
  loadAnalytics();
})();