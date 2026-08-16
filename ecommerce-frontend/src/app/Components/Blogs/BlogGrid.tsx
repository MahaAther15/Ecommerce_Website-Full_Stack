import BlogCard from "./BlogCard";
import { BlogPost } from "@/app/types/blog";
interface BlogGridProps {
    blogs: BlogPost[];
}
export default function BlogGrid({ blogs }: BlogGridProps) {
    return (
        <section id="blog" className="section-p1">
            {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
            ))}
        </section>
    )
}