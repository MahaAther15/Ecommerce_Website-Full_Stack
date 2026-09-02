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
    }, [dispatch]);

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
            dispatch(fetchAllReturnsAdmin());
        } catch (err: any) {
            alert(err || "Failed to update return request");
        } finally {
            setProcessing(false);
        }
    };

    const filtered = allReturns.filter((r) => filterStatus === "All" || r.status === filterStatus);

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
            <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 4px 0" }}>
                        <i className="fas fa-undo-alt" style={{ color: "#088178", marginRight: "10px" }} />
                        Returns & Refund Management
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                        Process customer return claims and approve refunds
                    </p>
                </div>

                <div className="admin-search-wrapper" style={{ display: "flex", gap: "10px", maxWidth: "260px", width: "100%" }}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: "100%", padding: "9px 16px", borderRadius: "8px", border: "1px solid #d1d5db", fontWeight: "600", fontSize: "13px", backgroundColor: "#fff", outline: "none" }}
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

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", fontWeight: "600", backgroundColor: "#fff", borderRadius: "12px" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "#088178", marginBottom: "12px", display: "block" }} />
                    Loading return requests...
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af", backgroundColor: "#fff", borderRadius: "12px" }}>
                    <i className="fas fa-box-open" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }} />
                    No return & refund requests found.
                </div>
            ) : (
                <>
                    {/* ═══ Desktop Table View ═══ */}
                    <div className="admin-desktop-view admin-table-card" style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px", minWidth: "750px" }}>
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
                                {filtered.map((req) => {
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

                    {/* ═══ Mobile Card View ═══ */}
                    <div className="admin-mobile-view" style={{ display: "none", flexDirection: "column", gap: "12px", width: "100%" }}>
                        {filtered.map((req) => {
                            const badge = STATUS_BADGES[req.status] || { color: "#6b7280", bg: "#f3f4f6" };
                            return (
                                <div
                                    key={req.id}
                                    style={{
                                        backgroundColor: "#fff",
                                        borderRadius: "12px",
                                        padding: "16px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                        border: "1px solid #f3f4f6",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px"
                                    }}
                                >
                                    {/* Top Line: Order Number & Status */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <span style={{ fontWeight: "800", color: "#088178", fontSize: "15px" }}>{req.orderNumber}</span>
                                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <span style={{
                                            backgroundColor: badge.bg,
                                            color: badge.color,
                                            padding: "3px 10px",
                                            borderRadius: "999px",
                                            fontWeight: "700",
                                            fontSize: "11px"
                                        }}>
                                            {req.status}
                                        </span>
                                    </div>

                                    {/* Customer & Reason Info */}
                                    <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "10px 12px", fontSize: "12px" }}>
                                        <div style={{ color: "#1f2937", fontWeight: "700" }}>{req.userFullName}</div>
                                        <div style={{ color: "#6b7280", fontSize: "11px", marginBottom: "6px" }}>{req.userEmail}</div>
                                        <div style={{ color: "#374151" }}><strong>Reason:</strong> {req.reason}</div>
                                    </div>

                                    {/* Refund Amount */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Refund Amount:</span>
                                        <span style={{ fontWeight: "800", color: "#088178", fontSize: "16px" }}>${req.refundAmount.toFixed(2)}</span>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => {
                                            setSelectedRequest(req);
                                            setAdminNotes(req.adminNotes || "");
                                        }}
                                        style={{
                                            width: "100%",
                                            backgroundColor: "#088178",
                                            color: "#fff",
                                            border: "none",
                                            padding: "9px 14px",
                                            borderRadius: "8px",
                                            fontWeight: "700",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "6px"
                                        }}
                                    >
                                        <i className="fas fa-undo-alt" /> Process Return
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Admin Action Modal */}
            {selectedRequest && (
                <div style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000, padding: "16px"
                }}>
                    <div style={{
                        backgroundColor: "#fff", borderRadius: "16px", maxWidth: "540px",
                        width: "100%", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1f2937" }}>
                                Process Return for {selectedRequest.orderNumber}
                            </h3>
                            <button onClick={() => setSelectedRequest(null)} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#6b7280" }}>
                                <i className="fas fa-times" />
                            </button>
                        </div>

                        <div style={{ backgroundColor: "#f9fafb", padding: "14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                            <p style={{ margin: "0 0 6px 0" }}><strong>Reason:</strong> {selectedRequest.reason}</p>
                            <p style={{ margin: "0 0 6px 0" }}><strong>Customer Note:</strong> {selectedRequest.comments || "None"}</p>
                            <p style={{ margin: "0 0 6px 0" }}><strong>Refund Account:</strong> {selectedRequest.refundAccountDetails || "N/A"}</p>
                            <p style={{ margin: 0 }}><strong>Refund Amount:</strong> <span style={{ color: "#088178", fontWeight: "800" }}>${selectedRequest.refundAmount.toFixed(2)}</span></p>
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                                Update Return Status
                            </label>
                            <select
                                value={actionStatus}
                                onChange={(e) => setActionStatus(Number(e.target.value))}
                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", backgroundColor: "#fff" }}
                            >
                                <option value={1}>Under Review</option>
                                <option value={2}>Approved (Awaiting Item Return)</option>
                                <option value={3}>Refunded (Complete & Process Refund)</option>
                                <option value={4}>Rejected</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                                Admin Response / Remarks
                            </label>
                            <textarea
                                rows={3}
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes for customer (e.g. Refund sent via Bank transfer #TXN123)..."
                                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", resize: "vertical" }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                style={{ flex: 1, padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px", color: "#374151" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={processing}
                                style={{
                                    flex: 1,
                                    padding: "10px 20px", borderRadius: "8px", border: "none",
                                    backgroundColor: actionStatus === 3 ? "#16a34a" : (actionStatus === 4 ? "#dc2626" : "#088178"),
                                    color: "#fff", fontWeight: "700", cursor: processing ? "not-allowed" : "pointer", fontSize: "13px"
                                }}
                            >
                                {processing ? "Processing..." : (actionStatus === 3 ? "Process Refund" : "Save Changes")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
