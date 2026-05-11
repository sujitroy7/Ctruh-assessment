"use client";

import { PackageSearch } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/products";

interface ProductGridProps {
  products: Product[];
  q: string;
  activeFilterCount: number;
  onClearFilters: () => void;
  onClearSearch: () => void;
}

export default function ProductGrid({
  products,
  q,
  activeFilterCount,
  onClearFilters,
  onClearSearch,
}: ProductGridProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      <p className="hidden md:block text-sm text-ink-muted">
        {products.length} product{products.length !== 1 ? "s" : ""} found
        {q && ` for "${q}"`}
      </p>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-50">
            <PackageSearch className="w-8 h-8 text-primary-500" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-ink">
              {q ? `No results for "${q}"` : "No products match"}
            </p>
            <p className="text-sm text-ink-muted mt-1 max-w-xs">
              {activeFilterCount > 0
                ? "Try adjusting your filters or clearing them to see more products."
                : "Try a different search term."}
            </p>
          </div>
          {(activeFilterCount > 0 || q) && (
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button variant="secondary" size="sm" onClick={onClearFilters}>
                  Clear filters
                </Button>
              )}
              {q && (
                <Button variant="ghost" size="sm" onClick={onClearSearch}>
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
