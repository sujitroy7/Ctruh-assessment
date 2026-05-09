"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductRow, { Product } from "../_components/ProductRow";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Classic Cotton Tee",
    is_deleted: false,
    items: [
      { id: "1a", gender: "male", type: "t-shirt", color: "#3b82f6", price: 599, stock: 12, images: [], is_deleted: false },
      { id: "1b", gender: "female", type: "t-shirt", color: "#ec4899", price: 599, stock: 0, images: ["img1.jpg"], is_deleted: false },
      { id: "1c", gender: "male", type: "t-shirt", color: "#10b981", price: 649, stock: 4, images: [], is_deleted: false },
    ],
  },
  {
    id: "2",
    name: "Slim Fit Chinos",
    is_deleted: false,
    items: [
      { id: "2a", gender: "male", type: "trousers", color: "#92400e", price: 1299, stock: 8, images: ["img2.jpg"], is_deleted: false },
      { id: "2b", gender: "male", type: "trousers", color: "#1f2937", price: 1299, stock: 3, images: [], is_deleted: false },
    ],
  },
  {
    id: "3",
    name: "Floral Sundress",
    is_deleted: false,
    items: [
      { id: "3a", gender: "female", type: "dress", color: "#f472b6", price: 1899, stock: 15, images: ["img3.jpg", "img4.jpg"], is_deleted: false },
    ],
  },
];

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [page, setPage] = useState(1);

  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleAdd() {
    // TODO: open add-product modal / navigate to create page
    alert("Add product — wire up your modal or route here.");
  }

  function handleEdit(product: Product) {
    // TODO: open edit modal with product pre-filled
    alert(`Edit product: ${product.name}`);
  }

  function handleDelete(productId: string) {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  function handleDeleteItem(productId: string, itemId: string) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, items: p.items.filter((i) => i.id !== itemId) }
          : p,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Products</h1>
          <p className="text-sm text-ink-muted mt-0.5">{total} product{total !== 1 ? "s" : ""} total</p>
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
              <th className="px-4 py-3 font-semibold text-ink-soft">Product Name</th>
              <th className="px-4 py-3 font-semibold text-ink-soft">Items</th>
              <th className="px-4 py-3 font-semibold text-ink-soft">Total Stock</th>
              <th className="px-4 py-3 font-semibold text-ink-soft">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-ink-muted">
                  No products found.
                </td>
              </tr>
            ) : (
              pageProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDeleteItem={handleDeleteItem}
                />
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
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ChevronRight />}
              disabled={page === totalPages}
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
