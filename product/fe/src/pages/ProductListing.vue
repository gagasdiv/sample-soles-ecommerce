<template>
  <div class="grid max-w-6xl grid-cols-1 gap-12 p-4 mx-auto md:grid-cols-3">
    <!-- Left Column: Products Listing -->
    <div class="md:col-span-2">
      <h1 class="mb-4 text-3xl font-bold">Products</h1>
      <!-- Empty state if no products -->
      <div v-if="products.length === 0" class="py-8 text-center text-gray-500">
        No products available.
      </div>
      <!-- Product list -->
      <div v-else class="space-y-4">
        <div v-for="product in products" :key="product.id"
          class="flex items-center justify-between p-2 bg-white rounded shadow">
          <p class="space-x-2">
            <span class="text-lg font-semibold">{{ product.name }}</span>
            <span class="text-sm text-gray-600">(${{ product.price }})</span>
            <span class="text-sm text-gray-500">Stock: {{ product.stock }}</span>
          </p>
          <button @click="addToCart(product)"
            class="px-2 py-1 text-sm text-white bg-blue-600 rounded cursor-pointer hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Right Column: Sticky Cart Summary -->
    <div class="md:col-span-1">
      <div class="sticky p-4 bg-white rounded shadow top-4">
        <h2 class="mb-4 text-2xl font-bold">Cart Summary</h2>
        <div v-if="cart.items.length === 0" class="text-gray-500">
          Your cart is empty.
        </div>
        <div v-else>
          <ul class="mb-4 space-y-2">
            <li v-for="item in cart.items" :key="item.id" class="flex justify-between">
              <span>{{ item.name }} (x{{ item.quantity }})</span>
              <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
            </li>
          </ul>
          <router-link to="/cart"
            class="block w-full px-4 py-2 text-center text-white bg-green-600 rounded hover:bg-green-700">
            View Cart
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useCartStore } from '../stores/cartStore'
import { onUnmounted } from 'vue'

export default {
  name: 'Home',
  setup() {
    const products = ref([])
    const cart = useCartStore()
    let intervalId = null

    const fetchProducts = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_PRODUCT_SERVICE_URL)
        products.value = await res.json()
      } catch (err) {
        console.error('Error fetching products:', err)
      }
    }

    const addToCart = (product) => {
      cart.addToCart(product)
    }

    onMounted(() => {
      fetchProducts()
      // Auto refresh the products list every 5 seconds
      intervalId = setInterval(fetchProducts, 5000)
    })

    onUnmounted(() => {
      clearInterval(intervalId)
    })

    return { products, addToCart, cart }
  }
}
</script>
