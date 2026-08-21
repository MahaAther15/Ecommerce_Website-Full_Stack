import Link from "next/link";
import AdminGuard from "@/app/Components/Admin/AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
                                <i className="fas fa-boxes"></i> Products
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
                                <i className="fas fa-receipt"></i> Orders
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
                                <i className="fas fa-certificate"></i> Brands
                            </Link>

                            <Link href="/admin/settings" style={{
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
                                <i className="fas fa-cog"></i> Settings
                            </Link>
                        </nav>
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
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
                    </div>
                </aside>

                {/* Admin Main Content Area - SCROLLABLE */}
                <main style={{
                    flex: 1,
                    height: "100vh",
                    overflowY: "auto",
                    padding: "32px 40px",
                    backgroundColor: "#f4f6f8"
                }}>
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
