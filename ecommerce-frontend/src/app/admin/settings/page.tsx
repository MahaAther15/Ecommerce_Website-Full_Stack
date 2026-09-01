"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { logout } from "@/app/redux/slices/authslice";
import { logout as clearAuthStorage } from "@/app/libs/authApi";

export default function AdminSettingsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setToastMessage("Logging out of Admin Portal...");

        try {
            // Optional: call backend logout endpoint to clear HttpOnly cookie
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            }).catch(() => {});
        } finally {
            // 1. Clear Redux Auth State
            dispatch(logout());

            // 2. Clear LocalStorage Tokens
            clearAuthStorage();

            // 3. Smooth Redirect to Shop / Login
            setTimeout(() => {
                router.push("/login");
            }, 800);
        }
    };

    return (
        <div style={{ maxWidth: "800px" }}>
            {/* Toast Notification */}
            {toastMessage && (
                <div style={{
                    position: "fixed",
                    top: "24px",
                    right: "24px",
                    backgroundColor: "#088178",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    zIndex: 999999,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}>
                    <i className="fas fa-sign-out-alt" style={{ marginRight: "8px" }}></i>
                    {toastMessage}
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937" }}>Admin Settings</h1>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>Manage administrative preferences, security, and session controls.</p>
            </div>

            {/* Account Overview Card */}
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                marginBottom: "24px"
            }}>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="fas fa-user-shield" style={{ color: "#088178" }}></i> Active Administrator Profile
                </h2>

                <div className="admin-settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ backgroundColor: "#f9fafb", padding: "14px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>FULL NAME</div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#1f2937", marginTop: "4px" }}>
                            {user?.name || "Super Admin"}
                        </div>
                    </div>

                    <div style={{ backgroundColor: "#f9fafb", padding: "14px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>ADMIN EMAIL</div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#1f2937", marginTop: "4px" }}>
                            {user?.email || "admin@ecommerce.com"}
                        </div>
                    </div>

                    <div style={{ backgroundColor: "#f9fafb", padding: "14px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>ASSIGNED ROLE</div>
                        <div style={{ marginTop: "4px" }}>
                            <span style={{
                                backgroundColor: "#088178",
                                color: "#fff",
                                padding: "3px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "700"
                            }}>
                                {user?.role || "Admin"}
                            </span>
                        </div>
                    </div>

                    <div style={{ backgroundColor: "#f9fafb", padding: "14px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>SECURITY STATUS</div>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#16a34a", marginTop: "4px" }}>
                            <i className="fas fa-check-circle" style={{ marginRight: "4px" }}></i> JWT Protected
                        </div>
                    </div>
                </div>
            </div>

            {/* Session & Logout Danger Zone Card */}
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #fee2e2",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#dc2626", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="fas fa-door-open"></i> Session & Access Control
                </h2>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
                    Logging out will terminate your current administrative session. All admin routes will become protected again, and you will be returned to the storefront / login page as a normal visitor.
                </p>

                <div style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <div style={{ fontWeight: "700", color: "#991b1b" }}>Log Out from Admin Portal</div>
                        <div style={{ fontSize: "13px", color: "#b91c1c" }}>Clears JWT tokens, authentication cookies, and resets user access.</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        style={{
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            fontWeight: "700",
                            border: "none",
                            cursor: isLoggingOut ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            opacity: isLoggingOut ? 0.7 : 1,
                            transition: "0.2s"
                        }}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        {isLoggingOut ? "Logging out..." : "Log Out Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}
