"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { getAllProducts } from "@/lib/api/products";
import ProductRow, { Product } from "../_components/ProductRow";

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const [page, setPage] = useState(1);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", page],
    queryFn: () => getAllProducts({ page, limit: PAGE_SIZE }),
  });

  // @ts-ignore
  const total = response?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // @ts-ignore
  const pageProducts = response?.data?.data ?? [];

  function handleAdd() {
    // TODO: open add-product modal / navigate to create page
    alert("Add product — wire up your modal or route here.");
  }

  return (
    <div className="min-h-screen bg-canvas px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Products</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {total} product{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus />} onClick={handleAdd}>
          Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-100 border-b border-border text-left">
              <th className="px-4 py-3 w-10" />
              <th className="px-4 py-3 font-semibold text-ink-soft">
                Product Name
              </th>
              <th className="px-4 py-3 font-semibold text-ink-soft">Type</th>
              <th className="px-4 py-3 font-semibold text-ink-soft">Items</th>
              <th className="px-4 py-3 font-semibold text-ink-soft">
                Total Stock
              </th>
              <th className="px-4 py-3 font-semibold text-ink-soft">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-red-600">
                  Failed to load products.
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-ink-muted"
                >
                  Loading products...
                </td>
              </tr>
            ) : pageProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-ink-muted"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              pageProducts.map((product: any) => (
                <ProductRow key={product.id} product={product} />
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-neutral-50">
          <span className="text-sm text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ChevronLeft />}
              disabled={page === 1 || isLoading}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ChevronRight />}
              disabled={page === totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
