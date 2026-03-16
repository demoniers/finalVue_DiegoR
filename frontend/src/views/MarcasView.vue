<template>
  <div class="marcas-view">
    <div class="header-actions">
      <h1>Gestión de Marcas</h1>
      <button @click="showForm = !showForm" class="btn" :class="showForm ? 'btn-primary' : 'btn-secondary'">
        {{ showForm ? 'Cerrar Formulario' : 'Nueva Marca' }}
      </button>
    </div>

    <div class="content-layout" :class="{ 'no-form': !showForm }">
      <!-- List -->
      <div class="list-section">
        <div v-if="loading" class="loading">Cargando marcas...</div>
        <div v-else class="brands-grid">
          <div v-for="marca in brandsWithAvgPrice" :key="marca.id" 
               @click="selectMarca(marca.id)"
               class="brand-card card" 
               :class="{ active: selectedMarcaId === marca.id }">
            <div class="brand-info">
              <h3>{{ marca.nombre }}</h3>
              <p>{{ marca.origen }} ({{ marca.anioFundacion }})</p>
              <div class="avg-badge">Precio Promedio Extra: {{ marca.avgPrice.toFixed(2) }}€</div>
            </div>

            <transition name="expand">
              <div v-if="selectedMarcaId === marca.id" class="models-inline">
                <h4>Modelos y Precios:</h4>
                <ul>
                  <li v-for="modelo in getModelosByMarca(marca.id)" :key="modelo.id">
                    {{ modelo.modelo }}: <strong>+{{ modelo.extraPorModelo }}€</strong>
                  </li>
                  <li v-if="getModelosByMarca(marca.id).length === 0" class="empty">
                    No hay modelos registrados.
                  </li>
                </ul>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div v-if="showForm" class="form-section">
        <div class="card">
          <h3>Nueva Marca</h3>
          <form @submit.prevent="addMarca">
            <label>Nombre</label>
            <input v-model="newMarca.nombre" type="text" placeholder="Ej: BMW" required>
            
            <label>País de Origen</label>
            <input v-model="newMarca.origen" type="text" placeholder="Ej: Alemania" required>
            
            <label>Año de Fundación</label>
            <input v-model.number="newMarca.anioFundacion" type="number" required>
            
            <button type="submit" class="btn btn-primary w-100">Registrar Marca</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { MarcasService, ModelosService } from '../services/api';

const route = useRoute();
const marcas = ref([]);
const modelos = ref([]);
const selectedMarcaId = ref(null);
const loading = ref(true);
const showForm = ref(false);

const newMarca = ref({
  nombre: '',
  origen: '',
  anioFundacion: new Date().getFullYear()
});

const loadData = async () => {
  loading.value = true;
  try {
    const [marcasRes, modelosRes] = await Promise.all([
      MarcasService.getAll(),
      ModelosService.getAll()
    ]);
    marcas.value = marcasRes.data;
    modelos.value = modelosRes.data;
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
};

const brandsWithAvgPrice = computed(() => {
  return marcas.value.map(marca => {
    const marcaModelos = modelos.value.filter(m => m.idMarca === marca.id);
    const avgPrice = marcaModelos.length > 0
      ? marcaModelos.reduce((acc, m) => acc + (m.extraPorModelo || 0), 0) / marcaModelos.length
      : 0;
    return { ...marca, avgPrice };
  }).sort((a, b) => b.avgPrice - a.avgPrice);
});

const selectMarca = (id) => {
  selectedMarcaId.value = selectedMarcaId.value === id ? null : id;
};

const getModelosByMarca = (id) => {
  return modelos.value.filter(m => m.idMarca === id);
};

const addMarca = async () => {
  try {
    const res = await MarcasService.create({
      ...newMarca.value,
      id: String(Date.now())
    });
    marcas.value.push(res.data);
    newMarca.value = { nombre: '', origen: '', anioFundacion: new Date().getFullYear() };
  } catch (error) {
    console.error("Error creating marca:", error);
  }
};

watch(() => route.query.action, (newAction) => {
  if (newAction === 'new') {
    showForm.value = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, { immediate: true });

onMounted(loadData);
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.content-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.content-layout.no-form {
  grid-template-columns: 1fr;
}
... (rest of styles preserved)

.brand-card {
  cursor: pointer;
  transition: transform 0.2s, background 0.3s;
}

.brand-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
}

.brand-card.active {
  background: var(--bg-dark);
  border-color: var(--accent);
}

.avg-badge {
  display: inline-block;
  background: var(--accent);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.models-inline {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-glass);
}

.models-inline ul {
  list-style: none;
  margin-top: 0.5rem;
}

.models-inline li {
  font-size: 0.9rem;
  padding: 0.3rem 0;
  display: flex;
  justify-content: space-between;
}

.empty {
  color: var(--text-muted);
  font-style: italic;
}

/* Transitions */
.expand-enter-active, .expand-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.w-100 {
  width: 100%;
}

@media (max-width: 768px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}
</style>
