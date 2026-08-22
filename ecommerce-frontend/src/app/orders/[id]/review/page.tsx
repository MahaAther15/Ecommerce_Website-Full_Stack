"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { fetchOrderById } from "@/app/redux/slices/orderSlice";
import { submitReview, fetchOrderReviews } from "@/app/redux/slices/reviewSlice";

export default function OrderReviewPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { selectedOrder, loading } = useAppSelector((state) => state.order || {});
    const { orderReviews = [], submitting = false, error = null } = useAppSelector((state) => state.review || {});

    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [rating, setRating] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(Number(id)));
            dispatch(fetchOrderReviews(Number(id)));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (selectedOrder && selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && !selectedProductId) {
            setSelectedProductId(selectedOrder.orderItems[0].productId);
        }
    }, [selectedOrder, selectedProductId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !selectedOrder) return;

        const formData = new FormData();
        formData.append("productId", selectedProductId.toString());
        formData.append("orderId", selectedOrder.id.toString());
        formData.append("rating", rating.toString());
        formData.append("title", title);
        formData.append("comment", comment);
        if (imageFile) {
            formData.append("image", imageFile);
        }

        const res = await dispatch(submitReview(formData));
        if (submitReview.fulfilled.match(res)) {
            setSuccessMsg("🎉 Thank you! Your review and photo were uploaded successfully.");
            setTitle("");
            setComment("");
            handleRemoveImage();
            dispatch(fetchOrderReviews(selectedOrder.id));
        }
    };

    if (loading || !selectedOrder) {
        return <div style={{ padding: "80px 20px", textAlign: "center" }}>Loading review portal...</div>;
    }

    const reviewedProductIds = new Set((orderReviews || []).map((r) => r.productId));

    return (
        <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "'Inter', sans-serif" }}>
            <Link href={`/orders/${selectedOrder.id}`} style={{ color: "#088178", textDecoration: "none", fontWeight: "600", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                <i className="fas fa-arrow-left" /> Back to Order #{selectedOrder.orderNumber || selectedOrder.id}
            </Link>

            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Write a Customer Review</h1>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>Select a product from your order to rate and share your experience.</p>

            {successMsg && (
                <div style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "14px", borderRadius: "10px", marginBottom: "20px", fontWeight: "600" }}>
                    {successMsg}
                </div>
            )}

            {error && (
                <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "14px", borderRadius: "10px", marginBottom: "20px", fontWeight: "600" }}>
                    {error}
                </div>
            )}

            {/* Product Selection Chips */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
                {(selectedOrder.orderItems || []).map((item) => {
                    const isSelected = selectedProductId === item.productId;
                    const isDone = reviewedProductIds.has(item.productId);
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedProductId(item.productId)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 14px",
                                borderRadius: "12px",
                                border: isSelected ? "2px solid #088178" : "1px solid #e5e7eb",
                                backgroundColor: isSelected ? "#f0fdf4" : "#fff",
                                cursor: "pointer",
                                position: "relative",
                            }}
                        >
                            {item.productImage && (
                                <img src={item.productImage} alt={item.productTitle} style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }} />
                            )}
                            <span style={{ fontSize: "13px", fontWeight: "700", color: isSelected ? "#088178" : "#374151" }}>{item.productTitle}</span>
                            {isDone && <span style={{ backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "11px", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>✓ Reviewed</span>}
                        </button>
                    );
                })}
            </div>

            {/* Review & Photo Form */}
            <form onSubmit={handleSubmit} style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                {/* Star Rating */}
                <div style={{ marginBottom: "22px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>Overall Rating</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i
                                key={star}
                                className="fas fa-star"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                style={{
                                    fontSize: "28px",
                                    cursor: "pointer",
                                    color: star <= (hoverRating || rating) ? "#f59e0b" : "#e5e7eb",
                                    transition: "color 0.15s ease",
                                }}
                            />
                        ))}
                        <span style={{ marginLeft: "10px", fontSize: "14px", fontWeight: "700", color: "#d97706", alignSelf: "center" }}>
                            {["Poor", "Fair", "Good", "Very Good", "Excellent!"][rating - 1]}
                        </span>
                    </div>
                </div>

                {/* Review Title */}
                <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Review Title / Headline</label>
                    <input
                        type="text"
                        placeholder="e.g. Super comfortable and fits perfectly!"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    />
                </div>

                {/* Review Comment */}
                <div style={{ marginBottom: "22px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Detailed Review *</label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Write what you liked or disliked about the fabric, size, packaging..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    />
                </div>

                {/* Photo Upload Section */}
                <div style={{ marginBottom: "26px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>
                        <i className="fas fa-camera" style={{ marginRight: "6px", color: "#088178" }} /> Upload Photo (Optional)
                    </label>
                    {!imagePreview ? (
                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d5db", borderRadius: "12px", padding: "24px", cursor: "pointer", backgroundColor: "#f9fafb" }}>
                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: "28px", color: "#9ca3af", marginBottom: "6px" }} />
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Click to upload product photo</span>
                            <span style={{ fontSize: "11px", color: "#9ca3af" }}>PNG, JPG or WEBP (Max 5MB)</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                        </label>
                    ) : (
                        <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                            <img src={imagePreview} alt="Upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                style={{ position: "absolute", top: "4px", right: "4px", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "11px" }}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        backgroundColor: "#088178",
                        color: "#fff",
                        border: "none",
                        padding: "14px 28px",
                        borderRadius: "10px",
                        fontWeight: "700",
                        fontSize: "15px",
                        cursor: submitting ? "not-allowed" : "pointer",
                        opacity: submitting ? 0.7 : 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    {submitting ? "Uploading & Submitting..." : "Submit Review"}
                </button>
            </form>
        </div>
    );
}
