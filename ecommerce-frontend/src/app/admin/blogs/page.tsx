"use client";

import { useEffect, useState, useRef } from "react";
import { getAllBlogsApi, createBlogAdminApi, deleteBlogAdminApi, BlogItem, updateBlogAdminApi } from "@/app/libs/blogApi";
import fallbackBlogs from "@/app/data/blogs.json";
import Link from "next/link";

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<BlogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
    const [deletingBlog, setDeletingBlog] = useState<BlogItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Fashion & Style");
    const [author, setAuthor] = useState("Admin");
    const [authorRole, setAuthorRole] = useState("Store Editor");
    const [readTime, setReadTime] = useState("5 min read");
    const [description, setDescription] = useState("");
    const [quote, setQuote] = useState("");
    const [fullContentStr, setFullContentStr] = useState("");
    const [takeawaysStr, setTakeawaysStr] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadBlogs();
    }, []);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadBlogs = async () => {
        setLoading(true);
        try {
            const data = await getAllBlogsApi();
            if (data && data.length > 0) {
                setBlogs(data);
            } else {
                setBlogs(fallbackBlogs as unknown as BlogItem[]);
            }
        } catch {
            setBlogs(fallbackBlogs as unknown as BlogItem[]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOpenEdit = (blog: BlogItem) => {
        setModalError(null);
        setEditingBlogId(blog.id);
        setTitle(blog.title || "");
        setCategory(blog.category || "Fashion & Style");
        setAuthor(blog.author || "Admin");
        setAuthorRole(blog.authorRole || "Store Editor");
        setReadTime(blog.readTime || "5 min read");
        setDescription(blog.description || "");
        setQuote(blog.quote || "");
        setFullContentStr((blog.fullContent || []).join("\n\n"));
        setTakeawaysStr((blog.keyTakeaways || blog.keyTakeAways || []).join("\n"));
        setImagePreview(blog.imageUrl || blog.image || null);
        setImageFile(null);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError(null);
        try {
            const formData = new FormData();
            formData.append("Title", title);
            formData.append("Category", category);
            formData.append("Author", author);
            formData.append("AuthorRole", authorRole);
            formData.append("ReadTime", readTime);
            formData.append("Description", description);
            formData.append("Quote", quote);

            // Paragraphs & Takeaways
            const paragraphs = fullContentStr.split("\n\n").filter((p) => p.trim());
            paragraphs.forEach((p) => formData.append("FullContent", p));

            const takeaways = takeawaysStr.split("\n").filter((t) => t.trim());
            takeaways.forEach((t) => formData.append("KeyTakeAways", t));

            if (imageFile) {
                formData.append("ImageFile", imageFile);
            }

            if (editingBlogId) {
                // UPDATE existing blog
                await updateBlogAdminApi(editingBlogId, formData);
                showToast("Blog article updated successfully!", "success");
            } else {
                // CREATE new blog
                await createBlogAdminApi(formData);
                showToast("Blog published & Cloudinary image uploaded!", "success");
            }

            setShowModal(false);
            resetForm();
            loadBlogs();
        } catch (err: any) {
            const errorMsg = err.message || "Failed to save blog. Ensure backend is running.";
            setModalError(errorMsg);
            showToast(errorMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingBlog) return;
        setIsDeleting(true);
        try {
            await deleteBlogAdminApi(deletingBlog.id);
            showToast(`Blog "${deletingBlog.title.slice(0, 30)}..." deleted successfully.`, "success");
            setDeletingBlog(null);
            loadBlogs();
        } catch (err: any) {
            showToast(err.message || "Failed to delete blog.", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const resetForm = () => {
        setModalError(null);
        setEditingBlogId(null);
        setTitle("");
        setCategory("Fashion & Style");
        setAuthor("Admin");
        setAuthorRole("Store Editor");
        setReadTime("5 min read");
        setDescription("");
        setQuote("");
        setFullContentStr("");
        setTakeawaysStr("");
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <div style={{ padding: "30px", fontFamily: "'Inter', sans-serif" }}>
            {/* Toast Badge */}
            {toast && (
                <div style={{
                    position: "fixed",
                    top: "24px",
                    right: "24px",
                    backgroundColor: toast.type === "success" ? "#088178" : "#dc2626",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    zIndex: 99999,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}>
                    <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`} />
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: 0 }}>
                        <i className="fas fa-newspaper" style={{ color: "#088178", marginRight: "10px" }} />
                        Blog Articles Management
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
                        Publish articles with direct Cloudinary image uploads
                    </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    style={{
                        backgroundColor: "#088178",
                        color: "#fff",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <i className="fas fa-plus" /> New Blog Post
                </button>
            </div>

            {/* Blog Cards Grid */}
            {loading ? (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>Loading blogs...</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                    {blogs.map((b) => (
                        <div key={b.id} style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                            <img src={b.imageUrl || b.image} alt={b.title} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                            <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#088178", textTransform: "uppercase" }}>{b.category}</span>
                                <h4 style={{ margin: "6px 0", fontSize: "16px", fontWeight: "700", color: "#111827" }}>{b.title}</h4>
                                <p style={{ color: "#6b7280", fontSize: "13px", flex: 1, margin: "0 0 14px 0" }}>{b.description.slice(0, 80)}...</p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: "12px", gap: "6px" }}>
                                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>By {b.author}</span>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            onClick={() => handleOpenEdit(b)}
                                            style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                        >
                                            <i className="fas fa-edit" /> Edit
                                        </button>
                                        <Link
                                            href={`/blogs/${b.id}`}
                                            target="_blank"
                                            style={{ backgroundColor: "#f0fdf4", color: "#088178", textDecoration: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                        >
                                            <i className="fas fa-eye" /> View
                                        </Link>
                                        <button
                                            onClick={() => setDeletingBlog(b)}
                                            style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                        >
                                            <i className="fas fa-trash-alt" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal: Create or Edit Blog */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", maxWidth: "650px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
                        <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "800", color: "#111827" }}>
                            {editingBlogId ? (
                                <><i className="fas fa-edit" style={{ color: "#2563eb", marginRight: "8px" }} />Edit Blog Post</>
                            ) : (
                                <><i className="fas fa-plus" style={{ color: "#088178", marginRight: "8px" }} />Publish New Blog Post</>
                            )}
                        </h3>

                        {modalError && (
                            <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <i className="fas fa-exclamation-circle" />
                                <span>{modalError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {/* Cloudinary Image Picker */}
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                                    Cover Image {editingBlogId ? "(Leave empty to keep existing image)" : "(Uploads to Cloudinary) *"}
                                </label>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} required={!editingBlogId && !imagePreview} style={{ fontSize: "13px" }} />
                                {imagePreview && <img src={imagePreview} alt="Preview" style={{ marginTop: "10px", width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px" }} />}
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Title *</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Category *</label>
                                    <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Read Time</label>
                                    <input type="text" value={readTime} onChange={(e) => setReadTime(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Author Name</label>
                                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Short Description *</label>
                                <textarea rows={2} required value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Quote (Highlighted box)</label>
                                <input type="text" value={quote} onChange={(e) => setQuote(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Full Content (Separate paragraphs with double Enter)</label>
                                <textarea rows={4} value={fullContentStr} onChange={(e) => setFullContentStr(e.target.value)} placeholder="Paragraph 1&#10;&#10;Paragraph 2..." style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Key Takeaways (One per line)</label>
                                <textarea rows={3} value={takeawaysStr} onChange={(e) => setTakeawaysStr(e.target.value)} placeholder="Tip 1&#10;Tip 2" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", backgroundColor: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ padding: "8px 20px", borderRadius: "6px", border: "none", backgroundColor: editingBlogId ? "#2563eb" : "#088178", color: "#fff", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer" }}>
                                    {submitting
                                        ? (editingBlogId ? "Saving Changes..." : "Uploading to Cloudinary...")
                                        : (editingBlogId ? "Save Changes" : "Publish Article")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Card Modal */}
            {deletingBlog && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10000,
                    padding: "20px"
                }}>
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "16px",
                        maxWidth: "440px",
                        width: "100%",
                        padding: "28px",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        textAlign: "center"
                    }}>
                        {/* Warning Icon Badge */}
                        <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            backgroundColor: "#fee2e2",
                            color: "#dc2626",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            margin: "0 auto 16px auto"
                        }}>
                            <i className="fas fa-trash-alt" />
                        </div>

                        <h3 style={{ margin: "0 0 8px 0", fontSize: "19px", fontWeight: "800", color: "#111827" }}>
                            Delete Blog Article?
                        </h3>

                        <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.5", margin: "0 0 20px 0" }}>
                            Are you sure you want to delete <strong style={{ color: "#111827" }}>&ldquo;{deletingBlog.title}&rdquo;</strong>? This action cannot be undone.
                        </p>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeletingBlog(null)}
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "#fff",
                                    color: "#374151",
                                    fontWeight: "600",
                                    cursor: isDeleting ? "not-allowed" : "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: "#dc2626",
                                    color: "#fff",
                                    fontWeight: "700",
                                    cursor: isDeleting ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px"
                                }}
                            >
                                {isDeleting ? (
                                    <>Deleting...</>
                                ) : (
                                    <>
                                        <i className="fas fa-trash-alt" /> Yes, Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
