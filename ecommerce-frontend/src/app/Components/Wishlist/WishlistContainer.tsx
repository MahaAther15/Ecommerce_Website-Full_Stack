"use client";

import { WishlistProduct } from "@/app/types/wishlist";
import WishlistItem from "./WishlistItem";
import WishListEmpty from "./WishListEmpty";
import { useRouter } from "next/navigation";

interface WishlistContainerProps {
  products: WishlistProduct[];
  onRemove: (id: number) => void;
  onClearAll: () => void;
}

export default function WishlistContainer({
  products,
  onRemove,
  onClearAll,
}: WishlistContainerProps) {
  const router = useRouter();

  return (
    <section id="wishlist-container">
      <div className="wishlist-header">
        <h1>
          <i className="far fa-heart"></i> My Saved Items{" "}
          <span className="wishlist-count">
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </h1>
        <div className="wishlist-actions">
          <button
            className="btn btn-primary"
            onClick={() => router.push("/shop")}
          >
            <i className="far fa-shopping-cart"></i> Continue Shopping
          </button>
          <button className="btn btn-secondary" onClick={onClearAll}>
            <i className="far fa-trash-alt"></i> Clear All
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <WishListEmpty />
      ) : (
        <div className="wishlist-grid">
          {products.map((product) => (
            <WishlistItem
              key={product.id}
              product={product}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  );
}
