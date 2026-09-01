import { authenticatedFetch } from "./authApi";
import { API_BASE_URL } from "./apiConfig";

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
}

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

// 1. Get all categories
export async function getCategoriesApi(): Promise<Category[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/category`, {
            cache: "no-store",
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

// 2. Create Category (Admin Only)
export async function createCategoryApi(dto: { name: string; description?: string }): Promise<Category> {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    return await handleResponse(response);
}

// 3. Update Category (Admin Only)
export async function updateCategoryApi(id: number, dto: { name: string; description?: string }): Promise<Category> {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/category/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    return await handleResponse(response);
}

// 4. Delete Category (Admin Only)
export async function deleteCategoryApi(id: number): Promise<boolean> {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/category/${id}`, {
        method: "DELETE",
    });
    await handleResponse(response);
    return true;
}