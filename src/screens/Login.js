import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button, ErrorBox, Field, Ico, colors, shadow } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) { setError('Ingresa tu correo y contraseña.'); return; }
    setLoading(true); setError('');
    try {
      await login(email.trim(), password); // al iniciar sesión el navegador cambia solo al Dashboard
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <Ico name="business" size={44} color="rgba(255,255,255,0.9)" />
          <Text style={s.title}>HealthNexus</Text>
          <Text style={s.sub}>Inicia sesión para continuar</Text>
        </View>
        <View style={{ padding: 24 }}>
          <View style={s.card}>
            <ErrorBox message={error} />
            <Field label="Correo" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="usuario@hospital.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            <Field label="Contraseña" icon="lock-closed-outline" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoCapitalize="none" style={{}} />
          </View>
          <Button title="Iniciar sesión" icon="log-in-outline" onPress={submit} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: colors.tealDeep, paddingTop: 80, paddingBottom: 56, paddingHorizontal: 28, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 8 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 24, marginTop: -8, ...shadow },
});
