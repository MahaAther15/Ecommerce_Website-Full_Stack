import { authenticatedFetch } from "./authApi";
import { API_BASE_URL } from "./apiConfig";

export interface BlogItem {
    id: string;
    title: string;
    slug: string;
    description: string;
    imageUrl?: string;
    image?: string;
    date: string;
    author: string;
    authorRole: string;
    category: string;
    readTime: string;
    quote?: string;
    fullContent: string[];
    keyTakeAways?: string[];
    keyTakeaways?: string[];
}

async function handleResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let result: any = null;
    if (text) {
        try {
            result = JSON.parse(text);
        } catch {
            throw new Error(`Invalid response format`);
        }
    }
    if (!res.ok || (result && result.success === false)) {
        throw new Error(result?.message || `Request failed with status ${res.status}`);
    }
    return result?.data ?? result;
}

// ─── Public APIs ──────────────────────────────────────────────────

// 1. Fetch All Blogs
export async function getAllBlogsApi(): Promise<BlogItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/Blog`, { cache: "no-store" });
    const data = await handleResponse<BlogItem[]>(res);
    return (data || []).map((b) => ({
        ...b,
        image: b.imageUrl || b.image || "/img/blog/b1.jpg",
        keyTakeaways: b.keyTakeAways || b.keyTakeaways || [],
    }));
}

// 2. Fetch Single Blog by ID or Slug
export async function getBlogByIdApi(id: string): Promise<BlogItem> {
    const res = await fetch(`${API_BASE_URL}/api/Blog/${id}`, { cache: "no-store" });
    const b = await handleResponse<BlogItem>(res);
    return {
        ...b,
        image: b.imageUrl || b.image || "/img/blog/b1.jpg",
        keyTakeaways: b.keyTakeAways || b.keyTakeaways || [],
    };
}

// 3. Get Blog Categories
export async function getBlogCategoriesApi(): Promise<string[]> {
    const res = await fetch(`${API_BASE_URL}/api/Blog/categories`, { cache: "no-store" });
    return handleResponse<string[]>(res);
}

// 4. Search Blogs
export async function searchBlogsApi(query: string): Promise<BlogItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/Blog/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
    const data = await handleResponse<BlogItem[]>(res);
    return (data || []).map((b) => ({
        ...b,
        image: b.imageUrl || b.image || "/img/blog/b1.jpg",
        keyTakeaways: b.keyTakeAways || b.keyTakeaways || [],
    }));
}

// ─── Admin APIs (Multipart Form Data for Cloudinary Upload) ────────

// 5. Create Blog (Admin)
export async function createBlogAdminApi(formData: FormData): Promise<BlogItem> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Blog`, {
        method: "POST",
        body: formData, // No Content-Type header so browser sets multipart boundary
    });
    return handleResponse<BlogItem>(res);
}

// 6. Update Blog (Admin)
export async function updateBlogAdminApi(id: string, formData: FormData): Promise<BlogItem> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Blog/${id}`, {
        method: "PUT",
        body: formData,
    });
    return handleResponse<BlogItem>(res);
}

// 7. Delete Blog (Admin)
export async function deleteBlogAdminApi(id: string): Promise<boolean> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Blog/${id}`, {
        method: "DELETE",
    });
    await handleResponse<boolean>(res);
    return true;
}
