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

export interface WishlistResponse {
  id: number;
  userId: number;
  items: WishlistItem[];
  totalItems: number;
}
