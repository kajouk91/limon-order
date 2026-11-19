import { TRANSLATIONS } from "../../data/translations.js";

export class CatalogView {
  constructor({ container, getCatalog, getCart, onUpdateQty, onOpenCustomModal }) {
    this.container = container;
    this.getCatalog = getCatalog;
    this.getCart = getCart;
    this.onUpdateQty = onUpdateQty;
    this.onOpenCustomModal = onOpenCustomModal;
    this.selectedBrand = "ALL";
    this.selectedType = "ALL";
    this.searchQuery = "";
  }

  render(lang) {
    const t = TRANSLATIONS[lang];
    const catalog = this.getCatalog();
    const brands = ["ALL", ...new Set(catalog.map(p => p.brand))];
    const types = ["ALL", "كيتات فحص", "معايرات CalSet", "كونترول Control", "محاليل ومستهلكات"];

    const filtered = catalog.filter(p =>
      p.matchesFilter({
        brand: this.selectedBrand,
        type: this.selectedType,
        query: this.searchQuery
      })
    );
    const cart = this.getCart();

    this.container.innerHTML = `
      <div class="filter-card">
        <div class="search-row">
          <div class="search-input-wrap">
            <input type="text" id="catalogSearchInput" class="search-input"
              placeholder="${t.searchPlaceholder}" value="${this.searchQuery}" />
          </div>
          <button class="btn btn-outline" id="openCustomItemBtn">${t.customItemBtn}</button>
        </div>

        <span class="chips-label">${t.filterBrand}</span>
        <div class="chips-scroll" id="brandChipsWrap">
          ${brands.map(b => `
            <button class="chip ${this.selectedBrand === b ? "active" : ""}" data-brand="${b}">
              ${b === "ALL" ? t.all : b}
            </button>
          `).join("")}
        </div>

        <span class="chips-label">${t.filterType}</span>
        <div class="chips-scroll" id="typeChipsWrap">
          ${types.map(tp => `
            <button class="chip type-chip ${this.selectedType === tp ? "active" : ""}" data-type="${tp}">
              ${tp === "ALL" ? t.all : tp}
            </button>
          `).join("")}
        </div>
      </div>

      <div class="catalog-meta">
        <span>(${filtered.length} / ${catalog.length})</span>
        <button class="btn btn-outline btn-sm" id="resetFiltersBtn">${t.resetFilters}</button>
      </div>

      <div class="products-grid">
        ${filtered.map(item => {
          const qty = cart[item.id] ? cart[item.id].qty : 0;
          return `
            <div class="product-card ${qty > 0 ? "in-cart" : ""}">
              <div>
                <div class="badges-row">
                  <span class="badge-brand">${item.brand}</span>
                  <span class="badge-type">${item.type}</span>
                </div>
                <div class="product-name">${item.name}</div>
                <div class="product-code">REF: ${item.code}</div>
              </div>
              <div class="qty-controls">
                <span style="font-size:0.8rem; font-weight:700; color:${qty > 0 ? "var(--primary)" : "var(--muted)"};">
                  ${qty > 0 ? "✓" : "Qty:"}
                </span>
                <div class="stepper">
                  <button class="step-btn" data-dec="${item.id}">−</button>
                  <input type="number" min="0" class="qty-input" data-inp="${item.id}" value="${qty}" />
                  <button class="step-btn" data-inc="${item.id}">+</button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div id="floatingCartMount"></div>
    `;

    this.bindEvents(lang);
  }

  bindEvents(lang) {
    const searchEl = this.container.querySelector("#catalogSearchInput");
    searchEl.addEventListener("input", e => {
      this.searchQuery = e.target.value;
      this.render(lang);
      const nextInput = this.container.querySelector("#catalogSearchInput");
      nextInput.focus();
      nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
    });

    this.container.querySelector("#openCustomItemBtn").addEventListener("click", () => this.onOpenCustomModal());
    this.container.querySelector("#resetFiltersBtn").addEventListener("click", () => {
      this.selectedBrand = "ALL";
      this.selectedType = "ALL";
      this.searchQuery = "";
      this.render(lang);
    });

    this.container.querySelectorAll("[data-brand]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectedBrand = btn.dataset.brand;
        this.render(lang);
      });
    });

    this.container.querySelectorAll("[data-type]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectedType = btn.dataset.type;
        this.render(lang);
      });
    });

    this.container.querySelectorAll("[data-inc]").forEach(btn => {
      btn.addEventListener("click", () => this.onUpdateQty(btn.dataset.inc, 1, true));
    });
    this.container.querySelectorAll("[data-dec]").forEach(btn => {
      btn.addEventListener("click", () => this.onUpdateQty(btn.dataset.dec, -1, true));
    });
    this.container.querySelectorAll("[data-inp]").forEach(inp => {
      inp.addEventListener("change", e => this.onUpdateQty(inp.dataset.inp, parseInt(e.target.value, 10) || 0, false));
    });
  }
}
