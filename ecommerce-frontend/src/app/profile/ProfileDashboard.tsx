"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserProfileApi, updateUserProfileApi, deleteUserAccountApi } from "@/app/libs/userApi";
import { logout } from "@/app/libs/authApi";
import { UserProfile, UpdateProfileData } from "@/app/types/user";
import { useAppDispatch } from "@/app/redux/hooks";
import { logout as reduxLogout } from "@/app/redux/slices/authslice";

export default function ProfileDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"dashboard" | "profile" | "address" | "orders" | "settings">("dashboard");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UpdateProfileData>({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🛑 GitHub-style Delete Account Modal States
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [typedEmail, setTypedEmail] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  // Check if typed text matches profile email exactly
  const isEmailMatch = profile?.email
    ? typedEmail.trim().toLowerCase() === profile.email.trim().toLowerCase()
    : false;

  const handleConfirmDelete = async () => {
    if (!isEmailMatch) return;

    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccessMessage(null);

    try {
      // 1. Call Backend Delete API
      await deleteUserAccountApi(typedEmail);

      // 2. Clear Session
      logout();
      dispatch(reduxLogout());

      // 3. Show Success Badge in Modal
      setDeleteSuccessMessage("Account deleted successfully! Redirecting to login...");

      // 4. Redirect after short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account. Please try again.");
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const data = await getUserProfileApi();
        setProfile(data);
        setFormData({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          postalCode: data.postalCode || "",
          country: data.country || "",
        });
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const updated = await updateUserProfileApi(formData);
      setProfile(updated);
      setSuccessMessage("Profile & shipping details saved successfully!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    dispatch(reduxLogout());
    router.push("/login");
  };

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!profile) return 0;
    let filled = 0;
    let total = 7;
    if (profile.fullName) filled++;
    if (profile.email) filled++;
    if (profile.phoneNumber) filled++;
    if (profile.address) filled++;
    if (profile.city) filled++;
    if (profile.state) filled++;
    if (profile.country) filled++;
    return Math.round((filled / total) * 100);
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", backgroundColor: "#f5f0eb",
        color: "#088178", fontSize: "18px", fontWeight: "700",
      }}>
        <i className="fas fa-spinner fa-spin" style={{ marginRight: "12px", fontSize: "24px" }}></i>
        Loading Account Dashboard...
      </div>
    );
  }

  const firstName = profile?.fullName ? profile.fullName.split(" ")[0] : "User";
  const completionPct = getProfileCompletion();
  const circumference = 2 * Math.PI * 54;
  const strokeDash = (completionPct / 100) * circumference;

  // Sidebar menu items
  const menuItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: "fas fa-home" },
    { id: "profile" as const, label: "Profile Info", icon: "fas fa-user" },
    { id: "address" as const, label: "Shipping Address", icon: "fas fa-map-marker-alt" },
    { id: "orders" as const, label: "Orders", icon: "fas fa-box" },
    { id: "settings" as const, label: "Settings", icon: "fas fa-cog" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f0eb",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Outer Dashboard Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1280px",
          height: "calc(100vh - 48px)",
          maxHeight: "860px",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
          display: "flex",
          overflow: "hidden",
        }}
      >

        {/* ───── LEFT SIDEBAR ───── */}
        <aside
          style={{
            width: "230px",
            background: "linear-gradient(180deg, #088178 0%, #065c54 100%)",
            padding: "28px 16px",
            display: "flex",
            flexDirection: "column",
            color: "#ffffff",
            flexShrink: 0,
            borderRadius: "24px 0 0 24px",
          }}
        >
          {/* Logo / Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", paddingLeft: "4px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              backgroundColor: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>
              <i className="fas fa-leaf"></i>
            </div>
            <span style={{ fontSize: "16px", fontWeight: "800", letterSpacing: "0.5px" }}>
              Cara Store
            </span>
          </div>

          {/* Navigation Menu */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 16px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: activeTab === item.id ? "#ffffff" : "transparent",
                  color: activeTab === item.id ? "#088178" : "rgba(255,255,255,0.8)",
                  fontWeight: activeTab === item.id ? "700" : "500",
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <i className={item.icon} style={{ width: "18px", fontSize: "14px" }}></i>
                {item.label}
              </button>
            ))}

            {/* Wishlist (external link) */}
            <Link
              href="/wishlist"
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 16px", borderRadius: "12px",
                color: "rgba(255,255,255,0.8)", fontWeight: "500",
                fontSize: "13px", textDecoration: "none",
              }}
            >
              <i className="fas fa-heart" style={{ width: "18px", fontSize: "14px" }}></i>
              Wishlist
            </Link>
          </nav>

          {/* Bottom Illustration Card */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🛍️</div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", margin: "0 0 10px 0", lineHeight: "1.4" }}>
              Explore our latest arrivals & deals
            </p>
            <Link
              href="/shop"
              style={{
                display: "inline-block",
                backgroundColor: "#ffffff",
                color: "#088178",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Visit Shop
            </Link>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 16px", borderRadius: "10px",
              border: "none", backgroundColor: "transparent",
              color: "rgba(255,255,255,0.7)", fontWeight: "600",
              fontSize: "13px", cursor: "pointer",
            }}
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </aside>

        {/* ───── RIGHT MAIN PANEL ───── */}
        <main style={{ flex: 1, backgroundColor: "#faf8f5", display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Top Header Bar */}
          <header
            style={{
              padding: "18px 30px",
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #f0ebe6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1a1a1a" }}>
                My Account
              </h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#888" }}>
                Welcome back, {firstName}! Manage your profile & orders.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Link
                href="/"
                style={{
                  backgroundColor: "#f0ebe6", color: "#555",
                  padding: "7px 14px", borderRadius: "20px",
                  fontSize: "12px", fontWeight: "600", textDecoration: "none",
                  display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                <i className="fas fa-arrow-left" style={{ fontSize: "10px" }}></i> Back to Home
              </Link>

              {/* User avatar pill */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                backgroundColor: "#f0ebe6", padding: "5px 12px 5px 5px",
                borderRadius: "20px",
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  backgroundColor: "#088178", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "700",
                }}>
                  {firstName.charAt(0)}
                </div>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#333" }}>
                  {profile?.email}
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Padding */}
          <div style={{ padding: "24px 30px", flex: 1 }}>

            {/* 🔴 Error Alert */}
            {errorMessage && (
              <div style={{
                backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca",
                padding: "12px 18px", borderRadius: "12px", marginBottom: "18px",
                fontSize: "13px", fontWeight: "600",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <i className="fas fa-exclamation-triangle"></i> {errorMessage}
              </div>
            )}

            {/* 🟢 Success Alert */}
            {successMessage && (
              <div style={{
                backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0",
                padding: "12px 18px", borderRadius: "12px", marginBottom: "18px",
                fontSize: "13px", fontWeight: "600",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <i className="fas fa-check-circle"></i> {successMessage}
              </div>
            )}

            {/* ═══ DASHBOARD TAB ═══ */}
            {activeTab === "dashboard" && (
              <>
                {/* Quick Action Icon Cards Row (Matching mockup app icons row) */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "24px" }}>
                  {[
                    { icon: "fas fa-user-circle", label: "Profile", color: "#088178", bg: "#e6f7f5", tab: "profile" as const },
                    { icon: "fas fa-map-marker-alt", label: "Address", color: "#d97706", bg: "#fef3c7", tab: "address" as const },
                    { icon: "fas fa-box", label: "Orders", color: "#7c3aed", bg: "#ede9fe", tab: "orders" as const },
                    { icon: "fas fa-heart", label: "Wishlist", color: "#dc2626", bg: "#fee2e2", tab: null },
                    { icon: "fas fa-cog", label: "Settings", color: "#475569", bg: "#f1f5f9", tab: "settings" as const },
                  ].map((card, i) => (
                    <button
                      key={i}
                      onClick={() => card.tab ? setActiveTab(card.tab) : router.push("/wishlist")}
                      style={{
                        backgroundColor: "#ffffff", border: "1px solid #f0ebe6",
                        borderRadius: "16px", padding: "18px 12px",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: "10px",
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "14px",
                        backgroundColor: card.bg, color: card.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "18px",
                      }}>
                        <i className={card.icon}></i>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#444" }}>{card.label}</span>
                    </button>
                  ))}
                </div>

                {/* Middle Section: 3 columns */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr", gap: "18px", marginBottom: "22px" }}>

                  {/* Column 1: Personal Details Table */}
                  <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #f0ebe6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#1a1a1a" }}>Personal Details</h4>
                      <button onClick={() => setActiveTab("profile")} style={{ background: "none", border: "none", color: "#088178", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}>
                        Edit <i className="fas fa-pen" style={{ fontSize: "10px" }}></i>
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[
                        { label: "Full Name", value: profile?.fullName, icon: "fas fa-user" },
                        { label: "Email", value: profile?.email, icon: "fas fa-envelope" },
                        { label: "Phone", value: profile?.phoneNumber || "Not added", icon: "fas fa-phone" },
                        { label: "Role", value: profile?.role, icon: "fas fa-id-badge" },
                      ].map((row, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          padding: "8px 10px", backgroundColor: "#faf8f5",
                          borderRadius: "10px",
                        }}>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "8px",
                            backgroundColor: "#e6f7f5", color: "#088178",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "12px",
                          }}>
                            <i className={row.icon}></i>
                          </div>
                          <div>
                            <span style={{ fontSize: "10px", color: "#999", fontWeight: "600", display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>{row.label}</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: row.value && row.value !== "Not added" ? "#333" : "#bbb" }}>{row.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Shipping Address Preview */}
                  <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #f0ebe6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#1a1a1a" }}>Shipping Address</h4>
                      <button onClick={() => setActiveTab("address")} style={{ background: "none", border: "none", color: "#088178", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}>
                        Edit <i className="fas fa-pen" style={{ fontSize: "10px" }}></i>
                      </button>
                    </div>

                    {profile?.address ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                          { label: "Street", value: profile.address, icon: "fas fa-road" },
                          { label: "City", value: profile.city, icon: "fas fa-city" },
                          { label: "State", value: profile.state, icon: "fas fa-flag" },
                          { label: "Country", value: `${profile.country} ${profile.postalCode ? `- ${profile.postalCode}` : ""}`, icon: "fas fa-globe" },
                        ].map((row, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: "12px",
                            padding: "8px 10px", backgroundColor: "#faf8f5",
                            borderRadius: "10px",
                          }}>
                            <div style={{
                              width: "30px", height: "30px", borderRadius: "8px",
                              backgroundColor: "#fef3c7", color: "#d97706",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "12px",
                            }}>
                              <i className={row.icon}></i>
                            </div>
                            <div>
                              <span style={{ fontSize: "10px", color: "#999", fontWeight: "600", display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>{row.label}</span>
                              <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{row.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <i className="fas fa-map-marked-alt" style={{ fontSize: "32px", color: "#ddd", marginBottom: "10px" }}></i>
                        <p style={{ fontSize: "12px", color: "#999", margin: "0 0 12px 0" }}>No shipping address saved yet.</p>
                        <button onClick={() => setActiveTab("address")} style={{ backgroundColor: "#088178", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                          + Add Address
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Profile Completion Donut (Matching mockup Audit circle) */}
                  <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #f0ebe6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700", color: "#1a1a1a", alignSelf: "flex-start" }}>Profile Audit</h4>

                    {/* SVG Donut Chart */}
                    <svg width="130" height="130" viewBox="0 0 120 120" style={{ marginBottom: "12px" }}>
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#f0ebe6" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="54" fill="none"
                        stroke="#088178" strokeWidth="10"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                      <text x="60" y="56" textAnchor="middle" fontSize="24" fontWeight="800" fill="#088178">{completionPct}%</text>
                      <text x="60" y="72" textAnchor="middle" fontSize="9" fontWeight="600" fill="#999">Completed</text>
                    </svg>

                    {/* Breakdown */}
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                        <span style={{ color: "#666" }}>Personal Info</span>
                        <span style={{ fontWeight: "700", color: profile?.phoneNumber ? "#088178" : "#ccc" }}>
                          {profile?.phoneNumber ? "100%" : "66%"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                        <span style={{ color: "#666" }}>Shipping Address</span>
                        <span style={{ fontWeight: "700", color: profile?.address ? "#088178" : "#ccc" }}>
                          {profile?.address ? "100%" : "0%"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Stats Bar Chart (Matching mockup "Request statistic" bar graph) */}
                <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #f0ebe6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#1a1a1a" }}>Account Activity</h4>
                    <span style={{ fontSize: "11px", color: "#999", fontWeight: "600" }}>Last 6 months</span>
                  </div>

                  {/* Bar Chart SVG */}
                  <div style={{ height: "120px", display: "flex", alignItems: "flex-end", gap: "10px", padding: "0 10px" }}>
                    {["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, i) => {
                      const heights = [30, 50, 25, 70, 45, 60, 20];
                      return (
                        <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "90px" }}>
                            <div style={{
                              width: "14px",
                              height: `${heights[i]}%`,
                              backgroundColor: "#088178",
                              borderRadius: "4px 4px 0 0",
                              transition: "height 0.3s ease",
                            }}></div>
                            <div style={{
                              width: "14px",
                              height: `${Math.max(10, heights[i] - 20)}%`,
                              backgroundColor: "#e6f7f5",
                              borderRadius: "4px 4px 0 0",
                            }}></div>
                          </div>
                          <span style={{ fontSize: "10px", color: "#999", fontWeight: "600" }}>{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ═══ EDIT PROFILE TAB ═══ */}
            {activeTab === "profile" && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #f0ebe6", padding: "28px", borderRadius: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "800", color: "#1a1a1a" }}>Edit Personal Profile</h3>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "24px" }}>Update your display name and contact details.</p>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e0db", outline: "none", fontSize: "13px", backgroundColor: "#faf8f5" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>Email (Read-only)</label>
                      <input type="email" value={profile?.email || ""} disabled
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #eee", backgroundColor: "#f5f2ef", color: "#999", fontSize: "13px" }}
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>Phone Number</label>
                      <input type="text" name="phoneNumber" placeholder="+92 300 1234567" value={formData.phoneNumber} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e0db", outline: "none", fontSize: "13px", backgroundColor: "#faf8f5" }}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={saving}
                    style={{ padding: "10px 24px", backgroundColor: "#088178", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: saving ? "not-allowed" : "pointer" }}
                  >
                    {saving ? "Saving..." : "Save Profile Details"}
                  </button>
                </form>
              </div>
            )}

            {/* ═══ EDIT SHIPPING ADDRESS TAB ═══ */}
            {activeTab === "address" && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #f0ebe6", padding: "28px", borderRadius: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "800", color: "#1a1a1a" }}>Default Shipping Address</h3>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "24px" }}>This address will be auto-filled at checkout for shipments.</p>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>Street Address</label>
                    <input type="text" name="address" placeholder="House/Apartment #, Street, Area" value={formData.address} onChange={handleChange}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e0db", outline: "none", fontSize: "13px", backgroundColor: "#faf8f5" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>City</label>
                      <input type="text" name="city" placeholder="e.g. Lahore, Karachi" value={formData.city} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e0db", outline: "none", fontSize: "13px", backgroundColor: "#faf8f5" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>State / Province</label>
                      <input type="text" name="state" placeholder="e.g. Punjab, Sindh" value={formData.state} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e0db", outline: "none", fontSize: "13px", backgroundColor: "#faf8f5" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>Postal / Zip Code</label>
                      <input type="text" name="postalCode" placeholder="54000" value={formData.postalCode} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e0db", outline: "none", fontSize: "13px", backgroundColor: "#faf8f5" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>Country</label>
                      <input type="text" name="country" placeholder="Pakistan" value={formData.country} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e0db", outline: "none", fontSize: "13px", backgroundColor: "#faf8f5" }}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={saving}
                    style={{ padding: "10px 24px", backgroundColor: "#088178", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: saving ? "not-allowed" : "pointer" }}
                  >
                    {saving ? "Saving..." : "Save Shipping Address"}
                  </button>
                </form>
              </div>
            )}

            {/* ═══ ORDERS TAB ═══ */}
            {activeTab === "orders" && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #f0ebe6", padding: "30px", borderRadius: "16px", textAlign: "center" }}>
                <i className="fas fa-box-open" style={{ fontSize: "44px", color: "#ddd", marginBottom: "12px" }}></i>
                <h3 style={{ margin: "0 0 6px 0", color: "#1a1a1a", fontSize: "17px" }}>No Orders Yet</h3>
                <p style={{ fontSize: "13px", color: "#999", marginBottom: "18px" }}>Start shopping to track your order history here.</p>
                <Link href="/shop" style={{ backgroundColor: "#088178", color: "#fff", padding: "10px 22px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}>
                  Browse Products
                </Link>
              </div>
            )}

            {/* ═══ SETTINGS TAB ═══ */}
            {activeTab === "settings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ backgroundColor: "#fff", border: "1px solid #f0ebe6", padding: "28px", borderRadius: "16px" }}>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "800", color: "#1a1a1a" }}>Account & Security Settings</h3>
                  <p style={{ fontSize: "12px", color: "#888", marginBottom: "24px" }}>Manage your account session and permanent data controls.</p>

                  {/* Actions Row: Logout & Delete Account Side-by-Side */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    
                    {/* 1. Logout Box */}
                    <div style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "22px",
                      backgroundColor: "#faf8f5",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <div style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            backgroundColor: "#f1f5f9", color: "#475569",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "14px"
                          }}>
                            <i className="fas fa-sign-out-alt"></i>
                          </div>
                          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1a1a1a" }}>Logout Session</h4>
                        </div>
                        <p style={{ fontSize: "12px", color: "#666", margin: "0 0 20px 0", lineHeight: "1.4" }}>
                          Sign out of your account on this device. You can safely log back in anytime.
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        style={{
                          backgroundColor: "#475569",
                          color: "#fff",
                          padding: "12px 18px",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          transition: "background-color 0.2s"
                        }}
                      >
                        <i className="fas fa-sign-out-alt"></i> Logout of Account
                      </button>
                    </div>

                    {/* 2. Delete Account (Danger Zone) Box */}
                    <div style={{
                      border: "1px solid #feb2b2",
                      borderRadius: "14px",
                      padding: "22px",
                      backgroundColor: "#fff5f5",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <div style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            backgroundColor: "#fee2e2", color: "#dc2626",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "14px"
                          }}>
                            <i className="fas fa-trash-alt"></i>
                          </div>
                          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#c53030" }}>Delete Account</h4>
                        </div>
                        <p style={{ fontSize: "12px", color: "#742a2a", margin: "0 0 20px 0", lineHeight: "1.4" }}>
                          Permanently delete your profile, orders, and addresses. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTypedEmail("");
                          setDeleteError(null);
                          setShowDeleteModal(true);
                        }}
                        style={{
                          backgroundColor: "#e53e3e",
                          color: "#fff",
                          padding: "12px 18px",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 4px 12px rgba(229, 62, 62, 0.25)",
                          transition: "background-color 0.2s"
                        }}
                      >
                        <i className="fas fa-trash-alt"></i> Delete Account
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* 🛑 GITHUB-STYLE DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            maxWidth: "500px",
            width: "100%",
            padding: "32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            animation: "fadeIn 0.2s ease-out"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  backgroundColor: "#fee2e2", color: "#dc2626",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px"
                }}>
                  <i className="fas fa-trash"></i>
                </div>
                <h3 style={{ fontSize: "19px", fontWeight: "800", color: "#1a1a1a", margin: 0 }}>
                  Delete Account
                </h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999" }}
              >
                ✕
              </button>
            </div>

            {/* Warning Callout Box */}
            <div style={{
              backgroundColor: "#fff5f5",
              borderLeft: "4px solid #e53e3e",
              padding: "14px",
              borderRadius: "6px",
              marginBottom: "20px"
            }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#9b2c2c", lineHeight: "1.5" }}>
                <strong>Unexpected bad things will happen if you don’t read this!</strong><br />
                This will permanently delete your account, wishlist, and shipping addresses.
              </p>
            </div>

            {/* Verification Prompt */}
            <p style={{ fontSize: "13px", color: "#4a5568", marginBottom: "10px", lineHeight: "1.4" }}>
              To verify, type your registered email <strong style={{ color: "#088178", userSelect: "all" }}>{profile?.email}</strong> in the box below:
            </p>

            <input
              type="text"
              value={typedEmail}
              onChange={(e) => setTypedEmail(e.target.value)}
              placeholder="Enter your email address"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 14px",
                border: isEmailMatch ? "2px solid #38a169" : "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none",
                marginBottom: "16px",
                boxSizing: "border-box",
                backgroundColor: "#faf8f5"
              }}
            />

            {deleteSuccessMessage && (
              <div style={{
                backgroundColor: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "16px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <i className="fas fa-check-circle" style={{ fontSize: "16px", color: "#16a34a" }}></i>
                {deleteSuccessMessage}
              </div>
            )}

            {deleteError && (
              <div style={{
                backgroundColor: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                marginBottom: "16px",
                fontWeight: "600"
              }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: "6px" }}></i> {deleteError}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                style={{
                  padding: "11px 20px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#edf2f7",
                  color: "#4a5568",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

              {/* Disabled until user types exact email */}
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={!isEmailMatch || deleteLoading}
                style={{
                  padding: "11px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: isEmailMatch ? "#e53e3e" : "#feb2b2",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: isEmailMatch && !deleteLoading ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease"
                }}
              >
                {deleteLoading ? "Deleting Account..." : "I understand, delete my account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
