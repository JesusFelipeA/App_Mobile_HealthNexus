import { Platform } from 'react-native';

const DEV_URL = Platform.OS === 'android' ? 'http://192.168.1.8:3000/api' : 'http://localhost:3000/api';
// Versión release (APK de producción): siempre HTTPS
const PROD_URL = 'https://TU-SERVIDOR/api';

export const API_URL = (__DEV__ ? DEV_URL : PROD_URL).replace(/\/$/, '');
