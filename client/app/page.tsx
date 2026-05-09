"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import ProductCard from "@/components/products/ProductCard";
import { Search } from "lucide-react";

const allProducts = [
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
    category: "Clothing",
  },
  {
    id: "2",
    name: "Veirdo Original Beige Oversized Typography T-Shirt",
    price: 549,
    originalPrice: 1199,
    bestPrice: 399,
    rating: 4.3,
    reviewCount: 185,
    colorCount: 3,
    image: "/product/tshirt-1.jpg",
    category: "Clothing",
  },
  {
    id: "3",
    name: "Veirdo Original Beige Oversized Typography T-Shirt",
    price: 549,
    originalPrice: 1199,
    bestPrice: 399,
    rating: 4.1,
    reviewCount: 98,
    colorCount: 4,
    image: "/product/tshirt-1.jpg",
    category: "Clothing",
  },
  {
    id: "4",
    name: "Veirdo Original Beige Oversized Typography T-Shirt",
    price: 549,
    originalPrice: 1199,
    rating: 3.9,
    reviewCount: 60,
    colorCount: 2,
    image: "/product/tshirt-1.jpg",
    category: "Clothing",
  },
  {
    id: "5",
    name: "Veirdo Original Beige Oversized Typography T-Shirt",
    price: 549,
    originalPrice: 1199,
    bestPrice: 399,
    badge: "NEW",
    rating: 4.5,
    reviewCount: 30,
    colorCount: 6,
    image: "/product/tshirt-1.jpg",
    category: "Clothing",
  },
  {
    id: "6",
    name: "Veirdo Original Beige Oversized Typography T-Shirt",
    price: 549,
    originalPrice: 1199,
    rating: 4.0,
    reviewCount: 74,
    colorCount: 3,
    image: "/product/tshirt-1.jpg",
    category: "Clothing",
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filtered = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 mb-10">
      {/* Search bar */}
      <div className="mt-6">
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
      <p className="text-sm text-ink-muted">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
        {query && ` for "${query}"`}
      </p>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No products found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
