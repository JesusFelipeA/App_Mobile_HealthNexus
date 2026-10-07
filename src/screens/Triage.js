import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { createPatient } from '../api';
import { Button, ErrorBox, Field, Ico, Screen, SectionTitle, colors } from '../components/ui';

const LEVELS = [
  { id: 'rojo', label: 'Crítico', color: '#DC2626', icon: 'alert-circle-outline', desc: 'Atención inmediata' },
  { id: 'amarillo', label: 'Urgente', color: '#F59E0B', icon: 'time-outline', desc: '15 min espera' },
  { id: 'verde', label: 'Leve', color: '#16A34A', icon: 'checkmark-circle', desc: '60 min espera' },
];

export default function Triage({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [reason, setReason] = useState('');
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const edad = Number(age);
    if (!name.trim()) return setError('Ingresa el nombre del paciente.');
    if (age === '' || !Number.isInteger(edad) || edad < 0 || edad > 120) return setError('Ingresa una edad válida (0 a 120).');
    if (reason.trim().length < 3) return setError('Describe el motivo de consulta.');
    if (!level) return setError('Selecciona un nivel de triage.');
    setLoading(true); setError('');
    try {
      await createPatient({ name: name.trim(), age: edad, reason: reason.trim(), triageLevel: level });
      Alert.alert('Listo', 'Paciente registrado correctamente.');
      navigation.navigate('Patients');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Nuevo Triage" icon="medkit-outline">
      <ErrorBox message={error} />
      <View style={s.form}>
        <Field label="Nombre del paciente" icon="person-outline" value={name} onChangeText={setName} placeholder="Ej: Juan Pérez López" />
        <Field label="Edad" icon="calendar-outline" value={age} onChangeText={setAge} placeholder="Ej: 45" keyboardType="number-pad" />
        <Field label="Motivo de consulta" icon="document-text-outline" value={reason} onChangeText={setReason} placeholder="Describe los síntomas..." multiline />
      </View>

      <SectionTitle>Clasificación de triage</SectionTitle>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
        {LEVELS.map((l) => {
          const on = level === l.id;
          return (
            <Pressable key={l.id} onPress={() => setLevel(l.id)} style={[s.level, { borderColor: on ? l.color : colors.line, backgroundColor: on ? `${l.color}26` : '#fff' }]}>
              <Ico name={l.icon} size={24} color={l.color} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 8 }}>{l.label}</Text>
              <Text style={{ fontSize: 10, color: colors.sub, marginTop: 4, textAlign: 'center' }}>{l.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button title="Registrar paciente" icon="save-outline" onPress={submit} loading={loading} />
      <Button title="Cancelar" icon="close-circle-outline" variant="outline" color={colors.coral} onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
    </Screen>
  );
}

const s = StyleSheet.create({
  form: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 24 },
  level: { flex: 1, paddingVertical: 16, paddingHorizontal: 8, borderRadius: 16, borderWidth: 2, alignItems: 'center' },
});
