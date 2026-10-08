import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import EmergencyButton from './src/components/EmergencyButton';
import { colors } from './src/components/ui';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Triage from './src/screens/Triage';
import Patients from './src/screens/Patients';
import Internas from './src/screens/Internas';
import Externas from './src/screens/Externas';
import Hospitals from './src/screens/Hospitals';
import Seguimiento from './src/screens/Seguimiento';
import Auditoria from './src/screens/Auditoria';
import SignosVitales from './src/screens/SignosVitales';
import Medicacion from './src/screens/Medicacion';
import Medicamentos from './src/screens/Medicamentos';
import Existencias from './src/screens/Existencias';
import Movimientos from './src/screens/Movimientos';
import AlertasFarmacia from './src/screens/AlertasFarmacia';

const Stack = createNativeStackNavigator();

// Las pantallas disponibles dependen del rol (la API vuelve a validar los permisos)
function Routes() {
  const { user, loading, can } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator color={colors.teal} size="large" /></View>;
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={Login} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={Dashboard} />
          {can('medico', 'enfermeria') && (
            <>
              <Stack.Screen name="Triage" component={Triage} />
              <Stack.Screen name="Patients" component={Patients} />
              <Stack.Screen name="Internas" component={Internas} />
              <Stack.Screen name="Hospitals" component={Hospitals} />
              <Stack.Screen name="Seguimiento" component={Seguimiento} />
            </>
          )}
          {can('medico') && <Stack.Screen name="Externas" component={Externas} />}
          {can('enfermeria', 'medico') && (
            <>
              <Stack.Screen name="SignosVitales" component={SignosVitales} />
              <Stack.Screen name="Medicacion" component={Medicacion} />
            </>
          )}
          {can('farmacia', 'enfermeria', 'medico') && <Stack.Screen name="Existencias" component={Existencias} />}
          {can('farmacia', 'enfermeria') && <Stack.Screen name="Movimientos" component={Movimientos} />}
          {can('farmacia') && (
            <>
              <Stack.Screen name="Medicamentos" component={Medicamentos} />
              <Stack.Screen name="AlertasFarmacia" component={AlertasFarmacia} />
            </>
          )}
          {can() && <Stack.Screen name="Auditoria" component={Auditoria} />}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <AuthProvider>
        <View style={{ flex: 1 }}>
          <NavigationContainer>
            <Routes />
          </NavigationContainer>
          <EmergencyButton />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
