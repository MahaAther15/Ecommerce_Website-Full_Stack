"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { fetchMyOrders } from "@/app/redux/slices/orderSlice";
import "./orders.css";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
    Pending:   { color: "#d97706", bg: "#fef3c7", icon: "fas fa-clock" },
    Confirmed: { color: "#2563eb", bg: "#dbeafe", icon: "fas fa-check-circle" },
    Shipped:   { color: "#7c3aed", bg: "#ede9fe", icon: "fas fa-shipping-fast" },
    Delivered: { color: "#16a34a", bg: "#dcfce7", icon: "fas fa-box-open" },
    Cancelled: { color: "#dc2626", bg: "#fee2e2", icon: "fas fa-times-circle" },
};

export default function MyOrdersPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { myOrders, loading, error } = useAppSelector((state) => state.order);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) { router.push("/login"); return; }
        dispatch(fetchMyOrders());
    }, [isAuthenticated]);

    return (
        <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 24px 60px 24px", fontFamily: "'Inter', system-ui, sans-serif" }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#1f2937", margin: "0 0 6px 0" }}>
                    <i className="fas fa-box" style={{ color: "#088178", marginRight: "10px" }} />My Orders
                </h1>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Track and manage all your purchases</p>
            </div>

            {loading && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "16px", padding: "80px 0" }}>
                    <div style={{ width: "44px", height: "44px", border: "4px solid #e5e7eb", borderTopColor: "#088178", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <p style={{ color: "#6b7280", fontWeight: "600" }}>Loading your orders...</p>
                </div>
            )}

            {error && !loading && (
                <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "16px 20px", color: "#dc2626", fontWeight: "600", marginBottom: "24px" }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: "8px" }} />{error}
                </div>
            )}

            {!loading && !error && myOrders.length === 0 && (
                <div style={{ backgroundColor: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "60px 40px", textAlign: "center" }}>
                    <i className="fas fa-box-open" style={{ fontSize: "56px", color: "#e5e7eb", marginBottom: "16px", display: "block" }} />
                    <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1f2937", marginBottom: "8px" }}>No Orders Yet</h2>
                    <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>You have not placed any orders. Start shopping!</p>
                    <Link href="/shop" style={{ backgroundColor: "#088178", color: "#fff", padding: "12px 28px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", fontSize: "15px" }}>
                        <i className="fas fa-shopping-bag" style={{ marginRight: "8px" }} />Browse Products
                    </Link>
                </div>
            )}

            {!loading && myOrders.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {myOrders.map((order, idx) => {
                        const cfg = STATUS_CONFIG[order.status] ?? { color: "#6b7280", bg: "#f3f4f6", icon: "fas fa-circle" };
                        const date = new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
                        return (
                            <div key={order.id} style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", animation: `fadeUp 0.3s ease ${idx * 50}ms both` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap", gap: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "10px 12px" }}>
                                            <i className="fas fa-receipt" style={{ color: "#088178", fontSize: "18px" }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: "800", color: "#111827", fontSize: "15px" }}>Order #{order.orderNumber || `ORD-${10000 + order.id}`}</div>
                                            <div style={{ color: "#9ca3af", fontSize: "12px", marginTop: "2px" }}>{date} &middot; {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span style={{ backgroundColor: cfg.bg, color: cfg.color, padding: "5px 14px", borderRadius: "999px", fontWeight: "700", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <i className={cfg.icon} />{order.status}
                                        </span>
                                        <span style={{ fontWeight: "800", color: "#088178", fontSize: "15px" }}>${order.finalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div style={{ padding: "14px 24px", display: "flex", gap: "10px", flexWrap: "wrap", borderBottom: "1px solid #f3f4f6" }}>
                                    {order.orderItems.slice(0, 3).map((item) => (
                                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f9fafb", borderRadius: "8px", padding: "6px 12px" }}>
                                            {item.productImage && (
                                                <img src={item.productImage} alt={item.productTitle} style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover" }} />
                                            )}
                                            <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{item.productTitle}</span>
                                            <span style={{ fontSize: "11px", color: "#9ca3af" }}>&times;{item.quantity}</span>
                                        </div>
                                    ))}
                                    {order.orderItems.length > 3 && (
                                        <div style={{ display: "flex", alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "6px 12px" }}>
                                            <span style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>+{order.orderItems.length - 3} more</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px" }}>
                                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                                        <i className={`fas ${order.isPaid ? "fa-check-circle" : "fa-clock"}`} style={{ marginRight: "4px", color: order.isPaid ? "#16a34a" : "#d97706" }} />
                                        {order.isPaid ? "Paid" : "Payment Pending"} &middot; {order.paymentMethod}
                                    </div>
                                    <Link href={`/orders/${order.id}`} style={{ backgroundColor: "#088178", color: "#fff", padding: "8px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                                        View Details <i className="fas fa-arrow-right" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
