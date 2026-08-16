import { Product } from "@/app/types/product";
import productsData from "@/app/data/products.json";

export async function getProducts(): Promise<Product[]> {
  return productsData as Product[];
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.id === id);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.category === category);
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(
    (product) => product.brand.toLowerCase() === brand.toLowerCase()
  );
}
