import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
};

export const ingresoService = {
  crear: (data) => api.post('/ingresos', data),
  activos: () => api.get('/ingresos/activos'),
  verificar: (placa) => api.get(`/ingresos/verificar/${placa}`),
};

export const salidaService = {
  calcular: (placa) => api.get(`/salidas/calcular/${placa}`),
  registrar: (data) => api.post('/salidas', data),
  historialHoy: () => api.get('/salidas/historial-hoy'),
};

export const tarifaService = {
  getAll: () => api.get('/tarifas'),
  update: (id, data) => api.put(`/tarifas/${id}`, data),
  historial: () => api.get('/tarifas/historial'),
  planes: (data) => api.post('/tarifas/planes', data),
  planesActivos: () => api.get('/tarifas/planes/activos'),
  miPlan: () => api.get('/tarifas/mi-plan'),
  reportes: (fechaInicio, fechaFin) => api.get(`/tarifas/reportes?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`),
  cupos: () => api.get('/tarifas/cupos'),
};