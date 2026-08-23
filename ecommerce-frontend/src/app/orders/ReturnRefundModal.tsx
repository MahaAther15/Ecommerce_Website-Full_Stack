"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { submitReturnRequest } from "@/app/redux/slices/returnRefundSlice";

interface Props {
    orderId: number;
    orderNumber: string;
    finalAmount: number;
    onClose: () => void;
    onSuccess: () => void;
}

const REASONS = [
    { value: 0, label: "Defective or Damaged Product" },
    { value: 1, label: "Wrong Item Received" },
    { value: 2, label: "Item Not as Described" },
    { value: 3, label: "Quality Not Expected" },
    { value: 4, label: "Changed Mind" },
    { value: 5, label: "Other" },
];

export default function ReturnRefundModal({ orderId, orderNumber, finalAmount, onClose, onSuccess }: Props) {
    const dispatch = useAppDispatch();
    const { submitting, error } = useAppSelector((state) => state.returnRefund || { submitting: false, error: null });

    const [reason, setReason] = useState<number>(0);
    const [comments, setComments] = useState("");
    const [refundAccountDetails, setRefundAccountDetails] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(submitReturnRequest({
                orderId,
                reason,
                comments,
                refundAccountDetails
            })).unwrap();
            onSuccess();
            onClose();
        } catch (err) {
            // error handled by redux
        }
    };

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "16px"
        }}>
            <div style={{
                backgroundColor: "#fff", borderRadius: "16px", maxWidth: "520px",
                width: "100%", padding: "28px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#111827" }}>
                        <i className="fas fa-undo-alt" style={{ color: "#088178", marginRight: "10px" }} />
                        Request Return & Refund
                    </h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#9ca3af" }}>
                        <i className="fas fa-times" />
                    </button>
                </div>

                <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>
                    Order <strong>{orderNumber}</strong> &middot; Refund Total: <strong style={{ color: "#088178" }}>${finalAmount.toFixed(2)}</strong>
                </p>

                {error && (
                    <div style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                            Reason for Return *
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(Number(e.target.value))}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        >
                            {REASONS.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                            Additional Comments / Details
                        </label>
                        <textarea
                            rows={3}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Explain the issue with the delivered item..."
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                            Refund Account / Bank Details (Optional for COD)
                        </label>
                        <input
                            type="text"
                            value={refundAccountDetails}
                            onChange={(e) => setRefundAccountDetails(e.target.value)}
                            placeholder="Bank Name, IBAN or JazzCash / Easypaisa Number"
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", fontWeight: "600", cursor: "pointer" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: "10px 22px", borderRadius: "8px", border: "none",
                                backgroundColor: "#088178", color: "#fff", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer"
                            }}
                        >
                            {submitting ? "Submitting..." : "Submit Return Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
