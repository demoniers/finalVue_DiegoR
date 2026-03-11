import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const MarcasService = {
  getAll: () => api.get('/marcas'),
  getById: (id) => api.get(`/marcas/${id}`),
  create: (data) => api.post('/marcas', data),
};

export const ModelosService = {
  getAll: () => api.get('/modelos'),
  getByMarca: (marcaId) => api.get(`/modelos?idMarca=${marcaId}`),
  create: (data) => api.post('/modelos', data),
  update: (id, data) => api.put(`/modelos/${id}`, data),
  patch: (id, data) => api.patch(`/modelos/${id}`, data),
};

export const VehiculosService = {
  getAll: () => api.get('/vehiculos'),
  getByModelo: (modeloId) => api.get(`/vehiculos?idModelo=${modeloId}`),
  create: (data) => api.post('/vehiculos', data),
};

export const ClientesService = {
  getAll: () => api.get('/clientes'),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

export default api;
