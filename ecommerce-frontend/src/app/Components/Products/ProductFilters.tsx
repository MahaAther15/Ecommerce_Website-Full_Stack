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
    <div className="search-box" style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <i className="fas fa-search"></i>
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ paddingRight: searchQuery ? "32px" : "12px" }}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          title="Clear search"
          style={{
            position: "absolute",
            right: "10px",
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            fontSize: "14px",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
