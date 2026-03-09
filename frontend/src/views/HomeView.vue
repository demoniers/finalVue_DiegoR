<template>
  <div class="home-view">
    <div class="hero card">
      <h1>Bienvenido a Renting Vue</h1>
      <p>Gestione su flota de vehículos de la manera más eficiente y moderna.</p>
      <div class="logo-placeholder">
        <img src="https://via.placeholder.com/300x150?text=LOGO+RENTING+VUE" alt="Company Logo" class="logo-img">
      </div>
    </div>
    
    <div class="stats grid">
      <div class="card stat-card">
        <h3>Marcas</h3>
        <p>Explore nuestras marcas líderes.</p>
        <router-link to="/marcas" class="btn btn-primary">Ver Marcas</router-link>
      </div>
      <div class="card stat-card">
        <h3>Modelos</h3>
        <p>Configuración y precios de modelos.</p>
        <router-link to="/modelos" class="btn btn-primary">Ver Modelos</router-link>
      </div>
      <div class="card stat-card">
        <h3>Vehículos</h3>
        <p>Nuestra flota actual disponible.</p>
        <router-link to="/vehiculos" class="btn btn-primary">Ver Vehículos</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 2rem;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(to right, var(--accent), var(--primary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-img {
  max-width: 100%;
  height: auto;
  border-radius: 1rem;
  margin-top: 2rem;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
}

.stat-card h3 {
  margin-bottom: 1rem;
}

.stat-card p {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}
</style>
