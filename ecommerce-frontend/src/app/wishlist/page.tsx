"use client";

import { useState, useEffect } from "react";
import WishlistHero from "../Components/Wishlist/WishlistHero";
import WishlistContainer from "../Components/Wishlist/WishlistContainer";
import wishlistData from "@/app/data/wishlist.json";
import { WishlistProduct } from "../types/wishlist";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { removeFromWishlist, clearWishlist } from "../redux/slices/wishlistslice";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRemove = (productId: number) => {
    dispatch(removeFromWishlist(productId));
    const product = (wishlistData as WishlistProduct[]).find(
      (p) => p.id === productId
    );
    showToast(`${product ? product.name : "Item"} removed from wishlist`);
  };

  const handleClearAll = () => {
    if (wishlistItems.length === 0) {
      showToast("Your wishlist is already empty");
      return;
    }
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      dispatch(clearWishlist());
      showToast("All items removed from wishlist");
    }
  };

  const wishlistProducts = (wishlistData as WishlistProduct[]).filter(
    (product) => (mounted ? wishlistItems.some((item) => item.id === product.id) : false)
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
