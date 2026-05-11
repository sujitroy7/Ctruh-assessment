"use client";

import { ShoppingCart } from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";
import { useCartStore } from "@/lib/store/cart";

interface ProductItem {
  id: string;
  gender: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
}

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  items: ProductItem[];
  defaultColor: string;
  defaultGender: string;
}

export default function AddToCartButton({
  productId,
  productName,
  items,
  defaultColor,
  defaultGender,
}: AddToCartButtonProps) {
  const [selectedColor] = useQueryState(
    "color",
    parseAsString.withDefault(defaultColor),
  );
  const [selectedGender] = useQueryState(
    "gender",
    parseAsString.withDefault(defaultGender),
  );

  const addItem = useCartStore((s) => s.addItem);

  const selectedItem = items.find(
    (item) =>
      item.color.toLowerCase() === selectedColor.toLowerCase() &&
      item.gender.toLowerCase() === selectedGender.toLowerCase(),
  );

  const inStock = selectedItem ? selectedItem.stock > 0 : false;

  function handleAddToCart() {
    if (!selectedItem || !inStock) return;
    addItem({
      productItemId: selectedItem.id,
      productId,
      name: productName,
      color: selectedItem.color,
      gender: selectedItem.gender,
      price: selectedItem.price,
      image: selectedItem.images[0],
    });
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!inStock}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-ink text-ink-inverse text-sm font-semibold hover:bg-ink/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
    >
      <ShoppingCart className="w-4 h-4" />
      {inStock ? "Add to Cart" : "Out of Stock"}
    </button>
  );
}
