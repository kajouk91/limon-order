import { IOrderRepository } from "./IOrderRepository.js";
import { APP_CONFIG } from "../../config/appConfig.js";
import { Order } from "../../domain/Order.js";

export class LocalStorageRepo extends IOrderRepository {
  constructor() {
    super();
    this.key = APP_CONFIG.STORAGE_KEYS.ORDERS;
  }

  async fetchAllOrders() {
    const raw = JSON.parse(localStorage.getItem(this.key) || "[]");
    return raw.map(o => new Order(o));
  }

  async saveAll(orders) {
    localStorage.setItem(this.key, JSON.stringify(orders));
  }

  async createOrder(order) {
    const list = await this.fetchAllOrders();
    list.unshift(order);
    await this.saveAll(list);
    return { ok: true, order };
  }

  async updateOrderStatus(orderId, newStatus) {
    const list = await this.fetchAllOrders();
    const target = list.find(o => o.orderId === orderId);
    if (target) {
      target.status = newStatus;
      await this.saveAll(list);
    }
    return { ok: true };
  }
}
