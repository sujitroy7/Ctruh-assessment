import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";

const featured = [
  {
    id: "1",
    name: "Veirdo Original Beige Oversized Typography T-Shirt",
    price: 549,
    originalPrice: 1199,
    bestPrice: 399,
    badge: "BEST SELLER",
    rating: 4.6,
    reviewCount: 220,
    colorCount: 5,
    image: "/product/tshirt-1.jpg",
  },
  {
    id: "2",
    name: "Veirdo Original Beige Oversized Typography T-Shirt",
    price: 549,
    originalPrice: 1199,
    bestPrice: 399,
    badge: "BEST SELLER",
    rating: 4.6,
    reviewCount: 220,
    colorCount: 5,
    image: "/product/tshirt-1.jpg",
  },
  {
    id: "3",
    name: "Veirdo Original Beige Oversized Typography T-Shirt",
    price: 549,
    originalPrice: 1199,
    bestPrice: 399,
    rating: 4.3,
    reviewCount: 185,
    colorCount: 3,
    image: "/product/tshirt-1.jpg",
  },
  {
    id: "4",
    name: "Veirdo Original Beige Oversized Typography T-Shirt",
    price: 549,
    originalPrice: 1199,
    bestPrice: 399,
    rating: 4.1,
    reviewCount: 98,
    colorCount: 4,
    image: "/product/tshirt-1.jpg",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="text-center py-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
        <h1 className="text-4xl font-bold leading-tight text-ink mb-4">
          Welcome to MyShop
        </h1>
        <p className="text-base leading-relaxed text-ink-muted mb-8 max-w-md mx-auto">
          Discover thousands of products at unbeatable prices.
        </p>
        <Link
          href="/search"
          className="inline-block px-6 py-3 rounded-md bg-primary-600 text-ink-inverse font-semibold hover:bg-primary-700 active:bg-primary-800 transition-colors"
        >
          Browse Products
        </Link>
      </section>

      {/* Featured products */}
      <section>
        <h2 className="text-xl font-bold text-ink mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}
