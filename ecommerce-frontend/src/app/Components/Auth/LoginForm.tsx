"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginApi, googleLoginApi, setAuthSession } from "@/app/libs/authApi";
import Link from "next/link";
import { LoginFormData, AuthFormErrors } from "@/app/types/auth";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const router = useRouter();


  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: AuthFormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AuthFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccessMessage(null);
    try {
      // 1. Call ASP.NET Core Backend Login API
      const response = await loginApi(formData);

      // 2. Save JWT Token & User Data in LocalStorage
      setAuthSession(response);

      // 3. Display success badge in form theme color
      setSuccessMessage(`Login completely successful! Welcome back, ${response.fullName}. Redirecting...`);

      // 4. Redirect after short delay
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to login." });
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("No Google credential received.");
      }

      setLoading(true);
      setErrors({});
      setSuccessMessage(null);

      // Call backend Google Login API
      const response = await googleLoginApi(credentialResponse.credential);

      // Save token and user details to localStorage
      setAuthSession(response);

      setSuccessMessage(`Google sign in successful! Welcome, ${response.fullName}. Redirecting...`);

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      setErrors({ general: err.message || "Google authentication failed. Please try again." });
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
        padding: "20px",
        backgroundColor: "#f0f4f3",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "920px",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 50px rgba(8, 129, 120, 0.12)",
          overflow: "hidden",
          minHeight: "540px",
        }}
      >
        {/* Left Side: Decorative Theme Banner */}
        <div
          style={{
            flex: "1",
            background: "linear-gradient(135deg, #088178 0%, #04524c 100%)",
            padding: "50px 40px",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Floating Circle Shapes matching mockup */}
          <div
            style={{
              position: "absolute",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              top: "-60px",
              left: "-80px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.06)",
              bottom: "-40px",
              right: "-40px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
              bottom: "80px",
              left: "40px",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                opacity: 0.9,
                display: "block",
                marginBottom: "12px",
              }}
            >
              WELCOME BACK
            </span>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "800",
                color: "#ffffff",
                lineHeight: "1.2",
                marginBottom: "18px",
              }}
            >
              CARA ECOMMERCE
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "#e0f2f1",
                lineHeight: "1.6",
                maxWidth: "320px",
                margin: 0,
              }}
            >
              Log in to access your orders, track shipments, wishlist items, and enjoy a seamless shopping experience.
            </p>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div
          style={{
            flex: "1.2",
            padding: "50px 45px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h2
              style={{
                fontSize: "30px",
                fontWeight: "700",
                color: "#1a1a1a",
                marginBottom: "6px",
              }}
            >
              Sign in
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#666666",
                margin: 0,
              }}
            >
              Enter your credentials to manage your account
            </p>
          </div>

          {successMessage && (
            <div
              style={{
                color: "#088178",
                backgroundColor: "#e0f2f1",
                border: "1px solid #088178",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="far fa-check-circle" style={{ fontSize: "16px" }}></i>
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div
              style={{
                color: "#721c24",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Input */}
            <div style={{ marginBottom: "20px", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#888888",
                  fontSize: "15px",
                }}
              >
                <i className="far fa-user"></i>
              </div>
              <input
                type="email"
                name="email"
                placeholder="User Name / Email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "13px 15px 13px 42px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: errors.email ? "1px solid red" : "1px solid #e1e1e1",
                  outline: "none",
                  backgroundColor: "#fbfbfb",
                  transition: "all 0.2s ease",
                }}
              />
              {errors.email && (
                <span
                  style={{
                    color: "red",
                    fontSize: "12px",
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: "18px", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#888888",
                  fontSize: "15px",
                }}
              >
                <i className="far fa-lock"></i>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "13px 80px 13px 42px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: errors.password ? "1px solid red" : "1px solid #e1e1e1",
                  outline: "none",
                  backgroundColor: "#fbfbfb",
                  transition: "all 0.2s ease",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#088178",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
              {errors.password && (
                <span
                  style={{
                    color: "red",
                    fontSize: "12px",
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                fontSize: "13px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#555555",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#088178", cursor: "pointer" }}
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                style={{
                  color: "#088178",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#088178",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.3s ease",
                boxShadow: "0 4px 12px rgba(8, 129, 120, 0.25)",
              }}
            >
              {loading ? "Signing In..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "24px 0",
              color: "#aaa",
              fontSize: "12px",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "#eee" }} />
            <span style={{ padding: "0 12px", textTransform: "lowercase" }}>or</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#eee" }} />
          </div>

          {/* Secondary / Social Sign in */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setErrors({ general: "Google sign-in was unsuccessful. Please try again." });
                }}
                theme="outline"
                size="large"
                shape="rectangular"
                width="350"
                text="continue_with"
              />
            </GoogleOAuthProvider>
          </div>

          {/* Footer Navigation */}
          <p
            style={{
              marginTop: "24px",
              textAlign: "center",
              fontSize: "13px",
              color: "#666666",
              margin: "24px 0 0 0",
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/register"
              style={{
                color: "#088178",
                fontWeight: "700",
                textDecoration: "underline",
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

