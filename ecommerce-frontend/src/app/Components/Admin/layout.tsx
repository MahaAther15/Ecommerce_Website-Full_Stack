import Link from "next/link";
import AdminGuard from "@/app/Components/Admin/AdminGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div
                style={{
                    display: "flex",
                    minHeight: "100vh",
                    backgroundColor: "#f4f6f8",
                }}
            >
                {/* Admin Sidebar */}
                <aside
                    style={{
                        width: "260px",
                        backgroundColor: "#1a222d",
                        color: "#fff",
                        padding: "24px 16px",
                        flexShrink: 0,
                    }}
                >
                    {/* Admin Header */}
                    <div
                        style={{
                            paddingBottom: "20px",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            marginBottom: "20px",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "18px",
                                fontWeight: "700",
                                color: "#088178",
                            }}
                        >
                            ⚡ Admin Portal
                        </h3>

                        <span
                            style={{
                                fontSize: "12px",
                                color: "#9ca3af",
                            }}
                        >
                            Store Management
                        </span>
                    </div>

                    {/* Sidebar Navigation */}
                    <nav
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        {/* Products */}
                        <Link
                            href="/admin/products"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                backgroundColor: "#088178",
                                color: "#fff",
                                textDecoration: "none",
                                fontWeight: "600",
                            }}
                        >
                            <i className="fas fa-boxes"></i>
                            Products
                        </Link>

                        {/* Categories */}
                        <Link
                            href="/admin/categories"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px",
                            }}
                        >
                            <i className="fas fa-tags"></i>
                            Categories
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


                        {/* View Live Store */}
                        <Link
                            href="/shop"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: "#d1d5db",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px",
                            }}
                        >
                            <i className="fas fa-external-link-alt"></i>
                            View Live Store
                        </Link>
                    </nav>
                </aside>

                {/* Admin Main Content Area */}
                <main
                    style={{
                        flex: 1,
                        padding: "32px",
                        overflowY: "auto",
                    }}
                >
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}