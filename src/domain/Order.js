export class Order {
  constructor(raw) {
    this.orderId = raw.orderId || "LM-" + Math.floor(1000 + Math.random() * 9000);
    this.createdAt = raw.createdAt || new Date().toLocaleString("en-GB");
    this.customerName = String(raw.customerName || "").trim();
    this.customerPhone = String(raw.customerPhone || "").trim();
    this.area = String(raw.area || "").trim();
    this.priority = raw.priority || "اعتيادي";
    this.status = raw.status || "طلب جديد";
    this.totalQty = Number(raw.totalQty) || 0;
    this.itemsText = String(raw.itemsText || "").trim();
    this.notes = String(raw.notes || "-").trim();
  }

  static fromCart({ items, customerName, customerPhone, area, priority, notes }) {
    if (!customerName || !customerPhone || !area) {
      throw new Error("MISSING_REQUIRED_FIELDS");
    }
    if (!items || items.length === 0) {
      throw new Error("EMPTY_CART");
    }
    const totalQty = items.reduce((sum, i) => sum + Number(i.qty || 0), 0);
    const itemsText = items
      .map(i => `[${i.brand}] ${i.name} (${i.code}) × ${i.qty}`)
      .join(" | ");

    return new Order({
      customerName,
      customerPhone,
      area,
      priority,
      status: "طلب جديد",
      totalQty,
      itemsText,
      notes: notes || "-"
    });
  }

  isUrgent() {
    return this.priority.includes("مستعجل") || this.priority.toLowerCase().includes("urgent");
  }
}
