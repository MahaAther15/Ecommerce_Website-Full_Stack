"use client";

import { useState, useEffect } from "react";
import WishlistHero from "../Components/Wishlist/WishlistHero";
import WishlistContainer from "../Components/Wishlist/WishlistContainer";
import { WishlistProduct } from "../types/wishlist";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { removeFromWishlist, clearWishlist } from "../redux/slices/wishlistslice";

interface ToastState {
  message: string;
  type: "success" | "info" | "error";
}

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToastBadge = (message: string, type: "success" | "info" | "error" = "info") => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  const handleRemove = (productId: number | string) => {
    const itemToRemove = wishlistItems.find(
      (item) => String(item.id) === String(productId)
    );
    dispatch(removeFromWishlist(productId));
    showToastBadge(
      `"${itemToRemove ? itemToRemove.name : "Item"}" removed from wishlist`,
      "info"
    );
  };

  const handleClearAll = () => {
    if (wishlistItems.length === 0) {
      showToastBadge("Your wishlist is already empty!", "info");
      return;
    }

    // Direct clear without browser alert popup
    dispatch(clearWishlist());
    showToastBadge("All items successfully cleared from your wishlist!", "success");
  };

  // Map Redux wishlist items to WishlistProduct format
  const wishlistProducts: WishlistProduct[] = mounted
    ? wishlistItems.map((item) => {
        const numericId =
          typeof item.id === "number" ? item.id : parseInt(String(item.id), 10) || 1;
        return {
          id: numericId,
          name: item.name,
          category: "Fashion & Lifestyle",
          description: "Premium quality item saved in your personal wishlist.",
          price: Number(item.price) || 0,
          originalPrice: (Number(item.price) || 0) * 1.25,
          discount: 20,
          image: item.image || "/img/products/f1.jpg",
          stock: "in-stock",
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
