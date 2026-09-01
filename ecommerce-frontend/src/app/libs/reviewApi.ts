import { authenticatedFetch } from "./authApi";
import { API_BASE_URL } from "./apiConfig";

export interface ReviewItem {
    id: number;
    userId: number;
    userName: string;
    productId: number;
    orderId: number;
    rating: number;
    title?: string;
    comment: string;
    imageUrl?: string;
    isVerifiedPurchase: boolean;
    createdAt: string;
}

export interface ProductReviewSummary {
    averageRating: number;
    totalReviews: number;
    starCounts: Record<number, number>;
    reviews: ReviewItem[];
}

async function handleResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let result: any = null;
    if (text) {
        try { result = JSON.parse(text); }
        catch { throw new Error(`Invalid response: ${text.slice(0, 100)}`); }
    }
    if (!res.ok || (result && !result.success)) {
        throw new Error(result?.message || `Request failed with status ${res.status}`);
    }
    return result?.data;
}

// 1. Get reviews for a product (Public)
export async function getProductReviewsApi(productId: number): Promise<ProductReviewSummary> {
    const res = await fetch(`${API_BASE_URL}/api/review/product/${productId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return handleResponse<ProductReviewSummary>(res);
}

// 2. Submit Review with photo (Authenticated, Multipart FormData)
export async function submitReviewApi(formData: FormData): Promise<ReviewItem> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/review`, {
        method: "POST",
        body: formData,
    });
    return handleResponse<ReviewItem>(res);
}

// 3. Get reviews for an order (Authenticated)
export async function getOrderReviewsApi(orderId: number): Promise<ReviewItem[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/review/order/${orderId}`, {
        method: "GET",
    });
    return handleResponse<ReviewItem[]>(res);
}

// 4. Delete review (Authenticated)
export async function deleteReviewApi(reviewId: number): Promise<boolean> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/review/${reviewId}`, {
        method: "DELETE",
    });
    await handleResponse<boolean>(res);
    return true;
}
