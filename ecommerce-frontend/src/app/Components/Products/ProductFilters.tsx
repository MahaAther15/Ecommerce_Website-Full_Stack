"use client";

interface ProductFiltersProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  brands: string[];
}

export default function ProductFilters({
  searchQuery,
  onSearchChange,
}: ProductFiltersProps) {
  return (
    <div className="search-box">
      <i className="fas fa-search"></i>
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
