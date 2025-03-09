<template>
  <div class="max-w-6xl p-4 mx-auto">
    <h1 class="mb-6 text-3xl font-bold">Admin - Manage Products</h1>

    <!-- Create Product Form -->
    <div class="p-4 mb-6 rounded bg-gray-50">
      <h2 class="mb-4 text-2xl font-bold">Add New Product</h2>
      <form @submit.prevent="createProduct">
        <div class="mb-4">
          <label for="newName" class="block mb-2 font-semibold text-gray-700">
            Name
          </label>
          <input type="text" id="newName" v-model="newProduct.name" required placeholder="Product name"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300" />
        </div>
        <div class="mb-4">
          <label for="newPrice" class="block mb-2 font-semibold text-gray-700">
            Price
          </label>
          <input type="number" id="newPrice" v-model.number="newProduct.price" required placeholder="Product price"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300" />
        </div>
        <div class="mb-4">
          <label for="newStock" class="block mb-2 font-semibold text-gray-700">
            Stock
          </label>
          <input type="number" id="newStock" v-model.number="newProduct.stock" required placeholder="Product stock"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300" />
        </div>
        <button type="submit" class="px-4 py-2 text-white bg-green-600 rounded cursor-pointer hover:bg-green-700">
          Create Product
        </button>
      </form>
    </div>

    <!-- Products Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Price</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Stock</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="product in products" :key="product.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ product.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingId === product.id">
                <input type="text" v-model="editedProduct.name"
                  class="px-2 py-1 border border-gray-300 rounded focus:outline-none" />
              </div>
              <div v-else>
                {{ product.name }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingId === product.id">
                <input type="number" v-model.number="editedProduct.price" step="0.01"
                  class="px-2 py-1 border border-gray-300 rounded focus:outline-none" />
              </div>
              <div v-else>
                ${{ product.price }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingId === product.id">
                <input type="number" v-model.number="editedProduct.stock"
                  class="px-2 py-1 border border-gray-300 rounded focus:outline-none" />
              </div>
              <div v-else>
                {{ product.stock }}
              </div>
            </td>
            <td class="px-6 py-4 text-center whitespace-nowrap">
              <div v-if="editingId === product.id">
                <button @click="saveEdit(product.id)"
                  class="px-2 py-1 mr-2 text-white bg-blue-600 rounded cursor-pointer hover:bg-blue-700">
                  Save
                </button>
                <button @click="cancelEdit"
                  class="px-2 py-1 text-white bg-gray-400 rounded cursor-pointer hover:bg-gray-500">
                  Cancel
                </button>
              </div>
              <div v-else>
                <button @click="startEdit(product)"
                  class="px-2 py-1 mr-2 text-white bg-yellow-600 rounded cursor-pointer hover:bg-yellow-700">
                  Edit
                </button>
                <button @click="deleteProduct(product.id)"
                  class="px-2 py-1 text-white bg-red-600 rounded cursor-pointer hover:bg-red-700">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'AdminProducts',
  setup() {
    const products = ref([])

    // State for new product form
    const newProduct = ref({
      name: '',
      price: 0,
      stock: 0
    })

    // State for inline editing
    const editingId = ref(null)
    const editedProduct = ref({
      name: '',
      price: 0,
      stock: 0
    })

    // Fetch products from the product service API
    const fetchProducts = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_PRODUCT_SERVICE_URL)
        if (!res.ok) throw new Error('Failed to fetch products')
        products.value = await res.json()
      } catch (error) {
        console.error(error)
        alert('Error fetching products')
      }
    }

    // Create a new product (POST)
    const createProduct = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_PRODUCT_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct.value)
        })
        if (!res.ok) throw new Error('Failed to create product')
        await fetchProducts()
        newProduct.value = { name: '', price: 0, stock: 0 }
      } catch (error) {
        console.error(error)
        alert('Error creating product')
      }
    }

    // Start editing a product
    const startEdit = (product) => {
      editingId.value = product.id
      editedProduct.value = { ...product }
    }

    // Cancel editing
    const cancelEdit = () => {
      editingId.value = null
      editedProduct.value = { name: '', price: 0, stock: 0 }
    }

    // Save edits (PUT)
    const saveEdit = async (id) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_PRODUCT_SERVICE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedProduct.value)
        })
        if (!res.ok) throw new Error('Failed to update product')
        await fetchProducts()
        cancelEdit()
      } catch (error) {
        console.error(error)
        alert('Error updating product')
      }
    }

    // Delete a product (DELETE)
    const deleteProduct = async (id) => {
      if (!window.confirm('Are you sure you want to delete this product?')) {
        return
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_PRODUCT_SERVICE_URL}/${id}`, {
          method: 'DELETE'
        })
        if (!res.ok) throw new Error('Failed to delete product')
        await fetchProducts()
      } catch (error) {
        console.error(error)
        alert('Error deleting product')
      }
    }

    onMounted(() => {
      fetchProducts()
    })

    return {
      products,
      newProduct,
      createProduct,
      editingId,
      editedProduct,
      startEdit,
      cancelEdit,
      saveEdit,
      deleteProduct
    }
  }
}
</script>
