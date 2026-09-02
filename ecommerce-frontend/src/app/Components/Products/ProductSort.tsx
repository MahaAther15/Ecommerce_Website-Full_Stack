"use client";

interface ProductSortProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function ProductSort({ sortBy, onSortChange }: ProductSortProps) {
  return (
    <div className="filter-item">
      <label style={{ fontWeight: "700", fontSize: "13px", color: "#333", marginRight: "6px" }}>Sort by:</label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
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
        <option value="default">Featured / Default</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
        <option value="newest">Newest Arrivals</option>
        <option value="title_asc">Name: A to Z</option>
        <option value="title_desc">Name: Z to A</option>
      </select>
    </div>
  );
}
