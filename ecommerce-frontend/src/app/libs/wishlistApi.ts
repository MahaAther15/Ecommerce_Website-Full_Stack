import { authenticatedFetch } from "./authApi";
import { WishlistResponse } from "../types/wishlist";
import { API_BASE_URL } from "./apiConfig";

async function parseJsonResponse(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

// 1. Fetch current logged-in user wishlist
export async function getWishlistApi(): Promise<WishlistResponse> {
    try {
        const res = await authenticatedFetch(`${API_BASE_URL}/api/wishlist`, {
            method: "GET",
            cache: "no-store",
        });
        const data = await parseJsonResponse(res);
        if (!res.ok || !data || !data.success) {
            return { items: [], totalCount: 0 };
        }
        return data.data;
    } catch {
        return { items: [], totalCount: 0 };
    }
}

// 2. Toggle item in wishlist (Add/Remove)
export async function toggleWishlistApi(productId: number): Promise<WishlistResponse> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok || !data || !data.success) {
        throw new Error(data?.message || "Failed to toggle wishlist");
    }
    return data.data || { items: [], totalCount: 0 };
}

// 3. Remove single item
export async function removeFromWishlistApi(productId: number): Promise<WishlistResponse> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/wishlist/items/${productId}`, {
        method: "DELETE",
    });
    const data = await parseJsonResponse(res);
    if (!res.ok || !data || !data.success) {
        throw new Error(data?.message || "Failed to remove item");
    }
    return data.data || { items: [], totalCount: 0 };
}

// 4. Clear all wishlist
export async function clearWishlistApi(): Promise<boolean> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/wishlist/clear`, {
        method: "DELETE",
    });
    const data = await parseJsonResponse(res);
    if (!res.ok || !data || !data.success) {
        throw new Error(data?.message || "Failed to clear wishlist");
    }
    return true;
}
