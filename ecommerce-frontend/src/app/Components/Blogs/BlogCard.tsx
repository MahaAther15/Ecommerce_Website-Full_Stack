import Link from "next/link";
import { BlogPost } from "@/app/types/blog";

interface BlogCardProps {
  blog: BlogPost;
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <div className="blog-box">
      <div className="blog-img">
        <img src={blog.image} alt={blog.title} />
      </div>
      <div className="blog-details">
        <h4>{blog.title}</h4>
        <p>{blog.description}</p>
        <Link href={`/blogs/${blog.id}`}>CONTINUE READING</Link>
      </div>
      <h1>{blog.date}</h1>
    </div>
  );
}