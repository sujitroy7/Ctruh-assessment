"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart";
import { getCart, addCartItem, updateCartItemQty, removeCartItem } from "@/lib/api/cart";

export function useCartSync() {
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const removeItemLocal = useCartStore((s) => s.removeItem);
  const updateQuantityLocal = useCartStore((s) => s.updateQuantity);
  const setSyncId = useCartStore((s) => s.setSyncId);
  const [syncing, setSyncing] = useState(false);

  // Always reflects the latest items without being a reactive dep of the sync effect
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const hasSynced = useRef(false);

  useEffect(() => {
    // session.user exists at runtime (set in NextAuth session callback) even though
    // TypeScript doesn't see 'id' — casting to any to access it safely.
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId || hasSynced.current) return;
    hasSynced.current = true;

    async function syncCart() {
      setSyncing(true);
      try {
        const res = await getCart();
        if (!res.success) return;

        const backendItems = res.data;
        // keyed by product_item_id (the product variant id)
        const backendMap = new Map(
          backendItems.map((item) => [item.product_item_id, item]),
        );
        const localItems = itemsRef.current;
        const localProductIds = new Set(localItems.map((i) => i.productItemId));

        // Step 1: Reconcile local items against backend
        for (const localItem of localItems) {
          const backendItem = backendMap.get(localItem.productItemId);

          if (!backendItem) {
            // Item exists locally but not on backend → create it
            const addRes = await addCartItem(localItem.productItemId, localItem.quantity);
            if (addRes.success) {
              setSyncId(localItem.productItemId, addRes.data._id);
            }
          } else if (backendItem.item_qty !== localItem.quantity) {
            // Qty differs → local wins, PATCH backend to match
            const patchRes = await updateCartItemQty(backendItem._id, localItem.quantity);
            if (patchRes.success) {
              setSyncId(localItem.productItemId, patchRes.data._id);
            }
          } else {
            // Already in sync → store the backend id for future operations
            setSyncId(localItem.productItemId, backendItem._id);
          }
        }

        // Step 2: Delete backend items that no longer exist locally
        for (const backendItem of backendItems) {
          if (!localProductIds.has(backendItem.product_item_id)) {
            await removeCartItem(backendItem._id);
          }
        }
      } catch (err) {
        console.error("[cart sync]", err);
      } finally {
        setSyncing(false);
      }
    }

    syncCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Enhanced removeItem: hits backend then updates local store
  const removeItem = useCallback(
    async (productItemId: string) => {
      const item = itemsRef.current.find((i) => i.productItemId === productItemId);
      if (item?.cartItemId) {
        try {
          await removeCartItem(item.cartItemId);
        } catch (err) {
          console.error("[cart] remove failed:", err);
        }
      }
      removeItemLocal(productItemId);
    },
    [removeItemLocal],
  );

  // Enhanced updateQuantity: PATCHes backend then updates local store
  const updateQuantity = useCallback(
    async (productItemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(productItemId);
        return;
      }

      const item = itemsRef.current.find((i) => i.productItemId === productItemId);
      if (item?.cartItemId) {
        try {
          await updateCartItemQty(item.cartItemId, quantity);
        } catch (err) {
          console.error("[cart] update qty failed:", err);
        }
      }
      updateQuantityLocal(productItemId, quantity);
    },
    [removeItem, updateQuantityLocal],
  );

  return { syncing, removeItem, updateQuantity };
}
