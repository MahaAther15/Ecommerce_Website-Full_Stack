"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { fetchProducts, fetchCategories, setFilters } from "@/app/redux/slices/productSlice";
import { getBrandApi } from "@/app/libs/brandApi";
import ProductGrid from "@/app/Components/Products/ProductGrid";
import ProductFilters from "@/app/Components/Products/ProductFilters";
import ProductSort from "@/app/Components/Products/ProductSort";
import Newsletter from "@/app/Components/Layout/Newsletter";
import "./products.css";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading, error, filters, totalPages, categories } = useAppSelector(
    (state) => state.product
  );

  const DEFAULT_BRANDS = [
    "Adidas",
    "Nike",
    "H&M",
    "Zara",
    "Uniqlo",
    "Ralph Lauren",
    "Puma",
    "Levis",
  ];

  const [availableBrands, setAvailableBrands] = useState<string[]>([
    "All",
    ...DEFAULT_BRANDS,
  ]);

  // Initial categories and brands fetch from database
  useEffect(() => {
    dispatch(fetchCategories());

    async function loadBrands() {
      try {
        const brands = await getBrandApi();
        const dbNames = Array.isArray(brands)
          ? brands.map((b) => b.name).filter(Boolean)
          : [];

        const combined = new Map<string, string>();
        DEFAULT_BRANDS.forEach((b) => combined.set(b.toLowerCase(), b));
        dbNames.forEach((b) => combined.set(b.toLowerCase(), b));

        setAvailableBrands(["All", ...Array.from(combined.values())]);
      } catch {
        // keep default brands
      }
    }
    loadBrands();
  }, [dispatch]);

  // Also collect any brands present on products
  useEffect(() => {
    if (products && products.length > 0) {
      setAvailableBrands((prev) => {
        const map = new Map<string, string>();
        DEFAULT_BRANDS.forEach((b) => map.set(b.toLowerCase(), b));
        prev.forEach((b) => {
          if (b !== "All") map.set(b.toLowerCase(), b);
        });
        products.forEach((p) => {
          if (p.brand && p.brand.trim()) {
            map.set(p.brand.trim().toLowerCase(), p.brand.trim());
          }
        });
        return ["All", ...Array.from(map.values())];
      });
    }
  }, [products]);

  // Fetch products from backend whenever filters change
  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleBrandChange = (brand: string) => {
    dispatch(setFilters({ brand, pageNumber: 1 }));
  };

  const handleSearchChange = (search: string) => {
    dispatch(setFilters({ search, pageNumber: 1 }));
  };

  const handleSortChange = (sortBy: string) => {
    dispatch(setFilters({ sortBy, pageNumber: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ pageNumber: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Client-side and server-side synced products list
  const displayedProducts = useMemo(() => {
    if (!products) return [];
    let list = [...products];

    // 1. Filter by Brand
    if (filters.brand && filters.brand !== "All") {
      const targetBrand = filters.brand.toLowerCase();
      list = list.filter((p) => p.brand?.toLowerCase() === targetBrand);
    }

    // 2. Filter by Search Query
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // 3. Sort by selected criteria
    if (filters.sortBy && filters.sortBy !== "default") {
      switch (filters.sortBy) {
        case "price_asc":
        case "price-low-high":
          list.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
        case "price-high-low":
          list.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "newest":
          list.sort((a, b) => b.id - a.id);
          break;
        case "title_asc":
        case "title-az":
          list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
          break;
        case "title_desc":
        case "title-za":
          list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
          break;
        default:
          break;
      }
    }

    return list;
  }, [products, filters.brand, filters.search, filters.sortBy]);

  return (
    <div>
      {/* Hero / Page Header section */}
      <section id="page-header">
        <h2>#StayHome</h2>
        <p>Save more with coupons & up to 70% off</p>
      </section>

      {/* Filter and Sort Controls */}
      <section className="section-p1 !py-6">
        <div id="shop-filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <ProductFilters
            selectedBrand={filters.brand || "All"}
            onBrandChange={handleBrandChange}
            searchQuery={filters.search || ""}
            onSearchChange={handleSearchChange}
            brands={availableBrands}
          />

          <div className="filter-group" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div className="filter-item">
              <label style={{ fontWeight: "700", fontSize: "13px", color: "#333", marginRight: "6px" }}>Filter by Brand:</label>
              <select
                value={filters.brand || "All"}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="filter-select"
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#fff",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand === "All" ? "All Brands" : brand}
                  </option>
                ))}
              </select>
            </div>

            <ProductSort
              sortBy={filters.sortBy || "default"}
              onSortChange={handleSortChange}
            />
          </div>
        </div>
      </section>

      {/* Product List Section */}
      <section id="product1" className="section-p1">
        {loading ? (
          <div className="text-center py-16" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-teal-600 border-r-transparent align-[-0.125em] mb-4"></div>
            <p className="text-lg font-medium text-gray-600" style={{ fontSize: "16px", color: "#666" }}>Loading products from server...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16" style={{ textAlign: "center", padding: "60px 20px" }}>
            <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-3" style={{ fontSize: "36px", color: "#ef4444", marginBottom: "12px", display: "block" }}></i>
            <p className="text-lg font-semibold text-red-600" style={{ color: "#dc2626", fontWeight: "700", marginBottom: "16px" }}>{error}</p>
            <button
              onClick={() => dispatch(fetchProducts(filters))}
              style={{
                backgroundColor: "#088178",
                color: "#fff",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : displayedProducts && displayedProducts.length > 0 ? (
          <ProductGrid products={displayedProducts} />
        ) : (
          <div className="text-center py-16" style={{ textAlign: "center", padding: "60px 20px" }}>
            <i className="fas fa-search" style={{ fontSize: "32px", color: "#9ca3af", marginBottom: "12px", display: "block" }}></i>
            <h3 className="text-xl font-semibold text-gray-600" style={{ fontSize: "18px", color: "#4b5563" }}>
              No products found matching your criteria.
            </h3>
            <button
              onClick={() => dispatch(setFilters({ brand: "All", search: "", sortBy: "default", pageNumber: 1 }))}
              style={{
                marginTop: "16px",
                backgroundColor: "#088178",
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <section id="pagination" className="section-p1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={filters.pageNumber === page ? "active" : ""}
            >
              {page}
            </button>
          ))}
        </section>
      )}

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}
