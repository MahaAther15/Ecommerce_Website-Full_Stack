"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserProfileApi, updateUserProfileApi, deleteUserAccountApi } from "@/app/libs/userApi";
import {
  getUserAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
  AddressDto,
  CreateAddressDto,
} from "@/app/libs/addressApi";
import { logout } from "@/app/libs/authApi";
import { UserProfile, UpdateProfileData } from "@/app/types/user";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { logout as reduxLogout } from "@/app/redux/slices/authslice";
import { resetWishlist } from "@/app/redux/slices/wishlistslice";
import { fetchMyOrders } from "@/app/redux/slices/orderSlice";

const ORDER_STATUS_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  Pending:   { color: "#d97706", bg: "#fef3c7", icon: "fas fa-clock" },
  Confirmed: { color: "#2563eb", bg: "#dbeafe", icon: "fas fa-check-circle" },
  Shipped:   { color: "#7c3aed", bg: "#ede9fe", icon: "fas fa-shipping-fast" },
  Delivered: { color: "#16a34a", bg: "#dcfce7", icon: "fas fa-box-open" },
  Cancelled: { color: "#dc2626", bg: "#fee2e2", icon: "fas fa-times-circle" },
};

export default function ProfileDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { myOrders = [], loading: ordersLoading = false } = useAppSelector((state) => state.order) ?? {};
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

  // 📍 Address Management States
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [addressLoading, setAddressLoading] = useState<boolean>(false);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressFormData, setAddressFormData] = useState<CreateAddressDto>({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    addressType: "Home",
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState<boolean>(false);
  const [addressModalError, setAddressModalError] = useState<string | null>(null);

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
    if (user?.role?.toLowerCase() === "admin") {
      router.replace("/admin/products");
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const data = await getUserProfileApi();
        if (data.role?.toLowerCase() === "admin") {
          router.replace("/admin/products");
          return;
        }
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
  }, [user, router]);

  // Fetch orders when the orders tab is opened
  useEffect(() => {
    if (activeTab === "orders") {
      dispatch(fetchMyOrders());
    }
  }, [activeTab]);

  // 📍 Fetch addresses from backend
  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const data = await getUserAddressesApi();
      setAddresses(data);
    } catch (err: any) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "address" || activeTab === "dashboard") {
      fetchAddresses();
    }
  }, [activeTab]);

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressFormData({
      fullName: profile?.fullName || "",
      phoneNumber: profile?.phoneNumber || "",
      streetAddress: "",
      city: profile?.city || "",
      state: profile?.state || "",
      postalCode: profile?.postalCode || "",
      country: "Pakistan",
      addressType: "Home",
      isDefault: addresses.length === 0,
    });
    setAddressModalError(null);
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: AddressDto) => {
    setEditingAddressId(addr.id);
    setAddressFormData({
      fullName: addr.fullName,
      phoneNumber: addr.phoneNumber,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "Pakistan",
      addressType: (addr.addressType as any) || "Home",
      isDefault: addr.isDefault,
    });
    setAddressModalError(null);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressModalError(null);
    try {
      if (editingAddressId) {
        await updateAddressApi(editingAddressId, addressFormData);
        setSuccessMessage("Address updated successfully!");
      } else {
        await createAddressApi(addressFormData);
        setSuccessMessage("New address added successfully!");
      }
      setShowAddressModal(false);
      await fetchAddresses();
    } catch (err: any) {
      setAddressModalError(err.message || "Failed to save address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddressApi(id);
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        setSuccessMessage("Address deleted successfully!");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to delete address.");
      }
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await setDefaultAddressApi(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      setSuccessMessage("Default shipping address updated!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to set default address.");
    }
  };

  // Pakistan phone validation: only digits, max 11 (03XX-XXXXXXX)
  const validatePakPhone = (phone?: string): string | null => {
    if (!phone) return null; // optional field
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length > 11) return "Pakistani phone number cannot exceed 11 digits.";
    if (digitsOnly.length > 0 && !digitsOnly.startsWith("03")) return "Pakistani number must start with 03.";
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For phone fields: allow only digits, max 11
    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 11) return; // block typing beyond 11 digits
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate phone before submit
    const phoneErr = validatePakPhone(formData.phoneNumber);
    if (phoneErr) {
      setErrorMessage(phoneErr);
      return;
    }
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
    dispatch(resetWishlist());
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
      className="profile-dashboard-wrapper"
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
        className="profile-dashboard-container"
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
          className="profile-dashboard-sidebar"
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
          <nav className="profile-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
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
            className="profile-sidebar-promo"
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
        <main className="profile-dashboard-main" style={{ flex: 1, backgroundColor: "#faf8f5", display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Top Header Bar */}
          <header
            className="profile-header-bar"
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
          <div className="profile-content-area" style={{ padding: "24px 30px", flex: 1 }}>

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
                <div className="profile-quick-actions" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "24px" }}>
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
                <div className="profile-details-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr", gap: "18px", marginBottom: "22px" }}>

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
              </>
            )}

            {/* ═══ EDIT PROFILE TAB ═══ */}
            {activeTab === "profile" && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #f0ebe6", padding: "28px", borderRadius: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "800", color: "#1a1a1a" }}>Edit Personal Profile</h3>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "24px" }}>Update your display name and contact details.</p>

                <form onSubmit={handleSubmit}>
                  <div className="profile-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
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
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "6px" }}>Phone Number <span style={{ fontWeight: "400", color: "#9ca3af" }}>(Pakistan: 03XX-XXXXXXX)</span></label>
                      <input type="tel" name="phoneNumber" placeholder="03001234567" value={formData.phoneNumber} onChange={handleChange}
                        maxLength={11}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${validatePakPhone(formData.phoneNumber) ? "#dc2626" : "#e5e0db"}`, outline: "none", fontSize: "13px", backgroundColor: "#faf8f5", letterSpacing: "1px" }}
                      />
                      {validatePakPhone(formData.phoneNumber) && (
                        <p style={{ color: "#dc2626", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                          <i className="fas fa-exclamation-circle" style={{ marginRight: "4px" }} />
                          {validatePakPhone(formData.phoneNumber)}
                        </p>
                      )}
                      <p style={{ color: "#9ca3af", fontSize: "11px", marginTop: "4px" }}>{(formData.phoneNumber?.length || 0)}/11 digits</p>
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

            {/* ═══ SAVED ADDRESSES TAB ═══ */}
            {activeTab === "address" && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #f0ebe6", padding: "28px", borderRadius: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "800", color: "#1a1a1a" }}>My Saved Addresses</h3>
                    <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>Manage your delivery addresses for quick and seamless checkout.</p>
                  </div>
                  <button
                    onClick={handleOpenAddAddress}
                    style={{
                      backgroundColor: "#088178",
                      color: "#fff",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="fas fa-plus"></i> Add New Address
                  </button>
                </div>

                {addressLoading && (
                  <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "24px", marginBottom: "10px", display: "block" }}></i>
                    Loading your saved addresses...
                  </div>
                )}

                {!addressLoading && addresses.length === 0 && (
                  <div style={{ padding: "48px 20px", textAlign: "center", border: "2px dashed #f0ebe6", borderRadius: "14px", backgroundColor: "#faf8f5" }}>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>📍</div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "700", color: "#374151" }}>No Saved Addresses Yet</h4>
                    <p style={{ margin: "0 0 18px 0", fontSize: "13px", color: "#6b7280" }}>
                      Add your home or office address to enable 1-click checkout.
                    </p>
                    <button
                      onClick={handleOpenAddAddress}
                      style={{
                        backgroundColor: "#088178",
                        color: "#fff",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      + Add Your First Address
                    </button>
                  </div>
                )}

                {!addressLoading && addresses.length > 0 && (
                  <div className="profile-address-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        style={{
                          border: addr.isDefault ? "2px solid #088178" : "1px solid #e5e7eb",
                          borderRadius: "14px",
                          padding: "18px",
                          backgroundColor: addr.isDefault ? "#f0fdfa" : "#ffffff",
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "700",
                                backgroundColor: addr.addressType === "Office" ? "#ede9fe" : "#fef3c7",
                                color: addr.addressType === "Office" ? "#6d28d9" : "#b45309",
                              }}
                            >
                              <i className={addr.addressType === "Office" ? "fas fa-building" : "fas fa-home"}></i>
                              {addr.addressType}
                            </span>

                            {addr.isDefault && (
                              <span
                                style={{
                                  backgroundColor: "#088178",
                                  color: "#ffffff",
                                  fontSize: "10px",
                                  fontWeight: "800",
                                  padding: "3px 8px",
                                  borderRadius: "12px",
                                  textTransform: "uppercase",
                                }}
                              >
                                ★ Default
                              </span>
                            )}
                          </div>

                          <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "800", color: "#1f2937" }}>
                            {addr.fullName}
                          </h4>
                          <div style={{ fontSize: "12px", color: "#088178", fontWeight: "600", marginBottom: "8px" }}>
                            <i className="fas fa-phone-alt" style={{ marginRight: "6px" }}></i>
                            {addr.phoneNumber}
                          </div>

                          <p style={{ margin: "0 0 14px 0", fontSize: "13px", color: "#4b5563", lineHeight: "1.5" }}>
                            {addr.streetAddress}, {addr.city}
                            {addr.state ? `, ${addr.state}` : ""}
                            {addr.postalCode ? ` - ${addr.postalCode}` : ""}, {addr.country}
                          </p>
                        </div>

                        {/* Actions */}
                        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          {!addr.isDefault ? (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#088178",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              Set as Default
                            </button>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "600" }}>
                              <i className="fas fa-check" style={{ marginRight: "4px" }}></i> Active Default
                            </span>
                          )}

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              style={{
                                background: "#f3f4f6",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 10px",
                                fontSize: "12px",
                                color: "#374151",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              style={{
                                background: "#fee2e2",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 10px",
                                fontSize: "12px",
                                color: "#dc2626",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══ ORDERS TAB ═══ */}
            {activeTab === "orders" && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #f0ebe6", borderRadius: "16px", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0ebe6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#1a1a1a" }}>Order History</h3>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#999" }}>All your past purchases</p>
                  </div>
                  <Link href="/orders" style={{ backgroundColor: "#088178", color: "#fff", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="fas fa-external-link-alt" /> View All
                  </Link>
                </div>

                {ordersLoading && (
                  <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: "22px", marginBottom: "10px", display: "block" }} />
                    Loading orders...
                  </div>
                )}

                {!ordersLoading && myOrders.length === 0 && (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <i className="fas fa-box-open" style={{ fontSize: "40px", color: "#e5e7eb", marginBottom: "12px", display: "block" }} />
                    <p style={{ fontSize: "14px", color: "#999", marginBottom: "16px" }}>No orders yet. Start shopping!</p>
                    <Link href="/shop" style={{ backgroundColor: "#088178", color: "#fff", padding: "9px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}>
                      Browse Products
                    </Link>
                  </div>
                )}

                {!ordersLoading && myOrders.slice(0, 5).map((order) => {
                  const cfg = ORDER_STATUS_CFG[order.status] ?? { color: "#6b7280", bg: "#f3f4f6", icon: "fas fa-circle" };
                  const date = new Date(order.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" });
                  const orderCode = order.orderNumber || `ORD-${10000 + order.id}`;
                  return (
                    <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f9f7f5", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "9px 11px" }}>
                          <i className="fas fa-receipt" style={{ color: "#088178", fontSize: "16px" }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: "800", color: "#111", fontSize: "14px" }}>Order #{orderCode}</div>
                          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{date} &middot; {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ backgroundColor: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: "999px", fontWeight: "700", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <i className={cfg.icon} />{order.status}
                        </span>
                        <span style={{ fontWeight: "800", color: "#088178", fontSize: "13px" }}>${order.finalAmount.toLocaleString()}</span>
                        <Link href={`/orders/${order.id}`} style={{ backgroundColor: "#f3f4f6", color: "#374151", padding: "6px 12px", borderRadius: "7px", textDecoration: "none", fontWeight: "700", fontSize: "11px" }}>
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
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

      {/* 📍 ADD / EDIT ADDRESS MODAL */}
      {showAddressModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1f2937" }}>
                {editingAddressId ? "Edit Shipping Address" : "Add New Shipping Address"}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            {addressModalError && (
              <div style={{ backgroundColor: "#fee2e2", border: "1px solid #f87171", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px" }}>
                {addressModalError}
              </div>
            )}

            <form onSubmit={handleSaveAddress}>
              {/* Address Type Selector */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Address Type
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {(["Home", "Office", "Other"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressFormData((prev) => ({ ...prev, addressType: type }))}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: addressFormData.addressType === type ? "2px solid #088178" : "1px solid #d1d5db",
                        backgroundColor: addressFormData.addressType === type ? "#f0fdfa" : "#fff",
                        color: addressFormData.addressType === type ? "#088178" : "#4b5563",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      <i className={type === "Home" ? "fas fa-home" : type === "Office" ? "fas fa-building" : "fas fa-map-pin"} style={{ marginRight: "6px" }}></i>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name & Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Receiver Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.fullName}
                    onChange={(e) => setAddressFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="e.g. John Doe"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={addressFormData.phoneNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      if (digitsOnly.length <= 11) {
                        setAddressFormData((prev) => ({ ...prev, phoneNumber: digitsOnly }));
                      }
                    }}
                    placeholder="03001234567"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${addressFormData.phoneNumber.length > 0 && !addressFormData.phoneNumber.startsWith("03") ? "#dc2626" : "#d1d5db"}`, fontSize: "13px", outline: "none", boxSizing: "border-box", letterSpacing: "1px" }}
                  />
                  {addressFormData.phoneNumber.length > 0 && !addressFormData.phoneNumber.startsWith("03") && (
                    <p style={{ color: "#dc2626", fontSize: "11px", marginTop: "3px", fontWeight: "600" }}>
                      <i className="fas fa-exclamation-circle" style={{ marginRight: "4px" }} />Number must start with 03
                    </p>
                  )}
                  <p style={{ color: "#9ca3af", fontSize: "10px", marginTop: "3px" }}>{addressFormData.phoneNumber.length}/11 digits</p>
                </div>
              </div>

              {/* Street Address */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Street Address *</label>
                <input
                  type="text"
                  required
                  value={addressFormData.streetAddress}
                  onChange={(e) => setAddressFormData((prev) => ({ ...prev, streetAddress: e.target.value }))}
                  placeholder="House #, Street, Area / Sector"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* City & State */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>City *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Lahore"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>State / Province</label>
                  <input
                    type="text"
                    value={addressFormData.state || ""}
                    onChange={(e) => setAddressFormData((prev) => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g. Punjab"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Postal Code & Country */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Postal Code</label>
                  <input
                    type="text"
                    value={addressFormData.postalCode || ""}
                    onChange={(e) => setAddressFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="54000"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>Country *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.country}
                    onChange={(e) => setAddressFormData((prev) => ({ ...prev, country: e.target.value }))}
                    placeholder="e.g. Pakistan"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Is Default Checkbox */}
              <div style={{ marginBottom: "22px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="modalIsDefault"
                  checked={addressFormData.isDefault}
                  onChange={(e) => setAddressFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  style={{ width: "16px", height: "16px", accentColor: "#088178", cursor: "pointer" }}
                />
                <label htmlFor="modalIsDefault" style={{ fontSize: "13px", color: "#374151", cursor: "pointer", fontWeight: "600" }}>
                  Set as my default shipping address
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#4b5563", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  style={{ padding: "10px 22px", borderRadius: "8px", border: "none", backgroundColor: "#088178", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: addressSaving ? "not-allowed" : "pointer" }}
                >
                  {addressSaving ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
