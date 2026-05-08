import Link from "next/link";

// Dummy featured products — replace with real API call
const featured = [
  { id: "1", name: "Product One", price: 29.99, category: "Electronics" },
  { id: "2", name: "Product Two", price: 49.99, category: "Clothing" },
  { id: "3", name: "Product Three", price: 19.99, category: "Books" },
  { id: "4", name: "Product Four", price: 89.99, category: "Electronics" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section
        className="text-center py-16 rounded-2xl bg-gradient-to-br
                          from-blue-50 to-indigo-50 border border-blue-100"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to MyShop
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Discover thousands of products at unbeatable prices.
        </p>
        <Link
          href="/search"
          className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white
                     font-medium hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </section>

      {/* Featured products */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-4
                         hover:shadow-md hover:border-blue-200 transition-all"
            >
              {/* Placeholder image */}
              <div
                className="w-full h-40 rounded-lg bg-gray-100 mb-3
                              flex items-center justify-center"
              >
                <span className="text-3xl">📦</span>
              </div>
              <p className="text-xs text-blue-500 font-medium mb-1">
                {product.category}
              </p>
              <h3
                className="text-sm font-semibold text-gray-900
                             group-hover:text-blue-600 transition-colors"
              >
                {product.name}
              </h3>
              <p className="text-sm font-bold text-gray-900 mt-1">
                ${product.price}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
