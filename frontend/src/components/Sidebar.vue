<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      RENTING VUE
    </div>
    <ul class="nav-links">
      <li>
        <router-link to="/" class="nav-link" active-class="active">
          <i class="fas fa-home"></i> <span>Inicio</span>
        </router-link>
      </li>
      <li>
        <router-link to="/marcas" class="nav-link" active-class="active">
          <i class="fas fa-tags"></i> <span>Marcas</span>
        </router-link>
      </li>
      <li>
        <router-link to="/modelos" class="nav-link" active-class="active">
          <i class="fas fa-car-side"></i> <span>Modelos</span>
        </router-link>
      </li>
      <li>
        <router-link to="/vehiculos" class="nav-link" active-class="active">
          <i class="fas fa-car"></i> <span>Vehículos</span>
        </router-link>
      </li>
      <li>
        <router-link to="/alquiler" class="nav-link" active-class="active">
          <i class="fas fa-key"></i> <span>Alquiler</span>
        </router-link>
      </li>
      <li>
        <router-link to="/clientes" class="nav-link" active-class="active">
          <i class="fas fa-users"></i> <span>Clientes</span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
/* Scoped styles if needed, but main layout is in main.css */
</style>
