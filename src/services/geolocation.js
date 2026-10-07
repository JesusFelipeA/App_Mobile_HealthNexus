import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Devuelve { lat, lng } o null si no hay permiso o falla el GPS
export async function getPosition() {
  try {
    if (Platform.OS === 'android') {
      const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (r !== PermissionsAndroid.RESULTS.GRANTED) return null;
    }
    return await new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(null),
        { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 },
      );
    });
  } catch {
    return null;
  }
}
