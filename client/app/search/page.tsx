"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import { Search } from "lucide-react";

// Dummy data — replace with real API call using query param
const allProducts = [
  { id: "1", name: "Product One", price: 29.99, category: "Electronics" },
  { id: "2", name: "Product Two", price: 49.99, category: "Clothing" },
  { id: "3", name: "Product Three", price: 19.99, category: "Books" },
  { id: "4", name: "Product Four", price: 89.99, category: "Electronics" },
  { id: "5", name: "Product Five", price: 14.99, category: "Books" },
  { id: "6", name: "Product Six", price: 59.99, category: "Clothing" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filtered = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Search Products
        </h1>
        <Input
          type="text"
          placeholder="Search by name or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          size="lg"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
        {query && ` for "${query}"`}
      </p>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-4
                         hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div
                className="w-full h-36 rounded-lg bg-gray-100 mb-3
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
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No products found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
