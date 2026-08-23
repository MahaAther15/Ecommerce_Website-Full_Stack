"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { fetchAllReturnsAdmin, updateReturnStatusAdmin } from "@/app/redux/slices/returnRefundSlice";
import { ReturnRequestDto } from "@/app/libs/returnRefundApi";

const STATUS_BADGES: Record<string, { color: string; bg: string }> = {
    Pending: { color: "#d97706", bg: "#fef3c7" },
    UnderReview: { color: "#2563eb", bg: "#dbeafe" },
    Approved: { color: "#7c3aed", bg: "#ede9fe" },
    Refunded: { color: "#16a34a", bg: "#dcfce7" },
    Rejected: { color: "#dc2626", bg: "#fee2e2" },
};

export default function AdminReturnsPage() {
    const dispatch = useAppDispatch();
    const { allReturns, loading } = useAppSelector((state) => state.returnRefund || { allReturns: [], loading: false });

    const [selectedRequest, setSelectedRequest] = useState<ReturnRequestDto | null>(null);
    const [actionStatus, setActionStatus] = useState<number>(3); // Default 3: Refunded
    const [adminNotes, setAdminNotes] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        dispatch(fetchAllReturnsAdmin());
    }, []);

    const handleUpdateStatus = async () => {
        if (!selectedRequest) return;
        setProcessing(true);
        try {
            await dispatch(updateReturnStatusAdmin({
                id: selectedRequest.id,
                dto: { status: actionStatus, adminNotes }
            })).unwrap();
            setSelectedRequest(null);
            setAdminNotes("");
        } catch (err: any) {
            alert(err || "Failed to update return request");
        } finally {
            setProcessing(false);
        }
    };

    const filtered = allReturns.filter((r) => filterStatus === "All" || r.status === filterStatus);

    return (
        <div style={{ padding: "30px", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: 0 }}>
                        <i className="fas fa-undo-alt" style={{ color: "#088178", marginRight: "10px" }} />
                        Returns & Refund Management
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
                        Process customer return claims and approve refunds
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", fontWeight: "600" }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="UnderReview">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Refunded">Refunded</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table Container */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                    <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        <tr>
                            <th style={{ padding: "14px 18px", color: "#4b5563" }}>Order #</th>
                            <th style={{ padding: "14px 18px", color: "#4b5563" }}>Customer</th>
                            <th style={{ padding: "14px 18px", color: "#4b5563" }}>Reason</th>
                            <th style={{ padding: "14px 18px", color: "#4b5563" }}>Refund Amount</th>
                            <th style={{ padding: "14px 18px", color: "#4b5563" }}>Date</th>
                            <th style={{ padding: "14px 18px", color: "#4b5563" }}>Status</th>
                            <th style={{ padding: "14px 18px", color: "#4b5563", textAlign: "right" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                                    Loading return requests...
                                </td>
                            </tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                                    No return & refund requests found.
                                </td>
                            </tr>
                        )}
                        {!loading && filtered.map((req) => {
                            const badge = STATUS_BADGES[req.status] || { color: "#6b7280", bg: "#f3f4f6" };
                            return (
                                <tr key={req.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "14px 18px", fontWeight: "700", color: "#111827" }}>{req.orderNumber}</td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <div style={{ fontWeight: "600", color: "#1f2937" }}>{req.userFullName}</div>
                                        <div style={{ fontSize: "12px", color: "#9ca3af" }}>{req.userEmail}</div>
                                    </td>
                                    <td style={{ padding: "14px 18px", color: "#374151" }}>{req.reason}</td>
                                    <td style={{ padding: "14px 18px", fontWeight: "700", color: "#088178" }}>${req.refundAmount.toFixed(2)}</td>
                                    <td style={{ padding: "14px 18px", color: "#6b7280", fontSize: "12px" }}>
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <span style={{
                                            backgroundColor: badge.bg, color: badge.color,
                                            padding: "4px 12px", borderRadius: "999px",
                                            fontWeight: "700", fontSize: "12px"
                                        }}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setAdminNotes(req.adminNotes || "");
                                            }}
                                            style={{
                                                backgroundColor: "#088178", color: "#fff",
                                                border: "none", padding: "6px 14px",
                                                borderRadius: "6px", fontWeight: "600",
                                                fontSize: "12px", cursor: "pointer"
                                            }}
                                        >
                                            Process Return
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Admin Action Modal */}
            {selectedRequest && (
                <div style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000, padding: "16px"
                }}>
                    <div style={{
                        backgroundColor: "#fff", borderRadius: "16px", maxWidth: "540px",
                        width: "100%", padding: "28px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                    }}>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>
                            Process Return for {selectedRequest.orderNumber}
                        </h3>

                        <div style={{ backgroundColor: "#f9fafb", padding: "14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                            <p style={{ margin: "0 0 6px 0" }}><strong>Reason:</strong> {selectedRequest.reason}</p>
                            <p style={{ margin: "0 0 6px 0" }}><strong>Customer Note:</strong> {selectedRequest.comments || "None"}</p>
                            <p style={{ margin: "0 0 6px 0" }}><strong>Refund Account:</strong> {selectedRequest.refundAccountDetails || "N/A"}</p>
                            <p style={{ margin: 0 }}><strong>Refund Amount:</strong> <span style={{ color: "#088178", fontWeight: "800" }}>${selectedRequest.refundAmount.toFixed(2)}</span></p>
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                                Update Return Status
                            </label>
                            <select
                                value={actionStatus}
                                onChange={(e) => setActionStatus(Number(e.target.value))}
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                            >
                                <option value={1}>Under Review</option>
                                <option value={2}>Approved (Awaiting Item Return)</option>
                                <option value={3}>Refunded (Complete & Process Refund)</option>
                                <option value={4}>Rejected</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                                Admin Response / Remarks
                            </label>
                            <textarea
                                rows={3}
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes for customer (e.g. Refund sent via Bank transfer #TXN123)..."
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", fontWeight: "600", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={processing}
                                style={{
                                    padding: "10px 22px", borderRadius: "8px", border: "none",
                                    backgroundColor: actionStatus === 3 ? "#16a34a" : (actionStatus === 4 ? "#dc2626" : "#088178"),
                                    color: "#fff", fontWeight: "700", cursor: processing ? "not-allowed" : "pointer"
                                }}
                            >
                                {processing ? "Processing..." : (actionStatus === 3 ? "Process & Return Refund" : "Save Changes")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
