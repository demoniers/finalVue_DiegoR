<template>
  <div class="vehiculos-view">
    <div class="header-actions">
      <h1>Flota de Vehículos</h1>
      <div class="view-toggle">
        <button @click="showForm = !showForm" class="btn" :class="showForm ? 'btn-primary' : 'btn-secondary'">
          {{ showForm ? 'Cerrar Formulario' : 'Nuevo Vehículo' }}
        </button>
        <button @click="viewMode = 'gallery'" class="btn" :class="viewMode === 'gallery' ? 'btn-primary' : 'btn-secondary'">Galería</button>
        <button @click="viewMode = 'list'" class="btn" :class="viewMode === 'list' ? 'btn-primary' : 'btn-secondary'">Lista</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters card grid-filter">
      <div>
        <label>Marca</label>
        <select v-model="filterMarca">
          <option value="">Todas</option>
          <option v-for="marca in marcas" :key="marca.id" :value="marca.id">{{ marca.nombre }}</option>
        </select>
      </div>
      <div>
        <label>Modelo</label>
        <select v-model="filterModelo" :disabled="!availableModels.length">
          <option value="">Todos</option>
          <option v-for="modelo in availableModels" :key="modelo.id" :value="modelo.id">{{ modelo.modelo }}</option>
        </select>
      </div>
    </div>

    <div class="main-layout" :class="{ 'no-form': !showForm }">
      <!-- Vehicles Display -->
      <div class="display-section">
        <div v-if="viewMode === 'gallery'" class="gallery-grid">
          <div v-for="v in filteredVehicules" :key="v.id" class="vehicle-card card">
            <img :src="v.imageUrl || 'https://via.placeholder.com/300x200?text=Coche'" class="vehicle-img">
            <div class="vehicle-details">
              <h3>{{ getModelInfo(v.idModelo).marca }} {{ getModelInfo(v.idModelo).modelo }}</h3>
              <p class="price">{{ v.precioDia + getModelInfo(v.idModelo).extra }}€ <span>/ día</span></p>
              <div class="specs">
                <span>{{ v.puertas }} puertas</span>
                <span v-if="v.sillaInfantil">👶 Silla infantil</span>
              </div>
              
              <!-- Requirement 7.2: List of clients who rented this vehicle -->
              <div class="rental-history-mini">
                <h4>Historial de Alquileres:</h4>
                <div v-if="getClientsForVehicle(v.id).length > 0" class="client-tags">
                   <span v-for="c in getClientsForVehicle(v.id)" :key="c.id" class="client-tag">
                     {{ c.nombre }}
                   </span>
                </div>
                <p v-else class="text-muted italic small">Sin alquileres previos.</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="list-view card">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Marca/Modelo</th>
                <th>Precio/Día</th>
                <th>Características</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in filteredVehicules" :key="v.id">
                <td><img :src="v.imageUrl" width="80" class="thumb"></td>
                <td>{{ getModelInfo(v.idModelo).marca }} {{ getModelInfo(v.idModelo).modelo }}</td>
                <td>{{ v.precioDia + getModelInfo(v.idModelo).extra }}€</td>
                <td>{{ v.puertas }} puertas, {{ v.sillaInfantil ? 'Con silla' : 'Sin silla' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Creation Form -->
      <div class="form-section">
        <div class="card">
          <h3>Nuevo Vehículo</h3>
          <p v-if="filterMarca || filterModelo" class="notice text-muted">Ajuste los filtros para pre-seleccionar Marca/Modelo.</p>
          <form @submit.prevent="addVehicle">
            <label>Modelo</label>
            <select v-model="newVehicle.idModelo" :disabled="!!filterModelo" required>
              <option value="" disabled>Seleccione un modelo</option>
              <option v-for="m in modelos" :key="m.id" :value="m.id">
                {{ getModelInfo(m.id).marca }} - {{ m.modelo }}
              </option>
            </select>

            <label>Precio Día Base (€)</label>
            <input v-model.number="newVehicle.precioDia" type="number" step="0.01" required>

            <label>Nº Puertas</label>
            <input v-model.number="newVehicle.puertas" type="number" required>

            <label class="checkbox-label">
              <input v-model="newVehicle.sillaInfantil" type="checkbox"> Silla Infantil Incluida
            </label>

            <button type="submit" class="btn btn-primary w-100">Registrar Vehículo</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { MarcasService, ModelosService, VehiculosService, ClientesService } from '../services/api';

const route = useRoute();
const marcas = ref([]);
const modelos = ref([]);
const vehiculos = ref([]);
const clientes = ref([]);
const loading = ref(true);

const filterMarca = ref('');
const filterModelo = ref('');
const viewMode = ref('gallery'); // 'gallery' | 'list'
const showForm = ref(false);

const newVehicle = ref({
  idModelo: '',
  precioDia: 0,
  puertas: 5,
  sillaInfantil: false,
  imageUrl: 'https://via.placeholder.com/300x200?text=Vehiculo'
});

const loadData = async () => {
  loading.value = true;
  try {
    const [marcasRes, modelosRes, vehiculosRes, clientesRes] = await Promise.all([
      MarcasService.getAll(),
      ModelosService.getAll(),
      VehiculosService.getAll(),
      ClientesService.getAll()
    ]);
    marcas.value = marcasRes.data;
    modelos.value = modelosRes.data;
    vehiculos.value = vehiculosRes.data;
    clientes.value = clientesRes.data;
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
};

const getClientsForVehicle = (vehicleId) => {
  return clientes.value.filter(c => 
    c.alquileres && c.alquileres.some(a => a.vehiculo === vehicleId || a.idVehiculo === vehicleId)
  );
};

const availableModels = computed(() => {
  if (!filterMarca.value) return modelos.value;
  return modelos.value.filter(m => m.idMarca === filterMarca.value);
});

const filteredVehicules = computed(() => {
  let list = vehiculos.value;
  if (filterMarca.value) {
    const marcaModelIds = modelos.value.filter(m => m.idMarca === filterMarca.value).map(m => m.id);
    list = list.filter(v => marcaModelIds.includes(v.idModelo));
  }
  if (filterModelo.value) {
    list = list.filter(v => v.idModelo === filterModelo.value);
  }
  return list;
});

const getModelInfo = (idModelo) => {
  const model = modelos.value.find(m => m.id === idModelo);
  const brand = marcas.value.find(b => b.id === model?.idMarca);
  return {
    modelo: model?.modelo || 'Unknown',
    marca: brand?.nombre || 'Unknown',
    extra: model?.extraPorModelo || 0
  };
};

const addVehicle = async () => {
  try {
    const res = await VehiculosService.create({
      ...newVehicle.value,
      id: String(Date.now())
    });
    vehiculos.value.push(res.data);
    newVehicle.value = {
      idModelo: filterModelo.value || '',
      precioDia: 0,
      puertas: 5,
      sillaInfantil: false,
      imageUrl: 'https://via.placeholder.com/300x200?text=Vehiculo'
    };
  } catch (error) {
    console.error("Error creating vehicle:", error);
  }
};

watch(filterMarca, () => {
  filterModelo.value = '';
});

// Update pre-selection in form when filters change
watch([filterMarca, filterModelo], () => {
  if (filterModelo.value) {
    newVehicle.value.idModelo = filterModelo.value;
  } else if (!filterMarca.value) {
    newVehicle.value.idModelo = '';
  }
});

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

.grid-filter {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.main-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.main-layout.no-form {
  grid-template-columns: 1fr;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.vehicle-card {
  padding: 0;
  overflow: hidden;
}

.vehicle-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.vehicle-details {
  padding: 1rem;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--accent);
  margin: 0.5rem 0;
}

.price span {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.specs {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
  margin-bottom: 0;
  background: var(--bg-dark);
  border-left: 4px solid var(--accent);
}

.rental-history-mini {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0,0,0,0.05);
}

.rental-history-mini h4 {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  letter-spacing: 0.05rem;
}

.client-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.client-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.italic { font-style: italic; }
.small { font-size: 0.75rem; }

.thumb {
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}
</style>
