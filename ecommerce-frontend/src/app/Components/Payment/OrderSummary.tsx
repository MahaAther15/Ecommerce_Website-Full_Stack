"use client";

import React from "react";
import Image from "next/image";

interface OrderSummaryProps {
  items: Array<{
    id: number | string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
}

export default function OrderSummary({
  items,
  totalAmount,
  shippingFee,
  finalAmount,
}: OrderSummaryProps) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        border: "1px solid #f3f4f6",
      }}
    >
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "800",
          color: "#1f2937",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Order Summary</span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#6b7280",
            backgroundColor: "#f3f4f6",
            padding: "3px 10px",
            borderRadius: "20px",
          }}
        >
          {items.reduce((acc, it) => acc + it.quantity, 0)} Items
        </span>
      </h3>

      {/* Item List */}
      <div
        style={{
          maxHeight: "260px",
          overflowY: "auto",
          paddingRight: "6px",
          marginBottom: "20px",
        }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #f3f4f6",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                  border: "1px solid #e5e7eb",
                }}
              >
                <img
                  src={item.image || "/img/products/f1.jpg"}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/img/products/f1.jpg";
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1f2937",
                    maxWidth: "160px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.name}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#1f2937",
              }}
            >
              Rs. {(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Calculations */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          fontSize: "14px",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
          <span>Subtotal</span>
          <span>Rs. {totalAmount.toLocaleString()}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: shippingFee === 0 ? "#16a34a" : "#6b7280",
          }}
        >
          <span>Shipping Fee</span>
          <span>{shippingFee === 0 ? "FREE 🎉" : `Rs. ${shippingFee}`}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "18px",
            fontWeight: "800",
            color: "#088178",
            borderTop: "2px solid #f3f4f6",
            paddingTop: "12px",
            marginTop: "4px",
          }}
        >
          <span>Total Amount</span>
          <span>Rs. {finalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Free Shipping Highlight */}
      <div
        style={{
          marginTop: "18px",
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "12px",
          color: "#166534",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <i className="fas fa-truck-loading" style={{ color: "#16a34a" }}></i>
        <span>
          Orders above <strong>Rs. 2,000</strong> qualify for <strong>FREE Delivery</strong> across Pakistan!
        </span>
      </div>

      {/* Trust Badges */}
      <div
        style={{
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid #f3f4f6",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          fontSize: "11px",
          color: "#6b7280",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="fas fa-shield-alt" style={{ color: "#088178" }}></i>
          <span>100% Secure Checkout</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="fas fa-undo" style={{ color: "#088178" }}></i>
          <span>7-Day Return Policy</span>
        </div>
      </div>
    </div>
  );
}
