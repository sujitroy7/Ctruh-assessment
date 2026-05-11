import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productItemId: string;
  productId: string;
  name: string;
  color: string;
  gender: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productItemId: string) => void;
  updateQuantity: (productItemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input) => {
        const qty = input.quantity ?? 1;
        set((state) => {
          const existing = state.items.find(
            (i) => i.productItemId === input.productItemId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productItemId === input.productItemId
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...input, quantity: qty }] };
        });
      },

      removeItem: (productItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productItemId !== productItemId),
        }));
      },

      updateQuantity: (productItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productItemId === productItemId ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectTotalCount = (state: Pick<CartState, "items">) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectTotalPrice = (state: Pick<CartState, "items">) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
