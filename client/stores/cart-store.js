import { create } from "zustand";
import axios from "@/lib/axios";

const useCartStore = create((set, get) => ({
    items: [],
    loading: false,
    error: null,

    // Fetch the current user's cart
    fetchCart: async () => {
        try {
            set({ loading: true, error: null });
            const response = await axios.get("/cart");
            set({ items: response.data.items });
        } catch (error) {
            set({ error: error.response?.data?.error || "Failed to fetch cart" });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Add a meal to the cart
    addToCart: async (mealId) => {
        try {
            set({ loading: true, error: null });
            const response = await axios.post("/cart/add", { mealId });
            const cartItem = response.data.cartItem;
            // Update cart items: if the meal is already in the cart, update its quantity, otherwise add new
            const existingItems = get().items;
            const existingIndex = existingItems.findIndex(
                (item) => item.mealId === cartItem.mealId
            );
            if (existingIndex >= 0) {
                existingItems[existingIndex] = cartItem;
                set({ items: [...existingItems] });
            } else {
                set({ items: [cartItem, ...existingItems] });
            }
            return cartItem;
        } catch (error) {
            set({ error: error.response?.data?.error || "Failed to add to cart" });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Remove a cart item by its ID
    removeFromCart: async (cartItemId) => {
        try {
            set({ loading: true, error: null });
            await axios.delete(`/api/cart/item/${cartItemId}`);
            set({
                items: get().items.filter((item) => item.id !== cartItemId),
            });
        } catch (error) {
            set({ error: error.response?.data?.error || "Failed to remove from cart" });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Update the quantity of a cart item
    updateCartItemQuantity: async (cartItemId, quantity) => {
        try {
            // Optimistically update the UI
            const previousItems = get().items;
            set({
                items: previousItems.map((item) =>
                    item.id === cartItemId ? { ...item, quantity } : item
                ),
                error: null
            });

            // Make API call
            const response = await axios.put(`/cart/item/${cartItemId}`, { quantity });
            const updatedCartItem = response.data.cartItem;

            // Update with server response
            set({
                items: get().items.map((item) =>
                    item.id === cartItemId ? updatedCartItem : item
                )
            });
        } catch (error) {
            // Revert on error
            set({
                items: get().items,
                error: error.response?.data?.error || "Failed to update cart item quantity"
            });
        }
    },

    removeFromCart: async (cartItemId) => {
        try {
            const previousItems = get().items;
            set({
                items: previousItems.filter((item) => item.id !== cartItemId),
                error: null
            });

            await axios.delete(`/cart/item/${cartItemId}`);
        } catch (error) {
            // Revert on error
            set({
                items: previousItems,
                error: error.response?.data?.error || "Failed to remove from cart"
            });
        }
    },

    // Reset the cart state
    resetCart: () => set({ items: [], loading: false, error: null }),
}));

export default useCartStore;
