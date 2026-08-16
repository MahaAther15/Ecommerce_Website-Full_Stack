"use client";

interface ProductSortProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function ProductSort({ sortBy, onSortChange }: ProductSortProps) {
  return (
    <div className="filter-item">
      <label>Sort by:</label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="filter-select"
      >
        <option value="default">Default</option>
        <option value="price-low-high">Price: Low to High</option>
        <option value="price-high-low">Price: High to Low</option>
        <option value="title-az">Name: A to Z</option>
      </select>
    </div>
  );
}
