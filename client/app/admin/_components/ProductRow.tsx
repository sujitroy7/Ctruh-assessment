"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import ProductItemsTable, { ProductItem } from "./ProductItemsTable";

export interface Product {
  id: string;
  name: string;
  is_deleted: boolean;
  items: ProductItem[];
}

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onDeleteItem: (productId: string, itemId: string) => void;
}

export default function ProductRow({ product, onEdit, onDelete, onDeleteItem }: ProductRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalStock = product.items
    .filter((i) => !i.is_deleted)
    .reduce((sum, i) => sum + i.stock, 0);

  const visibleItemCount = product.items.filter((i) => !i.is_deleted).length;

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete(product.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  }

  return (
    <>
      <tr
        className={clsx(
          "border-b border-border transition-colors",
          expanded ? "bg-primary-50" : "bg-surface hover:bg-neutral-50",
        )}
      >
        {/* Expand toggle */}
        <td className="px-4 py-3 w-10">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-center w-7 h-7 rounded hover:bg-neutral-200 transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-ink-muted" />
            ) : (
              <ChevronRight className="w-4 h-4 text-ink-muted" />
            )}
          </button>
        </td>

        {/* Product name */}
        <td
          className="px-4 py-3 font-medium text-ink cursor-pointer select-none"
          onClick={() => setExpanded((v) => !v)}
        >
          {product.name}
        </td>

        {/* Item count */}
        <td className="px-4 py-3 text-ink-soft text-sm">{visibleItemCount}</td>

        {/* Total stock */}
        <td className="px-4 py-3">
          <span
            className={clsx(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
              totalStock === 0
                ? "bg-error-50 text-error-700"
                : totalStock <= 10
                ? "bg-warning-50 text-warning-700"
                : "bg-success-50 text-success-700",
            )}
          >
            {totalStock}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Pencil />}
              onClick={() => onEdit(product)}
            >
              Edit
            </Button>

            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-error-600 font-medium">Sure?</span>
                <Button variant="danger" size="sm" onClick={handleDeleteClick}>
                  Yes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  No
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={handleDeleteClick}
                title="Delete product"
              >
                <Trash2 className="w-4 h-4 text-error-500" />
              </Button>
            )}
          </div>
        </td>
      </tr>

      {expanded && (
        <ProductItemsTable
          items={product.items}
          onDeleteItem={(itemId) => onDeleteItem(product.id, itemId)}
        />
      )}
    </>
  );
}
