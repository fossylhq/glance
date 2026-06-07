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
    const propertyHtml = (row.property_ids || [])
      .map(propertyId => `<span class="chip">${propertyId}</span>`)
      .join(" ");

    tr.innerHTML = `
      <td>${row.phone_number}</td>
      <td>${row.name || ""}</td>
      <td>${propertyHtml}</td>
    `;
    table.appendChild(tr);
  });
}

async function logout() {
  await supabaseClient.auth.signOut();
  location.reload();
}

(async function initialize() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    return;
  }

  const email = session.user.email?.trim().toLowerCase();
  const { data: isAllowed } = await supabaseClient.rpc("is_allowed_agent", {
    p_email: email
  });

  if (!isAllowed) {
    await supabaseClient.auth.signOut();
    return;
  }

  document.getElementById("loginScreen").style.display = "none";
  const dashboard = document.getElementById("dashboard");
  dashboard.style.display = "flex";
  dashboard.classList.add("visible");

  await loadLeads();
})();