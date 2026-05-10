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
  byId: Record<string, CartItem>;
  allIds: string[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productItemId: string) => void;
  updateQuantity: (productItemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      byId: {},
      allIds: [],

      addItem: (input) => {
        const qty = input.quantity ?? 1;
        set((state) => {
          const existing = state.byId[input.productItemId];
          if (existing) {
            return {
              byId: {
                ...state.byId,
                [input.productItemId]: {
                  ...existing,
                  quantity: existing.quantity + qty,
                },
              },
            };
          }
          return {
            byId: {
              ...state.byId,
              [input.productItemId]: { ...input, quantity: qty },
            },
            allIds: [...state.allIds, input.productItemId],
          };
        });
      },

      removeItem: (productItemId) => {
        set((state) => {
          const next = { ...state.byId };
          delete next[productItemId];
          return {
            byId: next,
            allIds: state.allIds.filter((id) => id !== productItemId),
          };
        });
      },

      updateQuantity: (productItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productItemId);
          return;
        }
        set((state) => ({
          byId: {
            ...state.byId,
            [productItemId]: { ...state.byId[productItemId], quantity },
          },
        }));
      },

      clearCart: () => set({ byId: {}, allIds: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ byId: state.byId, allIds: state.allIds }),
    },
  ),
);

export const selectTotalCount = (state: Pick<CartState, "byId">) =>
  Object.values(state.byId).reduce((sum, item) => sum + item.quantity, 0);

export const selectTotalPrice = (state: Pick<CartState, "byId">) =>
  Object.values(state.byId).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
