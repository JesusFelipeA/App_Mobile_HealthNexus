import * as Keychain from 'react-native-keychain';

// El token se guarda cifrado en el Keystore de Android
const SERVICE = 'healthnexus.token';

export async function getToken() {
  try {
    const c = await Keychain.getGenericPassword({ service: SERVICE });
    return c ? c.password : null;
  } catch {
    return null;
  }
}

export async function saveToken(token) {
  await Keychain.setGenericPassword('token', token, { service: SERVICE });
}

export async function clearToken() {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch {
    /* no había token guardado */
  }
}
const DEVICE_SERVICE = 'healthnexus.device';

export async function getDeviceFingerprint() {
  const credentials = await Keychain.getGenericPassword({
    service: DEVICE_SERVICE,
  });

  if (credentials?.password) {
    return credentials.password;
  }

  // Es un identificador, no un secreto de autenticación.
  const randomPart = () => Math.random().toString(36).slice(2);
  const fingerprint = `${Date.now()}-${randomPart()}${randomPart()}${randomPart()}${randomPart()}`;

  await Keychain.setGenericPassword('device', fingerprint, {
    service: DEVICE_SERVICE,
  });

  return fingerprint;
}
