"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getBlogByIdApi, BlogItem } from "@/app/libs/blogApi";
import fallbackBlogs from "@/app/data/blogs.json";
import Newsletter from "@/app/Components/Layout/Newsletter";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = use(params);
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      setLoading(true);
      try {
        const data = await getBlogByIdApi(id);
        setBlog(data);
      } catch {
        // Fallback to local data if backend query fails
        const local = (fallbackBlogs as any[]).find((b) => b.id === id);
        if (local) setBlog(local);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "100px 0", textAlign: "center", color: "#6b7280" }}>
        <p>Loading article...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-container text-center py-20" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937", marginBottom: "10px" }}>
          Blog Post Not Found
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>
          The article you are looking for might have been moved or removed.
        </p>
        <Link href="/blogs" className="blog-back-btn">
          <i className="far fa-arrow-left"></i> Back to All Blogs
        </Link>
      </div>
    );
  }

  const authorName = blog.author || "Cara Fashion Team";
  const authorRole = blog.authorRole || "Fashion Contributor";
  const category = blog.category || "Style & Trends";
  const readTime = blog.readTime || "5 min read";
  const contentParagraphs = blog.fullContent && blog.fullContent.length > 0 ? blog.fullContent : [blog.description];
  const takeaways = blog.keyTakeaways || blog.keyTakeAways || [];
  const authorInitial = authorName.charAt(0);

  return (
    <div>
      <div className="blog-detail-container">
        <Link href="/blogs" className="blog-back-btn">
          <i className="far fa-arrow-left"></i> Back to Blogs
        </Link>

        {/* Article Header */}
        <header className="blog-detail-header">
          <span className="blog-category-badge">{category}</span>
          <h1 className="blog-detail-title">{blog.title}</h1>

          <div className="blog-meta-bar">
            <div className="blog-meta-left">
              <div className="blog-author-avatar">{authorInitial}</div>
              <div className="blog-author-info">
                <h5>{authorName}</h5>
                <p>{authorRole}</p>
              </div>
            </div>

            <div className="blog-meta-stats">
              <span>
                <i className="far fa-calendar-alt"></i> Published {blog.date}
              </span>
              <span>
                <i className="far fa-clock"></i> {readTime}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Cloudinary Hero Image */}
        <img
          src={blog.imageUrl || blog.image || "/img/blog/b1.jpg"}
          alt={blog.title}
          className="blog-detail-hero-img"
        />

        {/* Article Body */}
        <article className="blog-content-body">
          {contentParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}

          {/* Quote Callout */}
          {blog.quote && (
            <div className="blog-quote-box">
              <i className="fas fa-quote-left"></i>
              <p>{blog.quote}</p>
            </div>
          )}

          {/* Key Takeaways */}
          {takeaways.length > 0 && (
            <div className="blog-takeaways-card">
              <h4>
                <i className="fas fa-lightbulb"></i> Key Takeaways & Highlights
              </h4>
              <ul>
                {takeaways.map((item, index) => (
                  <li key={index}>
                    <i className="fas fa-check-circle"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        {/* Footer */}
        <footer className="blog-share-footer">
          <Link href="/blogs" className="blog-back-btn" style={{ margin: 0 }}>
            Explore More Articles <i className="far fa-arrow-right"></i>
          </Link>
        </footer>
      </div>

      <Newsletter />
    </div>
  );
}
