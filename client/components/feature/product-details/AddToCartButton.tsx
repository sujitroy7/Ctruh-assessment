"use client";

import { ShoppingCart } from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";
import { useCartStore } from "@/lib/store/cart";
import Button from "@/components/ui/Button";
import type { ProductItem } from "@/types/products";

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
      productItemId: selectedItem._id,
      productId,
      name: productName,
      color: selectedItem.color,
      gender: selectedItem.gender,
      price: selectedItem.price,
      image: selectedItem.images?.[0],
    });
  }

  return (
    <Button
      type="button"
      fullWidth
      size="lg"
      onClick={handleAddToCart}
      disabled={!inStock}
      leftIcon={<ShoppingCart />}
    >
      {inStock ? "Add to Cart" : "Out of Stock"}
    </Button>
  );
}
