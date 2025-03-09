<template>
  <div class="max-w-4xl p-4 mx-auto">
    <h1 class="mb-4 text-3xl font-bold">Cart Details</h1>
    <!-- Display empty state if cart is empty -->
    <div v-if="cart.items.length === 0" class="text-gray-500">
      Your cart is empty.
    </div>
    <!-- If there are items, show detailed table -->
    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
              >
                Product
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
              >
                Price
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase"
              >
                Quantity
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
              >
                Subtotal
              </th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in cart.items" :key="item.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">${{ item.price }}</td>
              <td class="px-6 py-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center space-x-2">
                  <button
                    @click="decreaseQuantity(item)"
                    class="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                  >
                    -
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button
                    @click="increaseQuantity(item)"
                    class="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="confirmRemove(item)"
                  class="text-red-600 cursor-pointer hover:text-red-800"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total Price -->
      <div class="mt-4 text-right">
        <p class="text-xl font-bold">Total: ${{ totalPrice.toFixed(2) }}</p>
      </div>

      <!-- Navigation: Back to Products -->
      <div class="mt-4">
        <router-link
          to="/"
          class="inline-block px-4 py-2 text-white bg-blue-600 rounded cursor-pointer hover:bg-blue-700"
        >
          Back to Products
        </router-link>
      </div>

      <!-- Checkout Form -->
      <div class="p-6 mt-8 rounded bg-gray-50">
        <h2 class="mb-4 text-2xl font-bold">Checkout</h2>
        <form @submit.prevent="checkout">
          <div class="mb-4">
            <label
              for="customerName"
              class="block mb-2 font-semibold text-gray-700"
            >
              Your Name
            </label>
            <input
              type="text"
              id="customerName"
              v-model="customerName"
              required
              placeholder="Enter your name"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-4 py-2 text-white bg-green-600 rounded cursor-pointer hover:bg-green-700 disabled:opacity-50"
          >
            <span v-if="isLoading">Processing...</span>
            <span v-else>Confirm Order</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useCartStore } from '../stores/cartStore';
import { useRouter } from 'vue-router';

export default {
  name: 'CartPage',
  setup() {
    const cart = useCartStore();
    const router = useRouter();
    const customerName = ref('');
    const isLoading = ref(false);

    // Compute total price based on cart items
    const totalPrice = computed(() => {
      return cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    });

    // Increase quantity for a given item
    const increaseQuantity = item => {
      item.quantity++;
    };

    // Decrease quantity; if quantity becomes 1 and then decreased, ask for confirmation to remove the item
    const decreaseQuantity = item => {
      if (item.quantity === 1) {
        if (
          window.confirm(
            `Are you sure you want to remove "${item.name}" from the cart?`,
          )
        ) {
          cart.removeFromCart(item.id);
        }
      } else {
        item.quantity--;
      }
    };

    // Confirm removal when user clicks the "Remove" button
    const confirmRemove = item => {
      if (
        window.confirm(
          `Are you sure you want to remove "${item.name}" from the cart?`,
        )
      ) {
        cart.removeFromCart(item.id);
      }
    };

    // Checkout with loading state
    const checkout = async () => {
      if (!customerName.value.trim()) {
        alert('Please enter your name.');
        return;
      }
      isLoading.value = true;
      const orderData = {
        customerName: customerName.value,
        items: cart.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };
      try {
        const res = await fetch(import.meta.env.VITE_ORDER_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        if (!res.ok) throw new Error('Order submission failed');
        cart.clearCart();
        router.push('/');
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed. Please try again.');
      } finally {
        isLoading.value = false;
      }
    };

    return {
      cart,
      totalPrice,
      customerName,
      isLoading,
      increaseQuantity,
      decreaseQuantity,
      confirmRemove,
      checkout,
    };
  },
};
</script>
