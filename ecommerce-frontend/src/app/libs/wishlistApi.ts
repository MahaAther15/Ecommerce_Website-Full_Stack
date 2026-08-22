import { authenticatedFetch } from "./authApi";
import { WishlistResponse } from "../types/wishlist";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

// 1. Fetch current logged-in user wishlist
export async function getWishlistApi(): Promise<WishlistResponse> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/wishlist`, {
        method: "GET",
        cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch wishlist");
    return data.data;
}

// 2. Toggle item in wishlist (Add/Remove)
export async function toggleWishlistApi(productId: number): Promise<WishlistResponse> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to toggle wishlist");
    return data.data;
}

// 3. Remove single item
export async function removeFromWishlistApi(productId: number): Promise<WishlistResponse> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/wishlist/items/${productId}`, {
        method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to remove item");
    return data.data;
}

// 4. Clear all wishlist
export async function clearWishlistApi(): Promise<boolean> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/wishlist/clear`, {
        method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to clear wishlist");
    return data.data;
}
