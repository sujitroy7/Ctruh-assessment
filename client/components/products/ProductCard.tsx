"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Star } from "lucide-react";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  price: number;
  originalPrice: number;
  bestPrice?: number;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  colorCount?: number;
  onAddToCart?: () => void;
  className?: string;
}

export default function ProductCard({
  id,
  image,
  name,
  price,
  originalPrice,
  bestPrice,
  badge,
  rating,
  reviewCount,
  colorCount,
  onAddToCart,
  className,
}: ProductCardProps) {
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <div
      className={clsx(
        "flex flex-col rounded-lg border border-border bg-surface shadow-card hover:shadow-md transition-shadow overflow-hidden",
        className,
      )}
    >
      {/* Image + overlays */}
      <Link href={`/products/${id}`} className="relative block">
        <div className="relative w-full aspect-[3/4]">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {/* Badge — top-left */}
        {badge && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-surface rounded-lg shadow-sm">
            <span className="text-xs font-bold text-success-600 tracking-wide uppercase">
              {badge}
            </span>
          </div>
        )}

        {/* Bottom row overlays */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          {/* Rating + review count */}
          {(rating != null || reviewCount != null) && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-warning-400 text-warning-400 shrink-0" />
              {rating != null && (
                <span className="text-xs font-medium text-ink-inverse">{rating}</span>
              )}
              {reviewCount != null && (
                <>
                  <span className="text-xs text-ink-disabled">|</span>
                  <span className="text-xs font-medium text-ink-inverse">{reviewCount}</span>
                </>
              )}
            </div>
          )}

          {/* Color count */}
          {colorCount != null && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm ml-auto">
              <div className="flex w-5 h-3 rounded-full overflow-hidden shrink-0">
                <div className="w-1/2 bg-warning-300" />
                <div className="w-1/2 bg-primary-500" />
              </div>
              <span className="text-xs font-medium text-ink-inverse">{colorCount}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-col gap-1.5 px-3 pt-3 pb-2">
        {/* Price row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-ink">₹{price.toLocaleString("en-IN")}</span>
          <span className="text-sm text-ink-muted line-through">
            ₹{originalPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-sm font-semibold text-success-600">{discountPercent}% OFF</span>
        </div>

        {/* Best price */}
        {bestPrice != null && (
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-success-600 text-ink-inverse text-[9px] font-bold shrink-0">
              %
            </span>
            <span className="text-sm font-semibold text-success-600">
              Best price ₹{bestPrice.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {/* Product name */}
        <p className="text-sm text-ink-muted truncate">{name}</p>
      </div>

      {/* Add to cart */}
      <div className="mt-auto border-t border-border">
        <button
          type="button"
          onClick={onAddToCart}
          className="w-full py-3 text-sm font-bold text-ink text-center hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}
