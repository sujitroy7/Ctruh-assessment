"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ShoppingCart } from "lucide-react";

interface ProductItem {
  id: string;
  gender: string;
  type: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
  is_deleted: boolean;
}

interface ProductCardProps {
  id: string;
  name: string;
  items: ProductItem[];
  badge?: string;
  onAddToCart?: () => void;
  className?: string;
}

export default function ProductCard({ id, name, items, badge, onAddToCart, className }: ProductCardProps) {
  const activeItems = items.filter((item) => !item.is_deleted);

  const image = activeItems.find((item) => item.images.length > 0)?.images[0] ?? "";
  const colors = [...new Set(activeItems.map((item) => item.color.toLowerCase()))];
  const genders = [...new Set(activeItems.map((item) => item.gender.toLowerCase()))];
  const minPrice = activeItems.length > 0 ? Math.min(...activeItems.map((item) => item.price)) : null;

  return (
    <div
      className={clsx(
        "flex flex-col rounded-lg border border-border bg-surface shadow-card hover:shadow-md transition-shadow overflow-hidden",
        className,
      )}
    >
      <Link href={`/products/${id}`} className="relative block">
        <div className="relative w-full aspect-[3/4] bg-neutral-100">
          {image && (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          )}
          {badge && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-error-600 text-ink-inverse text-xs font-bold shadow-sm">
              {badge}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1.5 sm:gap-2 px-2 sm:px-3 pt-2 sm:pt-3 pb-2 sm:pb-3">
        <p className="text-xs sm:text-sm font-bold text-ink leading-snug line-clamp-2">{name}</p>

        {genders.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genders.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded text-xs text-ink-muted bg-neutral-100 capitalize"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {(colors.length > 5 ? colors.slice(0, 3) : colors).map((color) => (
              <span
                key={color}
                title={color}
                className="w-5 h-5 rounded-full border border-border shrink-0"
                style={{ backgroundColor: color }}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-xs text-ink-muted font-medium">
                +{colors.length - 3} more
              </span>
            )}
          </div>
        )}

        {minPrice !== null && (
          <span className="text-sm sm:text-base font-bold text-ink">${minPrice.toFixed(2)}</span>
        )}
      </div>

      <div className="mt-auto px-2 sm:px-3 pb-2 sm:pb-3">
        <button
          type="button"
          onClick={onAddToCart}
          className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-lg bg-ink text-ink-inverse text-xs sm:text-sm font-semibold hover:bg-ink/90 active:scale-[0.98] transition-all"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
