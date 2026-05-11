"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { CartItem } from "@/lib/store/cart";

interface CartProductProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}

export default function CartProduct({
  item,
  onRemove,
  onQuantityChange,
}: CartProductProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 rounded-lg border border-border bg-surface shadow-card hover:shadow-md transition-shadow p-3 sm:p-4 lg:p-6">
      {/* Product Image */}
      <div className="shrink-0">
        <div className="relative w-full sm:w-20 md:w-24 h-32 sm:h-24 md:h-32 rounded-lg bg-neutral-100 overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100%, (max-width: 768px) 80px, 96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-muted">
              <ShoppingBag className="w-8 h-8 sm:w-6 sm:h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col gap-2 sm:gap-3">
        <Link
          href={`/products/${item.productId}`}
          className="text-sm sm:text-base lg:text-lg font-bold text-ink hover:text-primary-600 transition-colors line-clamp-2"
        >
          {item.name}
        </Link>

        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-ink-soft">
          {item.color && (
            <span className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: item.color }}
              />
              <span className="line-clamp-1">{item.color}</span>
            </span>
          )}
          {item.gender && <span className="capitalize">{item.gender}</span>}
        </div>

        {/* Mobile Layout: Price and Controls Stack */}
        <div className="sm:hidden flex items-center justify-between gap-2 mt-2">
          <span className="text-sm font-bold text-ink">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
          <button
            onClick={() => onRemove(item.productItemId)}
            className="p-1.5 text-ink-muted hover:text-error-600 hover:bg-error-50 rounded transition-colors"
            aria-label="Remove item from cart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Layout: Price and Controls in Row */}
        <div className="hidden sm:flex items-center justify-between gap-3 mt-auto">
          <span className="text-base lg:text-lg font-bold text-ink">
            ${(item.price * item.quantity).toFixed(2)}
          </span>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-neutral-100 rounded-md p-1">
            <button
              onClick={() =>
                onQuantityChange(
                  item.productItemId,
                  Math.max(0, item.quantity - 1),
                )
              }
              className="p-1 hover:bg-neutral-200 rounded transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-ink-soft" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-ink">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                onQuantityChange(item.productItemId, item.quantity + 1)
              }
              className="p-1 hover:bg-neutral-200 rounded transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 text-ink-soft" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.productItemId)}
            className="p-1.5 text-ink-muted hover:text-error-600 hover:bg-error-50 rounded transition-colors"
            aria-label="Remove item from cart"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Quantity Controls */}
      <div className="sm:hidden flex items-center justify-center gap-2 bg-neutral-100 rounded-md p-1 mt-2">
        <button
          onClick={() =>
            onQuantityChange(item.productItemId, Math.max(0, item.quantity - 1))
          }
          className="p-1 hover:bg-neutral-200 rounded transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4 text-ink-soft" />
        </button>
        <span className="w-8 text-center text-sm font-medium text-ink">
          {item.quantity}
        </span>
        <button
          onClick={() =>
            onQuantityChange(item.productItemId, item.quantity + 1)
          }
          className="p-1 hover:bg-neutral-200 rounded transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4 text-ink-soft" />
        </button>
      </div>
    </div>
  );
}
