"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import AdminGuard from "@/app/Components/Admin/AdminGuard";
import { logout } from "@/app/libs/authApi";
import { useAppDispatch } from "@/app/redux/hooks";
import { logout as reduxLogout } from "@/app/redux/slices/authslice";
import { resetWishlist } from "@/app/redux/slices/wishlistslice";

import NotificationDropdown from "@/app/Components/Notification/NotificationDropdown";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const pathname = usePathname();

    const handleAdminLogout = () => {
        logout();
        dispatch(reduxLogout());
        dispatch(resetWishlist());
        router.push("/login");
    };

    return (
        <AdminGuard>
            <div style={{
                display: "flex",
                height: "100vh",
                width: "100%",
                overflow: "hidden",
                backgroundColor: "#f4f6f8"
            }}>
                {/* Admin Sidebar - FIXED */}
                <aside style={{
                    width: "260px",
                    height: "100vh",
                    backgroundColor: "#1a222d",
                    color: "#fff",
                    padding: "24px 16px",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRight: "1px solid rgba(255,255,255,0.05)"
                }}>
                    <div>
                        {/* Header Logo */}
                        <div style={{ paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#088178", display: "flex", alignItems: "center", gap: "8px" }}>
                                <i className="fas fa-shield-alt"></i> Admin Portal
                            </h3>
                            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Store Management</span>
                        </div>

                        {/* Navigation Links */}
                        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <Link href="/admin/products" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                <i className="fas fa-box"></i> Products
                            </Link>

                            <Link href="/admin/orders" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                <i className="fas fa-shopping-cart"></i> Orders
                            </Link>

                            <Link href="/admin/users" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                <i className="fas fa-users"></i> Users
                            </Link>

                            <Link href="/admin/categories" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                <i className="fas fa-tags"></i> Categories
                            </Link>

                            <Link href="/admin/brands" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                <i className="fas fa-copyright"></i> Brands
                            </Link>

                            <Link href="/admin/inventory" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                <i className="fas fa-warehouse"></i> Inventory
                            </Link>

                            <Link href="/admin/returns" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                <i className="fas fa-undo-alt"></i> Returns & Refunds
                            </Link>
                            <Link href="/admin/blogs" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                <i className="fas fa-newspaper"></i> Blogs
                            </Link>
                            <Link href="/admin/analytics" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                <i className="fas fa-chart-line"></i> Analytics & Accounting
                            </Link>


                        </nav>
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Link href="/shop" style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            color: "#9ca3af",
                            textDecoration: "none",
                            fontSize: "13px",
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
                                padding: "10px 14px",
                                borderRadius: "8px",
                                color: "#f87171",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "none",
                                fontSize: "13px",
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

                {/* Admin Main Content Area - SCROLLABLE WITH TOPBAR */}
                <main style={{
                    flex: 1,
                    height: "100vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#f4f6f8"
                }}>
                    {/* Admin Top Header Bar */}
                    <header style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 36px",
                        backgroundColor: "#fff",
                        borderBottom: "1px solid #e5e7eb",
                        position: "sticky",
                        top: 0,
                        zIndex: 100,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Admin Workspace</span>
                            <span style={{ color: "#d1d5db" }}>/</span>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                                {pathname.replace("/admin/", "").toUpperCase() || "DASHBOARD"}
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            {/* 🔔 Admin Actionable To-Do & Alerts Bell */}
                            <NotificationDropdown isAdmin={true} />
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid #e5e7eb", paddingLeft: "16px" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#088178", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" }}>
                                    A
                                </div>
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>Admin</span>
                            </div>
                        </div>
                    </header>

                    <div style={{ padding: "32px 40px", flex: 1 }}>
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
