<template>
  <div class="clientes-view">
    <h1>Gestión de Clientes</h1>

    <div class="master-detail">
      <!-- List (Master) -->
      <div class="list-panel card">
        <div class="panel-header">
          <h3>Clientes</h3>
          <button @click="deselect" class="btn btn-primary btn-sm" :disabled="!selectedCliente">Nuevo</button>
        </div>
        
        <div v-if="loading" class="text-muted">Cargando...</div>
        <ul class="client-list">
          <li v-for="c in clientes" :key="c.id" 
              @click="selectCliente(c)"
              :class="{ active: selectedCliente?.id === c.id }">
            <div class="client-item-info">
              <strong>{{ c.nombre }}</strong>
              <span>{{ c.dni }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Details (Right Panel) -->
      <div class="detail-panel">
        <div class="card">
          <h3>{{ selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
          <form @submit.prevent="saveCliente">
            <label>Nombre Completo</label>
            <input v-model="clientForm.nombre" type="text" placeholder="Ej: Juan Pérez" required>

            <label>DNI / NIE</label>
            <input v-model="clientForm.dni" type="text" placeholder="Ej: 12345678X" required>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                {{ selectedCliente ? 'Actualizar' : 'Registrar' }}
              </button>
              <button v-if="selectedCliente" type="button" @click="deleteCliente(selectedCliente.id)" class="btn btn-danger">
                Eliminar
              </button>
            </div>
          </form>
        </div>

        <!-- Rental History -->
        <div v-if="selectedCliente" class="card history-card">
          <h3>Historial de Alquileres</h3>
          <div v-if="!selectedCliente.alquileres || selectedCliente.alquileres.length === 0" class="text-muted">
            No tiene alquileres registrados.
          </div>
          <table v-else class="modern-table history-table">
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Fecha</th>
                <th>Días</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(alk, index) in selectedCliente.alquileres" :key="index">
                <td>
                  <strong>{{ alk.brandName }} {{ alk.modelName }}</strong>
                  <br><small>Ref: {{ alk.vehiculo }}</small>
                </td>
                <td>{{ alk.fechaInic }}</td>
                <td>{{ alk.numDias }}</td>
                <td class="price-val">{{ alk.totalPrice.toFixed(2) }}€</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ClientesService } from '../services/api';

const clientes = ref([]);
const selectedCliente = ref(null);
const loading = ref(true);

const clientForm = ref({
  nombre: '',
  dni: '',
  alquileres: []
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await ClientesService.getAll();
    clientes.value = res.data;
  } catch (error) {
    console.error("Error loading clients:", error);
  } finally {
    loading.value = false;
  }
};

const selectCliente = (cliente) => {
  selectedCliente.value = { ...cliente };
  clientForm.value = { ...cliente };
};

const deselect = () => {
  selectedCliente.value = null;
  clientForm.value = { nombre: '', dni: '', alquileres: [] };
};

const saveCliente = async () => {
  try {
    if (selectedCliente.value) {
      // Update
      const res = await ClientesService.update(selectedCliente.value.id, clientForm.value);
      const index = clientes.value.findIndex(c => c.id === selectedCliente.value.id);
      clientes.value[index] = res.data;
    } else {
      // Create
      const res = await ClientesService.create({
        ...clientForm.value,
        id: String(Date.now()),
        alquileres: []
      });
      clientes.value.push(res.data);
    }
    deselect();
  } catch (error) {
    console.error("Error saving client:", error);
  }
};

const deleteCliente = async (id) => {
  if (!confirm('¿Está seguro de que desea eliminar este cliente?')) return;
  try {
    await ClientesService.delete(id);
    clientes.value = clientes.value.filter(c => c.id !== id);
    deselect();
  } catch (error) {
    console.error("Error deleting client:", error);
  }
};

onMounted(loadData);
</script>

<style scoped>
.master-detail {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  margin-top: 2rem;
  height: calc(100vh - 180px);
}

.list-panel {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-glass);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.client-list {
  list-style: none;
  overflow-y: auto;
  flex: 1;
}

.client-list li {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-glass);
  cursor: pointer;
  transition: background 0.2s;
}

.client-list li:hover {
  background: rgba(0, 0, 0, 0.02);
}

.client-list li.active {
  background: var(--bg-dark);
  border-left: 4px solid var(--accent);
}

.client-item-info {
  display: flex;
  flex-direction: column;
}

.client-item-info span {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.detail-panel {
  overflow-y: auto;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.history-card {
  margin-top: 2rem;
}

.history-table {
  font-size: 0.9rem;
}

.price-val {
  font-weight: bold;
  color: var(--accent);
}

@media (max-width: 768px) {
  .master-detail {
    grid-template-columns: 1fr;
    height: auto;
  }
}
</style>
