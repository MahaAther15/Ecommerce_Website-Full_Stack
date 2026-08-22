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

    // Cloudinary Logo Upload
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
        <div>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937" }}>Brands Management</h1>
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>Manage brand logos, URL slugs, and storefront taxonomies.</p>
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
                    <i className="fas fa-plus"></i> Add New Brand
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: "20px", position: "relative", maxWidth: "450px" }}>
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

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
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
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>Loading brands...</td>
                            </tr>
                        ) : filteredBrands.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>No brands found. Click "Add New Brand" to create one.</td>
                            </tr>
                        ) : (
                            filteredBrands.map((brand) => (
                                <tr key={brand.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    {/* Logo */}
                                    <td style={{ padding: "12px 16px" }}>
                                        {brand.logoUrl ? (
                                            <img
                                                src={brand.logoUrl}
                                                alt={brand.name}
                                                style={{ width: "42px", height: "42px", objectFit: "contain", borderRadius: "6px", border: "1px solid #e5e7eb", padding: "2px" }}
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
                                    <td style={{ padding: "14px 16px", fontWeight: "600", color: "#111827" }}>
                                        {brand.name}
                                    </td>
                                    {/* Slug */}
                                    <td style={{ padding: "14px 16px" }}>
                                        <span style={{ backgroundColor: "#f3f4f6", color: "#4b5563", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontFamily: "monospace" }}>
                                            {brand.slug}
                                        </span>
                                    </td>
                                    {/* Description */}
                                    <td style={{ padding: "14px 16px", color: "#4b5563", fontSize: "13px", maxWidth: "250px" }}>
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
                                                style={{ background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#374151" }}
                                            >
                                                <i className="fas fa-edit"></i> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id, brand.name)}
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

            {/* Modal */}
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
                        maxWidth: "520px",
                        padding: "28px"
                    }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "16px" }}>
                            {editingBrand ? "✏️ Edit Brand" : "✨ Add New Brand"}
                        </h2>

                        {error && (
                            <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Brand Name */}
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Brand Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Nike, Adidas, Rolex, Zara"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                                />
                            </div>

                            {/* Cloudinary Brand Logo Upload */}
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Brand Logo</label>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
                                            borderRadius: "6px",
                                            backgroundColor: "#f3f4f6",
                                            border: "1px solid #d1d5db",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            fontSize: "13px"
                                        }}
                                    >
                                        {imageUploading ? "Uploading to Cloudinary..." : "📁 Upload Brand Logo"}
                                    </button>

                                    {formData.logoUrl && (
                                        <img
                                            src={formData.logoUrl}
                                            alt="Preview"
                                            style={{ width: "45px", height: "45px", objectFit: "contain", borderRadius: "6px", border: "1px solid #ccc", padding: "2px" }}
                                        />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Or paste direct Logo URL"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    style={{ width: "100%", marginTop: "6px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "12px" }}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief details about the brand story or products..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                                />
                            </div>

                            {/* Modal Actions */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={imageUploading}
                                    style={{ padding: "8px 20px", borderRadius: "6px", border: "none", background: "#088178", color: "#fff", fontWeight: "700", cursor: "pointer" }}
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
