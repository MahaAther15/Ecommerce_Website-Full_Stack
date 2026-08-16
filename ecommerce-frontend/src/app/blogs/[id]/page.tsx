"use client";

import { use } from "react";
import Link from "next/link";
import blogsData from "@/app/data/blogs.json";
import Newsletter from "@/app/Components/Layout/Newsletter";
import { BlogPost } from "@/app/types/blog";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = use(params);
  const blog = (blogsData as BlogPost[]).find((item) => item.id === id);

  if (!blog) {
    return (
      <div className="blog-detail-container text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Blog Post Not Found
        </h2>
        <p className="text-gray-600 mb-6">
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
  const contentParagraphs = blog.fullContent || [blog.description];
  const authorInitial = authorName.charAt(0);

  return (
    <div>
      <div className="blog-detail-container">
        {/* Navigation back link */}
        <Link href="/blogs" className="blog-back-btn">
          <i className="far fa-arrow-left"></i> Back to Blogs
        </Link>

        {/* Article Header */}
        <header className="blog-detail-header">
          <span className="blog-category-badge">{category}</span>
          <h1 className="blog-detail-title">{blog.title}</h1>

          {/* Author and Metadata bar */}
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

        {/* Featured Hero Image */}
        <img
          src={blog.image}
          alt={blog.title}
          className="blog-detail-hero-img"
        />

        {/* Article Body Content */}
        <article className="blog-content-body">
          {contentParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}

          {/* Featured Quote Callout */}
          {blog.quote && (
            <div className="blog-quote-box">
              <i className="fas fa-quote-left"></i>
              <p>{blog.quote}</p>
            </div>
          )}

          {/* Key Takeaways Card */}
          {blog.keyTakeaways && blog.keyTakeaways.length > 0 && (
            <div className="blog-takeaways-card">
              <h4>
                <i className="fas fa-lightbulb"></i> Key Takeaways & Highlights
              </h4>
              <ul>
                {blog.keyTakeaways.map((item, index) => (
                  <li key={index}>
                    <i className="fas fa-check-circle"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        {/* Article Footer & Social Share */}
        <footer className="blog-share-footer">
          <div className="blog-share-icons">
            <span>Share this article:</span>
            <a href="#" className="share-icon-btn" title="Share on Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="share-icon-btn" title="Share on Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="share-icon-btn" title="Share on Pinterest">
              <i className="fab fa-pinterest-p"></i>
            </a>
            <a href="#" className="share-icon-btn" title="Share on LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>

          <Link href="/blogs" className="blog-back-btn" style={{ margin: 0 }}>
            Explore More Articles <i className="far fa-arrow-right"></i>
          </Link>
        </footer>
      </div>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}
