import { IOrderRepository } from "./IOrderRepository.js";
import { LocalStorageRepo } from "./LocalStorageRepo.js";
import { getRuntimeConfig } from "../../config/appConfig.js";
import { Order } from "../../domain/Order.js";

export class GoogleSheetsRepo extends IOrderRepository {
  constructor() {
    super();
    this.localCache = new LocalStorageRepo();
  }

  getEndpoint() {
    return getRuntimeConfig().scriptUrl;
  }

  async createOrder(order) {
    await this.localCache.createOrder(order);
    const url = this.getEndpoint();
    if (!url) return { ok: true, offline: true };

    const payload = { action: "create", ...order };
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      return { ok: true };
    } catch {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
      });
      return { ok: true, opaque: true };
    }
  }

  async fetchAllOrders() {
    const url = this.getEndpoint();
    if (!url) return this.localCache.fetchAllOrders();

    const sep = url.includes("?") ? "&" : "?";
    const res = await fetch(`${url}${sep}t=${Date.now()}`);
    const json = await res.json();
    if (json && json.ok && Array.isArray(json.orders)) {
      const mapped = json.orders.map(o => new Order(o));
      await this.localCache.saveAll(mapped);
      return mapped;
    }
    return this.localCache.fetchAllOrders();
  }

  async updateOrderStatus(orderId, newStatus) {
    await this.localCache.updateOrderStatus(orderId, newStatus);
    const url = this.getEndpoint();
    if (!url) return { ok: true };

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "updateStatus", orderId, status: newStatus })
    });
    return { ok: true };
  }
}
