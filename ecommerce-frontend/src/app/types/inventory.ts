export interface InventoryItem {
  productId: number;
  title: string;
  category: string;
  brand: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated?: string;
}

export interface InventorySummary {
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockUnits: number;
}

export interface AdjustStockPayload {
  productId: number;
  quantity: number; // +50 or -5
  action: "Restock" | "Sale" | "Return" | "Damaged" | "Adjustment";
  note: string;
}

export interface InventoryLog {
  id: number;
  productId: number;
  action: string;
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdAt: string;
}
