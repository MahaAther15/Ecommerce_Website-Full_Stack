"use client";

import { useEffect, useState } from "react";
import { getAnalyticsReportApi, logExpenseApi, AnalyticReport } from "@/app/libs/analyticsApi";

export default function AdminAnalyticsPage() {
    const [range, setRange] = useState("30days");
    const [report, setReport] = useState<AnalyticReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expTitle, setExpTitle] = useState("");
    const [expAmount, setExpAmount] = useState("");
    const [expCat, setExpCat] = useState("Marketing");
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        loadData(range);
    }, [range]);

    const loadData = async (selectedRange: string) => {
        setLoading(true);
        try {
            const data = await getAnalyticsReportApi(selectedRange);
            setReport(data);
        } catch (err: any) {
            showToast(err.message || "Error loading analytics", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await logExpenseApi({ title: expTitle, amount: parseFloat(expAmount), category: expCat });
            showToast("Expense logged successfully!", "success");
            setShowExpenseModal(false);
            setExpTitle("");
            setExpAmount("");
            loadData(range);
        } catch (err: any) {
            showToast(err.message || "Failed to log expense", "error");
        }
    };

    if (loading || !report) {
        return (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "#088178" }} />
                <p style={{ marginTop: "12px", color: "#6b7280" }}>Calculating financial metrics from database sources...</p>
            </div>
        );
    }

    const { financials, sales, returnsAndLoss } = report;

    return (
        <div style={{ padding: "30px", fontFamily: "'Inter', sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
            {/* Floating Toast */}
            {toast && (
                <div style={{ position: "fixed", top: "24px", right: "24px", backgroundColor: toast.type === "success" ? "#088178" : "#dc2626", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", zIndex: 99999, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                    <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`} style={{ marginRight: "8px" }} />
                    {toast.msg}
                </div>
            )}

            {/* Header & Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <div>
                    <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#111827", margin: 0 }}>
                        <i className="fas fa-chart-line" style={{ color: "#088178", marginRight: "12px" }} />
                        Financial Accounting & Analytics
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
                        Auditable profit & loss calculations aggregated directly from live transactions
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                    >
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                    </select>

                    <button
                        onClick={() => setShowExpenseModal(true)}
                        style={{ backgroundColor: "#111827", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <i className="fas fa-receipt" /> Log Expense
                    </button>
                </div>
            </div>

            {/* 1. Primary Financial KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <KpiCard title="Net Revenue" value={`$${financials.netRevenue.toLocaleString()}`} subtitle={`Gross: $${financials.grossRevenue.toLocaleString()}`} icon="fa-wallet" color="#088178" />
                <KpiCard title="COGS / Capital" value={`$${financials.cogs.toLocaleString()}`} subtitle="Cost of sold units" icon="fa-boxes-packing" color="#3b82f6" />
                <KpiCard title="Gross Profit" value={`$${financials.grossProfit.toLocaleString()}`} subtitle={`${financials.grossMarginPercent}% margin`} icon="fa-hand-holding-dollar" color="#10b981" />
                <KpiCard title="Operating Expenses" value={`$${financials.operatingExpense.toLocaleString()}`} subtitle="Ads, shipping & tools" icon="fa-receipt" color="#f59e0b" />
                <KpiCard title="Net Profit" value={`$${financials.netProfit.toLocaleString()}`} subtitle={`${financials.netMarginPercent}% net margin`} icon="fa-sack-dollar" color={financials.netProfit >= 0 ? "#059669" : "#dc2626"} highlight />
            </div>

            {/* 2. Secondary Row: Inventory, Losses, Growth, Orders */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                <KpiCard title="Inventory Asset Value" value={`$${financials.inventoryAssetValue.toLocaleString()}`} subtitle="Warehouse stock capital" icon="fa-warehouse" color="#6366f1" />
                <KpiCard title="Damaged Stock Loss" value={`$${returnsAndLoss.damagedInventoryLoss.toLocaleString()}`} subtitle={`${returnsAndLoss.damagedUnits} damaged units`} icon="fa-triangle-exclamation" color="#ef4444" />
                <KpiCard title="Refunds & Returns" value={`$${returnsAndLoss.totalRefundAmount.toLocaleString()}`} subtitle={`${returnsAndLoss.approvedOrders} approved refunds`} icon="fa-arrow-rotate-left" color="#8b5cf6" />
                <KpiCard title="Revenue Growth" value={`${financials.growthratePercent > 0 ? "+" : ""}${financials.growthratePercent}%`} subtitle="Period over period" icon="fa-arrow-trend-up" color={financials.growthratePercent >= 0 ? "#10b981" : "#ef4444"} />
            </div>

            {/* 3. Detailed P&L Waterfall Card & Category Performance */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", marginBottom: "28px" }}>
                {/* P&L Statement */}
                <div style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "17px", fontWeight: "800", color: "#111827" }}>
                        <i className="fas fa-file-invoice-dollar" style={{ color: "#088178", marginRight: "8px" }} />
                        Income Statement (P&L Waterfall)
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <WaterfallRow label="(+) Gross Sales Revenue" value={`$${financials.grossRevenue.toFixed(2)}`} color="#111827" bold />
                        <WaterfallRow label="(-) Customer Refunds & Returns" value={`-$${returnsAndLoss.totalRefundAmount.toFixed(2)}`} color="#dc2626" />
                        <hr style={{ border: "none", borderTop: "1px dashed #e5e7eb", margin: "4px 0" }} />
                        <WaterfallRow label="(=) Net Revenue" value={`$${financials.netRevenue.toFixed(2)}`} color="#088178" bold />
                        <WaterfallRow label="(-) Cost of Goods Sold (COGS/Capital)" value={`-$${financials.cogs.toFixed(2)}`} color="#4b5563" />
                        <hr style={{ border: "none", borderTop: "1px dashed #e5e7eb", margin: "4px 0" }} />
                        <WaterfallRow label="(=) Gross Profit" value={`$${financials.grossProfit.toFixed(2)}`} color="#059669" bold />
                        <WaterfallRow label="(-) Operating Expenses (Marketing, Courier, SaaS)" value={`-$${financials.operatingExpense.toFixed(2)}`} color="#d97706" />
                        <WaterfallRow label="(-) Damaged / Lost Stock" value={`-$${returnsAndLoss.damagedInventoryLoss.toFixed(2)}`} color="#dc2626" />
                        <div style={{ marginTop: "12px", padding: "14px", backgroundColor: financials.netProfit >= 0 ? "#f0fdf4" : "#fef2f2", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <strong style={{ color: financials.netProfit >= 0 ? "#15803d" : "#b91c1c", fontSize: "16px" }}>Final Net Profit:</strong>
                                <span style={{ display: "block", fontSize: "12px", color: "#6b7280" }}>Net Margin: {financials.netMarginPercent}%</span>
                            </div>
                            <span style={{ fontSize: "20px", fontWeight: "900", color: financials.netProfit >= 0 ? "#15803d" : "#b91c1c" }}>
                                ${financials.netProfit.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Category Profitability Breakdown */}
                <div style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "17px", fontWeight: "800", color: "#111827" }}>
                        <i className="fas fa-layer-group" style={{ color: "#3b82f6", marginRight: "8px" }} />
                        Category Profitability
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {report.categoryBreakdown.map((cat, i) => (
                            <div key={i} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "700" }}>
                                    <span>{cat.categoryName}</span>
                                    <span style={{ color: "#059669" }}>+${cat.profit.toFixed(2)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                                    <span>Revenue: ${cat.revenue.toFixed(2)} ({cat.unitsSold} units)</span>
                                    <span>COGS: ${cat.cost.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expense Logging Modal */}
            {showExpenseModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "16px" }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", maxWidth: "450px", width: "100%", padding: "24px" }}>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>Log Business Expense</h3>
                        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Expense Title *</label>
                                <input type="text" required value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="e.g. Meta Ads, Courier charges" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Amount ($) *</label>
                                <input type="number" step="0.01" required value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="e.g. 150.00" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Category</label>
                                <select value={expCat} onChange={(e) => setExpCat(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                                    <option value="Marketing">Marketing & Ads</option>
                                    <option value="Shipping">Courier & Delivery</option>
                                    <option value="Packaging">Packaging Supplies</option>
                                    <option value="Software">Software & Hosting</option>
                                    <option value="Salaries">Staff Salaries</option>
                                    <option value="Other">Other Expenses</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                                <button type="button" onClick={() => setShowExpenseModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer" }}>Cancel</button>
                                <button type="submit" style={{ padding: "8px 20px", borderRadius: "6px", border: "none", backgroundColor: "#088178", color: "#fff", fontWeight: "700", cursor: "pointer" }}>Save Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function KpiCard({ title, value, subtitle, icon, color, highlight = false }: any) {
    return (
        <div style={{ backgroundColor: highlight ? "#088178" : "#fff", color: highlight ? "#fff" : "#111827", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: highlight ? "rgba(255,255,255,0.85)" : "#6b7280" }}>{title}</span>
                <i className={`fas ${icon}`} style={{ color: highlight ? "#fff" : color, fontSize: "16px" }} />
            </div>
            <div style={{ margin: "10px 0" }}>
                <span style={{ fontSize: "24px", fontWeight: "900" }}>{value}</span>
            </div>
            <span style={{ fontSize: "12px", color: highlight ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>{subtitle}</span>
        </div>
    );
}

function WaterfallRow({ label, value, color, bold = false }: any) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontWeight: bold ? "800" : "500" }}>
            <span style={{ color: "#374151" }}>{label}</span>
            <span style={{ color }}>{value}</span>
        </div>
    );
}
