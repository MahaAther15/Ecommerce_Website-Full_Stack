"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from "@/app/redux/slices/orderSlice";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
    Pending:   { color: "#d97706", bg: "#fef3c7", icon: "fas fa-clock" },
    Confirmed: { color: "#2563eb", bg: "#dbeafe", icon: "fas fa-check-circle" },
    Shipped:   { color: "#7c3aed", bg: "#ede9fe", icon: "fas fa-shipping-fast" },
    Delivered: { color: "#16a34a", bg: "#dcfce7", icon: "fas fa-box-open" },
    Cancelled: { color: "#dc2626", bg: "#fee2e2", icon: "fas fa-times-circle" },
};

const ALL_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
    const dispatch = useAppDispatch();
    const { allOrders, loading, error } = useAppSelector((state) => state.order);

    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(fetchAllOrdersAdmin());
    }, []);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            await dispatch(updateOrderStatusAdmin({ orderId, status: newStatus })).unwrap();
            const order = allOrders.find((o) => o.id === orderId);
            const orderCode = order?.orderNumber || `ORD-${10000 + orderId}`;
            showToast(`Order ${orderCode} updated to ${newStatus}.`);
        } catch (err: any) {
            showToast(err || "Failed to update order status.", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = allOrders.filter((o) => {
        const orderCode = o.orderNumber || `ORD-${10000 + o.id}`;
        const matchStatus = filterStatus === "All" || o.status === filterStatus;
        const matchSearch =
            searchTerm === "" ||
            orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(o.id).includes(searchTerm) ||
            String(o.userId).includes(searchTerm);
        return matchStatus && matchSearch;
    });

    const stats = {
        total: allOrders.length,
        pending: allOrders.filter((o) => o.status === "Pending").length,
        shipped: allOrders.filter((o) => o.status === "Shipped").length,
        delivered: allOrders.filter((o) => o.status === "Delivered").length,
        revenue: allOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.finalAmount, 0),
    };

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", top: "24px", right: "24px", backgroundColor: toast.type === "success" ? "#088178" : "#dc2626", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 99999, display: "flex", alignItems: "center", gap: "10px" }}>
                    <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`} />{toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937", margin: "0 0 4px 0" }}>Orders Management</h1>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>View all customer orders and update their status.</p>
            </div>

            {/* Stats Row */}
            <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                {[
                    { label: "Total Orders", value: stats.total, icon: "fas fa-list", color: "#088178", bg: "#e6f7f5" },
                    { label: "Pending", value: stats.pending, icon: "fas fa-clock", color: "#d97706", bg: "#fef3c7" },
                    { label: "Shipped", value: stats.shipped, icon: "fas fa-shipping-fast", color: "#7c3aed", bg: "#ede9fe" },
                    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: "fas fa-dollar-sign", color: "#16a34a", bg: "#dcfce7" },
                ].map((card) => (
                    <div key={card.label} style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: card.bg, color: card.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                            <i className={card.icon} />
                        </div>
                        <div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.label}</div>
                            <div style={{ fontSize: "20px", fontWeight: "800", color: "#1f2937" }}>{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="admin-filters-bar" style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: "1 1 300px" }}>
                    <i className="fas fa-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "14px" }} />
                    <input
                        type="text"
                        placeholder="Search by Order Code (e.g. ORD-10001) or Customer ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 38px 10px 38px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            outline: "none",
                            fontSize: "13px",
                            backgroundColor: "#fff"
                        }}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            title="Clear search"
                            style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "#9ca3af",
                                cursor: "pointer",
                                fontSize: "14px",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["All", ...ALL_STATUSES].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "13px",
                                backgroundColor: filterStatus === s ? "#088178" : "#f3f4f6",
                                color: filterStatus === s ? "#fff" : "#374151",
                                transition: "0.15s",
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-card" style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowX: "auto" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", fontWeight: "600" }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", marginBottom: "12px", display: "block" }} />Loading orders...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
                        <i className="fas fa-inbox" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }} />No orders found.
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "750px" }}>
                        <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            <tr>
                                {["Order Code", "Customer ID", "Items", "Total", "Payment", "Status", "Date", "Update Status"].map((h) => (
                                    <th key={h} style={{ padding: "13px 16px", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => {
                                const cfg = STATUS_CONFIG[order.status] ?? { color: "#6b7280", bg: "#f3f4f6", icon: "fas fa-circle" };
                                const date = new Date(order.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" });
                                const orderCode = order.orderNumber || `ORD-${10000 + order.id}`;
                                return (
                                    <tr key={order.id} style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.15s" }}>
                                        <td style={{ padding: "14px 16px", fontWeight: "800", color: "#088178", letterSpacing: "0.5px" }}>{orderCode}</td>
                                        <td style={{ padding: "14px 16px", color: "#374151", fontWeight: "600" }}>User #{order.userId}</td>
                                        <td style={{ padding: "14px 16px", color: "#374151" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                {order.orderItems.slice(0, 2).map((item) => (
                                                    <span key={item.id} style={{ fontSize: "12px", color: "#6b7280" }}>{item.productTitle} x{item.quantity}</span>
                                                ))}
                                                {order.orderItems.length > 2 && <span style={{ fontSize: "11px", color: "#9ca3af" }}>+{order.orderItems.length - 2} more</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontWeight: "800", color: "#1f2937" }}>${order.finalAmount.toLocaleString()}</td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ fontSize: "12px", color: "#374151" }}>{order.paymentMethod}</div>
                                            <div style={{ fontSize: "11px", color: order.isPaid ? "#16a34a" : "#d97706", fontWeight: "700" }}>
                                                {order.isPaid ? "Paid" : "Unpaid"}
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{ backgroundColor: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: "999px", fontWeight: "700", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                <i className={cfg.icon} />{order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6b7280" }}>{date}</td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <select
                                                value={order.status}
                                                disabled={updatingId === order.id || order.status === "Cancelled" || order.status === "Delivered"}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                style={{
                                                    padding: "6px 10px",
                                                    borderRadius: "8px",
                                                    border: "1px solid #d1d5db",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                    cursor: updatingId === order.id || order.status === "Cancelled" || order.status === "Delivered" ? "not-allowed" : "pointer",
                                                    backgroundColor: updatingId === order.id ? "#f9fafb" : "#fff",
                                                    outline: "none",
                                                    minWidth: "130px",
                                                }}
                                            >
                                                {ALL_STATUSES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            {updatingId === order.id && (
                                                <span style={{ marginLeft: "8px", fontSize: "12px", color: "#6b7280" }}>
                                                    <i className="fas fa-spinner fa-spin" />
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {error && (
                <div style={{ marginTop: "16px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontWeight: "600" }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: "8px" }} />{error}
                </div>
            )}
        </div>
    );
}
