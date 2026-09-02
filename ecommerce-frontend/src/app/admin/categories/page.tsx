"use client";

import { useState, useEffect } from "react";
import { getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi, Category } from "@/app/libs/categoryApi";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategoriesApi();
            setCategories(data);
        } catch (err: any) {
            showToast(err.message || "Failed to load categories", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenModal = (cat?: Category) => {
        setError(null);
        if (cat) {
            setEditingCategory(cat);
            setFormData({ name: cat.name, description: cat.description || "" });
        } else {
            setEditingCategory(null);
            setFormData({ name: "", description: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingCategory) {
                await updateCategoryApi(editingCategory.id, formData);
                showToast("Category updated successfully!");
            } else {
                await createCategoryApi(formData);
                showToast("Category created successfully!");
            }
            setIsModalOpen(false);
            loadCategories();
        } catch (err: any) {
            setError(err.message || "Operation failed.");
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete category "${name}"?`)) {
            try {
                await deleteCategoryApi(id);
                showToast("Category deleted successfully!");
                loadCategories();
            } catch (err: any) {
                showToast(err.message || "Delete failed", "error");
            }
        }
    };

    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed",
                    top: "24px",
                    right: "24px",
                    backgroundColor: toast.type === "success" ? "#088178" : "#e74c3c",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    zIndex: 999999,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937", margin: "0 0 4px 0" }}>Categories Management</h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Create and manage product categories / store sections.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="admin-action-btn"
                    style={{
                        backgroundColor: "#088178",
                        color: "#fff",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        border: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        boxShadow: "0 2px 8px rgba(8,129,120,0.2)"
                    }}
                >
                    <i className="fas fa-plus"></i> Add New Category
                </button>
            </div>

            {/* Search Bar */}
            <div className="admin-search-wrapper" style={{ marginBottom: "20px", position: "relative", maxWidth: "450px", width: "100%" }}>
                <i className="fas fa-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "14px" }} />
                <input
                    type="text"
                    placeholder="Search category by name, slug or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px 38px 10px 38px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        outline: "none",
                        fontSize: "13px",
                        backgroundColor: "#fff"
                    }}
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        title="Clear search"
                        style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "#9ca3af",
                            cursor: "pointer",
                            fontSize: "14px",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Categories Content */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", fontWeight: "600", backgroundColor: "#fff", borderRadius: "12px" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "#088178", marginBottom: "12px", display: "block" }} />
                    Loading categories...
                </div>
            ) : filteredCategories.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af", backgroundColor: "#fff", borderRadius: "12px" }}>
                    <i className="fas fa-tags" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }} />
                    No categories found matching your search.
                </div>
            ) : (
                <>
                    {/* ═══ Desktop Table View ═══ */}
                    <div className="admin-desktop-view admin-table-card" style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
                            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                <tr>
                                    <th style={{ padding: "14px 16px" }}>ID</th>
                                    <th style={{ padding: "14px 16px" }}>Category Name</th>
                                    <th style={{ padding: "14px 16px" }}>Slug</th>
                                    <th style={{ padding: "14px 16px" }}>Description</th>
                                    <th style={{ padding: "14px 16px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map((cat) => (
                                    <tr key={cat.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "14px 16px", color: "#6b7280" }}>#{cat.id}</td>
                                        <td style={{ padding: "14px 16px", fontWeight: "700", color: "#111827" }}>{cat.name}</td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{ backgroundColor: "#f3f4f6", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", color: "#4b5563" }}>
                                                {cat.slug}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: "13px" }}>{cat.description || "—"}</td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    style={{ background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#374151", fontWeight: "600", fontSize: "12px" }}
                                                >
                                                    <i className="fas fa-edit"></i> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    style={{ background: "#fee2e2", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#dc2626", fontSize: "12px" }}
                                                    title="Delete Category"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ═══ Mobile Card View ═══ */}
                    <div className="admin-mobile-view" style={{ display: "none", flexDirection: "column", gap: "12px", width: "100%" }}>
                        {filteredCategories.map((cat) => (
                            <div
                                key={cat.id}
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
                                {/* Top row: Name & Slug + ID */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                                    <div>
                                        <div style={{ fontWeight: "700", color: "#111827", fontSize: "15px" }}>
                                            {cat.name}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                                            ID: #{cat.id}
                                        </div>
                                    </div>
                                    <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>
                                        {cat.slug}
                                    </span>
                                </div>

                                {/* Description */}
                                <p style={{ margin: 0, fontSize: "13px", color: cat.description ? "#4b5563" : "#9ca3af", fontStyle: cat.description ? "normal" : "italic", lineHeight: "1.4" }}>
                                    {cat.description || "No description provided."}
                                </p>

                                {/* Action Buttons */}
                                <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
                                    <button
                                        onClick={() => handleOpenModal(cat)}
                                        style={{
                                            flex: 1,
                                            background: "#f3f4f6",
                                            border: "1px solid #e5e7eb",
                                            padding: "8px 12px",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            color: "#374151",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "6px"
                                        }}
                                    >
                                        <i className="fas fa-edit"></i> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id, cat.name)}
                                        style={{
                                            flex: 1,
                                            background: "#fee2e2",
                                            border: "1px solid #fecaca",
                                            padding: "8px 12px",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            color: "#dc2626",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "6px"
                                        }}
                                    >
                                        <i className="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10000,
                    padding: "16px"
                }}>
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "14px",
                        width: "100%",
                        maxWidth: "480px",
                        padding: "24px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#1f2937" }}>
                                {editingCategory ? "✏️ Edit Category" : "✨ Add New Category"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: "none", border: "none", fontSize: "18px", color: "#9ca3af", cursor: "pointer", padding: "4px" }}
                            >
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div style={{
                                backgroundColor: "#fef2f2",
                                border: "1px solid #f87171",
                                color: "#b91c1c",
                                padding: "10px 14px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}>
                                <i className="fas fa-exclamation-circle" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Category Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Hoodies, Summer Collection, Footwear"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Short description for this section..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", resize: "vertical" }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ flex: 1, padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: "10px 20px", borderRadius: "8px", border: "none", background: "#088178", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                                >
                                    {editingCategory ? "Update Category" : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
