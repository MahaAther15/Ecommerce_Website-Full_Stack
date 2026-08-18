"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordApi } from "@/app/libs/authApi";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError("Invalid or missing reset token. Please request a new password reset link.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const res = await resetPasswordApi(token, newPassword);
            setMessage(res.message);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
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
                    <i className="fas fa-lock"></i>
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1a1a1a", margin: "0 0 8px 0" }}>
                    Set New Password
                </h2>
                <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                    Enter a secure new password for your account.
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
                    }}
                >
                    <i className="fas fa-check-circle" style={{ marginRight: "6px" }}></i>
                    {message} Redirecting to login...
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
                <div style={{ marginBottom: "18px", position: "relative" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>
                        New Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        style={{
                            width: "100%",
                            padding: "12px 60px 12px 14px",
                            borderRadius: "8px",
                            border: "1px solid #e1e1e1",
                            outline: "none",
                            fontSize: "14px",
                            backgroundColor: "#fbfbfb",
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            right: "12px",
                            top: "34px",
                            background: "none",
                            border: "none",
                            color: "#088178",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer",
                        }}
                    >
                        {showPassword ? "HIDE" : "SHOW"}
                    </button>
                </div>

                <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>
                        Confirm New Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
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
                    {loading ? "Resetting..." : "Update Password"}
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
    );
}

export default function ResetPasswordPage() {
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
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </section>
    );
}
