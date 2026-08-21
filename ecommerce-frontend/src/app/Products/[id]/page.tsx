"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductGrid from "@/app/Components/Products/ProductGrid";
import Newsletter from "@/app/Components/Layout/Newsletter";
import { Product } from "@/app/types/product";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { addToCart } from "@/app/redux/slices/cartslice";
import { toggleWishlist } from "@/app/redux/slices/wishlistslice";
import { fetchProductById, fetchProducts } from "@/app/redux/slices/productSlice";

interface ProductDetailsProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { selectedProduct: product, products: allProducts, loading, error } = useAppSelector(
    (state) => state.product
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedColor, setSelectedColor] = useState("Emerald");
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
      if (!allProducts || allProducts.length === 0) {
        dispatch(fetchProducts({ pageSize: 8 }));
      }
    }
  }, [dispatch, productId]);

  const productImage = product?.imageUrl || (product as any)?.image || "/img/products/f1.jpg";
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl || (product as any).image || "/img/products/f1.jpg");
    }
  }, [product]);

  // Gallery Images (uses product image + default angles)
  const galleryImages = product
    ? [
        productImage,
        "/img/products/f2.jpg",
        "/img/products/f3.jpg",
        "/img/products/f4.jpg",
      ]
    : [];

  const isWishlisted = product
    ? wishlistItems.some((item) => String(item.id) === String(product.id))
    : false;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addToCart({
        id: String(product.id),
        name: `${product.title} (${selectedSize}, ${selectedColor})`,
        price: product.price,
        image: activeImage || productImage,
        quantity: quantity,
      })
    );
    showToast(`🛒 "${product.title}" (${quantity}x) added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    dispatch(
      addToCart({
        id: String(product.id),
        name: `${product.title} (${selectedSize}, ${selectedColor})`,
        price: product.price,
        image: activeImage || productImage,
        quantity: quantity,
      })
    );
    router.push("/cart");
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(
      toggleWishlist({
        id: String(product.id),
        name: product.title,
        price: product.price,
        image: productImage,
      })
    );
    showToast(
      isWishlisted
        ? `💔 Removed from Wishlist`
        : `❤️ Added to Wishlist!`
    );
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== productId)
    .slice(0, 4);

  if (loading) {
    return (
      <div className="section-p1 text-center py-24" style={{ textAlign: "center", padding: "100px 20px" }}>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-teal-600 border-r-transparent mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-600">Loading Product Details...</h3>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="section-p1 text-center py-20" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "12px", color: "#222" }}>Product Not Found</h2>
        <p style={{ color: "#666", marginBottom: "24px" }}>{error || "The product you are looking for does not exist or has been removed."}</p>
        <Link
          href="/Products"
          style={{
            backgroundColor: "#088178",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: "8px",
            fontWeight: "700",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const originalPrice = product.originalPrice || Math.round(product.price * 1.25);
  const savings = originalPrice - product.price;

  const colors = [
    { name: "Emerald", hex: "#088178" },
    { name: "Navy", hex: "#1e3a8a" },
    { name: "Charcoal", hex: "#374151" },
    { name: "Sand", hex: "#d97706" },
  ];

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast show" style={{ zIndex: 9999 }}>
          <i className="fas fa-check-circle" style={{ color: "#2ecc71", fontSize: "18px" }}></i>
          <span style={{ fontWeight: "600", fontSize: "14px" }}>{toastMessage}</span>
        </div>
      )}

      {/* Main Single Product Details Section */}
      <section
        id="prodetails"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "40px",
          maxWidth: "1200px",
          margin: "30px auto",
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        {/* Left: Interactive Image Gallery */}
        <div
          className="single-pro-image"
          style={{
            width: "460px",
            maxWidth: "100%",
            flexShrink: 0,
          }}
        >
          <div
            className="main-img-wrap"
            style={{
              position: "relative",
              width: "100%",
              height: "460px",
              maxHeight: "460px",
              borderRadius: "20px",
              overflow: "hidden",
              backgroundColor: "#f8faf9",
              border: "1px solid #e1eee5",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={activeImage || product.image}
              alt={product.title}
              id="MainImg"
              style={{
                width: "100%",
                height: "100%",
                maxHeight: "460px",
                objectFit: "cover",
                display: "block",
              }}
            />
            <span className="badge-discount">SAVE ${(savings).toFixed(0)}</span>
            <button
              type="button"
              className="wishlist-badge-btn"
              onClick={handleToggleWishlist}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <i
                className={isWishlisted ? "fas fa-heart" : "far fa-heart"}
                style={{ color: isWishlisted ? "#e74c3c" : "#555", fontSize: "18px" }}
              ></i>
            </button>
          </div>

          {/* 4 Thumbnails */}
          <div className="small-img-group">
            {galleryImages.map((imgSrc, idx) => (
              <div
                key={idx}
                className={`small-img-col ${(activeImage || product.image) === imgSrc ? "active" : ""}`}
                onClick={() => setActiveImage(imgSrc)}
                style={{
                  height: "90px",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={imgSrc}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product Details & Controls */}
        <div className="single-pro-details">
          {/* Breadcrumbs */}
          <div className="pro-breadcrumbs">
            <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <span>{product.brand}</span>
          </div>

          {/* Brand Tag */}
          <span className="pro-brand-tag">{product.brand}</span>

          {/* Title */}
          <h1 className="pro-title">{product.title}</h1>

          {/* Ratings & Stock */}
          <div className="pro-rating-row">
            <div className="pro-stars">
              {Array.from({ length: product.rating || 5 }).map((_, i) => (
                <i key={i} className="fas fa-star" style={{ marginRight: "2px" }}></i>
              ))}
            </div>
            <span className="pro-reviews-count">(142 Customer Reviews)</span>
            <span className="pro-stock-badge">
              <i className="fas fa-check" style={{ marginRight: "4px" }}></i> In Stock (Fast Delivery)
            </span>
          </div>

          {/* Price Box */}
          <div className="pro-price-box">
            <span className="pro-price">${product.price.toFixed(2)}</span>
            <span className="pro-old-price">${originalPrice.toFixed(2)}</span>
            <span className="pro-save-tag">20% OFF</span>
          </div>

          {/* Size Selector Chips */}
          <div style={{ marginBottom: "18px" }}>
            <div className="variant-label">
              <span>Select Size: <strong>{selectedSize}</strong></span>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Standard US Sizing. True to size fit."); }} style={{ color: "#088178", fontSize: "12px", textDecoration: "underline" }}>
                Size Guide
              </a>
            </div>
            <div className="size-options">
              {["S", "M", "L", "XL", "XXL"].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`size-btn ${selectedSize === sz ? "active" : ""}`}
                  onClick={() => setSelectedSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div style={{ marginBottom: "22px" }}>
            <div className="variant-label">
              <span>Select Color: <strong>{selectedColor}</strong></span>
            </div>
            <div className="color-options">
              {colors.map((c) => (
                <div
                  key={c.name}
                  className={`color-swatch ${selectedColor === c.name ? "active" : ""}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="qty-actions-row">
            <div className="qty-stepper">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <input
                type="text"
                readOnly
                value={quantity}
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn-add-cart"
              onClick={handleAddToCart}
            >
              <i className="fas fa-shopping-bag"></i> Add To Cart
            </button>

            <button
              type="button"
              className="btn-buy-now"
              onClick={handleBuyNow}
            >
              <i className="fas fa-bolt"></i> Buy Now
            </button>
          </div>

          {/* Perks Row */}
          <div className="perks-box">
            <div className="perk-item">
              <i className="fas fa-shipping-fast"></i>
              <span>Free Shipping on orders $50+</span>
            </div>
            <div className="perk-item">
              <i className="fas fa-undo"></i>
              <span>30-Day Hassle-Free Returns</span>
            </div>
            <div className="perk-item">
              <i className="fas fa-shield-alt"></i>
              <span>100% Cotton & Authentic</span>
            </div>
            <div className="perk-item">
              <i className="fas fa-lock"></i>
              <span>Secure Encrypted Payment</span>
            </div>
          </div>

          {/* Tabbed Product Details */}
          <div>
            <div className="tabs-header">
              <button
                type="button"
                className={`tab-btn ${activeTab === "desc" ? "active" : ""}`}
                onClick={() => setActiveTab("desc")}
              >
                Product Details
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "specs" ? "active" : ""}`}
                onClick={() => setActiveTab("specs")}
              >
                Specifications
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews (142)
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "desc" && (
                <p>
                  The <strong>{product.title}</strong> by <strong>{product.brand}</strong> delivers top-tier street styling and premium everyday comfort. Built with ultra-soft combed cotton, reinforced double-stitched hems, and breathable micro-fibers, this item keeps its shape and vibrant colors wash after wash.
                </p>
              )}
              {activeTab === "specs" && (
                <ul style={{ paddingLeft: "20px", margin: "10px 0" }}>
                  <li><strong>Material:</strong> 100% Pure Organic Ringspun Cotton (190 GSM)</li>
                  <li><strong>Fit Type:</strong> Regular Modern Fit</li>
                  <li><strong>Care:</strong> Machine wash cold, tumble dry low, do not bleach</li>
                  <li><strong>Origin:</strong> Designed in London, Imported</li>
                </ul>
              )}
              {activeTab === "reviews" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ backgroundColor: "#f8faf9", padding: "12px", borderRadius: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "13px" }}>Alex R. ⭐⭐⭐⭐⭐</strong>
                      <span style={{ fontSize: "11px", color: "#999" }}>2 days ago</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>
                      "Amazing quality fabric! The fit is accurate and it feels super soft. Definitely ordering more colors."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      <section id="product1" className="section-p1">
        <h2>You Might Also Like</h2>
        <p>Similar products recommended for your style</p>
        <ProductGrid products={relatedProducts} />
      </section>

      <Newsletter />
    </div>
  );
}
