import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { activarEmergencia } from '../api';
import { useAuth } from '../context/AuthContext';
import { Ico } from './ui';

// Botón flotante de emergencia (visible solo con sesión iniciada)
export default function EmergencyButton() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  if (!user) return null;

  const send = async () => {
    setSending(true);
    try {
      await activarEmergencia('Código de emergencia activado desde la app móvil');
      Alert.alert('🚨 Emergencia', 'Código de emergencia registrado.');
    } catch (e) {
      Alert.alert('No se pudo activar', e.message);
    } finally {
      setSending(false);
    }
  };

  const ask = () => {
    if (sending) return;
    Alert.alert('Código de emergencia', '¿Activar el CÓDIGO DE EMERGENCIA?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Activar', style: 'destructive', onPress: send },
    ]);
  };

  return (
    <Pressable onPress={ask} style={[styles.btn, sending && { opacity: 0.6 }]} accessibilityLabel="Código de emergencia">
      <Ico name="pulse" size={28} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { position: 'absolute', right: 24, bottom: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#DD5B47', alignItems: 'center', justifyContent: 'center', elevation: 8 },
});
