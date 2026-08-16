export interface WishlistProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  stock: "in-stock" | "low-stock" | "out-of-stock";
  discount: number;
}
