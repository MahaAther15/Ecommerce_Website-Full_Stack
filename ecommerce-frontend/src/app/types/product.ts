export interface Product {
  id: string;
  brand: string;
  title: string;
  image: string;
  rating: number;
  price: number;
  category?: string;
  description?: string;
}
