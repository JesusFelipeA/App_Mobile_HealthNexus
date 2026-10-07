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
