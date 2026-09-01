import { authenticatedFetch } from "./authApi";
import { API_BASE_URL } from "./apiConfig";

export interface AnalyticReport {
    financials: {
        grossRevenue: number;
        netRevenue: number;
        cogs: number;
        grossProfit: number;
        grossMarginPercent: number;
        operatingExpense: number;
        totalLoss: number;
        netProfit: number;
        netMarginPercent: number;
        inventoryAssetValue: number;
        growthratePercent: number;
    };
    sales: {
        totalOrders: number;
        completeOrders: number;
        pendingOrders: number;
        cancelledOrders: number;
        averageOrderValue: number;
        totalUnitsSold: number;
    };
    returnsAndLoss: {
        totalReturnRequest: number;
        approvedOrders: number;
        damagedUnits: number;
        totalRefundAmount: number;
        damagedInventoryLoss: number;
    };
    timeline: {
        label: string;
        revenue: number;
        profit: number;
        expense: number;
        ordersCount: number;
    }[];
    categoryBreakdown: {
        categoryName: string;
        revenue: number;
        cost: number;
        profit: number;
        unitsSold: number;
    }[];

}
export async function getAnalyticsReportApi(range = "30days"): Promise<AnalyticReport> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Analytics/report?range=${range}`);
    const data = await res.json();
    if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch analytics");
    }
    return data.data;
}
export async function logExpenseApi(expense: { title: string; amount: number; category: string; description?: string }) {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Analytics/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
    });
    return res.json();
}
