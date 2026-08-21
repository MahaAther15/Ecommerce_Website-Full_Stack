"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { placeOrder, clearOrderError } from "@/app/redux/slices/orderSlice";
import { clearCart } from "@/app/redux/slices/cartslice";

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { items, totalAmount } = useAppSelector((state) => state.cart);
    const { placing, error, successMessage, selectedOrder } = useAppSelector((state) => state.order);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const shippingFee = totalAmount >= 2000 ? 0 : 150;
    const finalAmount = totalAmount + shippingFee;

    const [form, setForm] = useState({
        shippingAddress: "",
        city: "",
        postalCode: "",
        country: "Pakistan",
        phoneNumber: "",
        paymentMethod: "Cash On Delivery",
    });

    useEffect(() => {
        if (!isAuthenticated) router.push("/login");
        if (items.length === 0 && !successMessage) router.push("/cart");
    }, [isAuthenticated, items]);

    // Redirect to order confirmation after success
    useEffect(() => {
        if (successMessage && selectedOrder) {
            dispatch(clearCart());
            setTimeout(() => {
                router.push(`/orders/${selectedOrder.id}`);
            }, 500);
        }
    }, [successMessage, selectedOrder]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.shippingAddress || !form.city || !form.phoneNumber) return;
        dispatch(placeOrder(form));
    };

    return (
        <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 24px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
            {/* Left: Shipping Form */}
            <div style={{ flex: "1 1 500px" }}>
                <h1 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "24px", color: "#1f2937" }}>
                    <i className="fas fa-shipping-fast" style={{ color: "#088178", marginRight: "10px" }}></i>
                    Shipping Details
                </h1>

                {error && (
                    <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", color: "#dc2626", fontWeight: "600" }}>
                        <i className="fas fa-exclamation-circle" style={{ marginRight: "8px" }}></i>
                        {error}
                        <button onClick={() => dispatch(clearOrderError())} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>✕</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                        { label: "Full Address", name: "shippingAddress", placeholder: "Street, House No, Area..." },
                        { label: "City", name: "city", placeholder: "e.g. Karachi" },
                        { label: "Postal Code", name: "postalCode", placeholder: "e.g. 75300" },
                        { label: "Phone Number", name: "phoneNumber", placeholder: "e.g. 03001234567" },
                    ].map(({ label, name, placeholder }) => (
                        <div key={name}>
                            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>{label}</label>
                            <input
                                type="text"
                                name={name}
                                value={(form as any)[name]}
                                onChange={handleChange}
                                placeholder={placeholder}
                                required={name !== "postalCode"}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "14px",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                    ))}

                    <div>
                        <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={form.paymentMethod}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none" }}
                        >
                            <option>Cash On Delivery</option>
                            <option>Bank Transfer</option>
                            <option>JazzCash</option>
                            <option>EasyPaisa</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={placing}
                        style={{
                            backgroundColor: placing ? "#6b7280" : "#088178",
                            color: "#fff",
                            padding: "14px",
                            borderRadius: "10px",
                            fontWeight: "700",
                            fontSize: "16px",
                            border: "none",
                            cursor: placing ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            transition: "0.2s",
                        }}
                    >
                        {placing ? (
                            <><span style={{ width: "18px", height: "18px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }}></span> Placing Order...</>
                        ) : (
                            <><i className="fas fa-check-circle"></i> Place Order — Rs. {finalAmount.toLocaleString()}</>
                        )}
                    </button>
                </form>
            </div>

            {/* Right: Order Summary */}
            <div style={{ flex: "0 0 340px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px", color: "#1f2937" }}>Order Summary</h2>
                <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                    {items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px" }}>
                            <div>
                                <div style={{ fontWeight: "600", color: "#1f2937" }}>{item.name}</div>
                                <div style={{ color: "#6b7280", fontSize: "12px" }}>Qty: {item.quantity}</div>
                            </div>
                            <div style={{ fontWeight: "700" }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                    ))}

                    <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                            <span>Subtotal</span>
                            <span>Rs. {totalAmount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: shippingFee === 0 ? "#16a34a" : "#6b7280" }}>
                            <span>Shipping</span>
                            <span>{shippingFee === 0 ? "FREE 🎉" : `Rs. ${shippingFee}`}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "16px", color: "#088178", borderTop: "2px solid #e5e7eb", paddingTop: "12px", marginTop: "4px" }}>
                            <span>Total</span>
                            <span>Rs. {finalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "16px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#166534" }}>
                    <i className="fas fa-shield-alt" style={{ marginRight: "8px" }}></i>
                    Orders above Rs. 2,000 get <strong>FREE shipping!</strong>
                </div>
            </div>
        </div>
    );
}
