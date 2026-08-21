"use client";

import { useState, useEffect } from "react";
import { getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi, Category } from "@/app/libs/categoryApi";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
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

    return (
        <div>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937" }}>Categories Management</h1>
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>Create and manage product categories / store sections.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        backgroundColor: "#088178",
                        color: "#fff",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <i className="fas fa-plus"></i> Add New Category
                </button>
            </div>

            {/* Categories Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
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
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>Loading categories...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>No categories found. Click "Add New Category" to create one.</td></tr>
                        ) : (
                            categories.map((cat) => (
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
                                                style={{ background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#374151" }}
                                            >
                                                <i className="fas fa-edit"></i> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id, cat.name)}
                                                style={{ background: "#fee2e2", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#dc2626" }}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10000,
                    padding: "20px"
                }}>
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        width: "100%",
                        maxWidth: "500px",
                        padding: "28px"
                    }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "16px" }}>
                            {editingCategory ? "✏️ Edit Category" : "✨ Add New Category"}
                        </h2>

                        {error && (
                            <div style={{
                                backgroundColor: "#fef2f2",
                                border: "1px solid #f87171",
                                color: "#b91c1c",
                                padding: "10px 14px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "14px"
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Category Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Hoodies, Summer Collection, Footwear"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Short description for this section..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: "8px 20px", borderRadius: "6px", border: "none", background: "#088178", color: "#fff", fontWeight: "700", cursor: "pointer" }}
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
