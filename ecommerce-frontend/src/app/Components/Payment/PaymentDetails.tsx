"use client";

import React from "react";

interface PaymentDetailsProps {
  selectedMethod: string;
  formData: {
    cardNumber?: string;
    cardHolderName?: string;
    cardExpiry?: string;
    cardCvc?: string;
    walletNumber?: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PaymentDetails({
  selectedMethod,
  formData,
  onInputChange,
}: PaymentDetailsProps) {
  if (selectedMethod === "Cash On Delivery") {
    return (
      <div
        style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            backgroundColor: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#16a34a",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          <i className="fas fa-truck"></i>
        </div>
        <div>
          <h4
            style={{
              margin: "0 0 4px 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "#166534",
            }}
          >
            Cash on Delivery Selected
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#15803d",
              lineHeight: "1.4",
            }}
          >
            You can pay the full amount in cash directly to the courier agent upon receiving your package.
          </p>
        </div>
      </div>
    );
  }

  if (selectedMethod === "Credit/Debit Card") {
    return (
      <div
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#374151" }}>
            Card Payment Information
          </span>
          <div style={{ display: "flex", gap: "8px", color: "#6b7280", fontSize: "18px" }}>
            <i className="fab fa-cc-visa" style={{ color: "#1a1f71" }}></i>
            <i className="fab fa-cc-mastercard" style={{ color: "#eb001b" }}></i>
            <i className="fas fa-lock" style={{ color: "#10b981", fontSize: "14px" }}></i>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#4b5563",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Cardholder Full Name *
            </label>
            <input
              type="text"
              name="cardHolderName"
              value={formData.cardHolderName || ""}
              onChange={onInputChange}
              placeholder="e.g. Muhammad Ali"
              required={selectedMethod === "Credit/Debit Card"}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#4b5563",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Card Number *
            </label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber || ""}
              onChange={onInputChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required={selectedMethod === "Credit/Debit Card"}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                letterSpacing: "1px",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#4b5563",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Expiry Date (MM/YY) *
              </label>
              <input
                type="text"
                name="cardExpiry"
                value={formData.cardExpiry || ""}
                onChange={onInputChange}
                placeholder="12/28"
                maxLength={5}
                required={selectedMethod === "Credit/Debit Card"}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#4b5563",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Security Code (CVV/CVC) *
              </label>
              <input
                type="password"
                name="cardCvc"
                value={formData.cardCvc || ""}
                onChange={onInputChange}
                placeholder="123"
                maxLength={4}
                required={selectedMethod === "Credit/Debit Card"}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedMethod === "JazzCash" || selectedMethod === "EasyPaisa") {
    const isJazzCash = selectedMethod === "JazzCash";
    const brandColor = isJazzCash ? "#dc2626" : "#16a34a";

    return (
      <div
        style={{
          backgroundColor: "#f9fafb",
          border: `1px solid ${brandColor}40`,
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937" }}>
            {selectedMethod} Mobile Account
          </span>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#4b5563",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Registered {selectedMethod} Mobile Number *
          </label>
          <input
            type="text"
            name="walletNumber"
            value={formData.walletNumber || ""}
            onChange={onInputChange}
            placeholder="03001234567"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px dashed #d1d5db",
            fontSize: "12px",
            color: "#6b7280",
            lineHeight: "1.5",
          }}
        >
          <i className="fas fa-info-circle" style={{ color: brandColor, marginRight: "6px" }}></i>
          After placing the order, you will receive an MPIN prompt on your {selectedMethod} registered mobile phone to authorize the transaction.
        </div>
      </div>
    );
  }

  return null;
}
