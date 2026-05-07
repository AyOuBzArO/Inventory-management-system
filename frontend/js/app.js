/* ============================================================
   IMS App — Shared JavaScript
   ============================================================ */

const API = "http://127.0.0.1:8000";

// ---------- Auth ----------
function getToken() {
  return localStorage.getItem("token");
}

function requireAuth() {
  const token = getToken();
  if (!token) window.location.href = "login.html";
  return token;
}

function authHeaders() {
  const token = getToken();
  return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

function getWelcomeName() {
  try {
    return localStorage.getItem("username") || "User";
  } catch {
    return "User";
  }
}

// ---------- Dark Mode ----------
function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
}

function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle("dark");
  localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
}

function getThemeIcon() {
  const isDark = document.documentElement.classList.contains("dark");
  return isDark
    ? `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
    : `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
}

// ---------- Animated Counter ----------
function animateCounter(el, target, duration = 1000) {
  const start = performance.now();
  const initial = parseFloat(el.textContent.replace(/[^0-9.-]/g, "")) || 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = initial + (target - initial) * eased;

    if (el.dataset.prefix) {
      el.textContent = el.dataset.prefix + current.toFixed(el.dataset.fixed ? 2 : 0);
    } else {
      el.textContent = current.toFixed(el.dataset.fixed ? 2 : 0);
    }

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ---------- Toast ----------
function showToast(message, type = "info") {
  const icons = {
    success: `<svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  const container = document.getElementById("toast-container") || createToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.closest('.toast').classList.add('removing'); setTimeout(() => this.closest('.toast').remove(), 200)">
      <svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.isConnected) {
      toast.classList.add("removing");
      setTimeout(() => toast.remove(), 200);
    }
  }, 4000);
}

function createToastContainer() {
  const el = document.createElement("div");
  el.id = "toast-container";
  el.className = "toast-container";
  document.body.appendChild(el);
  return el;
}

// ---------- Formatting ----------
function formatCurrency(amount) {
  return "$" + Number(amount).toFixed(2);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ---------- Skeleton ----------
function renderSkeletonCards(count = 6) {
  return Array(count).fill().map(() => `
    <div class="skeleton skeleton-card">
      <div style="height:200px;border-radius:16px 16px 0 0"></div>
      <div style="padding:20px">
        <div class="skeleton" style="height:18px;width:70%;margin-bottom:12px"></div>
        <div class="skeleton" style="height:12px;width:90%;margin-bottom:20px"></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:16px">
          <div class="skeleton" style="width:60px;height:24px"></div>
          <div class="skeleton" style="width:80px;height:24px"></div>
        </div>
        <div style="display:flex;gap:8px">
          <div class="skeleton" style="flex:1;height:36px"></div>
          <div class="skeleton" style="flex:1;height:36px"></div>
        </div>
      </div>
    </div>`).join("");
}

// ---------- Confirm Dialog ----------
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${title}</div>
        <div class="modal-text">${message}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="confirm-no">Cancel</button>
          <button class="btn btn-danger" id="confirm-yes">
            <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#confirm-yes").addEventListener("click", () => { overlay.remove(); resolve(true); });
    overlay.querySelector("#confirm-no").addEventListener("click", () => { overlay.remove(); resolve(false); });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
  });
}

// ---------- Mouse-follow glow for stat cards ----------
function initCardGlow() {
  document.querySelectorAll(".stat-card").forEach(function(card) {
    card.addEventListener("mousemove", function(e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");
    });
    card.addEventListener("mouseleave", function() {
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    });
  });
}

// ---------- Animated Counter (enhanced) ----------
function animateCounter(el, target, duration) {
  if (!duration) duration = 1200;
  var start = performance.now();
  var initial = parseFloat(el.textContent.replace(/[^0-9.-]/g, "")) || 0;

  function update(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    // Custom cubic bezier ease-out: 0.34, 1.56, 0.64, 1 (spring-like)
    var eased;
    if (progress < 0.5) {
      eased = 4 * progress * progress * progress;
    } else {
      var p = progress - 1;
      eased = 1 + p * p * p;
    }
    var current = initial + (target - initial) * eased;

    if (el.dataset.prefix) {
      el.textContent = el.dataset.prefix + current.toFixed(el.dataset.fixed ? 2 : 0);
    } else {
      el.textContent = current.toFixed(el.dataset.fixed ? 2 : 0);
    }

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ---------- SVG Icons ----------
const Icons = {
  box: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 3l7 4-7 4-7-4 7-4z"/><path d="M19 7v8l-7 4v-8l7-4z"/><path d="M5 7v8l7 4v-8l-7-4z"/></svg>`,
  alertTriangle: `<svg class="icon" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  dollarSign: `<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  trendingUp: `<svg class="icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  trendingDown: `<svg class="icon" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
  search: `<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus: `<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit: `<svg class="icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  chevronRight: `<svg class="icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`,
  barChart: `<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  users: `<svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  upload: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  image: `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  logOut: `<svg class="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  sun: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  check: `<svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  eye: `<svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  zap: `<svg class="icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
};
