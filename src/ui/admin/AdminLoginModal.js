export class AdminLoginModal {
  constructor({ container, authService, onSuccess, onBackToCustomer }) {
    this.container = container;
    this.authService = authService;
    this.onSuccess = onSuccess;
    this.onBackToCustomer = onBackToCustomer;
  }

  render() {
    this.container.innerHTML = `
      <div style="max-width:420px; margin:40px auto; background:#fff; padding:26px; border-radius:18px; box-shadow:var(--shadow); border:1px solid var(--border); text-align:center;">
        <div style="font-size:2.4rem; margin-bottom:8px;">🛡️</div>
        <h2 style="font-weight:900; margin-bottom:6px;">لوحة إدارة شركة ليمون ميديكال</h2>
        <p style="color:var(--muted); font-size:0.88rem; margin-bottom:16px;">أدخل رمز المرور الخاص بالإدارة</p>
        <input type="password" id="pinInput" class="form-control" placeholder="••••"
          style="text-align:center; font-size:1.2rem; letter-spacing:4px; margin-bottom:12px;" />
        <button class="btn btn-primary" style="width:100%;" id="unlockBtn">دخول لوحة الإدارة</button>
        <div style="margin-top:12px;">
          <button class="btn btn-outline btn-sm" id="backCustBtn">العودة لواجهة الزبائن</button>
        </div>
      </div>
    `;

    const tryLogin = () => {
      const val = this.container.querySelector("#pinInput").value;
      if (this.authService.verifyPin(val)) {
        this.onSuccess();
      } else {
        alert("رمز المرور غير صحيح!");
      }
    };

    this.container.querySelector("#unlockBtn").addEventListener("click", tryLogin);
    this.container.querySelector("#pinInput").addEventListener("keydown", e => {
      if (e.key === "Enter") tryLogin();
    });
    this.container.querySelector("#backCustBtn").addEventListener("click", () => this.onBackToCustomer());
  }
}
