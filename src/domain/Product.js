export class Product {
  constructor({ id, brand, type, name, code }) {
    this.id = id || `prod_${Date.now()}`;
    this.brand = String(brand || "General").trim();
    this.type = String(type || "كيتات فحص").trim();
    this.name = String(name || "").trim();
    this.code = String(code || "N/A").trim();
  }

  matchesFilter({ brand, type, query }) {
    const matchBrand = !brand || brand === "ALL" || this.brand === brand;
    const matchType = !type || type === "ALL" || this.type === type;
    if (!query) return matchBrand && matchType;
    const q = query.toLowerCase();
    const matchText =
      this.name.toLowerCase().includes(q) ||
      this.code.toLowerCase().includes(q) ||
      this.brand.toLowerCase().includes(q);
    return matchBrand && matchType && matchText;
  }
}
