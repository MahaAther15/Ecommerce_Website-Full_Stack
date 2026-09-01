/**
 * Returns a distinct, valid product image.
 * If the product has a custom/Cloudinary image URL, it uses that.
 * Otherwise, maps the product ID to its matching unique catalog image (f1..f8, n1..n8).
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

export function getProductImage(product?: { id?: number | string; imageUrl?: string; image?: string } | null): string {
  if (!product) return DEFAULT_PRODUCT_IMAGES[0];

  const raw = product.imageUrl || product.image;
  // If it's a valid remote URL (e.g. Cloudinary) or custom uploaded URL that isn't default f1.jpg
  if (raw && raw.trim() !== "" && (raw.startsWith("http://") || raw.startsWith("https://") || (raw.startsWith("/img/products/") && raw !== "/img/products/f1.jpg"))) {
    return raw;
  }

  const numId = Number(product.id) || 1;
  const index = Math.abs((numId - 1) % DEFAULT_PRODUCT_IMAGES.length);
  return DEFAULT_PRODUCT_IMAGES[index];
}
