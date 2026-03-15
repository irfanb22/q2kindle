// ── Config ──
const SUPABASE_URL = "https://scxkmenczzxpwustppee.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjeGttZW5jenp4cHd1c3RwcGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NTYxMzIsImV4cCI6MjA4NjEzMjEzMn0.rxppaKjnFlQwhRQhtS4hlpIXUZ3h497weJ0Z4bUxvOo";
const API_BASE = "https://q2kindle.com";

// ── DOM refs ──
const views = {
  login: document.getElementById("login-view"),
  otp: document.getElementById("otp-view"),
  save: document.getElementById("save-view"),
};

const els = {
  emailInput: document.getElementById("email-input"),
  sendLinkBtn: document.getElementById("send-link-btn"),
  loginStatus: document.getElementById("login-status"),
  otpInput: document.getElementById("otp-input"),
  verifyBtn: document.getElementById("verify-btn"),
  backBtn: document.getElementById("back-btn"),
  resendBtn: document.getElementById("resend-btn"),
  otpStatus: document.getElementById("otp-status"),
  pageTitle: document.getElementById("page-title"),
  pageUrl: document.getElementById("page-url"),
  saveBtn: document.getElementById("save-btn"),
  saveStatus: document.getElementById("save-status"),
  userEmail: document.getElementById("user-email"),
  signOutBtn: document.getElementById("sign-out-btn"),
};

let currentEmail = "";

// ── View switching ──
function showView(name) {
  Object.values(views).forEach((v) => v.classList.remove("active"));
  views[name].classList.add("active");
}

function showStatus(el, message, type) {
  el.textContent = message;
  el.className = `status ${type}`;
}

function clearStatus(el) {
  el.className = "status";
  el.textContent = "";
}

function setLoading(btn, loading, text) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span>${text || "Loading..."}`
    : text || btn.dataset.originalText;
}

// ── Supabase REST helpers ──
async function supabasePost(path, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res;
}

async function refreshSession(refreshToken) {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  await chrome.storage.local.set({
    q2k_access_token: data.access_token,
    q2k_refresh_token: data.refresh_token,
    q2k_user_email: data.user?.email || "",
    q2k_token_expires_at: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}

async function getValidToken() {
  const stored = await chrome.storage.local.get([
    "q2k_access_token",
    "q2k_refresh_token",
    "q2k_token_expires_at",
  ]);

  if (!stored.q2k_access_token) return null;

  // Refresh if token expires within 60 seconds
  if (
    stored.q2k_token_expires_at &&
    Date.now() > stored.q2k_token_expires_at - 60000
  ) {
    if (stored.q2k_refresh_token) {
      return await refreshSession(stored.q2k_refresh_token);
    }
    return null;
  }

  return stored.q2k_access_token;
}

// ── Auth flow ──
els.sendLinkBtn.dataset.originalText = "Send Magic Link";
els.sendLinkBtn.addEventListener("click", async () => {
  const email = els.emailInput.value.trim();
  if (!email) {
    showStatus(els.loginStatus, "Please enter your email.", "error");
    return;
  }

  clearStatus(els.loginStatus);
  setLoading(els.sendLinkBtn, true, "Sending...");

  try {
    const res = await supabasePost("/auth/v1/otp", {
      email,
      create_user: false,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.msg || err.error_description || "Failed to send");
    }

    currentEmail = email;
    showView("otp");
    els.otpInput.focus();
  } catch (err) {
    showStatus(
      els.loginStatus,
      err.message || "Failed to send magic link.",
      "error"
    );
  } finally {
    setLoading(els.sendLinkBtn, false, "Send Magic Link");
  }
});

// Enter key on email input
els.emailInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") els.sendLinkBtn.click();
});

// ── OTP verification ──
els.verifyBtn.dataset.originalText = "Verify Code";
els.verifyBtn.addEventListener("click", async () => {
  const token = els.otpInput.value.trim();
  if (!token || token.length !== 6) {
    showStatus(els.otpStatus, "Please enter the 6-digit code.", "error");
    return;
  }

  clearStatus(els.otpStatus);
  setLoading(els.verifyBtn, true, "Verifying...");

  try {
    const res = await supabasePost("/auth/v1/verify", {
      email: currentEmail,
      token,
      type: "email",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.msg || err.error_description || "Invalid code");
    }

    const data = await res.json();

    await chrome.storage.local.set({
      q2k_access_token: data.access_token,
      q2k_refresh_token: data.refresh_token,
      q2k_user_email: data.user?.email || currentEmail,
      q2k_token_expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    });

    await initSaveView();
  } catch (err) {
    showStatus(
      els.otpStatus,
      err.message || "Verification failed.",
      "error"
    );
  } finally {
    setLoading(els.verifyBtn, false, "Verify Code");
  }
});

// Enter key on OTP input
els.otpInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") els.verifyBtn.click();
});

// Only allow numeric input in OTP field
els.otpInput.addEventListener("input", () => {
  els.otpInput.value = els.otpInput.value.replace(/\D/g, "").slice(0, 6);
});

// Back button
els.backBtn.addEventListener("click", () => {
  clearStatus(els.otpStatus);
  els.otpInput.value = "";
  showView("login");
});

// Resend button
els.resendBtn.addEventListener("click", async () => {
  els.resendBtn.disabled = true;
  try {
    await supabasePost("/auth/v1/otp", {
      email: currentEmail,
      create_user: false,
    });
    showStatus(els.otpStatus, "Code resent. Check your email.", "success");
  } catch {
    showStatus(els.otpStatus, "Failed to resend.", "error");
  } finally {
    els.resendBtn.disabled = false;
  }
});

// ── Save flow ──
async function initSaveView() {
  const stored = await chrome.storage.local.get(["q2k_user_email"]);
  els.userEmail.textContent = stored.q2k_user_email || "";

  // Get the current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    els.pageTitle.textContent = tab.title || "Untitled Page";
    els.pageUrl.textContent = tab.url || "";
  }

  clearStatus(els.saveStatus);
  showView("save");
}

els.saveBtn.dataset.originalText = "Save to Queue";
els.saveBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) {
    showStatus(els.saveStatus, "No URL to save.", "error");
    return;
  }

  // Don't save chrome:// or extension pages
  if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("chrome-extension://") ||
    tab.url.startsWith("about:")
  ) {
    showStatus(els.saveStatus, "Can't save browser internal pages.", "error");
    return;
  }

  clearStatus(els.saveStatus);
  setLoading(els.saveBtn, true, "Saving...");

  try {
    const token = await getValidToken();
    if (!token) {
      showView("login");
      showStatus(
        els.loginStatus,
        "Session expired. Please sign in again.",
        "error"
      );
      return;
    }

    const res = await fetch(`${API_BASE}/api/articles/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: tab.url }),
    });

    if (res.status === 401) {
      // Token invalid — clear and show login
      await chrome.storage.local.remove([
        "q2k_access_token",
        "q2k_refresh_token",
        "q2k_user_email",
        "q2k_token_expires_at",
      ]);
      showView("login");
      showStatus(
        els.loginStatus,
        "Session expired. Please sign in again.",
        "error"
      );
      return;
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save article");
    }

    const data = await res.json();
    const title = data.article?.title || "Article";
    const failed = data.extractionFailed;

    showStatus(
      els.saveStatus,
      failed
        ? `"${title}" saved, but content couldn't be extracted.`
        : `"${title}" saved to your queue!`,
      failed ? "error" : "success"
    );

    // Disable save button briefly to prevent double-saves
    els.saveBtn.disabled = true;
    setTimeout(() => {
      els.saveBtn.disabled = false;
    }, 2000);
  } catch (err) {
    showStatus(
      els.saveStatus,
      err.message || "Failed to save article.",
      "error"
    );
  } finally {
    setLoading(els.saveBtn, false, "Save to Queue");
  }
});

// ── Sign out ──
els.signOutBtn.addEventListener("click", async () => {
  await chrome.storage.local.remove([
    "q2k_access_token",
    "q2k_refresh_token",
    "q2k_user_email",
    "q2k_token_expires_at",
  ]);
  clearStatus(els.saveStatus);
  els.emailInput.value = "";
  showView("login");
});

// ── Init ──
(async () => {
  const token = await getValidToken();
  if (token) {
    await initSaveView();
  } else {
    showView("login");
  }
})();
