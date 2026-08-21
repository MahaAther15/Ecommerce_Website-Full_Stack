import { authenticatedFetch } from "./authApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

// ─── Types ────────────────────────────────────────────────────────

export interface OrderItemDto {
    id: number;
    productId: number;
    productTitle: string;
    productImage?: string;
    unitPrice: number;
    quantity: number;
    subTotal: number;
}

export interface OrderDto {
    id: number;
    userId: number;
    orderItems: OrderItemDto[];
    totalAmount: number;
    shippingFee: number;
    discount: number;
    finalAmount: number;
    status: string; // "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled"
    shippingAddress?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phoneNumber?: string;
    paymentMethod: string;
    isPaid: boolean;
    createdAt: string;
}

export interface PlaceOrderDto {
    shippingAddress: string;
    city: string;
    postalCode?: string;
    country: string;
    phoneNumber: string;
    paymentMethod: string;
}

// ─── Helper ───────────────────────────────────────────────────────

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

// ─── API Functions ────────────────────────────────────────────────

// 1. Place Order (Cart → Order)
export async function placeOrderApi(dto: PlaceOrderDto): Promise<OrderDto> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    return handleResponse<OrderDto>(res);
}

// 2. Get My Orders (Order History)
export async function getMyOrdersApi(): Promise<OrderDto[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/order/my`, {
        method: "GET",
    });
    return handleResponse<OrderDto[]>(res);
}

// 3. Get Order by ID
export async function getOrderByIdApi(orderId: number): Promise<OrderDto> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/order/${orderId}`, {
        method: "GET",
    });
    return handleResponse<OrderDto>(res);
}

// 4. Cancel Order
export async function cancelOrderApi(orderId: number): Promise<boolean> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/order/${orderId}/cancel`, {
        method: "POST",
    });
    await handleResponse<boolean>(res);
    return true;
}

// ─── ADMIN APIs ───────────────────────────────────────────────────

// 5. Admin: Get All Orders
export async function getAllOrdersAdminApi(): Promise<OrderDto[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/order/admin/all`, {
        method: "GET",
    });
    return handleResponse<OrderDto[]>(res);
}

// 6. Admin: Update Order Status
export async function updateOrderStatusAdminApi(
    orderId: number,
    status: string
): Promise<OrderDto> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/order/admin/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    return handleResponse<OrderDto>(res);
}
