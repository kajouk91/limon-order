import { APP_CONFIG, getRuntimeConfig } from "../../config/appConfig.js";

export class SettingsModal {
  constructor({ modalsRoot, authService, notificationService, toast, onSaved }) {
    this.modalsRoot = modalsRoot;
    this.authService = authService;
    this.notificationService = notificationService;
    this.toast = toast;
    this.onSaved = onSaved;
  }

  open() {
    const cfg = getRuntimeConfig();
    const keys = APP_CONFIG.STORAGE_KEYS;

    this.modalsRoot.innerHTML = `
      <div class="modal-backdrop open">
        <div class="modal-box" style="max-width:560px;">
          <div class="modal-header">
            <h3>⚙️ إعدادات السحابة والإشعارات وكلمة المرور</h3>
            <button class="close-btn" id="closeSettingsBtn">✕</button>
          </div>

          <div class="form-group">
            <label>رابط Google Apps Script Web App (/exec)</label>
            <input type="url" id="setScriptUrl" class="form-control" style="direction:ltr;" value="${cfg.scriptUrl}" />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label>رقم واتساب الشركة (دولي بدون +)</label>
              <input type="text" id="setWhatsapp" class="form-control" style="direction:ltr;" value="${cfg.whatsapp}" placeholder="905XXXXXXXXX" />
            </div>
            <div class="form-group">
              <label>تغيير رمز دخول الإدارة (PIN)</label>
              <input type="text" id="setAdminPin" class="form-control" value="${cfg.adminPin}" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label>Telegram Bot Token (اختياري)</label>
              <input type="text" id="setTgToken" class="form-control" style="direction:ltr;" value="${cfg.tgToken}" />
            </div>
            <div class="form-group">
              <label>Telegram Chat ID (اختياري)</label>
              <input type="text" id="setTgChat" class="form-control" style="direction:ltr;" value="${cfg.tgChatId}" />
            </div>
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
            <button class="btn btn-primary" style="flex:1;" id="saveSettingsBtn">💾 حفظ الإعدادات</button>
            <button class="btn btn-outline" id="enableNotifBtn">🔔 تفعيل إشعارات المتصفح</button>
          </div>
        </div>
      </div>
    `;

    this.modalsRoot.querySelector("#closeSettingsBtn").addEventListener("click", () => (this.modalsRoot.innerHTML = ""));
    this.modalsRoot.querySelector("#enableNotifBtn").addEventListener("click", async () => {
      const res = await this.notificationService.requestBrowserPermission();
      if (res === "granted") {
        this.notificationService.playNewOrderChime();
        this.toast.show("🔔 تم تفعيل الإشعارات والصوت بنجاح!");
      } else {
        this.toast.show("⚠️ يرجى السماح بالإشعارات من إعدادات المتصفح");
      }
    });

    this.modalsRoot.querySelector("#saveSettingsBtn").addEventListener("click", () => {
      try {
        const newPin = this.modalsRoot.querySelector("#setAdminPin").value;
        this.authService.updatePin(newPin);
        localStorage.setItem(keys.SCRIPT_URL, this.modalsRoot.querySelector("#setScriptUrl").value.trim());
        localStorage.setItem(keys.WHATSAPP, this.modalsRoot.querySelector("#setWhatsapp").value.trim());
        localStorage.setItem(keys.TG_TOKEN, this.modalsRoot.querySelector("#setTgToken").value.trim());
        localStorage.setItem(keys.TG_CHAT, this.modalsRoot.querySelector("#setTgChat").value.trim());
        this.modalsRoot.innerHTML = "";
        this.toast.show("✅ تم حفظ الإعدادات وتحديث رمز المرور");
        if (this.onSaved) this.onSaved();
      } catch {
        this.toast.show("⚠️ رمز المرور يجب أن يكون 4 أرقام على الأقل");
      }
    });
  }
}
