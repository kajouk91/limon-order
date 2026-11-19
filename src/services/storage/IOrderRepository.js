/**
 * [Liskov Substitution & Dependency Inversion Interface]
 * أي مصدر تخزين (Google Sheets / Firebase / REST API) يجب أن يلتزم بهذه الدوال
 */
export class IOrderRepository {
  async createOrder(order) {
    throw new Error("Method 'createOrder()' must be implemented.");
  }
  async fetchAllOrders() {
    throw new Error("Method 'fetchAllOrders()' must be implemented.");
  }
  async updateOrderStatus(orderId, newStatus) {
    throw new Error("Method 'updateOrderStatus()' must be implemented.");
  }
}
