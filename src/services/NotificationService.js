import { getRuntimeConfig } from "../config/appConfig.js";

export class NotificationService {
  playNewOrderChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.18, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.36);
      });
    } catch {}
  }

  async requestBrowserPermission() {
    if (!("Notification" in window)) return "unsupported";
    return Notification.requestPermission();
  }

  showDesktopAlert(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }

  async sendTelegramOrderAlert(order) {
    const { tgToken, tgChatId } = getRuntimeConfig();
    if (!tgToken || !tgChatId) return;

    const text =
      `🍋 *طلب جديد — شركة ليمون ميديكال*\n` +
      `🔖 رقم الطلب: *${order.orderId}*\n` +
      `🏥 المخبر: ${order.customerName}\n` +
      `📞 الهاتف: ${order.customerPhone}\n` +
      `📍 المنطقة: ${order.area}\n` +
      `⚡ الأولوية: ${order.priority}\n` +
      `📦 المواد (${order.totalQty} عبوة):\n${order.itemsText}`;

    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tgChatId, text, parse_mode: "Markdown" })
      });
    } catch {}
  }
}
