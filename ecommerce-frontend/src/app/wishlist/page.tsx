"use client";

import { useState, useEffect } from "react";
import WishlistHero from "../Components/Wishlist/WishlistHero";
import WishlistContainer from "../Components/Wishlist/WishlistContainer";
import wishlistData from "@/app/data/wishlist.json";
import { WishlistProduct } from "../types/wishlist";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("wishlistItems");
    if (saved) {
      setWishlistIds(JSON.parse(saved));
    } else {
      // Default initial sample wishlist items (1, 2, 3) for demonstration
      const initialIds = [1, 2, 3];
      setWishlistIds(initialIds);
      localStorage.setItem("wishlistItems", JSON.stringify(initialIds));
    }
    setIsLoaded(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRemove = (productId: number) => {
    const updated = wishlistIds.filter((id) => id !== productId);
    setWishlistIds(updated);
    localStorage.setItem("wishlistItems", JSON.stringify(updated));

    const product = (wishlistData as WishlistProduct[]).find(
      (p) => p.id === productId
    );
    showToast(`${product ? product.name : "Item"} removed from wishlist`);
  };

  const handleClearAll = () => {
    if (wishlistIds.length === 0) {
      showToast("Your wishlist is already empty");
      return;
    }
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      setWishlistIds([]);
      localStorage.setItem("wishlistItems", JSON.stringify([]));
      showToast("All items removed from wishlist");
    }
  };

  const wishlistProducts = (wishlistData as WishlistProduct[]).filter(
    (product) => (isLoaded ? wishlistIds.includes(product.id) : false)
  );

  return (
    <div>
      <WishlistHero />
      <WishlistContainer
        products={wishlistProducts}
        onRemove={handleRemove}
        onClearAll={handleClearAll}
      />

      {toastMessage && (
        <div className="toast show toast-error">
          <i className="far fa-info-circle"></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
