import { createRouter, createWebHistory } from 'vue-router';
import ProductListing from './pages/ProductListing.vue';
import CartPage from './pages/CartPage.vue';
import AdminProducts from './pages/AdminProducts.vue';
import OrderList from './pages/OrderList.vue';

const routes = [
  { path: '/', component: ProductListing },
  { path: '/cart', component: CartPage },
  { path: '/admin', component: AdminProducts },
  { path: '/orders', component: OrderList },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
