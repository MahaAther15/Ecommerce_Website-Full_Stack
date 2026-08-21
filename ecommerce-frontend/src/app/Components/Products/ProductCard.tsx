"use client";

import { useRouter } from "next/navigation";
import { Product } from "@/app/types/product";
import { useAppDispatch } from "@/app/redux/hooks";
import { addToCart } from "@/app/redux/slices/cartslice";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if user clicked on the cart button directly
    const target = e.target as HTMLElement;
    if (target.closest(".cart-btn")) {
      return;
    }
    router.push(`/Products/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      addToCart({
        id: String(product.id),
        name: product.title,
        price: product.price,
        image: product.imageUrl || (product as any).image || "",
        quantity: 1,
      })
    );
  };

  const imageSrc = product.imageUrl || (product as any).image || "/img/products/f1.jpg";

  return (
    <div className="pro" onClick={handleCardClick}>
      <img
        src={imageSrc}
        alt={product.title}
        style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "20px" }}
      />
      <div className="des">
        <span>{product.brand}</span>
        <h5>{product.title}</h5>
        <div className="start">
          {Array.from({ length: product.rating || 5 }).map((_, index) => (
            <i key={index} className="fas fa-star"></i>
          ))}
        </div>
        <h4>${product.price}</h4>
      </div>
      <button
        type="button"
        className="cart-btn"
        onClick={handleAddToCart}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          position: "absolute",
          bottom: "12px",
          right: "10px",
        }}
        title="Add to Cart"
      >
        <i className="fal fa-shopping-cart cart"></i>
      </button>
    </div>
  );
}
