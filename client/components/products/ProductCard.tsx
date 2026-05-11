"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ShoppingCart, Pencil } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/types/products";
import Button from "@/components/ui/Button";

interface Props extends Pick<Product, "_id" | "name" | "items"> {
  badge?: string;
  className?: string;
}

export default function ProductCard({
  _id,
  name,
  items,
  badge,
  className,
}: Props) {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const isOwner =
    !!session?.user && "role" in session.user && session.user.role === "owner";

  // Avoid duplicacy
  const colors = [...new Set(items.map((item) => item.color.toLowerCase()))];
  const genders = [...new Set(items.map((item) => item.gender.toLowerCase()))];

  const [selectedGender, setSelectedGender] = useState(genders[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");

  const selectedItem =
    items.find(
      (item) =>
        item.gender.toLowerCase() === selectedGender &&
        item.color.toLowerCase() === selectedColor,
    ) ??
    items.find((item) => item.color.toLowerCase() === selectedColor) ??
    items[0];

  const image = "/product/tshirt-1.jpg";
  // const image =
  //   selectedItem?.images[0] ??
  //   activeItems.find((item) => item.images.length > 0)?.images[0] ??
  //   "";
  const displayPrice =
    selectedItem?.price ??
    (items.length > 0 ? Math.min(...items.map((item) => item.price)) : null);

  const displayedColors = colors.length > 5 ? colors.slice(0, 3) : colors;

  function handleGenderSelect(gender: string) {
    setSelectedGender(gender);
    const colorsForGender = [
      ...new Set(
        items
          .filter((item) => item.gender.toLowerCase() === gender)
          .map((item) => item.color.toLowerCase()),
      ),
    ];
    if (
      colorsForGender.length > 0 &&
      !colorsForGender.includes(selectedColor)
    ) {
      setSelectedColor(colorsForGender[0]);
    }
  }

  function handleColorSelect(color: string) {
    setSelectedColor(color);
    const gendersForColor = [
      ...new Set(
        items
          .filter((item) => item.color.toLowerCase() === color)
          .map((item) => item.gender.toLowerCase()),
      ),
    ];
    if (
      gendersForColor.length > 0 &&
      !gendersForColor.includes(selectedGender)
    ) {
      setSelectedGender(gendersForColor[0]);
    }
  }

  return (
    <div
      className={clsx(
        "flex flex-col rounded-lg border border-border bg-surface shadow-card hover:shadow-md transition-shadow overflow-hidden",
        className,
      )}
    >
      <Link href={`/products/${_id}`} className="relative block">
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
        <p className="text-xs sm:text-sm font-bold text-ink leading-snug line-clamp-2">
          {name}
        </p>

        {genders.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genders.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleGenderSelect(g)}
                className={clsx(
                  "px-2 py-0.5 rounded text-xs capitalize transition-colors",
                  selectedGender === g
                    ? "bg-neutral-200 text-ink-soft font-medium"
                    : "bg-neutral-100 text-ink-muted hover:bg-neutral-200",
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {displayedColors.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => handleColorSelect(color)}
                className={clsx(
                  "w-5 h-5 rounded-full border shrink-0 transition-all",
                  selectedColor === color
                    ? "border-neutral-300 ring-2 ring-offset-1 ring-neutral-300"
                    : "border-border hover:opacity-80",
                )}
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

        {displayPrice !== null && (
          <span className="text-sm sm:text-base font-bold text-ink">
            ${displayPrice.toFixed(2)}
          </span>
        )}
      </div>

      <div className="mt-auto px-2 sm:px-3 pb-2 sm:pb-3">
        {isOwner ? (
          <Button
            href={`/admin/products/${_id}`}
            fullWidth
            size="md"
            leftIcon={<Pencil />}
            className="!bg-ink hover:!bg-ink/90 !rounded-lg active:scale-[0.98]"
          >
            Edit Product
          </Button>
        ) : (
          <Button
            type="button"
            fullWidth
            size="md"
            disabled={!selectedItem || selectedItem.stock <= 0}
            onClick={() => {
              if (!selectedItem || selectedItem.stock <= 0) return;
              addItem({
                productItemId: selectedItem._id,
                productId: _id,
                name,
                color: selectedItem.color,
                gender: selectedItem.gender,
                price: selectedItem.price,
                image: selectedItem.images?.[0],
              });
            }}
            leftIcon={<ShoppingCart />}
            className="!bg-ink hover:!bg-ink/90 !rounded-lg active:scale-[0.98]"
          >
            {selectedItem && selectedItem.stock <= 0
              ? "Out of Stock"
              : "Add to Cart"}
          </Button>
        )}
      </div>
    </div>
  );
}
