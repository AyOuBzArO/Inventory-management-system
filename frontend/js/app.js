/* ============================================================
   IMS App — Shared JavaScript
   ============================================================ */

const API = window.location.origin;

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
  const locale = getLang() === "fr" ? "fr-FR" : "en-US";
  return new Date(dateStr).toLocaleDateString(locale, {
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
          <button class="btn btn-secondary" id="confirm-no">${TRANSLATIONS[getLang()].common.cancel}</button>
          <button class="btn btn-danger" id="confirm-yes">
            <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            ${TRANSLATIONS[getLang()].common.delete}
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

// ---------- i18n ----------
var TRANSLATIONS = {
  en: {
    nav: { products: "Products", addProduct: "Add Product", sales: "Sales", statistics: "Statistics", signOut: "Sign out" },
    login: { title: "Welcome back", subtitle: "Sign in to your account to continue", createTitle: "Create account", createSubtitle: "Sign up to start managing your inventory", username: "Username", password: "Password", confirmPassword: "Confirm password", signIn: "Sign In", signUp: "Sign Up", noAccount: "Don't have an account?", haveAccount: "Already have an account?" },
    dashboard: {
      title: "Products", newProduct: "New Product", viewAnalytics: "View Analytics", search: "Search products...",
      totalProducts: "Total Products", lowStockItems: "Low Stock Items", inventoryValue: "Inventory Value",
      greetingMorning: "Good morning", greetingAfternoon: "Good afternoon", greetingEvening: "Good evening",
      heroText: "Here's your inventory overview for today. Monitor stock levels, track performance, and manage products effortlessly.",
      heroTotal: "Total Products", heroLow: "Low Stock", heroValue: "Inventory Value",
      loading: "Loading...", noProducts: "No products yet",
      noProductsText: "Get started by adding your first product to the inventory.",
      addProduct: "Add Product", inStock: "in stock", product: "product", products: "products",
      edit: "Edit", delete: "Delete", noDescription: "No description",
      serverError: "Could not load products. Is the server running?",
      deleteConfirmTitle: "Delete product?", deleteConfirmText: "Are you sure you want to delete this product? This action cannot be undone.",
      deletedSuccess: "Product deleted successfully", deletedError: "Failed to delete product"
    },
    addProduct: {
      addTitle: "Add Product", addSubtitle: "Fill in the details below to add a new product to your inventory",
      editTitle: "Edit Product", editSubtitle: "Update the product details below",
      photoSection: "Product Photo", uploadClick: "Click to upload an image",
      uploadHint: "or drag and drop — PNG, JPG up to 5MB",
      basicInfo: "Basic Information", nameLabel: "Product Name", namePh: "e.g. Wireless Headphones",
      descLabel: "Description", descPh: "Brief description of the product (optional)",
      pricingSection: "Pricing & Stock", priceLabel: "Price ($)", qtyLabel: "Quantity",
      previewLabel: "Live Preview", previewName: "Product name", previewDesc: "Description will appear here",
      inStock: "in stock", cancel: "Cancel", save: "Save Product", update: "Update Product",
      saving: "Saving...", updating: "Updating...", redirecting: "Redirecting...",
      errorName: "Please enter a product name", errorPrice: "Please enter a valid price",
      errorImage: "Please select an image file", errorSize: "Image must be less than 5MB",
      errorSave: "Error saving product", errorConn: "Connection error. Is the server running?",
      errorLoad: "Failed to load product"
    },
    sales: {
      pageTitle: "Sales", totalTransactions: "Total Transactions", todayRevenue: "Today's Revenue",
      totalRevenue: "Total Revenue", recordSale: "Record New Sale", product: "Product",
      quantity: "Quantity", estimatedTotal: "Estimated Total", confirmSale: "Confirm Sale",
      history: "Sales History", colDate: "Date & Time", colProduct: "Product", colQty: "Qty",
      colRevenue: "Revenue", allTime: "All time", today: "Today", dailyTotal: "Daily total",
      allTransactions: "All transactions",
      selectProduct: "Select a product...", unitsInStock: "units currently in stock",
      noSales: "No sales recorded yet", failedSales: "Failed to load sales history",
      failedProducts: "Failed to load products", saleRecorded: "Sale recorded",
      errorProduct: "Please select a product", errorQty: "Quantity must be at least 1",
      errorStock: "Not enough stock", loading: "Loading...",
      transaction: "transaction", transactions: "transactions", available: "available"
    },
    stats: {
      pageTitle: "Statistics", daily: "Daily Revenue", weekly: "Weekly Revenue",
      monthly: "Monthly Revenue", best: "Best Selling Products", worst: "Worst Selling Products",
      overTime: "Sales Over Time", lowStock: "Low Stock Alerts", topSelling: "Top Selling Products",
      byProduct: "Revenue by Product", trend: "Daily Revenue Trend",
      today: "Today", lastWeek: "Last 7 days", lastMonth: "Last 30 days",
      loading: "Loading...", noData: "No sales data yet", noProducts: "No products yet",
      wellStocked: "All products are well stocked", failed: "Failed to load",
      sold: "sold", left: "left", total: "Total"
    },
    common: { cancel: "Cancel", delete: "Delete", loading: "Loading..." }
  },
  fr: {
    nav: { products: "Produits", addProduct: "Ajouter", sales: "Ventes", statistics: "Statistiques", signOut: "Déconnexion" },
    login: { title: "Bon retour", subtitle: "Connectez-vous à votre compte", createTitle: "Créer un compte", createSubtitle: "Inscrivez-vous pour gérer votre stock", username: "Identifiant", password: "Mot de passe", confirmPassword: "Confirmer le mot de passe", signIn: "Se connecter", signUp: "S'inscrire", noAccount: "Pas encore de compte ?", haveAccount: "Déjà un compte ?" },
    dashboard: {
      title: "Produits", newProduct: "Nouveau produit", viewAnalytics: "Voir les stats", search: "Rechercher...",
      totalProducts: "Total produits", lowStockItems: "Stock faible", inventoryValue: "Valeur du stock",
      greetingMorning: "Bonjour", greetingAfternoon: "Bon après-midi", greetingEvening: "Bonsoir",
      heroText: "Voici l'aperçu de votre inventaire. Surveillez les niveaux de stock, suivez les performances et gérez vos produits facilement.",
      heroTotal: "Total produits", heroLow: "Stock faible", heroValue: "Valeur du stock",
      loading: "Chargement...", noProducts: "Aucun produit",
      noProductsText: "Commencez par ajouter votre premier produit à l'inventaire.",
      addProduct: "Ajouter", inStock: "en stock", product: "produit", products: "produits",
      edit: "Modifier", delete: "Supprimer", noDescription: "Aucune description",
      serverError: "Impossible de charger les produits. Le serveur est-il actif ?",
      deleteConfirmTitle: "Supprimer le produit ?", deleteConfirmText: "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.",
      deletedSuccess: "Produit supprimé avec succès", deletedError: "Échec de la suppression"
    },
    addProduct: {
      addTitle: "Ajouter un produit", addSubtitle: "Remplissez les détails ci-dessous pour ajouter un nouveau produit",
      editTitle: "Modifier le produit", editSubtitle: "Mettez à jour les détails du produit ci-dessous",
      photoSection: "Photo du produit", uploadClick: "Cliquez pour télécharger une image",
      uploadHint: "ou glissez-déposez — PNG, JPG jusqu'à 5 Mo",
      basicInfo: "Informations de base", nameLabel: "Nom du produit", namePh: "ex. Casque sans fil",
      descLabel: "Description", descPh: "Brève description du produit (facultatif)",
      pricingSection: "Prix & Stock", priceLabel: "Prix ($)", qtyLabel: "Quantité",
      previewLabel: "Aperçu en direct", previewName: "Nom du produit", previewDesc: "La description apparaîtra ici",
      inStock: "en stock", cancel: "Annuler", save: "Enregistrer", update: "Mettre à jour",
      saving: "Enregistrement...", updating: "Mise à jour...", redirecting: "Redirection...",
      errorName: "Veuillez entrer un nom de produit", errorPrice: "Veuillez entrer un prix valide",
      errorImage: "Veuillez sélectionner une image", errorSize: "L'image doit faire moins de 5 Mo",
      errorSave: "Erreur lors de l'enregistrement", errorConn: "Erreur de connexion. Le serveur est-il actif ?",
      errorLoad: "Impossible de charger le produit"
    },
    sales: {
      pageTitle: "Ventes", totalTransactions: "Transactions totales", todayRevenue: "Revenus du jour",
      totalRevenue: "Revenus totaux", recordSale: "Nouvelle vente", product: "Produit",
      quantity: "Quantité", estimatedTotal: "Total estimé", confirmSale: "Confirmer",
      history: "Historique des ventes", colDate: "Date & Heure", colProduct: "Produit",
      colQty: "Qté", colRevenue: "Revenu", allTime: "Tout le temps", today: "Aujourd'hui",
      dailyTotal: "Total du jour", allTransactions: "Toutes les transactions",
      selectProduct: "Sélectionner un produit...", unitsInStock: "unités en stock",
      noSales: "Aucune vente enregistrée", failedSales: "Impossible de charger l'historique",
      failedProducts: "Impossible de charger les produits", saleRecorded: "Vente enregistrée",
      errorProduct: "Veuillez sélectionner un produit", errorQty: "La quantité doit être au moins 1",
      errorStock: "Stock insuffisant", loading: "Chargement...",
      transaction: "transaction", transactions: "transactions", available: "disponibles"
    },
    stats: {
      pageTitle: "Statistiques", daily: "Revenus journaliers", weekly: "Revenus hebdomadaires",
      monthly: "Revenus mensuels", best: "Meilleurs produits", worst: "Moins vendus",
      overTime: "Ventes dans le temps", lowStock: "Alertes stock bas", topSelling: "Top des ventes",
      byProduct: "Revenu par produit", trend: "Tendance des revenus",
      today: "Aujourd'hui", lastWeek: "7 derniers jours", lastMonth: "30 derniers jours",
      loading: "Chargement...", noData: "Aucune donnée de vente", noProducts: "Aucun produit",
      wellStocked: "Tous les produits sont bien approvisionnés", failed: "Échec du chargement",
      sold: "vendu(s)", left: "restant(s)", total: "Total"
    },
    common: { cancel: "Annuler", delete: "Supprimer", loading: "Chargement..." }
  }
};

function getLang() { return localStorage.getItem("lang") || "en"; }
function setLang(lang) {
  localStorage.setItem("lang", lang);
  applyTranslations();
  if (typeof window.onLangChange === "function") window.onLangChange();
}
function toggleLang() { setLang(getLang() === "en" ? "fr" : "en"); }
function getLangLabel() { return getLang() === "en" ? "FR" : "EN"; }

function applyTranslations() {
  var t = TRANSLATIONS[getLang()];
  document.querySelectorAll("[data-i18n]").forEach(function(el) {
    var keys = el.dataset.i18n.split(".");
    var val = t;
    for (var i = 0; i < keys.length; i++) { val = val && val[keys[i]]; }
    if (val !== undefined) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(function(el) {
    var keys = el.dataset.i18nPh.split(".");
    var val = t;
    for (var i = 0; i < keys.length; i++) { val = val && val[keys[i]]; }
    if (val !== undefined) el.placeholder = val;
  });
  var btn = document.getElementById("langBtn");
  if (btn) btn.textContent = getLangLabel();
}

function initLang() { applyTranslations(); }
