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
