"use client";

import React from "react";

interface PaymentMethodsProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

const paymentOptions = [
  {
    id: "Cash On Delivery",
    name: "Cash On Delivery",
    desc: "Pay in cash when your order is delivered",
    icon: "fa-money-bill-wave",
    badge: "Most Popular",
  },
  {
    id: "Credit/Debit Card",
    name: "Credit / Debit Card",
    desc: "Pay securely with Visa, MasterCard, or UnionPay",
    icon: "fa-credit-card",
    badge: "Instant",
  },
  {
    id: "JazzCash",
    name: "JazzCash",
    desc: "Direct payment through JazzCash Mobile Account",
    icon: "fa-mobile-alt",
    badge: "Instant",
  },
  {
    id: "EasyPaisa",
    name: "EasyPaisa",
    desc: "Direct payment through EasyPaisa Mobile Account",
    icon: "fa-wallet",
    badge: "Instant",
  },
];

export default function PaymnetMethos({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodsProps) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <label
        style={{
          display: "block",
          fontSize: "14px",
          fontWeight: "700",
          color: "#374151",
          marginBottom: "12px",
        }}
      >
        Select Payment Method *
      </label>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "12px",
        }}
      >
        {paymentOptions.map((opt) => {
          const isSelected = selectedMethod === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onSelectMethod(opt.id)}
              style={{
                border: isSelected ? "2px solid #088178" : "1.5px solid #e5e7eb",
                backgroundColor: isSelected ? "#f0fdfa" : "#ffffff",
                borderRadius: "10px",
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                boxShadow: isSelected
                  ? "0 4px 12px rgba(8, 129, 120, 0.12)"
                  : "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <input
                type="radio"
                name="paymentMethodRadio"
                checked={isSelected}
                onChange={() => onSelectMethod(opt.id)}
                style={{
                  marginTop: "3px",
                  accentColor: "#088178",
                  cursor: "pointer",
                  width: "16px",
                  height: "16px",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: isSelected ? "#088178" : "#1f2937",
                    }}
                  >
                    <i
                      className={`fas ${opt.icon}`}
                      style={{
                        marginRight: "8px",
                        color: isSelected ? "#088178" : "#6b7280",
                      }}
                    ></i>
                    {opt.name}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: 0,
                    lineHeight: "1.4",
                  }}
                >
                  {opt.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
