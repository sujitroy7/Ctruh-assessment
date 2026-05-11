"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore, selectTotalPrice, selectTotalCount } from "@/lib/store/cart";
import { useCartSync } from "@/lib/hooks/useCartSync";
import Button from "@/components/ui/Button";
import CartProduct from "@/components/cart/CartProduct";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const { syncing, removeItem, updateQuantity } = useCartSync();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalPrice = selectTotalPrice({ items });
  const totalCount = selectTotalCount({ items });

  if (items.length === 0 && isMounted) {
    return (
      <main className="min-h-screen bg-canvas px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-ink">
            Your Cart
          </h1>
          <div className="mt-8 sm:mt-10 lg:mt-12 flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 rounded-lg border border-border bg-surface">
            <ShoppingBag className="w-10 sm:w-12 lg:w-14 text-ink-muted mb-4" />
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-ink mb-2 text-center">
              Your cart is empty
            </p>
            <p className="text-xs sm:text-sm lg:text-base text-ink-soft mb-6 sm:mb-8 text-center px-4">
              Start shopping to add items to your cart
            </p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-ink mb-6 sm:mb-8">
          Your Cart
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Items Section */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            {syncing && (
              <p className="text-xs text-ink-muted">Syncing cart…</p>
            )}
            {!isMounted ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-ink-muted">
                  Loading cart...
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-border bg-surface">
                <ShoppingBag className="w-10 h-10 text-ink-muted mb-3" />
                <p className="text-ink-soft">Your cart is empty</p>
              </div>
            ) : (
              items.map((item) => (
                <CartProduct
                  key={item.productItemId}
                  item={item}
                  onRemove={removeItem}
                  onQuantityChange={updateQuantity}
                />
              ))
            )}
          </div>

          {/* Summary Section */}
          <div className="md:col-span-1">
            <div className="sticky top-4 sm:top-20 rounded-lg border border-border bg-surface shadow-card p-4 sm:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-ink mb-4 sm:mb-5">
                Order Summary
              </h2>

              <div className="space-y-2 sm:space-y-3 pb-3 sm:pb-4 border-b border-border">
                <div className="flex justify-between text-xs sm:text-sm text-ink-soft">
                  <span>Items ({totalCount})</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-ink-soft">
                  <span>Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 mb-4 sm:mb-6 flex justify-between items-center">
                <span className="text-sm sm:text-base font-bold text-ink">
                  Total
                </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-ink">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Link href="/checkout" className="block">
                  <Button fullWidth size="lg" className="text-xs sm:text-sm">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link href="/">
                  <Button
                    variant="secondary"
                    fullWidth
                    size="md"
                    className="text-xs sm:text-sm"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
