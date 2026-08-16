import Link from "next/link";

export default function HomeHero() {
  return (
    <section id="hero">
      <h4>Trade-In Offer</h4>
      <h2>Super Value Deals</h2>
      <h1>On All Products</h1>
      <p>Save more with coupons & up to 70% off!</p>
      <Link href="/Products">
        <button>Shop Now</button>
      </Link>
    </section>
  );
}
