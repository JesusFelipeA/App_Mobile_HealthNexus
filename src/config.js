import { Platform } from 'react-native';

// ─── URL de la API ───────────────────────────────────────────────
// Emulador Android: 10.0.2.2 es tu PC.
// Celular físico:   usa la IP de tu PC en la red, ej. http://192.168.1.50:3000/api
const DEV_URL = Platform.OS === 'android' ? 'http://192.168.1.8:3000/api' : 'http://localhost:3000/api';
// Versión release (APK de producción): siempre HTTPS
const PROD_URL = 'https://TU-SERVIDOR/api';

export const API_URL = (__DEV__ ? DEV_URL : PROD_URL).replace(/\/$/, '');
