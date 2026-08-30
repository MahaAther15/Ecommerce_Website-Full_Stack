"use client";

import { WishlistProduct } from "@/app/types/wishlist";
import { useRouter } from "next/navigation";

interface WishlistItemProps {
  product: WishlistProduct;
  onRemove: (id: number) => void;
}

export default function WishlistItem({ product, onRemove }: WishlistItemProps) {
  const router = useRouter();

  let stockText = "In Stock";
  let stockClass = "in-stock";
  if (product.stock === "low-stock") {
    stockText = "Low Stock";
    stockClass = "low-stock";
  } else if (product.stock === "out-of-stock") {
    stockText = "Out of Stock";
    stockClass = "out-of-stock";
  }

  const origPrice = product.originalPrice ?? product.price;
  const savings = origPrice - product.price;

  return (
    <div className="wishlist-item">
      <div
        className="wishlist-item-remove-icon"
        onClick={() => onRemove(product.id)}
      >
        <i className="far fa-times"></i>
      </div>
      <div className="wishlist-item-img">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="wishlist-item-content">
        <div className="wishlist-item-category">{product.category || "General"}</div>
        <h3 className="wishlist-item-title">{product.name}</h3>
        <p className="wishlist-item-description">{product.description || ""}</p>

        <div className={`item-stock ${stockClass}`}>{stockText}</div>

        <div className="wishlist-item-price">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="original-price">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.discount && product.discount > 0 && (
            <span className="discount-badge">Save {product.discount}%</span>
          )}
        </div>

        {savings > 0 && (
          <p style={{ fontSize: "12px", color: "#27ae60", marginBottom: "15px" }}>
            <i className="far fa-tag"></i> You save ${savings.toFixed(2)}
          </p>
        )}

        <div className="wishlist-item-actions">
          <button
            className="action-btn action-btn-visit"
            onClick={() => router.push(`/shop?id=${product.id}`)}
          >
            <i className="far fa-external-link"></i> View Product
          </button>
          <button
            className="action-btn action-btn-remove"
            onClick={() => onRemove(product.id)}
          >
            <i className="far fa-trash-alt"></i> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
