"use client";

import { useState, useMemo } from "react";
import productsData from "@/app/data/products.json";
import ProductGrid from "@/app/Components/Products/ProductGrid";
import ProductFilters from "@/app/Components/Products/ProductFilters";
import ProductSort from "@/app/Components/Products/ProductSort";
import Newsletter from "@/app/Components/Layout/Newsletter";
import { Product } from "@/app/types/product";

export default function ProductsPage() {
  const [products] = useState<Product[]>(productsData as Product[]);
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");

  // Get unique brands for filter dropdown
  const brands = useMemo(() => {
    const brandSet = new Set(products.map((p) => p.brand));
    return Array.from(brandSet);
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Brand
    if (selectedBrand !== "All") {
      result = result.filter(
        (p) => p.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }

    // Sort Products
    if (sortBy === "price-low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high-low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "title-az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [products, selectedBrand, searchQuery, sortBy]);

  return (
    <div>
      {/* Hero / Page Header section */}
      <section id="page-header">
        <h2>#StayHome</h2>
        <p>Save more with coupons & upto 70% off</p>
      </section>

      {/* Filter and Sort Controls */}
      <section className="section-p1 !py-6">
        <div id="shop-filter-bar">
          <ProductFilters
            selectedBrand={selectedBrand}
            onBrandChange={setSelectedBrand}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            brands={brands}
          />

          <div className="filter-group">
            <div className="filter-item">
              <label>Filter by Brand:</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <ProductSort sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>
      </section>

      {/* Product List Section */}
      <section id="product1" className="section-p1">
        {filteredAndSortedProducts.length > 0 ? (
          <ProductGrid products={filteredAndSortedProducts} />
        ) : (
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold text-gray-600">
              No products found matching your criteria.
            </h3>
          </div>
        )}
      </section>

      {/* Pagination Section */}
      <section id="pagination" className="section-p1">
        <a href="#" className="active">
          1
        </a>
        <a href="#">2</a>
        <a href="#">
          <i className="fal fa-long-arrow-alt-right"></i>
        </a>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}
