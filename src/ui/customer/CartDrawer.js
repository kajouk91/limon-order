import { TRANSLATIONS } from "../../data/translations.js";
import { APP_CONFIG, getRuntimeConfig } from "../../config/appConfig.js";
import { Order } from "../../domain/Order.js";

export class CartDrawer {
  constructor({ modalsRoot, getCart, onUpdateQty, onClearCart, onAddCustomItem, orderRepo, notificationService, toast }) {
    this.modalsRoot = modalsRoot;
    this.getCart = getCart;
    this.onUpdateQty = onUpdateQty;
    this.onClearCart = onClearCart;
    this.onAddCustomItem = onAddCustomItem;
    this.orderRepo = orderRepo;
    this.notificationService = notificationService;
    this.toast = toast;
  }

  renderFloatingBar(mountEl, lang) {
    if (!mountEl) return;
    const t = TRANSLATIONS[lang];
    const items = Object.values(this.getCart());
    const totalQty = items.reduce((s, i) => s + i.qty, 0);

    mountEl.innerHTML = `
      <div class="floating-cart">
        <div class="cart-summary-info">
          <div class="cart-count-badge">${totalQty}</div>
          <div>
            <div style="font-weight:800; font-size:0.95rem;">
              ${items.length === 0 ? t.cartEmpty : `${items.length} (${totalQty} pkg)`}
            </div>
            <div style="font-size:0.78rem; color:#cbd5e1;">
              ${items.length === 0 ? t.cartEmptySub : t.cartReadySub}
            </div>
          </div>
        </div>
        <button class="btn btn-accent" id="openCheckoutBtn">${t.reviewCartBtn}</button>
      </div>
    `;

    mountEl.querySelector("#openCheckoutBtn").addEventListener("click", () => {
      if (Object.keys(this.getCart()).length === 0) {
        this.toast.show("⚠️ السلة فارغة / Cart is empty");
        return;
      }
      this.openCheckout(lang);
    });
  }

  openCustomItemModal() {
    this.modalsRoot.innerHTML = `
      <div class="modal-backdrop open" id="customModal">
        <div class="modal-box" style="max-width:460px;">
          <div class="modal-header">
            <h3>➕ طلب مادة غير موجودة بالقائمة</h3>
            <button class="close-btn" id="closeCustomBtn">✕</button>
          </div>
          <div class="form-group">
            <label>اسم المادة / الكود *</label>
            <input type="text" id="cItemName" class="form-control" placeholder="e.g., Elecsys Vitamin B12" />
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label>الجهاز / الشركة</label>
              <input type="text" id="cItemBrand" class="form-control" value="طلب خاص" />
            </div>
            <div class="form-group">
              <label>العدد *</label>
              <input type="number" id="cItemQty" class="form-control" value="1" min="1" />
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%;" id="confirmCustomBtn">إضافة للسلة</button>
        </div>
      </div>
    `;

    this.modalsRoot.querySelector("#closeCustomBtn").addEventListener("click", () => (this.modalsRoot.innerHTML = ""));
    this.modalsRoot.querySelector("#confirmCustomBtn").addEventListener("click", () => {
      const name = this.modalsRoot.querySelector("#cItemName").value.trim();
      const brand = this.modalsRoot.querySelector("#cItemBrand").value.trim() || "طلب خاص";
      const qty = Math.max(1, parseInt(this.modalsRoot.querySelector("#cItemQty").value, 10) || 1);
      if (!name) return this.toast.show("⚠️ يرجى كتابة اسم المادة");
      this.onAddCustomItem({ name, brand, qty });
      this.modalsRoot.innerHTML = "";
      this.toast.show("✅ تمت إضافة المادة إلى السلة");
    });
  }

  openCheckout(lang) {
    const t = TRANSLATIONS[lang];
    const items = Object.values(this.getCart());
    const savedProfile = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CUSTOMER_PROFILE) || "{}");

    this.modalsRoot.innerHTML = `
      <div class="modal-backdrop open" id="checkoutBackdrop">
        <div class="modal-box">
          <div class="modal-header">
            <h3>${t.checkoutTitle}</h3>
            <button class="close-btn" id="closeCheckoutBtn">✕</button>
          </div>
          <div style="max-height:210px; overflow-y:auto; margin-bottom:14px;">
            ${items.map(i => `
              <div class="cart-item-row">
                <div>
                  <div style="font-weight:800; font-size:0.9rem;">[${i.brand}] ${i.name}</div>
                  <div style="font-size:0.76rem; color:var(--muted);">REF: ${i.code}</div>
                </div>
                <div style="font-weight:900;">× ${i.qty}</div>
              </div>
            `).join("")}
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label>${t.custNameLabel}</label>
              <input type="text" id="custName" class="form-control" value="${savedProfile.name || ""}" />
            </div>
            <div class="form-group">
              <label>${t.custPhoneLabel}</label>
              <input type="tel" id="custPhone" class="form-control" value="${savedProfile.phone || ""}" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label>${t.custAreaLabel}</label>
              <input type="text" id="custArea" class="form-control" value="${savedProfile.area || ""}" />
            </div>
            <div class="form-group">
              <label>${t.priorityLabel}</label>
              <select id="custPriority" class="form-control">
                <option value="اعتيادي">${t.priorityNormal}</option>
                <option value="مستعجل 🔴">${t.priorityUrgent}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>${t.notesLabel}</label>
            <input type="text" id="custNotes" class="form-control" />
          </div>

          <button class="btn btn-primary" style="width:100%; padding:13px;" id="submitOrderBtn">
            ${t.confirmOrderBtn}
          </button>
        </div>
      </div>
    `;

    this.modalsRoot.querySelector("#closeCheckoutBtn").addEventListener("click", () => (this.modalsRoot.innerHTML = ""));
    this.modalsRoot.querySelector("#submitOrderBtn").addEventListener("click", async () => {
      const btn = this.modalsRoot.querySelector("#submitOrderBtn");
      try {
        const customerName = this.modalsRoot.querySelector("#custName").value.trim();
        const customerPhone = this.modalsRoot.querySelector("#custPhone").value.trim();
        const area = this.modalsRoot.querySelector("#custArea").value.trim();
        const priority = this.modalsRoot.querySelector("#custPriority").value;
        const notes = this.modalsRoot.querySelector("#custNotes").value.trim();

        const order = Order.fromCart({
          items: Object.values(this.getCart()),
          customerName,
          customerPhone,
          area,
          priority,
          notes
        });

        localStorage.setItem(
          APP_CONFIG.STORAGE_KEYS.CUSTOMER_PROFILE,
          JSON.stringify({ name: customerName, phone: customerPhone, area })
        );

        btn.disabled = true;
        btn.textContent = t.sendingBtn;

        await this.orderRepo.createOrder(order);
        await this.notificationService.sendTelegramOrderAlert(order);
        this.onClearCart();
        this.showSuccessModal(order, lang);
      } catch (err) {
        this.toast.show("⚠️ يرجى تعبئة جميع الحقول المطلوبة");
      }
    });
  }

  showSuccessModal(order, lang) {
    const t = TRANSLATIONS[lang];
    const waNum = getRuntimeConfig().whatsapp.replace(/\D/g, "");
    const waText = encodeURIComponent(
      `مرحباً شركة ليمون ميديكال 🍋\nطلب جديد رقم: *${order.orderId}*\nالمخبر: ${order.customerName}\nالمواد:\n${order.itemsText}`
    );

    this.modalsRoot.innerHTML = `
      <div class="modal-backdrop open">
        <div class="modal-box" style="text-align:center;">
          <div style="font-size:3rem; margin-bottom:8px;">🎉</div>
          <h3 style="color:var(--success); margin-bottom:6px;">${t.orderSuccessTitle}</h3>
          <p style="color:var(--muted); font-size:0.9rem; margin-bottom:14px;">${t.orderSuccessDesc}</p>
          <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:12px; padding:12px; margin-bottom:14px;">
            <div style="font-size:0.8rem; color:#166534;">${t.refCodeLabel}</div>
            <div style="font-size:1.5rem; font-weight:900; color:#15803d;">${order.orderId}</div>
          </div>
          ${waNum ? `<a href="https://wa.me/${waNum}?text=${waText}" target="_blank" class="btn btn-success" style="width:100%; margin-bottom:10px;">📲 إرسال نسخة لواتساب الشركة</a>` : ""}
          <button class="btn btn-outline" style="width:100%;" id="closeSuccessBtn">${t.closeBtn}</button>
        </div>
      </div>
    `;
    this.modalsRoot.querySelector("#closeSuccessBtn").addEventListener("click", () => (this.modalsRoot.innerHTML = ""));
  }
}
