"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Newsletter from "@/app/Components/Layout/Newsletter";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { addToCart } from "@/app/redux/slices/cartslice";
import { toggleWishlistItem } from "@/app/redux/slices/wishlistslice";
import { fetchProductById } from "@/app/redux/slices/productSlice";
import { fetchProductReviews } from "@/app/redux/slices/reviewSlice";
import { getProductImage } from "@/app/libs/productUtils";

interface ProductDetailsProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { selectedProduct: product, loading, error } = useAppSelector(
    (state) => state.product || {}
  );
  const reviewSummary = useAppSelector((state) => state.review?.summary);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedColor, setSelectedColor] = useState("Emerald");
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
      dispatch(fetchProductReviews(productId));
    }
  }, [dispatch, productId]);

  const productImage = getProductImage(product);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (product) {
      setActiveImage(getProductImage(product));
    }
  }, [product]);

  const isWishlisted = product
    ? wishlistItems.some((item) => Number(item.productId || item.id) === Number(product.id))
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
        productId: Number(product.id),
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
        productId: Number(product.id),
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
    dispatch(toggleWishlistItem(Number(product.id)));
    showToast(
      isWishlisted
        ? `💔 Removed from Wishlist`
        : `❤️ Added to Wishlist!`
    );
  };

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
              {Array.from({ length: 5 }).map((_, i) => (
                <i
                  key={i}
                  className="fas fa-star"
                  style={{
                    marginRight: "2px",
                    color: i < Math.round(reviewSummary?.averageRating ?? product.rating ?? 5) ? "#f59e0b" : "#d1d5db"
                  }}
                />
              ))}
            </div>
            <span className="pro-reviews-count">
              ({reviewSummary?.totalReviews ?? product.reviewCount ?? 0} Customer Reviews)
            </span>
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
                Reviews ({reviewSummary?.totalReviews ?? product.reviewCount ?? 0})
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
                <div>
                  {/* Ratings Breakdown Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "24px", backgroundColor: "#f8faf9", padding: "20px", borderRadius: "14px", marginBottom: "24px", alignItems: "center" }}>
                    <div style={{ textAlign: "center", borderRight: "1px solid #e5e7eb", paddingRight: "16px" }}>
                      <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#111827", margin: 0 }}>
                        {reviewSummary?.averageRating ? reviewSummary.averageRating.toFixed(1) : (product.rating ? product.rating.toFixed(1) : "0.0")}
                      </h2>
                      <div style={{ color: "#f59e0b", fontSize: "16px", margin: "4px 0" }}>
                        {"★".repeat(Math.round(reviewSummary?.averageRating ?? product.rating ?? 0))}
                        {"☆".repeat(5 - Math.round(reviewSummary?.averageRating ?? product.rating ?? 0))}
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                        Based on {reviewSummary?.totalReviews ?? product.reviewCount ?? 0} reviews
                      </p>
                    </div>

                    {/* Progress Bars for 5★ to 1★ */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviewSummary?.starCounts?.[stars] || 0;
                        const total = reviewSummary?.totalReviews || 0;
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        return (
                          <div key={stars} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
                            <span style={{ width: "30px", fontWeight: "600", color: "#4b5563" }}>{stars} ★</span>
                            <div style={{ flex: 1, height: "8px", backgroundColor: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#f59e0b", borderRadius: "999px" }} />
                            </div>
                            <span style={{ width: "24px", color: "#9ca3af", textAlign: "right" }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Reviews List */}
                  {reviewSummary?.reviews && reviewSummary.reviews.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {reviewSummary.reviews.map((rev) => (
                        <div key={rev.id} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong style={{ fontSize: "14px", color: "#111827" }}>{rev.userName}</strong>
                              {rev.isVerifiedPurchase && (
                                <span style={{ backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "11px", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                  ✓ Verified Buyer
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                              {new Date(rev.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          </div>

                          {/* Stars & Title */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ color: "#f59e0b", fontSize: "13px" }}>
                              {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                            </span>
                            {rev.title && <strong style={{ fontSize: "13px", color: "#374151" }}>{rev.title}</strong>}
                          </div>

                          {/* Review Comment */}
                          <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#4b5563", lineHeight: 1.6 }}>
                            {rev.comment}
                          </p>

                          {/* Customer Uploaded Photo Preview */}
                          {rev.imageUrl && (
                            <div
                              style={{ width: "84px", height: "84px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb", cursor: "pointer" }}
                              onClick={() => window.open(rev.imageUrl, "_blank")}
                              title="Click to view full image"
                            >
                              <img src={rev.imageUrl} alt="Customer product upload" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "30px", color: "#9ca3af", fontSize: "14px" }}>
                      <i className="fas fa-comment-alt" style={{ fontSize: "28px", color: "#d1d5db", display: "block", marginBottom: "8px" }} />
                      No reviews yet for this product. Order now and be the first to leave a review!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
