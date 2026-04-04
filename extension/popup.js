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
  success: document.getElementById("success-view"),
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
  saveBtn: document.getElementById("save-btn"),
  saveStatus: document.getElementById("save-status"),
  userEmail: document.getElementById("user-email"),
  signOutBtn: document.getElementById("sign-out-btn"),
  goToQueueBtn: document.getElementById("go-to-queue-btn"),
  progressBarFill: document.getElementById("progress-bar-fill"),
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

let successTimer = null;
let savingTextTimer = null;

const SAVING_MESSAGES = [
  { text: "Saving...", delay: 0 },
  { text: "Extracting article...", delay: 3000 },
  { text: "Almost there...", delay: 6000 },
  { text: "Still working...", delay: 10000 },
];

function startSavingTextRotation() {
  const timeouts = [];
  SAVING_MESSAGES.forEach(({ text, delay }) => {
    const id = setTimeout(() => {
      els.saveBtn.innerHTML = `<span class="spinner"></span><span class="saving-text">${text}</span>`;
    }, delay);
    timeouts.push(id);
  });
  savingTextTimer = timeouts;
}

function stopSavingTextRotation() {
  if (savingTextTimer) {
    savingTextTimer.forEach(clearTimeout);
    savingTextTimer = null;
  }
}

function showSuccessView() {
  // Re-trigger the checkmark animation by replacing the SVG
  const wrap = views.success.querySelector(".checkmark-wrap");
  wrap.innerHTML = `
    <svg viewBox="0 0 48 48" width="36" height="36">
      <circle class="checkmark-circle" cx="24" cy="24" r="22"/>
      <path class="checkmark-check" d="M14 24 l7 7 13-13"/>
    </svg>
  `;
  // Re-trigger progress bar animation
  els.progressBarFill.style.animation = "none";
  // Force reflow then restart
  void els.progressBarFill.offsetWidth;
  els.progressBarFill.style.animation = "";

  showView("success");

  // Auto-close popup after 7s
  clearTimeout(successTimer);
  successTimer = setTimeout(() => {
    window.close();
  }, 7000);
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
    // Persist OTP state so it survives popup close/reopen
    await chrome.storage.local.set({ q2k_otp_email: email });
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

    // Clear OTP state and save session
    await chrome.storage.local.remove(["q2k_otp_email"]);
    await chrome.storage.local.set({
      q2k_access_token: data.access_token,
      q2k_refresh_token: data.refresh_token,
      q2k_user_email: data.user?.email || currentEmail,
      q2k_token_expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    });

    // Show brief "Signed in!" confirmation before transitioning
    showStatus(els.otpStatus, "Signed in!", "success");
    await new Promise((r) => setTimeout(r, 1500));
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
els.backBtn.addEventListener("click", async () => {
  clearStatus(els.otpStatus);
  els.otpInput.value = "";
  await chrome.storage.local.remove(["q2k_otp_email"]);
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
  startSavingTextRotation();

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

    // Grab the page HTML from the active tab (captures paywalled content the user can see)
    let pageHtml = null;
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML,
      });
      if (result?.result) {
        pageHtml = result.result;
      }
    } catch {
      // Some pages block script injection (chrome://, PDFs, etc.) — fall back to URL-only
    }

    const payload = { url: tab.url };
    if (pageHtml) {
      payload.html = pageHtml;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let res;
    try {
      res = await fetch(`${API_BASE}/api/articles/extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      if (fetchErr.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeout);
    }

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

    setLoading(els.saveBtn, false, "Save to Queue");
    showSuccessView();
  } catch (err) {
    showStatus(
      els.saveStatus,
      err.message || "Failed to save article.",
      "error"
    );
  } finally {
    stopSavingTextRotation();
    setLoading(els.saveBtn, false, "Save to Queue");
  }
});

// ── Go to Queue button ──
els.goToQueueBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/dashboard` });
  window.close();
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
    // Check if we were waiting for an OTP code before the popup closed
    const stored = await chrome.storage.local.get(["q2k_otp_email"]);
    if (stored.q2k_otp_email) {
      currentEmail = stored.q2k_otp_email;
      showView("otp");
      els.otpInput.focus();
    } else {
      showView("login");
    }
  }
})();
