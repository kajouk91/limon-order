import { APP_CONFIG } from "./config/appConfig.js";
import { DEFAULT_CATALOG } from "./data/catalogData.js";
import { TRANSLATIONS } from "./data/translations.js";
import { Product } from "./domain/Product.js";
import { GoogleSheetsRepo } from "./services/storage/GoogleSheetsRepo.js";
import { AuthService } from "./services/AuthService.js";
import { NotificationService } from "./services/NotificationService.js";
import { PdfExportService } from "./services/PdfExportService.js";
import { ToastComponent } from "./ui/shared/ToastComponent.js";
import { HeaderComponent } from "./ui/shared/HeaderComponent.js";
import { CatalogView } from "./ui/customer/CatalogView.js";
import { CartDrawer } from "./ui/customer/CartDrawer.js";
import { AdminLoginModal } from "./ui/admin/AdminLoginModal.js";
import { AdminDashboard } from "./ui/admin/AdminDashboard.js";
import { SettingsModal } from "./ui/admin/SettingsModal.js";

class LimonMedicalApp {
  constructor() {
    this.lang = new URLSearchParams(window.location.search).get("lang") === "en"
      ? "en"
      : (localStorage.getItem(APP_CONFIG.STORAGE_KEYS.LANG) || "ar");

    const rawCatalog = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CATALOG) || "null") || DEFAULT_CATALOG;
    this.catalog = rawCatalog.map(p => new Product(p));
    this.cart = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CART) || "{}");

    // Dependency Injection
    this.orderRepo = new GoogleSheetsRepo();
    this.authService = new AuthService();
    this.notificationService = new NotificationService();
    this.pdfService = new PdfExportService();
    this.toast = new ToastComponent("toast");

    this.header = new HeaderComponent({
      container: document.getElementById("appHeader"),
      onToggleLang: () => this.toggleLanguage(),
      onSwitchCustomer: () => {
        history.replaceState(null, "", window.location.pathname + window.location.search);
        this.route();
      },
      onSecretAdminTrigger: () => {
        window.location.hash = "admin";
      }
    });

    this.cartDrawer = new CartDrawer({
      modalsRoot: document.getElementById("modalsRoot"),
      getCart: () => this.cart,
      onUpdateQty: (id, val, isDelta) => this.updateCartQty(id, val, isDelta),
      onClearCart: () => {
        this.cart = {};
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CART, "{}");
        this.renderCustomer();
      },
      onAddCustomItem: ({ name, brand, qty }) => {
        const id = "custom_" + Date.now();
        this.cart[id] = { id, brand, type: "طلب خاص", name, code: "CUSTOM", qty };
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CART, JSON.stringify(this.cart));
        this.renderCustomer();
      },
      orderRepo: this.orderRepo,
      notificationService: this.notificationService,
      toast: this.toast
    });

    this.catalogView = new CatalogView({
      container: document.getElementById("customerView"),
      getCatalog: () => this.catalog,
      getCart: () => this.cart,
      onUpdateQty: (id, val, isDelta) => this.updateCartQty(id, val, isDelta),
      onOpenCustomModal: () => this.cartDrawer.openCustomItemModal()
    });

    this.settingsModal = new SettingsModal({
      modalsRoot: document.getElementById("modalsRoot"),
      authService: this.authService,
      notificationService: this.notificationService,
      toast: this.toast,
      onSaved: () => this.adminDashboard.syncOrders(true)
    });

    this.adminDashboard = new AdminDashboard({
      container: document.getElementById("adminView"),
      orderRepo: this.orderRepo,
      pdfService: this.pdfService,
      notificationService: this.notificationService,
      settingsModal: this.settingsModal,
      toast: this.toast
    });

    this.adminLogin = new AdminLoginModal({
      container: document.getElementById("adminView"),
      authService: this.authService,
      onSuccess: () => this.adminDashboard.init(),
      onBackToCustomer: () => {
        history.replaceState(null, "", window.location.pathname + window.location.search);
        this.route();
      }
    });
  }

  start() {
    this.applyLanguageDirection();
    this.route();
    window.addEventListener("hashchange", () => this.route());
  }

  applyLanguageDirection() {
    const t = TRANSLATIONS[this.lang];
    document.documentElement.lang = this.lang;
    document.documentElement.dir = t.dir;
  }

  toggleLanguage() {
    this.lang = this.lang === "ar" ? "en" : "ar";
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.LANG, this.lang);
    this.applyLanguageDirection();
    this.route();
  }

  updateCartQty(id, val, isDelta) {
    const cur = this.cart[id] ? this.cart[id].qty : 0;
    const next = Math.max(0, isDelta ? cur + val : val);
    if (next === 0) {
      delete this.cart[id];
    } else {
      const prod = this.catalog.find(p => p.id === id);
      if (prod) this.cart[id] = { ...prod, qty: next };
    }
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CART, JSON.stringify(this.cart));
    this.renderCustomer();
  }

  renderCustomer() {
    this.catalogView.render(this.lang);
    this.cartDrawer.renderFloatingBar(document.getElementById("floatingCartMount"), this.lang);
  }

  route() {
    const isAdmin = window.location.hash === "#admin" ||
      new URLSearchParams(window.location.search).get("portal") === "admin";

    this.header.render({ lang: this.lang, isAdminRoute: isAdmin });

    const custEl = document.getElementById("customerView");
    const adminEl = document.getElementById("adminView");

    if (isAdmin) {
      custEl.classList.add("hidden");
      adminEl.classList.remove("hidden");
      if (this.authService.isAuthenticated()) {
        this.adminDashboard.init();
      } else {
        this.adminLogin.render();
      }
    } else {
      this.adminDashboard.stopPolling();
      adminEl.classList.add("hidden");
      custEl.classList.remove("hidden");
      this.renderCustomer();
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new LimonMedicalApp();
  app.start();
});
