# HealthNexus – App móvil (React Native CLI)

App Android hecha con **React Native CLI 0.87** que consume la API REST `healthnexus-api`.

## Requisitos
- **Node.js 22.11 o superior** (lo exige React Native 0.87).
- JDK 17 o superior, Android Studio con SDK de Android y un emulador (o un celular con depuración USB).
  Guía oficial de entorno: https://reactnative.dev/docs/set-up-your-development-environment
- La API `healthnexus-api` en marcha.

## Puesta en marcha
```
npm install
npx react-native start        # terminal 1: Metro
npx react-native run-android  # terminal 2: instala la app en el emulador/celular
```
Inicia sesión con un usuario de tu tabla `users`.

## URL de la API (`src/config.js`)
| Dónde corre | URL |
|---|---|
| Emulador Android | `http://10.0.2.2:3000/api` (ya viene por defecto en modo desarrollo) |
| Celular físico | `http://IP-DE-TU-PC:3000/api` (cambia `DEV_URL`; PC y celular en la misma red) |
| Versión release | `https://TU-SERVIDOR/api` (cambia `PROD_URL`) |

- En **debug** Android permite HTTP; en **release** solo HTTPS, así que publica la API con HTTPS antes de generar el APK.
- Si usas celular físico por USB, también sirve `adb reverse tcp:3000 tcp:3000` y la URL `http://localhost:3000/api`.
- Agrega la IP/origen a `CORS_ORIGINS` solo si pruebas desde navegador; las apps nativas no usan CORS.

## Estructura
```
App.js                      # navegación (pantallas según el rol)
src/
├── config.js               # URL de la API
├── api/client.js           # fetch base: token, errores, 401 → cierra sesión
├── api/index.js            # una función por endpoint
├── context/AuthContext.js  # sesión, rol y can(...roles)
├── services/secureStorage.js  # token cifrado (react-native-keychain / Keystore)
├── services/geolocation.js    # GPS para hospitales cercanos
├── hooks/useFetch.js
├── utils/triage.js         # niveles de triage, estados, formatos
├── components/ui.js        # Screen, Card, Field, SelectField, Button...
├── components/EmergencyButton.js
└── screens/                # Login, Dashboard, Triage, Patients, Internas, Externas, Hospitals,
                            # Seguimiento, Auditoria, SignosVitales, Medicacion,
                            # Medicamentos, Existencias, Movimientos, AlertasFarmacia
```

## Qué ve cada rol
| Pantalla | Roles |
|---|---|
| Triage, Pacientes, Derivaciones internas, Hospitales, Seguimiento | médico, enfermería |
| Derivaciones externas | médico (reservar cama en Hospitales: solo médico) |
| Signos vitales, Medicación | enfermería registra · médico solo consulta |
| Existencias por lote | farmacia, enfermería, médico (solo lectura, excepto farmacia) |
| Movimientos de inventario | farmacia registra · enfermería solo consulta |
| Medicamentos, Alertas de inventario | farmacia |
| Auditoría | solo administrador |

El administrador ve todo. La API vuelve a validar los permisos en el servidor (los permisos coinciden con los de tu tabla `permissions`).
Para probar enfermería y farmacia crea usuarios con `scripts/crear-usuario.js` (ver README de la API).

## Librerías nativas usadas
`@react-navigation/native` + `native-stack`, `react-native-screens`, `react-native-safe-area-context`,
`react-native-keychain` (token seguro), `@react-native-community/geolocation` (GPS),
`react-native-vector-icons` (Ionicons; la fuente ya está enlazada en `android/app/build.gradle`).

## Pruebas
`npm test` (utilidades). La lógica de la API se probó contra `healthnexus-api`.

## Pendiente
- Notificaciones push (Firebase) y escaneo de paciente con la cámara.
- Dispensación de recetas (farmacia) y descuento de inventario al administrar medicación.
- Solo está configurado Android; la carpeta `ios/` es la del proyecto base y no se probó.
