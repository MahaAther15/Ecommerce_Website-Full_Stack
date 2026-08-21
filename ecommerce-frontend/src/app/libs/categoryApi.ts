import { authenticatedFetch } from "./authApi";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";
export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
}

// get all categories
export async function getCategoriesApi(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/category`, {
        cache: "no-store",
    });
    const resData = await response.json();
    if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Failed to fetch categories.");
    }
    return resData.data;
}

// 2. Create Category (Admin Only)
export async function createCategoryApi(dto: { name: string; description?: string }): Promise<Category> {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    const resData = await response.json();
    if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Failed to create category.");
    }
    return resData.data;
}
// 3. Update Category (Admin Only)
export async function updateCategoryApi(id: number, dto: { name: string; description?: string }): Promise<Category> {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/category/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    const resData = await response.json();
    if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Failed to update category.");
    }
    return resData.data;
}

// 4. Delete Category (Admin Only)
export async function deleteCategoryApi(id: number): Promise<boolean> {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/category/${id}`, {
        method: "DELETE",
    });
    const resData = await response.json();
    if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Failed to delete category.");
    }
    return true;
}