"use client";

import { useRouter } from "next/navigation";

export default function WishListEmpty() {
  const router = useRouter();

  return (
    <div id="empty-wishlist" className="empty-wishlist">
      <i className="far fa-heart-broken"></i>
      <h3>Your Wishlist is Empty</h3>
      <p>
        You haven't added any items to your wishlist yet. Start browsing our
        collection and save items you love!
      </p>
      <button
        className="btn btn-primary"
        id="browse-products"
        onClick={() => router.push("/shop")}
      >
        <i className="far fa-store"></i> Browse Products
      </button>
    </div>
  );
}
