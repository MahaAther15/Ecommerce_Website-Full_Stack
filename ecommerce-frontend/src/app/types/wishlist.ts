export interface WishlistItem {
  id: number;
  productId: number;
  title: string;
  name?: string; // UI compatibility
  brand?: string;
  price: number;
  imageUrl: string;
  image?: string; // UI compatibility
  stockQuantity?: number;
  addedAt?: string;
}

export interface WishlistProduct {
  id: number;
  name: string;
  category?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  stock?: "in-stock" | "out-of-stock" | "low-stock";
  rating?: number;
}

export interface WishlistResponse {
  id: number;
  userId: number;
  items: WishlistItem[];
  totalItems: number;
}
