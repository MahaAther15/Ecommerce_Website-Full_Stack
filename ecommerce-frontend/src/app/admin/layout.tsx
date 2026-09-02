"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminGuard from "@/app/Components/Admin/AdminGuard";
import { logout } from "@/app/libs/authApi";
import { useAppDispatch } from "@/app/redux/hooks";
import { logout as reduxLogout } from "@/app/redux/slices/authslice";
import { resetWishlist } from "@/app/redux/slices/wishlistslice";
import NotificationDropdown from "@/app/Components/Notification/NotificationDropdown";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleAdminLogout = () => {
        logout();
        dispatch(reduxLogout());
        dispatch(resetWishlist());
        router.push("/login");
    };

    const navLinks = [
        { href: "/admin/products", label: "Products", icon: "fas fa-box" },
        { href: "/admin/orders", label: "Orders", icon: "fas fa-shopping-cart" },
        { href: "/admin/users", label: "Users", icon: "fas fa-users" },
        { href: "/admin/categories", label: "Categories", icon: "fas fa-tags" },
        { href: "/admin/brands", label: "Brands", icon: "fas fa-copyright" },
        { href: "/admin/inventory", label: "Inventory", icon: "fas fa-warehouse" },
        { href: "/admin/returns", label: "Returns & Refunds", icon: "fas fa-undo-alt" },
        { href: "/admin/blogs", label: "Blogs", icon: "fas fa-newspaper" },
        { href: "/admin/analytics", label: "Analytics & Accounting", icon: "fas fa-chart-line" },
    ];

    return (
        <AdminGuard>
            <div className="admin-layout-container" style={{
                display: "flex",
                height: "100vh",
                width: "100%",
                overflow: "hidden",
                backgroundColor: "#f4f6f8",
                position: "relative"
            }}>
                {/* Mobile Backdrop Overlay */}
                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className="admin-backdrop"
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            zIndex: 998,
                        }}
                    />
                )}

                {/* Admin Sidebar */}
                <aside
                    className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
                    style={{
                        width: "260px",
                        height: "100vh",
                        backgroundColor: "#1a222d",
                        color: "#fff",
                        padding: "24px 16px",
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                        transition: "transform 0.3s ease-in-out",
                        zIndex: 999
                    }}
                >
                    <div>
                        {/* Header Logo */}
                        <div style={{
                            paddingBottom: "20px",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            marginBottom: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <div>
                                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#088178", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <i className="fas fa-shield-alt"></i> Admin Portal
                                </h3>
                                <span style={{ fontSize: "12px", color: "#9ca3af" }}>Store Management</span>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="admin-close-btn"
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#9ca3af",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                    padding: "4px"
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setSidebarOpen(false)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            color: isActive ? "#ffffff" : "#d1d5db",
                                            backgroundColor: isActive ? "#088178" : "transparent",
                                            textDecoration: "none",
                                            fontWeight: isActive ? "700" : "500",
                                            fontSize: "13px",
                                            transition: "0.2s"
                                        }}
                                    >
                                        <i className={link.icon} style={{ width: "16px" }}></i> {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Link href="/shop" style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            color: "#9ca3af",
                            textDecoration: "none",
                            fontSize: "12px",
                            transition: "0.2s"
                        }}>
                            <i className="fas fa-external-link-alt"></i> View Live Store
                        </Link>

                        <button
                            onClick={handleAdminLogout}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "9px 12px",
                                borderRadius: "8px",
                                color: "#f87171",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "none",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                width: "100%",
                                textAlign: "left",
                                transition: "0.2s"
                            }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </aside>

                {/* Admin Main Content Area */}
                <main className="admin-main-area" style={{
                    flex: 1,
                    height: "100vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#f4f6f8",
                    minWidth: 0
                }}>
                    {/* Admin Top Header Bar */}
                    <header className="admin-top-header" style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 24px",
                        backgroundColor: "#fff",
                        borderBottom: "1px solid #e5e7eb",
                        position: "sticky",
                        top: 0,
                        zIndex: 100,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {/* Hamburger Menu button for mobile */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="admin-hamburger-btn"
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "18px",
                                    color: "#374151",
                                    cursor: "pointer",
                                    padding: "6px 8px",
                                    borderRadius: "6px"
                                }}
                                title="Open navigation menu"
                            >
                                <i className="fas fa-bars"></i>
                            </button>

                            <span className="admin-header-title" style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                                {pathname.replace("/admin/", "").toUpperCase() || "DASHBOARD"}
                            </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <NotificationDropdown isAdmin={true} />
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid #e5e7eb", paddingLeft: "12px" }}>
                                <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#088178", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px" }}>
                                    A
                                </div>
                                <span className="admin-user-label" style={{ fontSize: "12px", fontWeight: "700", color: "#111827" }}>Admin</span>
                            </div>
                        </div>
                    </header>

                    <div className="admin-content-padding" style={{ padding: "24px 30px", flex: 1, overflowX: "auto" }}>
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
