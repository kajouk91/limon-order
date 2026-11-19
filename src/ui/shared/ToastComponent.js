export class ToastComponent {
  constructor(elementId = "toast") {
    this.el = document.getElementById(elementId);
    this.timer = null;
  }

  show(message, durationMs = 3500) {
    if (!this.el) return;
    this.el.textContent = message;
    this.el.classList.add("show");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.el.classList.remove("show"), durationMs);
  }
}
