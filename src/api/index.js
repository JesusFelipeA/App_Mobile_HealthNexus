import { http } from './client';

const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
  return s ? `?${s}` : '';
};

// Auth
export const login = (email, password) => http.post('/auth/login', { email, password });
export const me = () => http.get('/auth/me');

// Dashboard y pacientes
export const getStats = () => http.get('/stats');
export const getPatients = (triage) => http.get(`/patients${qs({ triage })}`);
export const createPatient = (data) => http.post('/patients', data);
export const setTriage = (id, triageLevel) => http.patch(`/patients/${id}/triage`, { triageLevel });

// Derivaciones
export const getCamas = () => http.get('/derivaciones/camas');
export const getInternas = () => http.get('/derivaciones/internas');
export const createInterna = (data) => http.post('/derivaciones/internas', data);
export const finalizarInterna = (id) => http.patch(`/derivaciones/internas/${id}`, { estado: 'finalizada' });
export const getExternas = () => http.get('/derivaciones/externas');
export const createExterna = (data) => http.post('/derivaciones/externas', data);

// Hospitales
export const getHospitals = (pos) => http.get(`/hospitals${qs(pos ? { lat: pos.lat, lng: pos.lng } : {})}`);
export const reservarCama = (hospitalId, pacienteId) => http.post(`/hospitals/${hospitalId}/reservas`, { pacienteId });

// Seguimiento, auditoría y emergencias
export const getSeguimiento = () => http.get('/seguimiento');
export const getAuditoria = (params) => http.get(`/auditoria${qs(params)}`);
export const activarEmergencia = (mensaje) => http.post('/emergencias', { mensaje });

// Farmacia
export const getFarmaciaResumen = () => http.get('/farmacia/resumen');
export const getMedicamentos = (params) => http.get(`/farmacia/medicamentos${qs(params)}`);
export const getCatalogo = (q) => http.get(`/farmacia/catalogo${qs({ q })}`);
export const getExistencias = (params) => http.get(`/farmacia/existencias${qs(params)}`);
export const getMovimientos = (params) => http.get(`/farmacia/movimientos${qs(params)}`);
export const createMovimiento = (data) => http.post('/farmacia/movimientos', data);
export const getAlertasFarmacia = () => http.get('/farmacia/alertas');

// Enfermería
export const getSignos = (pacienteId) => http.get(`/enfermeria/signos${qs({ pacienteId })}`);
export const createSignos = (data) => http.post('/enfermeria/signos', data);
export const getAdministraciones = (pacienteId) => http.get(`/enfermeria/administraciones${qs({ pacienteId })}`);
export const createAdministracion = (data) => http.post('/enfermeria/administraciones', data);
