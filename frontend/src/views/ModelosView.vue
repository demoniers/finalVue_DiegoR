<template>
  <div class="modelos-view">
    <div class="header-actions">
      <h1>Gestión de Modelos</h1>
      <button @click="showForm = !showForm" class="btn" :class="showForm ? 'btn-primary' : 'btn-secondary'">
        {{ showForm ? 'Cerrar Formulario' : 'Nuevo Modelo' }}
      </button>
    </div>

    <!-- Filter -->
    <div class="filter-container card">
      <label>Filtrar por Marca:</label>
      <select v-model="selectedBrandFilter">
        <option value="">Todas las marcas</option>
        <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
          {{ marca.nombre }}
        </option>
      </select>
    </div>

    <div class="content-layout" :class="{ 'no-form': !showForm }">
      <!-- Table -->
      <div class="table-section">
        <div class="card">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Precio Base (Promedio)</th>
                <th>Extra por Modelo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="modelo in filteredModelos" :key="modelo.id">
                <td>{{ getMarcaName(modelo.idMarca) }}</td>
                <td>{{ modelo.modelo }}</td>
                <td>{{ getBasePrice(modelo.id).toFixed(2) }}€</td>
                <td>
                  <span v-if="modelo.extraPorModelo && !modelo.editing">{{ modelo.extraPorModelo }}€</span>
                  <div v-else class="update-inline">
                    <input v-model.number="modelo.newExtra" type="number" step="0.01" placeholder="Nuevo extra">
                    <button @click="updateExtra(modelo)" class="btn btn-primary btn-sm">Guardar</button>
                  </div>
                </td>
                <td>
                  <button v-if="modelo.extraPorModelo" @click="modelo.editing = true; modelo.newExtra = modelo.extraPorModelo" class="btn btn-secondary btn-sm">Editar</button>
                </td>
              </tr>
              <tr v-if="filteredModelos.length === 0">
                <td colspan="5" class="text-center">No hay modelos que coincidan con la selección.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Form -->
      <div v-if="showForm" class="form-section">
        <div class="card">
          <h3>Nuevo Modelo</h3>
          <form @submit.prevent="addModelo">
            <label>Marca</label>
            <select v-model="newModelo.idMarca" required>
              <option value="" disabled>Seleccione una marca</option>
              <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                {{ marca.nombre }}
              </option>
            </select>

            <label>Nombre del Modelo</label>
            <input v-model="newModelo.modelo" type="text" placeholder="Ej: Giulia" required>

            <label>Extra por Modelo (€)</label>
            <input v-model.number="newModelo.extraPorModelo" type="number" step="0.01" required>

            <button type="submit" class="btn btn-primary w-100">Registrar Modelo</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { MarcasService, ModelosService, VehiculosService } from '../services/api';

const route = useRoute();
const marcas = ref([]);
const modelos = ref([]);
const vehiculos = ref([]);
const selectedBrandFilter = ref('');
const loading = ref(true);
const showForm = ref(false);

const newModelo = ref({
  idMarca: '',
  modelo: '',
  extraPorModelo: 0
});

const loadData = async () => {
  loading.value = true;
  try {
    const [marcasRes, modelosRes, vehiculosRes] = await Promise.all([
      MarcasService.getAll(),
      ModelosService.getAll(),
      VehiculosService.getAll()
    ]);
    marcas.value = marcasRes.data;
    modelos.value = modelosRes.data;
    vehiculos.value = vehiculosRes.data;
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
};

const filteredModelos = computed(() => {
  if (!selectedBrandFilter.value) return modelos.value;
  return modelos.value.filter(m => m.idMarca === selectedBrandFilter.value);
});

const getMarcaName = (id) => {
  return marcas.value.find(m => m.id === id)?.nombre || 'Unknown';
};

const getBasePrice = (modeloId) => {
  const relatedVehicles = vehiculos.value.filter(v => v.idModelo === modeloId);
  if (relatedVehicles.length === 0) return 0;
  return relatedVehicles.reduce((acc, v) => acc + v.precioDia, 0) / relatedVehicles.length;
};

const updateExtra = async (modelo) => {
  try {
    await ModelosService.patch(modelo.id, { extraPorModelo: modelo.newExtra });
    modelo.extraPorModelo = modelo.newExtra;
    delete modelo.editing;
  } catch (error) {
    console.error("Error updating extra:", error);
  }
};

const addModelo = async () => {
  try {
    const res = await ModelosService.create({
      ...newModelo.value,
      id: String(Date.now())
    });
    modelos.value.push(res.data);
    newModelo.value = { idMarca: '', modelo: '', extraPorModelo: 0 };
  } catch (error) {
    console.error("Error creating modelo:", error);
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

.filter-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.filter-container select {
  margin-bottom: 0;
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

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th, .modern-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-glass);
}

.modern-table th {
  color: var(--primary);
  font-weight: 600;
}

.update-inline {
  display: flex;
  gap: 0.5rem;
}

.update-inline input {
  width: 100px;
  margin-bottom: 0;
  padding: 0.4rem;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.w-100 {
  width: 100%;
}

.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}
</style>
