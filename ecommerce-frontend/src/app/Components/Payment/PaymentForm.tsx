"use client";

import React, { useState } from "react";
import PaymnetMethos from "./PaymnetMethos";
import PaymentDetails from "./PaymentDetails";
import { AddressDto } from "@/app/libs/addressApi";

interface PaymentFormProps {
  form: {
    shippingAddress: string;
    city: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
    paymentMethod: string;
    cardNumber?: string;
    cardHolderName?: string;
    cardExpiry?: string;
    cardCvc?: string;
    walletNumber?: string;
  };
  savedAddresses?: AddressDto[];
  selectedAddressId?: number | "new";
  onSelectSavedAddress?: (addr: AddressDto | "new") => void;
  selectedMethod: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSelectMethod: (method: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placing: boolean;
  finalAmount: number;
  error: string | null;
  onClearError: () => void;
}

export default function PaymentForm({
  form,
  savedAddresses = [],
  selectedAddressId,
  onSelectSavedAddress,
  selectedMethod,
  onInputChange,
  onSelectMethod,
  onSubmit,
  placing,
  finalAmount,
  error,
  onClearError,
}: PaymentFormProps) {
  const [useCustomAddress, setUseCustomAddress] = useState<boolean>(
    savedAddresses.length === 0 || selectedAddressId === "new"
  );

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "28px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        border: "1px solid #f3f4f6",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#1f2937",
            margin: "0 0 6px 0",
          }}
        >
          <i
            className="fas fa-lock"
            style={{ color: "#088178", marginRight: "10px" }}
          ></i>
          Secure Checkout & Payment
        </h2>
        <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
          Please select your delivery address and choose your preferred payment option.
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#b91c1c",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onClearError}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#b91c1c",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* Section 1: Shipping Details */}
        <div style={{ marginBottom: "28px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#374151",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "#088178",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              1
            </span>
            Delivery Address
          </h3>

          {/* Saved Addresses Options */}
          {savedAddresses.length > 0 && (
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>
                Select from Saved Addresses:
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", marginBottom: "12px" }}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id && !useCustomAddress;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setUseCustomAddress(false);
                        onSelectSavedAddress && onSelectSavedAddress(addr);
                      }}
                      style={{
                        border: isSelected ? "2px solid #088178" : "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        backgroundColor: isSelected ? "#f0fdfa" : "#ffffff",
                        cursor: "pointer",
                        transition: "0.2s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: addr.addressType === "Office" ? "#6d28d9" : "#b45309",
                          backgroundColor: addr.addressType === "Office" ? "#ede9fe" : "#fef3c7",
                          padding: "2px 8px",
                          borderRadius: "12px",
                        }}>
                          <i className={addr.addressType === "Office" ? "fas fa-building" : "fas fa-home"} style={{ marginRight: "4px" }}></i>
                          {addr.addressType}
                        </span>

                        {addr.isDefault && (
                          <span style={{ fontSize: "10px", fontWeight: "800", color: "#088178", textTransform: "uppercase" }}>
                            ★ Default
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#1f2937" }}>{addr.fullName}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>{addr.phoneNumber}</div>
                      <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px", lineHeight: "1.3" }}>
                        {addr.streetAddress}, {addr.city}
                      </div>
                    </div>
                  );
                })}

                {/* Option to use custom address */}
                <div
                  onClick={() => {
                    setUseCustomAddress(true);
                    onSelectSavedAddress && onSelectSavedAddress("new");
                  }}
                  style={{
                    border: useCustomAddress ? "2px dashed #088178" : "1px dashed #d1d5db",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    backgroundColor: useCustomAddress ? "#f0fdfa" : "#fafafa",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    minHeight: "90px",
                  }}
                >
                  <i className="fas fa-plus-circle" style={{ color: "#088178", fontSize: "18px", marginBottom: "4px" }}></i>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#088178" }}>
                    + Enter Different Address
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields: Editable if custom address or if user wants to review */}
          {(useCustomAddress || savedAddresses.length === 0) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                backgroundColor: savedAddresses.length > 0 ? "#f9fafb" : "transparent",
                padding: savedAddresses.length > 0 ? "16px" : "0",
                borderRadius: "10px",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#4b5563",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Complete Street Address *
                </label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={form.shippingAddress}
                  onChange={onInputChange}
                  required
                  placeholder="House / Flat #, Street Name, Area / Sector"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#4b5563",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={onInputChange}
                  required
                  placeholder="e.g. Lahore, Karachi, Faisalabad"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#4b5563",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Postal Code (Optional)
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={onInputChange}
                  placeholder="e.g. 54000"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#4b5563",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Phone Number (WhatsApp / Active) *
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={onInputChange}
                  required
                  placeholder="03001234567"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#4b5563",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={onInputChange}
                  required
                  placeholder="e.g. Pakistan"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Payment Method */}
        <div style={{ marginBottom: "16px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#374151",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "#088178",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              2
            </span>
            Payment Selection
          </h3>

          <PaymnetMethos
            selectedMethod={selectedMethod}
            onSelectMethod={onSelectMethod}
          />
        </div>

        {/* Section 3: Dynamic Details based on Method */}
        <PaymentDetails
          selectedMethod={selectedMethod}
          formData={form}
          onInputChange={onInputChange as any}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={placing}
          style={{
            width: "100%",
            backgroundColor: placing ? "#9ca3af" : "#088178",
            color: "#ffffff",
            padding: "16px",
            borderRadius: "10px",
            fontWeight: "800",
            fontSize: "16px",
            border: "none",
            cursor: placing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 4px 14px rgba(8, 129, 120, 0.3)",
            transition: "background-color 0.2s ease, transform 0.1s ease",
          }}
        >
          {placing ? (
            <>
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #ffffff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }}
              ></span>
              <span>Processing Order...</span>
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i>
              <span>Confirm Order — ${finalAmount.toLocaleString()}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
