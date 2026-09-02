"use client";

import { useState, useEffect, useRef } from "react";
import { getBrandApi, createBrandApi, updateBrandApi, deleteBrandApi, Brand } from "@/app/libs/brandApi";
import { uploadProductImageApi } from "@/app/libs/productApi";

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        logoUrl: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadBrands = async () => {
        try {
            setLoading(true);
            const data = await getBrandApi();
            setBrands(data);
        } catch (err: any) {
            showToast(err.message || "Failed to load brands", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBrands();
    }, []);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenModal = (brand?: Brand) => {
        setError(null);
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                description: brand.description || "",
                logoUrl: brand.logoUrl || "",
            });
        } else {
            setEditingBrand(null);
            setFormData({
                name: "",
                description: "",
                logoUrl: "",
            });
        }
        setIsModalOpen(true);
    };

    // Cloudinary Brand Logo Upload
    const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
            setError("Invalid image format! Only JPG, PNG, WEBP, and SVG are allowed.");
            return;
        }

        try {
            setImageUploading(true);
            const secureUrl = await uploadProductImageApi(file);
            setFormData((prev) => ({ ...prev, logoUrl: secureUrl }));
            showToast("Brand logo uploaded successfully!");
        } catch (err: any) {
            setError(err.message || "Logo upload failed. Please try again.");
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingBrand) {
                await updateBrandApi(editingBrand.id, formData);
                showToast("Brand updated successfully!");
            } else {
                await createBrandApi(formData);
                showToast("Brand created successfully!");
            }
            setIsModalOpen(false);
            loadBrands();
        } catch (err: any) {
            setError(err.message || "Operation failed.");
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete brand "${name}"?`)) {
            try {
                await deleteBrandApi(id);
                showToast("Brand deleted successfully!");
                loadBrands();
            } catch (err: any) {
                showToast(err.message || "Delete failed", "error");
            }
        }
    };

    const filteredBrands = brands.filter(
        (b) =>
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
            {/* Toast Notification */}
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
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937", margin: "0 0 4px 0" }}>Brands Management</h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Manage brand logos, URL slugs, and storefront taxonomies.</p>
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
                    <i className="fas fa-plus"></i> Add New Brand
                </button>
            </div>

            {/* Search Bar */}
            <div className="admin-search-wrapper" style={{ marginBottom: "20px", position: "relative", maxWidth: "450px", width: "100%" }}>
                <i className="fas fa-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "14px" }} />
                <input
                    type="text"
                    placeholder="Search brand by name, slug or description..."
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

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", fontWeight: "600", backgroundColor: "#fff", borderRadius: "12px" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "#088178", marginBottom: "12px", display: "block" }} />
                    Loading brands...
                </div>
            ) : filteredBrands.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af", backgroundColor: "#fff", borderRadius: "12px" }}>
                    <i className="fas fa-copyright" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }} />
                    No brands found matching your search.
                </div>
            ) : (
                <>
                    {/* ═══ Desktop Table View ═══ */}
                    <div className="admin-desktop-view admin-table-card" style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "650px" }}>
                            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                <tr>
                                    <th style={{ padding: "14px 16px" }}>Logo</th>
                                    <th style={{ padding: "14px 16px" }}>Brand Name</th>
                                    <th style={{ padding: "14px 16px" }}>Slug (URL)</th>
                                    <th style={{ padding: "14px 16px" }}>Description</th>
                                    <th style={{ padding: "14px 16px" }}>Status</th>
                                    <th style={{ padding: "14px 16px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBrands.map((brand) => (
                                    <tr key={brand.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        {/* Logo */}
                                        <td style={{ padding: "12px 16px" }}>
                                            {brand.logoUrl ? (
                                                <img
                                                    src={brand.logoUrl}
                                                    alt={brand.name}
                                                    style={{ width: "42px", height: "42px", objectFit: "contain", borderRadius: "6px", border: "1px solid #e5e7eb", padding: "2px", backgroundColor: "#fff" }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: "42px",
                                                    height: "42px",
                                                    borderRadius: "6px",
                                                    backgroundColor: "#f3f4f6",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "700",
                                                    color: "#088178",
                                                    fontSize: "16px"
                                                }}>
                                                    {brand.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </td>
                                        {/* Brand Name */}
                                        <td style={{ padding: "14px 16px", fontWeight: "700", color: "#111827" }}>
                                            {brand.name}
                                        </td>
                                        {/* Slug */}
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{ backgroundColor: "#f3f4f6", color: "#4b5563", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontFamily: "monospace" }}>
                                                {brand.slug}
                                            </span>
                                        </td>
                                        {/* Description */}
                                        <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: "13px", maxWidth: "250px" }}>
                                            {brand.description || <span style={{ color: "#9ca3af" }}>No description</span>}
                                        </td>
                                        {/* Status */}
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{
                                                backgroundColor: brand.isActive !== false ? "#dcfce7" : "#fee2e2",
                                                color: brand.isActive !== false ? "#15803d" : "#b91c1c",
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "600"
                                            }}>
                                                {brand.isActive !== false ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    onClick={() => handleOpenModal(brand)}
                                                    style={{ background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#374151", fontWeight: "600", fontSize: "12px" }}
                                                >
                                                    <i className="fas fa-edit"></i> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand.id, brand.name)}
                                                    style={{ background: "#fee2e2", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#dc2626", fontSize: "12px" }}
                                                    title="Delete Brand"
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
                        {filteredBrands.map((brand) => (
                            <div
                                key={brand.id}
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
                                {/* Top row: Logo + Brand Name + Status */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                                        {brand.logoUrl ? (
                                            <img
                                                src={brand.logoUrl}
                                                alt={brand.name}
                                                style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px", border: "1px solid #e5e7eb", padding: "2px", flexShrink: 0, backgroundColor: "#fff" }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "6px",
                                                backgroundColor: "#f3f4f6",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "700",
                                                color: "#088178",
                                                fontSize: "16px",
                                                flexShrink: 0
                                            }}>
                                                {brand.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: "700", color: "#111827", fontSize: "15px" }}>
                                                {brand.name}
                                            </div>
                                            <span style={{ fontSize: "11px", color: "#6b7280", fontFamily: "monospace" }}>
                                                {brand.slug}
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{
                                        backgroundColor: brand.isActive !== false ? "#dcfce7" : "#fee2e2",
                                        color: brand.isActive !== false ? "#15803d" : "#b91c1c",
                                        padding: "3px 8px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        flexShrink: 0
                                    }}>
                                        {brand.isActive !== false ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                {/* Description */}
                                <p style={{ margin: 0, fontSize: "13px", color: brand.description ? "#4b5563" : "#9ca3af", fontStyle: brand.description ? "normal" : "italic", lineHeight: "1.4" }}>
                                    {brand.description || "No description provided."}
                                </p>

                                {/* Action Buttons */}
                                <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
                                    <button
                                        onClick={() => handleOpenModal(brand)}
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
                                        onClick={() => handleDelete(brand.id, brand.name)}
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

            {/* Modal */}
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
                        maxWidth: "500px",
                        padding: "24px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#1f2937" }}>
                                {editingBrand ? "✏️ Edit Brand" : "✨ Add New Brand"}
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
                            <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px", fontWeight: "600" }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {/* Brand Name */}
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Brand Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Nike, Adidas, Rolex, Zara"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none" }}
                                />
                            </div>

                            {/* Cloudinary Brand Logo Upload */}
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Brand Logo</label>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleLogoFileChange}
                                        style={{ display: "none" }}
                                    />
                                    <button
                                        type="button"
                                        disabled={imageUploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: "8px",
                                            backgroundColor: "#f3f4f6",
                                            border: "1px solid #d1d5db",
                                            cursor: "pointer",
                                            fontWeight: "700",
                                            fontSize: "13px",
                                            color: "#374151"
                                        }}
                                    >
                                        {imageUploading ? "Uploading to Cloudinary..." : "📁 Upload Brand Logo"}
                                    </button>

                                    {formData.logoUrl && (
                                        <img
                                            src={formData.logoUrl}
                                            alt="Preview"
                                            style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px", border: "1px solid #e5e7eb", padding: "2px", backgroundColor: "#fff" }}
                                        />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Or paste direct Logo URL"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    style={{ width: "100%", marginTop: "8px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "12px", outline: "none" }}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief details about the brand story or products..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", resize: "vertical" }}
                                />
                            </div>

                            {/* Modal Actions */}
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
                                    disabled={imageUploading}
                                    style={{ flex: 1, padding: "10px 20px", borderRadius: "8px", border: "none", background: "#088178", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                                >
                                    {editingBrand ? "Update Brand" : "Create Brand"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
