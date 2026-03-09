import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: HomeView,
  },
  {
    path: '/marcas',
    name: 'Marcas',
    component: () => import('../views/MarcasView.vue'),
  },
  {
    path: '/modelos',
    name: 'Modelos',
    component: () => import('../views/ModelosView.vue'),
  },
  {
    path: '/vehiculos',
    name: 'Vehiculos',
    component: () => import('../views/VehiculosView.vue'),
  },
  {
    path: '/alquiler',
    name: 'Alquiler',
    component: () => import('../views/AlquilerView.vue'),
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('../views/ClientesView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
