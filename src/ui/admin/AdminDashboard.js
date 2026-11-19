import { APP_CONFIG } from "../../config/appConfig.js";

export class AdminDashboard {
  constructor({ container, orderRepo, pdfService, notificationService, settingsModal, toast }) {
    this.container = container;
    this.orderRepo = orderRepo;
    this.pdfService = pdfService;
    this.notificationService = notificationService;
    this.settingsModal = settingsModal;
    this.toast = toast;
    this.orders = [];
    this.knownIds = new Set();
    this.statusFilter = "ALL";
    this.searchQuery = "";
    this.pollTimer = null;
  }

  async init() {
    await this.syncOrders(false);
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => this.syncOrders(false), APP_CONFIG.POLL_INTERVAL_MS);
  }

  stopPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  async syncOrders(manual = false) {
    try {
      const fresh = await this.orderRepo.fetchAllOrders();
      let hasNew = false;
      fresh.forEach(o => {
        if (!this.knownIds.has(o.orderId)) {
          this.knownIds.add(o.orderId);
          if (this.orders.length > 0) hasNew = true;
        }
      });
      this.orders = fresh;
      this.render();

      if (hasNew) {
        this.notificationService.playNewOrderChime();
        this.notificationService.showDesktopAlert("طلب جديد — LIMON KIMYA", "تم استلام طلب مواد مخبرية جديد.");
        this.toast.show("🔔 وصل طلب جديد من أحد الزبائن!");
      } else if (manual) {
        this.toast.show("✅ تم تحديث الطلبات من السحابة");
      }
    } catch {
      if (manual) this.toast.show("⚠️ تعذر الاتصال بالسحابة حالياً");
    }
  }

  render() {
    const total = this.orders.length;
    const countNew = this.orders.filter(o => o.status === "طلب جديد").length;
    const countPrep = this.orders.filter(o => o.status === "قيد التجهيز").length;
    const countDone = this.orders.filter(o => o.status.includes("تمت")).length;
    const countUrgent = this.orders.filter(o => o.isUrgent()).length;

    const filtered = this.orders.filter(o => {
      const matchStatus =
        this.statusFilter === "ALL" ||
        (this.statusFilter === "URGENT" && o.isUrgent()) ||
        o.status === this.statusFilter;
      const q = this.searchQuery.toLowerCase();
      const matchQ = !q ||
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.area.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });

    this.container.innerHTML = `
      <div class="admin-banner">
        <div>
          <h2 style="font-size:1.2rem; font-weight:900;">📊 غرفة متابعة طلبات الزبائن والمخابر</h2>
          <p style="font-size:0.82rem; color:#cbd5e1;">مزامنة حية مع Google Sheets كل 15 ثانية</p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-accent btn-sm" id="openSettingsBtn">⚙️ الإعدادات وكلمة المرور</button>
          <button class="btn btn-outline btn-sm" id="copyLinkBtn">📋 نسخ رابط الزبائن</button>
          <button class="btn btn-success btn-sm" id="manualSyncBtn">🔄 تحديث الآن</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div>إجمالي الطلبات</div><div class="stat-val">${total}</div></div>
        <div class="stat-card"><div style="color:#1d4ed8;">طلبات جديدة</div><div class="stat-val" style="color:#1d4ed8;">${countNew}</div></div>
        <div class="stat-card"><div style="color:var(--warning);">قيد التجهيز</div><div class="stat-val" style="color:var(--warning);">${countPrep}</div></div>
        <div class="stat-card"><div style="color:var(--success);">تمت المهمة ✅</div><div class="stat-val" style="color:var(--success);">${countDone}</div></div>
        <div class="stat-card"><div style="color:var(--danger);">مستعجل 🔴</div><div class="stat-val" style="color:var(--danger);">${countUrgent}</div></div>
      </div>

      <div class="filter-card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; gap:7px; flex-wrap:wrap;">
          ${["ALL", "طلب جديد", "قيد التجهيز", "تمت المهمة ✅", "URGENT"].map(st => `
            <button class="chip ${this.statusFilter === st ? "active" : ""}" data-st="${st}">
              ${st === "ALL" ? "الكل" : st === "URGENT" ? "🔴 مستعجل" : st}
            </button>
          `).join("")}
        </div>
        <input type="text" id="adminSearchInput" class="form-control" style="width:240px;"
          placeholder="بحث برقم الطلب أو المخبر..." value="${this.searchQuery}" />
      </div>

      <div>
        ${filtered.length === 0 ? `<div class="stat-card" style="text-align:center; color:var(--muted);">لا توجد طلبات مطابقة</div>` : ""}
        ${filtered.map(o => `
          <div class="order-card ${o.isUrgent() ? "urgent" : ""}">
            <div class="order-header">
              <div>
                <span style="font-weight:900; font-size:1.05rem; color:var(--primary);">${o.orderId}</span>
                <span class="pill ${o.status.includes("تمت") ? "pill-done" : o.status === "قيد التجهيز" ? "pill-prep" : "pill-new"}">${o.status}</span>
                ${o.isUrgent() ? `<span class="pill pill-urgent">🔴 مستعجل</span>` : ""}
                <div style="font-weight:800; margin-top:4px;">🏥 ${o.customerName} — 📍 ${o.area}</div>
                <div style="font-size:0.84rem; color:var(--muted);">📞 ${o.customerPhone} | 🕒 ${o.createdAt} | 📦 ${o.totalQty} عبوة</div>
              </div>
            </div>
            <div class="order-items-box">
              ${o.itemsText.split("|").map(item => `<div>• ${item.trim()}</div>`).join("")}
            </div>
            ${o.notes && o.notes !== "-" ? `<div style="font-size:0.84rem; color:#854d0e; margin-bottom:8px;">📝 ${o.notes}</div>` : ""}
            <div class="order-actions">
              <button class="btn btn-warning btn-sm" data-prep="${o.orderId}">⏳ قيد التجهيز</button>
              <button class="btn btn-success btn-sm" data-done="${o.orderId}">✅ تمت المهمة</button>
              <button class="btn btn-outline btn-sm" data-pdf="${o.orderId}">🖨️ إيصال تسليم</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelector("#openSettingsBtn").addEventListener("click", () => this.settingsModal.open());
    this.container.querySelector("#manualSyncBtn").addEventListener("click", () => this.syncOrders(true));
    this.container.querySelector("#copyLinkBtn").addEventListener("click", () => {
      const link = window.location.href.split("#")[0].split("?")[0];
      navigator.clipboard.writeText(link);
      this.toast.show("✅ تم نسخ رابط الزبائن: " + link);
    });

    this.container.querySelectorAll("[data-st]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.statusFilter = btn.dataset.st;
        this.render();
      });
    });

    const searchEl = this.container.querySelector("#adminSearchInput");
    searchEl.addEventListener("input", e => {
      this.searchQuery = e.target.value;
      this.render();
    });

    this.container.querySelectorAll("[data-prep]").forEach(btn => {
      btn.addEventListener("click", async () => {
        await this.orderRepo.updateOrderStatus(btn.dataset.prep, "قيد التجهيز");
        await this.syncOrders(false);
        this.toast.show("✅ تم التحديث إلى قيد التجهيز");
      });
    });

    this.container.querySelectorAll("[data-done]").forEach(btn => {
      btn.addEventListener("click", async () => {
        await this.orderRepo.updateOrderStatus(btn.dataset.done, "تمت المهمة ✅");
        await this.syncOrders(false);
        this.toast.show("✅ تمت المهمة بنجاح");
      });
    });

    this.container.querySelectorAll("[data-pdf]").forEach(btn => {
      btn.addEventListener("click", () => {
        const ord = this.orders.find(x => x.orderId === btn.dataset.pdf);
        if (ord) this.pdfService.printDeliveryReceipt(ord);
      });
    });
  }
}
