"use client";

import { useEffect, useState } from "react";
import BlogHero from "../Components/Blogs/BlogHero";
import BlogGrid from "../Components/Blogs/BlogGrid";
import BlogPagination from "../Components/Blogs/BlogPagination";
import Newsletter from "../Components/Layout/Newsletter";
import { getAllBlogsApi, getBlogCategoriesApi, searchBlogsApi, BlogItem } from "@/app/libs/blogApi";
import fallbackBlogs from "@/app/data/blogs.json";
import { BlogPost } from "@/app/types/blog";
import "./blogs.css";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
    loadCategories();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await getAllBlogsApi();
      if (data && data.length > 0) {
        setBlogs(data as unknown as BlogPost[]);
      } else {
        setBlogs(fallbackBlogs as BlogPost[]);
      }
    } catch {
      setBlogs(fallbackBlogs as BlogPost[]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getBlogCategoriesApi();
      if (cats && cats.length > 0) setCategories(cats);
    } catch {
      // ignore
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadBlogs();
      return;
    }
    setLoading(true);
    try {
      const results = await searchBlogsApi(searchQuery);
      setBlogs(results as unknown as BlogPost[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    if (selectedCategory === "All") return true;
    return b.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div>
      <BlogHero />

      {/* Filter & Search Bar */}
      <div
        className="blog-filter-bar"
        style={{
          maxWidth: "1200px",
          margin: "24px auto 10px",
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        {/* Categories */}
        <div
          className="blog-categories-wrapper"
          style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}
        >
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              className={`blog-cat-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 13px",
                borderRadius: "14px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: selectedCategory === cat ? "#088178" : "#f1f3f5",
                color: selectedCategory === cat ? "#fff" : "#4b5563",
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="blog-search-form" style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            className="blog-search-input"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            className="blog-search-btn"
            style={{
              backgroundColor: "#088178",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div style={{ padding: "80px 0", textAlign: "center", color: "#6b7280" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTopColor: "#088178", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p>Loading latest articles...</p>
        </div>
      ) : (
        <BlogGrid blogs={filteredBlogs} />
      )}

      <BlogPagination />
      <Newsletter />
    </div>
  );
}
