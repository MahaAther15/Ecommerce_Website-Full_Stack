import { authenticatedFetch } from "./authApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

export interface BackendCartItem {
    id: number;
    productId: number;
    title: string;
    brand: string;
    price: number;
    imageUrl: string;
    quantity: number;
    stockQuantity: number;
    subTotal: number;
}

export interface BackendCart {
    id: number;
    userId: number;
    items: BackendCartItem[];
    totalQuantity: number;
    totalAmount: number;
}

async function parseJsonResponse(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

// 1. Get Current User Cart (Logged-in User)
export async function getCartApi(): Promise<BackendCart> {
    try {
        const res = await authenticatedFetch(`${API_BASE_URL}/api/cart`, {
            method: "GET",
            cache: "no-store",
        });

        const result = await parseJsonResponse(res);
        if (!res.ok || !result || !result.success) {
            return { id: 0, userId: 0, items: [], totalQuantity: 0, totalAmount: 0 };
        }
        return result.data;
    } catch {
        return { id: 0, userId: 0, items: [], totalQuantity: 0, totalAmount: 0 };
    }
}

// 2. Add Item to Cart
export async function addToCartApi(productId: number, quantity: number = 1): Promise<BackendCart> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
    });

    const result = await parseJsonResponse(res);
    if (!res.ok || !result || !result.success) {
        throw new Error(result?.message || "Failed to add item to cart.");
    }
    return result.data;
}

// 3. Update Cart Item Quantity
export async function updateCartQuantityApi(productId: number, quantity: number): Promise<BackendCart> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
    });

    const result = await parseJsonResponse(res);
    if (!res.ok || !result || !result.success) {
        throw new Error(result?.message || "Failed to update item quantity.");
    }
    return result.data;
}

// 4. Remove Item from Cart
export async function removeFromCartApi(productId: number): Promise<BackendCart> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
        method: "DELETE",
    });

    const result = await parseJsonResponse(res);
    if (!res.ok || !result || !result.success) {
        throw new Error(result?.message || "Failed to remove item from cart.");
    }
    return result.data;
}

// 5. Clear Entire Cart
export async function clearCartApi(): Promise<boolean> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/cart/clear`, {
        method: "DELETE",
    });

    const result = await parseJsonResponse(res);
    if (!res.ok || !result || !result.success) {
        throw new Error(result?.message || "Failed to clear cart.");
    }
    return true;
}
