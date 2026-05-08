import Link from "next/link";
import { notFound } from "next/navigation";

// Dummy data — replace with real API call using params.id
const products: Record<
  string,
  {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
  }
> = {
  "1": {
    id: "1",
    name: "Product One",
    price: 29.99,
    category: "Electronics",
    description:
      "A great product with amazing features. Built to last and designed for everyday use.",
  },
  "2": {
    id: "2",
    name: "Product Two",
    price: 49.99,
    category: "Clothing",
    description:
      "Premium quality clothing item. Comfortable, stylish, and durable.",
  },
  "3": {
    id: "3",
    name: "Product Three",
    price: 19.99,
    category: "Books",
    description:
      "A must-read for everyone. Packed with insights and practical knowledge.",
  },
  "4": {
    id: "4",
    name: "Product Four",
    price: 89.99,
    category: "Electronics",
    description: "Top of the line electronics. High performance, sleek design.",
  },
};

export default function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const product = products[params.id];

  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/search" className="hover:text-gray-600">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image placeholder */}
        <div
          className="w-full aspect-square rounded-2xl bg-gray-100
                        flex items-center justify-center border border-gray-200"
        >
          <span className="text-8xl">📦</span>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium text-blue-500">
            {product.category}
          </span>

          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <p className="text-2xl font-bold text-gray-900">${product.price}</p>

          <p className="text-gray-500 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Add to cart — visible to all, but can gate behind auth if needed */}
          <div className="flex gap-3 mt-4">
            <button
              className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white
                               font-medium hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
            <button
              className="px-4 py-3 rounded-xl border border-gray-300
                               text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ♡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
