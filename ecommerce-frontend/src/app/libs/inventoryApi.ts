import { authenticatedFetch } from "./authApi";
import {
    InventoryItem,
    InventorySummary,
    AdjustStockPayload,
    InventoryLog,
} from "../types/inventory";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

// 1. Get Summary Stats
export async function getInventorySummaryApi(): Promise<InventorySummary> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/inventory/summary`, {
        method: "GET",
        cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch summary");
    return data.data;
}

// 2. Get All Inventory with Filter & Search
export async function getInventoryListApi(filter: string = "all", search: string = ""): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (filter && filter !== "all") params.append("filter", filter);
    if (search) params.append("search", search);

    const res = await authenticatedFetch(`${API_BASE_URL}/api/inventory?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch inventory");
    return data.data;
}

// 3. Adjust Stock (+ / -)
export async function adjustStockApi(payload: AdjustStockPayload): Promise<InventoryItem> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/inventory/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to adjust stock");
    return data.data;
}

// 4. Get Audit Trail Logs for a Product
export async function getProductLogsApi(productId: number): Promise<InventoryLog[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/inventory/${productId}/logs`, {
        method: "GET",
        cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch logs");
    return data.data;
}
