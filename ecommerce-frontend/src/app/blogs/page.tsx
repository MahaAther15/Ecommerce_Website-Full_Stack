import BlogHero from "../Components/Blogs/BlogHero";
import BlogGrid from "../Components/Blogs/BlogGrid";
import blogsData from "@/app/data/blogs.json";
import BlogPagination from "../Components/Blogs/BlogPagination";
import Newsletter from "../Components/Layout/Newsletter";

export default function BlogsPage() {
  return (
    <div>
      <BlogHero />
      <BlogGrid blogs={blogsData} />
      <BlogPagination />
      <Newsletter />
    </div>
  );
}
