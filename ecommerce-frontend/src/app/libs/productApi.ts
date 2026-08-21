import { Product, PagedResult, ProductFilterParams } from "@/app/types/product";
import { authenticatedFetch, getAuthToken } from "./authApi";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

// 1. Get All Products with Filters & Pagination
export async function getProductsApi(filter?: ProductFilterParams): Promise<PagedResult<Product>> {
  const params = new URLSearchParams();

  if (filter?.search) params.append("search", filter.search);
  if (filter?.category && filter.category !== "All") params.append("category", filter.category);
  if (filter?.brand && filter.brand !== "All") params.append("brand", filter.brand);
  if (filter?.minPrice) params.append("minPrice", filter.minPrice.toString());
  if (filter?.maxPrice) params.append("maxPrice", filter.maxPrice.toString());
  if (filter?.sortBy) params.append("sortBy", filter.sortBy);
  if (filter?.pageNumber) params.append("pageNumber", filter.pageNumber.toString());
  if (filter?.pageSize) params.append("pageSize", filter.pageSize.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/api/product${queryString}`, {
    cache: "no-store",
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || "Failed to fetch products.");
  }

  return resData.data;
}

// 2. Get Single Product by ID
export async function getProductByIdApi(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
    cache: "no-store",
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || "Product not found.");
  }

  return resData.data;
}

// 3. Get Featured Products
export async function getFeaturedProductsApi(count: number = 8): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/api/product/featured?count=${count}`, {
    cache: "no-store",
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || "Failed to fetch featured products.");
  }

  return resData.data;
}

// 4. Get Categories
export async function getCategoriesApi(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/product/categories`, {
    cache: "no-store",
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || "Failed to fetch categories.");
  }

  return resData.data;
}
// 5. Create Product (Admin Only)
export async function createProductApi(dto: any): Promise<Product> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || "Failed to create product.");
  }
  return resData.data;
}

// 6. Update Product (Admin Only)
export async function updateProductApi(id: number, dto: any): Promise<Product> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/product/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || "Failed to update product.");
  }
  return resData.data;
}

// 7. Delete Product (Admin Only)
export async function deleteProductApi(id: number): Promise<boolean> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/product/${id}`, {
    method: "DELETE",
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || "Failed to delete product.");
  }
  return true;
}

// 8. Upload Product Image to Cloudinary (Admin Only)
export async function uploadProductImageApi(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/product/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || "Failed to upload image.");
  }
  return resData.imageUrl;
}
