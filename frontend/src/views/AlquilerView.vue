<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { MarcasService, ModelosService, VehiculosService, ClientesService } from '../services/api';

const marcas = ref([]);
const modelos = ref([]);
const vehiculos = ref([]);
const clientes = ref([]);
const loading = ref(true);

const step = ref(1); // 1: Selection, 2: Details, 3: Summary
const selectedMarca = ref('');
const selectedModelo = ref('');
const availableVehicles = ref([]);

const rentForm = ref({
  vehiculoId: '',
  clienteId: '',
  numDias: 1,
  fechaInic: new Date().toISOString().split('T')[0]
});

const bookingSummary = ref(null);

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

const filteredModelos = computed(() => {
  if (!selectedMarca.value) return [];
  return modelos.value.filter(m => m.idMarca === selectedMarca.value);
});

const canProceedToDetails = computed(() => {
  return selectedMarca.value && selectedModelo.value;
});

const goToDetails = () => {
  availableVehicles.value = vehiculos.value.filter(v => v.idModelo === selectedModelo.value);
  step.value = 2;
};

const calculateTotal = (vehicleId) => {
  const v = vehiculos.value.find(item => item.id === vehicleId);
  const m = modelos.value.find(item => item.id === selectedModelo.value);
  if (!v || !m) return 0;
  return (v.precioDia + (m.extraPorModelo || 0)) * rentForm.value.numDias;
};

const finalizeBooking = async () => {
  const vehicle = vehiculos.value.find(v => v.id === rentForm.value.vehiculoId);
  const model = modelos.value.find(m => m.id === selectedModelo.value);
  const brand = marcas.value.find(b => b.id === selectedMarca.value);
  const customer = clientes.value.find(c => c.id === rentForm.value.clienteId);
  
  const totalPrice = calculateTotal(rentForm.value.vehiculoId);

  const rentalData = {
    vehiculo: rentForm.value.vehiculoId,
    numDias: rentForm.value.numDias,
    fechaInic: rentForm.value.fechaInic,
    // For display in history
    brandName: brand.nombre,
    modelName: model.modelo,
    totalPrice: totalPrice
  };

  try {
    // Requirements: Save the rental to the customer's history.
    const updatedHistory = [...(customer.alquileres || []), rentalData];
    await ClientesService.update(customer.id, { ...customer, alquileres: updatedHistory });
    
    bookingSummary.value = {
      brand: brand.nombre,
      model: model.modelo,
      customer: customer.nombre,
      days: rentForm.value.numDias,
      total: totalPrice,
      startDate: rentForm.value.fechaInic
    };
    step.value = 3;
  } catch (error) {
    console.error("Error saving booking:", error);
  }
};

const reset = () => {
  step.value = 1;
  selectedMarca.value = '';
  selectedModelo.value = '';
  rentForm.value = {
    vehiculoId: '',
    clienteId: '',
    numDias: 1,
    fechaInic: new Date().toISOString().split('T')[0]
  };
  bookingSummary.value = null;
};

watch(selectedMarca, () => {
  selectedModelo.value = '';
});

onMounted(loadData);
</script>

<template>
  <div class="alquiler-view">
    <h1>Contratar Alquiler</h1>

    <!-- Step 1: Selection -->
    <div v-if="step === 1" class="step-container card">
      <h3>1. Selección de Vehículo</h3>
      <div class="form-group">
        <label>Marca</label>
        <select v-model="selectedMarca">
          <option value="" disabled>Seleccione una marca</option>
          <option v-for="b in marcas" :key="b.id" :value="b.id">{{ b.nombre }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Modelo</label>
        <select v-model="selectedModelo" :disabled="!selectedMarca">
          <option value="" disabled>Seleccione un modelo</option>
          <option v-for="m in filteredModelos" :key="m.id" :value="m.id">{{ m.modelo }}</option>
        </select>
      </div>

      <button @click="goToDetails" class="btn btn-primary" :disabled="!canProceedToDetails">Continuar</button>
    </div>

    <!-- Step 2: Form Details -->
    <div v-if="step === 2" class="step-container card">
      <button @click="step = 1" class="btn btn-secondary btn-sm mb-1">Volver</button>
      <h3>2. Detalles del Alquiler</h3>
      
      <form @submit.prevent="finalizeBooking">
        <label>Vehículo Disponible (Precio/Día)</label>
        <select v-model="rentForm.vehiculoId" required>
          <option value="" disabled>Seleccione el vehículo específico</option>
          <option v-for="v in availableVehicles" :key="v.id" :value="v.id">
             Ref: {{ v.id }} - {{ v.precioDia + (modelos.find(m => m.id === selectedModelo)?.extraPorModelo || 0) }}€/día
          </option>
        </select>

        <label>Cliente</label>
        <select v-model="rentForm.clienteId" required>
          <option value="" disabled>Seleccione el cliente</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }} ({{ c.dni }})</option>
        </select>

        <div class="grid-2">
          <div>
            <label>Nº de Días</label>
            <input v-model.number="rentForm.numDias" type="number" min="1" required>
          </div>
          <div>
            <label>Fecha de Inicio</label>
            <input v-model="rentForm.fechaInic" type="date" required>
          </div>
        </div>

        <div v-if="rentForm.vehiculoId" class="price-summary card">
          Total a Pagar: <span class="total">{{ calculateTotal(rentForm.vehiculoId).toFixed(2) }}€</span>
        </div>

        <button type="submit" class="btn btn-primary w-100">Confirmar Alquiler</button>
      </form>
    </div>

    <!-- Step 3: Success Summary -->
    <div v-if="step === 3" class="step-container success-card card">
      <div class="success-icon">✅</div>
      <h2>¡Alquiler Confirmado!</h2>
      <div class="summary-details">
        <p><strong>Marca:</strong> {{ bookingSummary.brand }}</p>
        <p><strong>Modelo:</strong> {{ bookingSummary.model }}</p>
        <p><strong>Cliente:</strong> {{ bookingSummary.customer }}</p>
        <p><strong>Fecha:</strong> {{ bookingSummary.startDate }}</p>
        <p><strong>Duración:</strong> {{ bookingSummary.days }} días</p>
        <hr>
        <p class="final-total"><strong>Precio Total:</strong> {{ bookingSummary.total.toFixed(2) }}€</p>
      </div>
      <button @click="reset" class="btn btn-primary">Nuevo Alquiler</button>
    </div>
  </div>
</template>

<style scoped>
.step-container {
  max-width: 600px;
  margin: 2rem auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.mb-1 { margin-bottom: 1rem; }

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.price-summary {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success);
  margin: 1.5rem 0;
  text-align: center;
  font-size: 1.1rem;
}

.total {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--success);
}

.success-card {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.summary-details {
  text-align: left;
  background: rgba(255,255,255,0.03);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

.summary-details p {
  margin-bottom: 0.5rem;
}

.final-total {
  font-size: 1.2rem;
  color: var(--accent);
}

.w-100 { width: 100%; }
</style>
