import { Product, PagedResult, ProductFilterParams } from "@/app/types/product";
import { authenticatedFetch, getAuthToken } from "./authApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

// Helper to safely parse JSON response
async function handleResponse(res: Response) {
  let result: any = null;
  const text = await res.text();
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = null;
    }
  }

  if (!res.ok || (result && !result.success)) {
    throw new Error(result?.message || `Request failed with status ${res.status}`);
  }

  return result ? result.data : null;
}

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

  return await handleResponse(response);
}

// 2. Get Single Product by ID
export async function getProductByIdApi(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
    cache: "no-store",
  });

  return await handleResponse(response);
}

// 3. Get Featured Products
export async function getFeaturedProductsApi(count: number = 8): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/product/featured?count=${count}`, {
      cache: "no-store",
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// 4. Get Categories
export async function getCategoriesApi(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/product/categories`, {
      cache: "no-store",
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
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

  return await handleResponse(response);
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

  return await handleResponse(response);
}

// 7. Delete Product (Admin Only)
export async function deleteProductApi(id: number): Promise<boolean> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/product/${id}`, {
    method: "DELETE",
  });

  await handleResponse(response);
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

  const text = await response.text();
  let resData: any = null;
  if (text) {
    try {
      resData = JSON.parse(text);
    } catch {
      resData = null;
    }
  }

  if (!response.ok || !resData || !resData.success) {
    throw new Error(resData?.message || "Failed to upload image.");
  }
  return resData.imageUrl;
}
