import { authenticatedFetch } from "./authApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

export interface ReturnRequestDto {
    id: number;
    orderId: number;
    orderNumber: string;
    userId: number;
    userFullName: string;
    userEmail: string;
    reason: string;
    comments?: string;
    refundAmount: number;
    status: "Pending" | "UnderReview" | "Approved" | "Refunded" | "Rejected";
    adminNotes?: string;
    refundAccountDetails?: string;
    createdAt: string;
    processedAt?: string;
}

export interface CreateReturnRequestDto {
    orderId: number;
    reason: number; // 0: DefectiveOrDamaged, 1: WrongItemReceived, etc.
    comments?: string;
    refundAccountDetails?: string;
}

export interface UpdateReturnStatusDto {
    status: number; // 0: Pending, 1: UnderReview, 2: Approved, 3: Refunded, 4: Rejected
    adminNotes?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let result: any = null;
    if (text) {
        try { result = JSON.parse(text); }
        catch { throw new Error(`Invalid response format`); }
    }
    if (!res.ok || (result && !result.success)) {
        throw new Error(result?.message || `Request failed with status ${res.status}`);
    }
    return result?.data;
}

// 1. Submit Return Request (Customer)
export async function createReturnRequestApi(dto: CreateReturnRequestDto): Promise<ReturnRequestDto> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/ReturnRefund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    return handleResponse<ReturnRequestDto>(res);
}

// 2. Get Return Request for Order
export async function getReturnRequestByOrderIdApi(orderId: number): Promise<ReturnRequestDto | null> {
    try {
        const res = await authenticatedFetch(`${API_BASE_URL}/api/ReturnRefund/order/${orderId}`, {
            method: "GET",
        });
        return await handleResponse<ReturnRequestDto>(res);
    } catch {
        return null;
    }
}

// 3. Admin: Get All Returns
export async function getAllReturnRequestsAdminApi(): Promise<ReturnRequestDto[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/ReturnRefund/admin/all`, {
        method: "GET",
    });
    return handleResponse<ReturnRequestDto[]>(res);
}

// 4. Admin: Update Return Status & Process Refund
export async function updateReturnStatusAdminApi(
    returnRequestId: number,
    dto: UpdateReturnStatusDto
): Promise<ReturnRequestDto> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/ReturnRefund/admin/${returnRequestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    return handleResponse<ReturnRequestDto>(res);
}
