"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/app/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if user clicked on the cart button directly
    const target = e.target as HTMLElement;
    if (target.closest(".cart")) {
      return;
    }
    router.push(`/Products/${product.id}`);
  };

  return (
    <div className="pro" onClick={handleCardClick}>
      <img src={product.image} alt={product.title} />
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
      <Link href="/cart" onClick={(e) => e.stopPropagation()}>
        <i className="fal fa-shopping-cart cart"></i>
      </Link>
    </div>
  );
}
