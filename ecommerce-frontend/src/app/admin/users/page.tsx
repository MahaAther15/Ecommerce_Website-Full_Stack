"use client";

import { useEffect, useState } from "react";
import { getAllUsersAdminApi, UserItem } from "@/app/libs/userApi";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsersAdminApi();
            setUsers(data);
        } catch (err: any) {
            showToast(err.message || "Failed to load registered users", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    const totalCustomers = users.filter((u) => u.role.toLowerCase() !== "admin").length;
    const totalAdmins = users.filter((u) => u.role.toLowerCase() === "admin").length;

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "#088178" }} />
                <p style={{ marginTop: "12px", color: "#6b7280" }}>Loading users directory...</p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Toast Notification */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        top: "24px",
                        right: "24px",
                        backgroundColor: toast.type === "success" ? "#088178" : "#dc2626",
                        color: "#fff",
                        padding: "12px 24px",
                        borderRadius: "10px",
                        fontWeight: "700",
                        zIndex: 99999,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    }}
                >
                    <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`} style={{ marginRight: "8px" }} />
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="admin-page-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: 0 }}>
                        <i className="fas fa-users" style={{ color: "#088178", marginRight: "10px" }} />
                        User Directory
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
                        View registered customers and administrators across your store
                    </p>
                </div>
                <button
                    onClick={loadUsers}
                    style={{
                        backgroundColor: "#fff",
                        border: "1px solid #d1d5db",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    <i className="fas fa-rotate-right" /> Refresh
                </button>
            </div>

            {/* Top KPI Cards */}
            <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: "4px solid #088178" }}>
                    <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Total Registered</span>
                    <h2 style={{ fontSize: "26px", fontWeight: "900", margin: "6px 0 0 0", color: "#111827" }}>{users.length}</h2>
                </div>
                <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: "4px solid #3b82f6" }}>
                    <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Customers</span>
                    <h2 style={{ fontSize: "26px", fontWeight: "900", margin: "6px 0 0 0", color: "#111827" }}>{totalCustomers}</h2>
                </div>
                <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderLeft: "4px solid #8b5cf6" }}>
                    <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Administrators</span>
                    <h2 style={{ fontSize: "26px", fontWeight: "900", margin: "6px 0 0 0", color: "#111827" }}>{totalAdmins}</h2>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="admin-filters-bar" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                    <i className="fas fa-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 14px 10px 38px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            fontSize: "14px",
                            outline: "none",
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            backgroundColor: "#fff",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        <option value="all">All Roles</option>
                        <option value="Customer">Customers</option>
                        <option value="Admin">Admins</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-table-card" style={{ backgroundColor: "#fff", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "650px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: "12px", color: "#6b7280", textTransform: "uppercase" }}>
                            <th style={{ padding: "14px 20px" }}>User</th>
                            <th style={{ padding: "14px 20px" }}>Contact</th>
                            <th style={{ padding: "14px 20px" }}>Location</th>
                            <th style={{ padding: "14px 20px" }}>Role</th>
                            <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: "14px" }}>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                                    No users found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u) => {
                                const initials = u.fullName ? u.fullName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase();
                                const isAdminRole = u.role.toLowerCase() === "admin";
                                return (
                                    <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "14px 20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div
                                                    style={{
                                                        width: "38px",
                                                        height: "38px",
                                                        borderRadius: "50%",
                                                        backgroundColor: isAdminRole ? "#8b5cf6" : "#088178",
                                                        color: "#fff",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontWeight: "700",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: "700", color: "#111827" }}>{u.fullName || "Unnamed User"}</div>
                                                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                                            {u.phoneNumber || <span style={{ color: "#9ca3af" }}>Not provided</span>}
                                        </td>
                                        <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                                            {u.city ? `${u.city}${u.country ? `, ${u.country}` : ""}` : <span style={{ color: "#9ca3af" }}>N/A</span>}
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <span
                                                style={{
                                                    padding: "4px 10px",
                                                    borderRadius: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: "700",
                                                    backgroundColor: isAdminRole ? "#f3e8ff" : "#f0fdf4",
                                                    color: isAdminRole ? "#7e22ce" : "#15803d",
                                                }}
                                            >
                                                {isAdminRole ? "Admin" : "Customer"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                            <button
                                                onClick={() => setSelectedUser(u)}
                                                style={{
                                                    backgroundColor: "#f3f4f6",
                                                    border: "none",
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    color: "#111827",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <i className="fas fa-eye" style={{ marginRight: "4px" }} /> View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* View User Details Modal */}
            {selectedUser && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10000,
                        padding: "16px",
                    }}
                >
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", maxWidth: "480px", width: "100%", padding: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>User Profile</h3>
                            <button onClick={() => setSelectedUser(null)} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#6b7280" }}>
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                            <div>
                                <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: "600" }}>Full Name:</span>
                                <div style={{ fontWeight: "700", color: "#111827" }}>{selectedUser.fullName || "N/A"}</div>
                            </div>
                            <div>
                                <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: "600" }}>Email:</span>
                                <div style={{ fontWeight: "600", color: "#111827" }}>{selectedUser.email}</div>
                            </div>
                            <div>
                                <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: "600" }}>Phone Number:</span>
                                <div style={{ fontWeight: "600", color: "#111827" }}>{selectedUser.phoneNumber || "Not provided"}</div>
                            </div>
                            <div>
                                <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: "600" }}>Address:</span>
                                <div style={{ fontWeight: "600", color: "#111827" }}>{selectedUser.address || "Not provided"}</div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div>
                                    <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: "600" }}>City / State:</span>
                                    <div style={{ fontWeight: "600", color: "#111827" }}>{selectedUser.city || "-"}{selectedUser.state ? `, ${selectedUser.state}` : ""}</div>
                                </div>
                                <div>
                                    <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: "600" }}>Country:</span>
                                    <div style={{ fontWeight: "600", color: "#111827" }}>{selectedUser.country || "-"}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                            <button
                                onClick={() => setSelectedUser(null)}
                                style={{ padding: "8px 18px", borderRadius: "8px", border: "none", backgroundColor: "#111827", color: "#fff", fontWeight: "700", cursor: "pointer" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
