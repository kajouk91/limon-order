import { APP_CONFIG } from "../../config/appConfig.js";
import { TRANSLATIONS } from "../../data/translations.js";

export class HeaderComponent {
  constructor({ container, onToggleLang, onSwitchCustomer, onSecretAdminTrigger }) {
    this.container = container;
    this.onToggleLang = onToggleLang;
    this.onSwitchCustomer = onSwitchCustomer;
    this.onSecretAdminTrigger = onSecretAdminTrigger;
    this.clicks = 0;
    this.clickTimer = null;
  }

  render({ lang, isAdminRoute }) {
    const t = TRANSLATIONS[lang];
    this.container.innerHTML = `
      <div class="topbar-inner">
        <div class="brand" id="brandTrigger">
          <img src="./assets/images/logo.svg" alt="LIMON KIMYA" class="brand-logo-img" />
          <div class="brand-title">
            <h1>${APP_CONFIG.COMPANY_NAME_AR} | ${APP_CONFIG.COMPANY_NAME_EN}</h1>
            <p>${isAdminRoute ? t.adminSubtitle : t.subtitle}</p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div class="status-pill">
            <span class="dot online"></span>
            <span>${t.readyBadge}</span>
          </div>
          <button class="btn btn-outline btn-sm" id="langSwitchBtn">${t.langToggle}</button>
          ${isAdminRoute ? `<button class="btn btn-accent btn-sm" id="goCustomerBtn">${t.customerPortalBtn}</button>` : ""}
        </div>
      </div>
    `;

    this.container.querySelector("#langSwitchBtn").addEventListener("click", () => this.onToggleLang());
    const custBtn = this.container.querySelector("#goCustomerBtn");
    if (custBtn) custBtn.addEventListener("click", () => this.onSwitchCustomer());

    this.container.querySelector("#brandTrigger").addEventListener("click", () => {
      this.clicks++;
      clearTimeout(this.clickTimer);
      this.clickTimer = setTimeout(() => { this.clicks = 0; }, 700);
      if (this.clicks >= 3) {
        this.clicks = 0;
        this.onSecretAdminTrigger();
      }
    });
  }
}
