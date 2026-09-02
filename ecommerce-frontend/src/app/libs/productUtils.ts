/**
 * Returns a distinct, valid product image.
 * If the product has a custom/Cloudinary image URL, it uses that.
 * Otherwise, maps by category + title or product ID to its matching unique catalog image (f1..f8, n1..n8).
 */
const DEFAULT_PRODUCT_IMAGES = [
  "/img/products/f1.jpg",
  "/img/products/f2.jpg",
  "/img/products/f3.jpg",
  "/img/products/f4.jpg",
  "/img/products/f5.jpg",
  "/img/products/f6.jpg",
  "/img/products/f7.jpg",
  "/img/products/f8.jpg",
  "/img/products/n1.jpg",
  "/img/products/n2.jpg",
  "/img/products/n3.jpg",
  "/img/products/n4.jpg",
  "/img/products/n5.jpg",
  "/img/products/n6.jpg",
  "/img/products/n7.jpg",
  "/img/products/n8.jpg",
];

const TITLE_IMAGE_MAP: Record<string, { featured: string; newArrival: string }> = {
  "slim fit linen shirt": { featured: "/img/products/f1.jpg", newArrival: "/img/products/n2.jpg" },
  "cartoon astronaut t-shirts": { featured: "/img/products/f2.jpg", newArrival: "/img/products/n1.jpg" },
  "classic windbreaker jacket": { featured: "/img/products/f3.jpg", newArrival: "/img/products/n3.jpg" },
  "graphic cotton t-shirt": { featured: "/img/products/f4.jpg", newArrival: "/img/products/n4.jpg" },
  "premium oxford shirt": { featured: "/img/products/f5.jpg", newArrival: "/img/products/n5.jpg" },
  "classic fit polo shirt": { featured: "/img/products/f6.jpg", newArrival: "/img/products/n6.jpg" },
  "oversized urban t-shirt": { featured: "/img/products/f7.jpg", newArrival: "/img/products/n7.jpg" },
  "techfit workout t-shirt": { featured: "/img/products/f8.jpg", newArrival: "/img/products/n8.jpg" },
};

export function getProductImage(product?: { id?: number | string; imageUrl?: string; image?: string; title?: string; category?: string } | null): string {
  if (!product) return DEFAULT_PRODUCT_IMAGES[0];

  const raw = (product.imageUrl || product.image || "").trim();

  // 1. If custom uploaded URL (Cloudinary, remote HTTPS/HTTP, base64 data)
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
    return raw;
  }

  // 2. If it's a specific catalog local image that is NOT the generic default f1.jpg
  if (raw.startsWith("/img/products/") && raw !== "/img/products/f1.jpg") {
    return raw;
  }
  if (raw.startsWith("img/products/") && raw !== "img/products/f1.jpg") {
    return `/${raw}`;
  }

  // 3. Match by Product Title & Category (maps 8 featured + 8 newArrivals uniquely)
  if (product.title) {
    const key = product.title.trim().toLowerCase();
    const cat = (product.category || "").toLowerCase();
    if (TITLE_IMAGE_MAP[key]) {
      const isNew = cat.includes("new") || cat.includes("arrival");
      return isNew ? TITLE_IMAGE_MAP[key].newArrival : TITLE_IMAGE_MAP[key].featured;
    }
  }

  // 4. If raw is non-empty and starts with slash or local path (e.g. uploaded file)
  if (raw && raw !== "/img/products/f1.jpg" && raw !== "null" && raw !== "undefined") {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  // 5. Fallback distinctly distributed by product ID
  const numId = Number(product.id) || 1;
  const index = Math.abs((numId - 1) % DEFAULT_PRODUCT_IMAGES.length);
  return DEFAULT_PRODUCT_IMAGES[index];
}
