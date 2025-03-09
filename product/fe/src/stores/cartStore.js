import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  actions: {
    addToCart(product) {
      const existing = this.items.find(item => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({ ...product, quantity: 1 });
      }
    },
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId);
    },
    clearCart() {
      this.items = [];
    },
  },
  // Automatically persist this store's state in localStorage
  persist: true,
});
