"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordApi } from "@/app/libs/authApi";
import "../register/register.css";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const res = await forgotPasswordApi(email.trim());
            setMessage(res.message);
        } catch (err: any) {
            setError(err.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                overflow: "hidden",
                padding: "20px",
                backgroundColor: "#f0f4f3",
                fontFamily: "'Inter', system-ui, sans-serif",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "460px",
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    padding: "40px",
                    boxShadow: "0 20px 50px rgba(8, 129, 120, 0.12)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div
                        style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "16px",
                            backgroundColor: "#e0f2f1",
                            color: "#088178",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            margin: "0 auto 16px auto",
                        }}
                    >
                        <i className="fas fa-key"></i>
                    </div>
                    <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1a1a1a", margin: "0 0 8px 0" }}>
                        Forgot Password?
                    </h2>
                    <p style={{ fontSize: "14px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                        Enter your registered email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {message && (
                    <div
                        style={{
                            backgroundColor: "#e0f2f1",
                            color: "#088178",
                            border: "1px solid #088178",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            fontSize: "13px",
                            fontWeight: "600",
                            lineHeight: "1.4",
                        }}
                    >
                        <i className="fas fa-check-circle" style={{ marginRight: "6px" }}></i>
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            backgroundColor: "#f8d7da",
                            color: "#721c24",
                            border: "1px solid #f5c6cb",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            fontSize: "13px",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "8px",
                                border: "1px solid #e1e1e1",
                                outline: "none",
                                fontSize: "14px",
                                backgroundColor: "#fbfbfb",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "13px",
                            backgroundColor: "#088178",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "700",
                            cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 12px rgba(8, 129, 120, 0.25)",
                        }}
                    >
                        {loading ? "Sending link..." : "Send Reset Link"}
                    </button>
                </form>

                <div style={{ marginTop: "24px", textAlign: "center" }}>
                    <Link
                        href="/login"
                        style={{
                            color: "#088178",
                            fontSize: "13px",
                            fontWeight: "700",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <i className="fas fa-arrow-left" style={{ fontSize: "11px" }}></i> Back to Sign in
                    </Link>
                </div>
            </div>
        </section>
    );
}
