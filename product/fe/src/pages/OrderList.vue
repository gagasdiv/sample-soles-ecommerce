<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const autoRefreshSeconds = 3;

const orders = ref([]);
const loading = ref(false);
const fetchInterval = ref(null);

async function fetchOrders() {
  loading.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_ORDER_SERVICE_URL}`);

    if (!res.ok) throw new Error('Failed to fetch orders');

    const data = await res.json();
    orders.value = data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  } finally {
    loading.value = false;
  }
}

// Auto-refresh orders every 3 seconds
onMounted(() => {
  fetchOrders();
  fetchInterval.value = setInterval(fetchOrders, autoRefreshSeconds * 1000);
});
onUnmounted(() => {
  clearInterval(fetchInterval.value);
});
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold">Order List</h1>
      <h6 class="text-sm text-gray-500">
        Auto-refresh every {{ autoRefreshSeconds }} seconds
      </h6>
      <div>
        <button
          @click="fetchOrders"
          class="bg-blue-500 text-white text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-blue-700"
        >
          refresh now
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500">Loading orders...</div>

    <div v-else-if="orders.length === 0" class="text-gray-500">
      No orders found.
    </div>

    <div v-else class="flex flex-row flex-wrap -mx-4">
      <div v-for="order in orders" :key="order.id" class="px-2 py-1 basis-1/5">
        <div class="p-2 border rounded-md">
          <p class="font-semibold">Order ID: {{ order.id }}</p>
          <p>Customer: {{ order.customerName }}</p>
          <p>
            Status:
            <span
              :class="{
                'text-green-500': order.status === 'completed',
                'text-yellow-500': order.status === 'checked',
                'text-red-500': order.status === 'rejected',
                'text-blue-500':
                  order.status === 'created' ||
                  order.status === 'paid' ||
                  order.status === 'shipped',
              }"
            >
              {{ order.status }}
            </span>
          </p>
          <!-- Product Details -->
          <div class="mt-2 text-sm">
            <p class="font-semibold">
              Product IDs:
              {{
                order.items
                  .map(item => `${item.productId} (x${item.quantity})`)
                  .join(', ')
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
