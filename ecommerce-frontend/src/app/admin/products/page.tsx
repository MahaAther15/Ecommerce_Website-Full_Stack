"use client";

import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { fetchProducts, addProduct, editProduct, removeProduct } from "@/app/redux/slices/productSlice";
import { uploadProductImageApi } from "@/app/libs/productApi";
import { Product } from "@/app/types/product";
import { getCategoriesApi, Category } from "@/app/libs/categoryApi";
import { getProductImage } from "@/app/libs/productUtils";

export default function AdminProductsPage() {
    const dispatch = useAppDispatch();
    const { products, loading } = useAppSelector((state) => state.product);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        brand: "",
        category: "featured",
        price: 0,
        originalPrice: 0,
        stockQuantity: 50,
        imageUrl: "",
        description: "",
        isFeatured: false,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dispatch(fetchProducts({ pageSize: 1000 }));
        getCategoriesApi()
            .then((data) => setCategories(data))
            .catch((err) => console.error("Failed to load categories:", err));
    }, [dispatch]);

    const showNotification = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Open Modal for Create or Edit
    const handleOpenModal = (product?: Product) => {
        setModalError(null);
        if (product) {
            setEditingProduct(product);
            setFormData({
                title: product.title,
                brand: product.brand,
                category: product.category,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                stockQuantity: product.stockQuantity,
                imageUrl: product.imageUrl,
                description: product.description,
                isFeatured: product.isFeatured,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                title: "",
                brand: "",
                category: "featured",
                price: 0,
                originalPrice: 0,
                stockQuantity: 50,
                imageUrl: "",
                description: "",
                isFeatured: false,
            });
        }
        setIsModalOpen(true);
    };

    // Image Upload to Cloudinary Handler
    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setModalError(null);

        // Client-side extension validation
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            setModalError("Invalid image format! Only JPG, JPEG, PNG, and WEBP files are allowed.");
            return;
        }

        try {
            setImageUploading(true);
            const secureUrl = await uploadProductImageApi(file);
            setFormData((prev) => ({ ...prev, imageUrl: secureUrl }));
            showNotification("Image uploaded to Cloudinary successfully!");
        } catch (err: any) {
            setModalError(err.message || "Image upload failed. Please try a valid image.");
        } finally {
            setImageUploading(false);
        }
    };

    // Save Product (Create or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);

        if (!formData.imageUrl) {
            setModalError("Please upload an image for this product.");
            return;
        }

        try {
            if (editingProduct) {
                await dispatch(editProduct({ id: editingProduct.id, dto: formData })).unwrap();
                showNotification("Product updated successfully!");
            } else {
                await dispatch(addProduct(formData)).unwrap();
                showNotification("Product created successfully!");
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setModalError(err || "Operation failed. Please check form fields.");
        }
    };

    // Delete Product Handler
    const handleDelete = async (id: number, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await dispatch(removeProduct(id)).unwrap();
                showNotification("Product deleted successfully!");
            } catch (err: any) {
                showNotification(err || "Delete failed.", "error");
            }
        }
    };

    const filteredProducts = products.filter(
        (p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
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
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 999999
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header Bar */}
            <div className="admin-page-header" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "14px"
            }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937", margin: "0 0 4px 0" }}>Products Management</h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Manage inventory, add new stock, update pricing & categories.</p>
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
                        justifyContent: "center",
                        gap: "8px",
                        fontSize: "14px",
                        boxShadow: "0 2px 8px rgba(8,129,120,0.2)"
                    }}
                >
                    <i className="fas fa-plus"></i> Add New Product
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="admin-search-wrapper" style={{ marginBottom: "20px", position: "relative", maxWidth: "450px", width: "100%" }}>
                <i className="fas fa-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "14px" }} />
                <input
                    type="text"
                    placeholder="Search by title, brand or category..."
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

            {/* Products Content */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", fontWeight: "600", backgroundColor: "#fff", borderRadius: "12px" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", marginBottom: "12px", display: "block", color: "#088178" }} />Loading products...
                </div>
            ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af", backgroundColor: "#fff", borderRadius: "12px" }}>
                    <i className="fas fa-inbox" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }} />No products found.
                </div>
            ) : (
                <>
                    {/* ═══ Desktop View (Table) ═══ */}
                    <div className="admin-desktop-view admin-table-card" style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "620px" }}>
                            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                <tr>
                                    <th style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>Image</th>
                                    <th style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>Product</th>
                                    <th style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>Category</th>
                                    <th style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>Price</th>
                                    <th style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>Stock</th>
                                    <th style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((prod) => (
                                    <tr key={prod.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "12px 16px" }}>
                                            <img
                                                src={getProductImage({ id: prod.id, title: prod.title, category: prod.category, imageUrl: prod.imageUrl })}
                                                alt={prod.title}
                                                style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", backgroundColor: "#f3f4f6" }}
                                            />
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ fontWeight: "600", color: "#111827" }}>{prod.title}</div>
                                            <div style={{ fontSize: "12px", color: "#6b7280" }}>{prod.brand}</div>
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" }}>
                                                {prod.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontWeight: "700", color: "#088178" }}>${prod.price}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{ color: prod.stockQuantity > 0 ? "#16a34a" : "#dc2626", fontWeight: "600", fontSize: "13px" }}>
                                                {prod.stockQuantity > 0 ? `${prod.stockQuantity} in stock` : "Out of stock"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    onClick={() => handleOpenModal(prod)}
                                                    style={{ background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#374151", fontWeight: "600", fontSize: "12px" }}
                                                >
                                                    <i className="fas fa-edit"></i> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(prod.id, prod.title)}
                                                    style={{ background: "#fee2e2", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", color: "#dc2626", fontSize: "12px" }}
                                                    title="Delete Product"
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

                    {/* ═══ Mobile View (Cards) ═══ */}
                    <div className="admin-mobile-view" style={{ display: "none", flexDirection: "column", gap: "12px", width: "100%" }}>
                        {filteredProducts.map((prod) => {
                            const isOut = prod.stockQuantity <= 0;
                            const isLow = prod.stockQuantity > 0 && prod.stockQuantity <= 5;
                            const stockColor = isOut ? "#dc2626" : isLow ? "#d97706" : "#16a34a";
                            const stockBg = isOut ? "#fee2e2" : isLow ? "#fef3c7" : "#dcfce7";
                            const stockText = isOut ? "Out of stock" : `${prod.stockQuantity} in stock`;

                            return (
                                <div
                                    key={prod.id}
                                    style={{
                                        backgroundColor: "#fff",
                                        borderRadius: "12px",
                                        padding: "14px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                        border: "1px solid #f3f4f6",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px"
                                    }}
                                >
                                    {/* Top row: Image + Info */}
                                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                        <img
                                            src={getProductImage({ id: prod.id, title: prod.title, category: prod.category, imageUrl: prod.imageUrl })}
                                            alt={prod.title}
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                                flexShrink: 0,
                                                backgroundColor: "#f3f4f6"
                                            }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: "700", color: "#111827", fontSize: "14px", lineHeight: "1.3", marginBottom: "2px" }}>
                                                {prod.title}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
                                                {prod.brand} &middot; ID: #{prod.id}
                                            </div>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                                                <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>
                                                    {prod.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle row: Price & Stock */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingTop: "8px",
                                        borderTop: "1px solid #f3f4f6"
                                    }}>
                                        <div>
                                            <span style={{ fontSize: "11px", color: "#9ca3af", display: "block", textTransform: "uppercase", fontWeight: "600" }}>Price</span>
                                            <span style={{ fontWeight: "800", color: "#088178", fontSize: "16px" }}>${prod.price}</span>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{ fontSize: "11px", color: "#9ca3af", display: "block", textTransform: "uppercase", fontWeight: "600" }}>Stock</span>
                                            <span style={{
                                                backgroundColor: stockBg,
                                                color: stockColor,
                                                padding: "3px 8px",
                                                borderRadius: "999px",
                                                fontWeight: "700",
                                                fontSize: "11px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px"
                                            }}>
                                                <i className={`fas ${isOut ? "fa-times-circle" : isLow ? "fa-exclamation-triangle" : "fa-check-circle"}`} style={{ fontSize: "10px" }} />
                                                {stockText}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom row: Actions */}
                                    <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
                                        <button
                                            onClick={() => handleOpenModal(prod)}
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
                                            onClick={() => handleDelete(prod.id, prod.title)}
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
                            );
                        })}
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
                        maxWidth: "560px",
                        maxHeight: "92vh",
                        overflowY: "auto",
                        padding: "24px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#1f2937" }}>
                                {editingProduct ? "✏️ Edit Product" : "✨ Add New Product"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: "none", border: "none", fontSize: "18px", color: "#9ca3af", cursor: "pointer", padding: "4px" }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* In-Modal Error Alert Banner */}
                        {modalError && (
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
                                <i className="fas fa-exclamation-circle" style={{ fontSize: "16px" }}></i>
                                <span>{modalError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none" }}
                                />
                            </div>

                            <div className="admin-form-row" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                <div style={{ flex: "1 1 200px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Brand</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none" }}
                                    />
                                </div>
                                <div style={{ flex: "1 1 200px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", backgroundColor: "#fff" }}
                                    >
                                        <option value="featured">Featured (Default)</option>
                                        <option value="newArrival">New Arrival (Default)</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.slug || cat.name.toLowerCase()}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-row" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                <div style={{ flex: "1 1 200px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none" }}
                                    />
                                </div>
                                <div style={{ flex: "1 1 200px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Stock Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none" }}
                                    />
                                </div>
                            </div>

                            {/* Cloudinary Image Upload Section */}
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Product Image</label>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageFileChange}
                                        style={{ display: "none" }}
                                    />
                                    <button
                                        type="button"
                                        disabled={imageUploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            padding: "9px 16px",
                                            borderRadius: "8px",
                                            backgroundColor: "#f3f4f6",
                                            border: "1px solid #d1d5db",
                                            cursor: "pointer",
                                            fontWeight: "700",
                                            fontSize: "13px",
                                            color: "#374151"
                                        }}
                                    >
                                        {imageUploading ? "Uploading to Cloudinary..." : "📁 Choose Image"}
                                    </button>
                                    {formData.imageUrl && (
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                        />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Or paste direct Cloudinary Image URL"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    style={{ width: "100%", marginTop: "8px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "12px", outline: "none" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Description</label>
                                <textarea
                                    rows={3}
                                    required
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
                                    disabled={imageUploading}
                                    style={{ flex: 1, padding: "10px 20px", borderRadius: "8px", border: "none", background: "#088178", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                                >
                                    {editingProduct ? "Update Product" : "Create Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
