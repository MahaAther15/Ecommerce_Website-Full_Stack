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
            <div style={{ padding: "60px", textAlign: "center", backgroundColor: "#fff", borderRadius: "12px" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "#088178", marginBottom: "12px", display: "block" }} />
                <p style={{ margin: 0, color: "#6b7280", fontWeight: "600" }}>Calculating financial metrics from database sources...</p>
            </div>
        );
    }

    const { financials, returnsAndLoss } = report;

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
            {/* Floating Toast */}
            {toast && (
                <div style={{ position: "fixed", top: "24px", right: "24px", backgroundColor: toast.type === "success" ? "#088178" : "#dc2626", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", zIndex: 99999, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                    <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`} style={{ marginRight: "8px" }} />
                    {toast.msg}
                </div>
            )}

            {/* Header & Controls */}
            <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 4px 0" }}>
                        <i className="fas fa-chart-line" style={{ color: "#088178", marginRight: "10px" }} />
                        Financial Accounting & Analytics
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                        Auditable profit & loss calculations aggregated directly from live transactions
                    </p>
                </div>

                <div className="admin-search-wrapper" style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "auto", maxWidth: "400px" }}>
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        style={{ flex: 1, minWidth: "130px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", fontWeight: "600", fontSize: "13px", cursor: "pointer", outline: "none" }}
                    >
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                    </select>

                    <button
                        onClick={() => setShowExpenseModal(true)}
                        className="admin-action-btn"
                        style={{ backgroundColor: "#111827", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                        <i className="fas fa-receipt" /> Log Expense
                    </button>
                </div>
            </div>

            {/* 1. Primary Financial KPIs */}
            <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
                <KpiCard title="Net Revenue" value={`$${financials.netRevenue.toLocaleString()}`} subtitle={`Gross: $${financials.grossRevenue.toLocaleString()}`} icon="fa-wallet" color="#088178" />
                <KpiCard title="COGS / Capital" value={`$${financials.cogs.toLocaleString()}`} subtitle="Cost of sold units" icon="fa-boxes-packing" color="#3b82f6" />
                <KpiCard title="Gross Profit" value={`$${financials.grossProfit.toLocaleString()}`} subtitle={`${financials.grossMarginPercent}% margin`} icon="fa-hand-holding-dollar" color="#10b981" />
                <KpiCard title="Operating Expenses" value={`$${financials.operatingExpense.toLocaleString()}`} subtitle="Ads, shipping & tools" icon="fa-receipt" color="#f59e0b" />
                <KpiCard title="Net Profit" value={`$${financials.netProfit.toLocaleString()}`} subtitle={`${financials.netMarginPercent}% net margin`} icon="fa-sack-dollar" color={financials.netProfit >= 0 ? "#059669" : "#dc2626"} highlight isNetProfit />
            </div>

            {/* 2. Secondary Row: Inventory, Losses, Growth */}
            <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                <KpiCard title="Inventory Asset Value" value={`$${financials.inventoryAssetValue.toLocaleString()}`} subtitle="Warehouse stock capital" icon="fa-warehouse" color="#6366f1" />
                <KpiCard title="Damaged Stock Loss" value={`$${returnsAndLoss.damagedInventoryLoss.toLocaleString()}`} subtitle={`${returnsAndLoss.damagedUnits} damaged units`} icon="fa-triangle-exclamation" color="#ef4444" />
                <KpiCard title="Refunds & Returns" value={`$${returnsAndLoss.totalRefundAmount.toLocaleString()}`} subtitle={`${returnsAndLoss.approvedOrders} approved refunds`} icon="fa-arrow-rotate-left" color="#8b5cf6" />
                <KpiCard title="Revenue Growth" value={`${financials.growthratePercent > 0 ? "+" : ""}${financials.growthratePercent}%`} subtitle="Period over period" icon="fa-arrow-trend-up" color={financials.growthratePercent >= 0 ? "#10b981" : "#ef4444"} />
            </div>

            {/* 3. Detailed P&L Waterfall Card & Category Performance */}
            <div className="admin-analytics-pnl-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", marginBottom: "24px" }}>
                {/* P&L Statement */}
                <div style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                        <i className="fas fa-file-invoice-dollar" style={{ color: "#088178", marginRight: "8px" }} />
                        Income Statement (P&L Waterfall)
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <WaterfallRow label="(+) Gross Sales Revenue" value={`$${financials.grossRevenue.toFixed(2)}`} color="#111827" bold />
                        <WaterfallRow label="(-) Customer Refunds & Returns" value={`-$${returnsAndLoss.totalRefundAmount.toFixed(2)}`} color="#dc2626" />
                        <hr style={{ border: "none", borderTop: "1px dashed #e5e7eb", margin: "2px 0" }} />
                        <WaterfallRow label="(=) Net Revenue" value={`$${financials.netRevenue.toFixed(2)}`} color="#088178" bold />
                        <WaterfallRow label="(-) Cost of Goods Sold (COGS/Capital)" value={`-$${financials.cogs.toFixed(2)}`} color="#4b5563" />
                        <hr style={{ border: "none", borderTop: "1px dashed #e5e7eb", margin: "2px 0" }} />
                        <WaterfallRow label="(=) Gross Profit" value={`$${financials.grossProfit.toFixed(2)}`} color="#059669" bold />
                        <WaterfallRow label="(-) Operating Expenses (Marketing, Courier, SaaS)" value={`-$${financials.operatingExpense.toFixed(2)}`} color="#d97706" />
                        <WaterfallRow label="(-) Damaged / Lost Stock" value={`-$${returnsAndLoss.damagedInventoryLoss.toFixed(2)}`} color="#dc2626" />
                        <div style={{ marginTop: "8px", padding: "12px 14px", backgroundColor: financials.netProfit >= 0 ? "#f0fdf4" : "#fef2f2", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <strong style={{ color: financials.netProfit >= 0 ? "#15803d" : "#b91c1c", fontSize: "15px" }}>Final Net Profit:</strong>
                                <span style={{ display: "block", fontSize: "11px", color: "#6b7280" }}>Net Margin: {financials.netMarginPercent}%</span>
                            </div>
                            <span style={{ fontSize: "18px", fontWeight: "900", color: financials.netProfit >= 0 ? "#15803d" : "#b91c1c" }}>
                                ${financials.netProfit.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Category Profitability Breakdown */}
                <div style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                        <i className="fas fa-layer-group" style={{ color: "#3b82f6", marginRight: "8px" }} />
                        Category Profitability
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {report.categoryBreakdown.length === 0 ? (
                            <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>No sales recorded in this period.</p>
                        ) : (
                            report.categoryBreakdown.map((cat, i) => (
                                <div key={i} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700" }}>
                                        <span>{cat.categoryName}</span>
                                        <span style={{ color: "#059669" }}>+${cat.profit.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                                        <span>Revenue: ${cat.revenue.toFixed(2)} ({cat.unitsSold} units)</span>
                                        <span>COGS: ${cat.cost.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Expense Logging Modal */}
            {showExpenseModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "16px" }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "14px", maxWidth: "460px", width: "100%", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1f2937" }}>Log Business Expense</h3>
                            <button onClick={() => setShowExpenseModal(false)} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#6b7280" }}>
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Expense Title *</label>
                                <input type="text" required value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="e.g. Meta Ads, Courier charges" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Amount ($) *</label>
                                <input type="number" step="0.01" required value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="e.g. 150.00" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Category</label>
                                <select value={expCat} onChange={(e) => setExpCat(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", backgroundColor: "#fff" }}>
                                    <option value="Marketing">Marketing & Ads</option>
                                    <option value="Shipping">Courier & Delivery</option>
                                    <option value="Packaging">Packaging Supplies</option>
                                    <option value="Software">Software & Hosting</option>
                                    <option value="Salaries">Staff Salaries</option>
                                    <option value="Other">Other Expenses</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                                <button type="button" onClick={() => setShowExpenseModal(false)} style={{ flex: 1, padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#374151" }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#088178", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>Save Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function KpiCard({ title, value, subtitle, icon, color, highlight = false, isNetProfit = false }: any) {
    return (
        <div
            className={isNetProfit ? "admin-kpi-highlight" : ""}
            style={{
                backgroundColor: highlight ? "#088178" : "#fff",
                color: highlight ? "#fff" : "#111827",
                borderRadius: "14px",
                padding: "16px 18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "110px"
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: highlight ? "rgba(255,255,255,0.85)" : "#6b7280", textTransform: "uppercase", letterSpacing: "0.3px" }}>{title}</span>
                <i className={`fas ${icon}`} style={{ color: highlight ? "#fff" : color, fontSize: "15px" }} />
            </div>
            <div style={{ margin: "6px 0" }}>
                <span style={{ fontSize: "22px", fontWeight: "900" }}>{value}</span>
            </div>
            <span style={{ fontSize: "11px", color: highlight ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>{subtitle}</span>
        </div>
    );
}

function WaterfallRow({ label, value, color, bold = false }: any) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: bold ? "800" : "500" }}>
            <span style={{ color: "#374151" }}>{label}</span>
            <span style={{ color, fontWeight: bold ? "800" : "600" }}>{value}</span>
        </div>
    );
}
