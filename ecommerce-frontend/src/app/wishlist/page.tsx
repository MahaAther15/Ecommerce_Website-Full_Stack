"use client";

import { useState, useEffect } from "react";
import WishlistHero from "../Components/Wishlist/WishlistHero";
import WishlistContainer from "../Components/Wishlist/WishlistContainer";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchUserWishlist,
  removeWishlistItem,
  clearUserWishlist,
} from "../redux/slices/wishlistslice";
import { getProductImage } from "../libs/productUtils";
import "./wishlist.css";

interface ToastState {
  message: string;
  type: "success" | "info" | "error";
}

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      dispatch(fetchUserWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const showToastBadge = (message: string, type: "success" | "info" | "error" = "info") => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  const handleRemove = (productId: number | string) => {
    const targetId = Number(productId);
    const itemToRemove = wishlistItems.find(
      (item) => item.productId === targetId || item.id === targetId
    );
    dispatch(removeWishlistItem(targetId));
    showToastBadge(
      `"${itemToRemove?.title || itemToRemove?.name || "Item"}" removed from wishlist`,
      "info"
    );
  };

  const handleClearAll = () => {
    if (wishlistItems.length === 0) {
      showToastBadge("Your wishlist is already empty!", "info");
      return;
    }

    dispatch(clearUserWishlist());
    showToastBadge("All items successfully cleared from your wishlist!", "success");
  };

  // Map Redux wishlist items to WishlistProduct format
  const wishlistProducts = mounted
    ? wishlistItems.map((item) => {
        const prodId = item.productId || item.id;
        const mappedId = typeof prodId === "number" ? prodId : parseInt(String(prodId), 10) || 1;
        return {
          id: mappedId,
          name: item.title || item.name || "Product",
          category: item.brand || "Fashion & Lifestyle",
          description: "Premium quality item saved in your personal wishlist.",
          price: Number(item.price) || 0,
          originalPrice: (Number(item.price) || 0) * 1.25,
          discount: 20,
          image: getProductImage({ id: mappedId, imageUrl: item.imageUrl, image: item.image }),
          stock: (item.stockQuantity ?? 10) > 0 ? ("in-stock" as const) : ("out-of-stock" as const),
          rating: 5,
        };
      })
    : [];

  return (
    <div style={{ position: "relative" }}>
      <WishlistHero />

      <WishlistContainer
        products={wishlistProducts}
        onRemove={handleRemove as any}
        onClearAll={handleClearAll}
      />

      {/* Modern Floating Message Badge / Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 20px",
            borderRadius: "10px",
            backgroundColor:
              toast.type === "success"
                ? "#088178"
                : toast.type === "error"
                ? "#dc2626"
                : "#1f2937",
            color: "#ffffff",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            fontSize: "14px",
            fontWeight: "600",
            animation: "slideInUp 0.3s ease",
            maxWidth: "380px",
          }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i
              className={
                toast.type === "success"
                  ? "fas fa-check"
                  : toast.type === "error"
                  ? "fas fa-exclamation-triangle"
                  : "fas fa-info-circle"
              }
              style={{ fontSize: "13px" }}
            ></i>
          </div>
          <span style={{ flex: 1, lineHeight: "1.4" }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.8)",
              cursor: "pointer",
              fontSize: "16px",
              padding: "0 0 0 8px",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
