"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { fetchProducts, fetchCategories, setFilters } from "@/app/redux/slices/productSlice";
import ProductGrid from "@/app/Components/Products/ProductGrid";
import ProductFilters from "@/app/Components/Products/ProductFilters";
import ProductSort from "@/app/Components/Products/ProductSort";
import Newsletter from "@/app/Components/Layout/Newsletter";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading, error, filters, totalPages, categories } = useAppSelector(
    (state) => state.product
  );

  // Initial categories fetch
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch products whenever filters change
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

  const brandsList = ["All", "Adidas", "Nike", "H&M", "Uniqlo", "Ralph Lauren", "Zara"];

  return (
    <div>
      {/* Hero / Page Header section */}
      <section id="page-header">
        <h2>#StayHome</h2>
        <p>Save more with coupons & up to 70% off</p>
      </section>

      {/* Filter and Sort Controls */}
      <section className="section-p1 !py-6">
        <div id="shop-filter-bar">
          <ProductFilters
            selectedBrand={filters.brand || "All"}
            onBrandChange={handleBrandChange}
            searchQuery={filters.search || ""}
            onSearchChange={handleSearchChange}
            brands={brandsList}
          />

          <div className="filter-group">
            <div className="filter-item">
              <label>Filter by Brand:</label>
              <select
                value={filters.brand || "All"}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="filter-select"
              >
                {brandsList.map((brand) => (
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
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-teal-600 border-r-transparent align-[-0.125em] mb-4"></div>
            <p className="text-lg font-medium text-gray-600">Loading products from server...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-3"></i>
            <p className="text-lg font-semibold text-red-600">{error}</p>
            <button
              onClick={() => dispatch(fetchProducts(filters))}
              className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-600">
              No products found matching your criteria.
            </h3>
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

