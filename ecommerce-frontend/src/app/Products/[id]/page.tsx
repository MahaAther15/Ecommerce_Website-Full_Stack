"use client";

import { use, useState } from "react";
import Link from "next/link";
import productsData from "@/app/data/products.json";
import ProductGrid from "@/app/Components/Products/ProductGrid";
import Newsletter from "@/app/Components/Layout/Newsletter";
import { Product } from "@/app/types/product";

interface ProductDetailsProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const product = (productsData as Product[]).find((p) => p.id === productId);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("XL");

  const relatedProducts = (productsData as Product[])
    .filter((p) => p.id !== productId)
    .slice(0, 4);

  if (!product) {
    return (
      <div className="section-p1 text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6 text-gray-600">The product you are looking for does not exist.</p>
        <Link href="/Products" className="bg-[#088178] text-white px-6 py-3 rounded-md font-semibold">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <section id="prodetails" className="section-p1 flex flex-col md:flex-row gap-10 mt-6">
        <div className="single-pro-image w-full md:w-1/2">
          <img
            src={product.image}
            alt={product.title}
            className="w-full rounded-2xl border border-gray-200"
          />
        </div>

        <div className="single-pro-details w-full md:w-1/2 flex flex-col justify-start">
          <h6 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">
            Home / {product.brand}
          </h6>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h4>
          <h2 className="text-3xl font-bold text-[#088178] mb-4">${product.price}</h2>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-48 text-sm focus:outline-none"
            >
              <option value="S">Small</option>
              <option value="M">Medium</option>
              <option value="L">Large</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="border border-gray-300 rounded-md p-2 w-20 text-center text-sm focus:outline-none"
            />
            <Link
              href="/cart"
              className="bg-[#088178] text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-[#06645e] transition"
            >
              Add To Cart
            </Link>
          </div>

          <h4 className="text-lg font-bold text-gray-900 mb-2">Product Details</h4>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            The {product.title} by {product.brand} is crafted from 100% premium quality fabric, designed to offer supreme comfort, durability, and modern urban style. Perfect for casual wear and daily adventures.
          </p>
        </div>
      </section>

      {/* Featured / Related Products */}
      <section id="product1" className="section-p1">
        <h2>Featured Products</h2>
        <p>Summer Collection New Modern Design</p>
        <ProductGrid products={relatedProducts} />
      </section>

      <Newsletter />
    </div>
  );
}
