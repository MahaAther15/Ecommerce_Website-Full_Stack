"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { fetchOrderById, cancelOrder, clearSelectedOrder } from "@/app/redux/slices/orderSlice";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    Pending:   { label: "Pending",   color: "#d97706", bg: "#fef3c7", icon: "fas fa-clock" },
    Confirmed: { label: "Confirmed", color: "#2563eb", bg: "#dbeafe", icon: "fas fa-check-circle" },
    Shipped:   { label: "Shipped",   color: "#7c3aed", bg: "#ede9fe", icon: "fas fa-shipping-fast" },
    Delivered: { label: "Delivered", color: "#16a34a", bg: "#dcfce7", icon: "fas fa-box-open" },
    Cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2", icon: "fas fa-times-circle" },
};

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { selectedOrder, loading, error } = useAppSelector((state) => state.order);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) { router.push("/login"); return; }
        if (id) dispatch(fetchOrderById(Number(id)));
        return () => { dispatch(clearSelectedOrder()); };
    }, [id, isAuthenticated]);

    const handleCancel = async () => {
        if (!selectedOrder) return;
        if (!confirm("Are you sure you want to cancel this order?")) return;
        await dispatch(cancelOrder(selectedOrder.id));
        dispatch(fetchOrderById(selectedOrder.id));
    };

    const statusCfg = STATUS_CONFIG[selectedOrder?.status ?? ""] ?? {
        label: selectedOrder?.status ?? "",
        color: "#6b7280", bg: "#f3f4f6", icon: "fas fa-circle",
    };

    if (loading) return (
        <div style={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "16px" }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ width: "44px", height: "44px", border: "4px solid #e5e7eb", borderTopColor: "#088178", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#6b7280", fontWeight: "600" }}>Loading order details...</p>
        </div>
    );

    if (error || !selectedOrder) return (
        <div style={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "16px", textAlign: "center" }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: "48px", color: "#fbbf24" }} />
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1f2937" }}>Order Not Found</h2>
            <p style={{ color: "#6b7280" }}>{error || "This order does not exist or you do not have access."}</p>
            <Link href="/orders" style={{ backgroundColor: "#088178", color: "#fff", padding: "10px 22px", borderRadius: "10px", textDecoration: "none", fontWeight: "700" }}>
                Back to My Orders
            </Link>
        </div>
    );

    const order = selectedOrder;
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });

    return (
        <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 24px", fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <Link href="/orders" style={{ color: "#088178", textDecoration: "none", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                        <i className="fas fa-arrow-left" /> Back to Orders
                    </Link>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937", margin: 0 }}>Order #{order.id}</h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: "4px 0 0 0" }}>Placed on {orderDate}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, padding: "8px 18px", borderRadius: "999px", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className={statusCfg.icon} />{statusCfg.label}
                    </span>
                    {order.status === "Pending" && (
                        <button onClick={handleCancel} style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", padding: "8px 18px", borderRadius: "999px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className="fas fa-times" /> Cancel Order
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Timeline */}
            {order.status !== "Cancelled" && (
                <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "20px" }}>Order Progress</h3>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {["Pending", "Confirmed", "Shipped", "Delivered"].map((step, i, arr) => {
                            const statuses = ["Pending", "Confirmed", "Shipped", "Delivered"];
                            const currentIdx = statuses.indexOf(order.status);
                            const stepIdx = statuses.indexOf(step);
                            const isDone = stepIdx <= currentIdx;
                            const cfg = STATUS_CONFIG[step];
                            return (
                                <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                                    {i < arr.length - 1 && (
                                        <div style={{ position: "absolute", top: "20px", left: "50%", width: "100%", height: "3px", backgroundColor: isDone && stepIdx < currentIdx ? "#088178" : "#e5e7eb", zIndex: 0 }} />
                                    )}
                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: isDone ? "#088178" : "#f3f4f6", color: isDone ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", zIndex: 1, position: "relative", boxShadow: isDone ? "0 0 0 4px rgba(8,129,120,0.15)" : "none" }}>
                                        <i className={cfg.icon} />
                                    </div>
                                    <span style={{ fontSize: "11px", fontWeight: "700", color: isDone ? "#088178" : "#9ca3af", marginTop: "8px", textAlign: "center" }}>{step}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
                {/* Left */}
                <div>
                    {/* Order Items */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: "24px" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1f2937", margin: 0 }}>
                                <i className="fas fa-shopping-bag" style={{ color: "#088178", marginRight: "8px" }} />Order Items ({order.orderItems.length})
                            </h3>
                        </div>
                        {order.orderItems.map((item) => (
                            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", borderBottom: "1px solid #f9fafb" }}>
                                <div style={{ width: "64px", height: "64px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#f3f4f6", flexShrink: 0 }}>
                                    {item.productImage
                                        ? <img src={item.productImage} alt={item.productTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fas fa-image" style={{ color: "#d1d5db", fontSize: "24px" }} /></div>
                                    }
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "700", color: "#111827", fontSize: "14px" }}>{item.productTitle}</div>
                                    <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>Rs. {item.unitPrice.toLocaleString()} &times; {item.quantity}</div>
                                </div>
                                <div style={{ fontWeight: "800", color: "#088178", fontSize: "15px" }}>Rs. {item.subTotal.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Shipping Info */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "20px 24px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1f2937", marginBottom: "16px" }}>
                            <i className="fas fa-map-marker-alt" style={{ color: "#088178", marginRight: "8px" }} />Shipping Details
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {[
                                { label: "Address", value: order.shippingAddress },
                                { label: "City", value: order.city },
                                { label: "Postal Code", value: order.postalCode || "N/A" },
                                { label: "Country", value: order.country },
                                { label: "Phone", value: order.phoneNumber },
                                { label: "Payment", value: order.paymentMethod },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "12px 14px" }}>
                                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{label}</div>
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Price Summary */}
                <div>
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "24px", position: "sticky", top: "24px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1f2937", marginBottom: "20px" }}>
                            <i className="fas fa-receipt" style={{ color: "#088178", marginRight: "8px" }} />Price Breakdown
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: "14px" }}>
                                <span>Subtotal</span><span>Rs. {order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: order.shippingFee === 0 ? "#16a34a" : "#6b7280" }}>
                                <span>Shipping</span><span>{order.shippingFee === 0 ? "FREE" : `Rs. ${order.shippingFee}`}</span>
                            </div>
                            {order.discount > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#16a34a" }}>
                                    <span>Discount</span><span>- Rs. {order.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "18px", color: "#088178" }}>
                                <span>Total</span><span>Rs. {order.finalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: "20px", backgroundColor: order.isPaid ? "#f0fdf4" : "#fffbeb", border: `1px solid ${order.isPaid ? "#bbf7d0" : "#fde68a"}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className={`fas ${order.isPaid ? "fa-check-circle" : "fa-clock"}`} style={{ color: order.isPaid ? "#16a34a" : "#d97706" }} />
                            <span style={{ fontSize: "13px", fontWeight: "700", color: order.isPaid ? "#166534" : "#92400e" }}>{order.isPaid ? "Payment Confirmed" : "Payment Pending"}</span>
                        </div>
                        <Link href="/orders" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "16px", backgroundColor: "#f3f4f6", color: "#374151", padding: "12px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", fontSize: "14px" }}>
                            <i className="fas fa-list" /> View All Orders
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
