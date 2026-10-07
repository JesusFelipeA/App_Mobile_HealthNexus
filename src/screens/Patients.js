import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { getPatients, setTriage } from '../api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { Badge, Card, Empty, ErrorBox, Loading, Screen, colors } from '../components/ui';
import { TRIAGE, statusLabel, triageInfo } from '../utils/triage';

const FILTERS = [['', 'Todos'], ['rojo', 'Crítico'], ['amarillo', 'Urgente'], ['verde', 'Leve']];

export default function Patients() {
  const { can } = useAuth();
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);
  const [actionError, setActionError] = useState('');
  const { data, loading, error, reload } = useFetch(() => getPatients(filter), [filter]);

  const changeLevel = async (id, level) => {
    setActionError('');
    try { await setTriage(id, level); setOpen(null); reload(true); } catch (e) { setActionError(e.message); }
  };

  const list = data || [];
  return (
    <Screen title="Pacientes" icon="people-outline">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, flexGrow: 0 }}>
        {FILTERS.map(([id, label]) => (
          <Pressable key={id || 'all'} onPress={() => setFilter(id)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: filter === id ? colors.teal : '#fff' }}>
            <Text style={{ fontWeight: '700', fontSize: 12, color: filter === id ? '#fff' : colors.sub }}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ErrorBox message={error || actionError} onRetry={reload} />
      {loading && !data ? <Loading /> : list.length === 0 ? <Empty icon="people-outline" text="No hay pacientes para mostrar." /> : list.map((p) => {
        const t = triageInfo(p.triageLevel);
        return (
          <Card key={p.id} accent={t.color}>
            <Pressable onPress={() => can('medico') && setOpen(open === p.id ? null : p.id)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 }}>{p.name}</Text>
                <Badge text={t.label} color={t.color} />
              </View>
              <Text style={{ fontSize: 13, color: colors.sub }}>Edad: {p.age} años{p.status ? `  ·  ${statusLabel(p.status)}` : ''}</Text>
              {p.reason ? <Text style={{ fontSize: 13, color: colors.sub, marginTop: 8, backgroundColor: colors.bg, padding: 10, borderRadius: 8 }}>{p.reason}</Text> : null}
            </Pressable>
            {open === p.id && (
              <View style={{ marginTop: 14 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.sub, textTransform: 'uppercase', marginBottom: 8 }}>Cambiar prioridad</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(TRIAGE).map(([id, info]) => {
                    const cur = p.triageLevel === id;
                    return (
                      <Pressable key={id} disabled={cur} onPress={() => changeLevel(p.id, id)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderColor: info.color, backgroundColor: cur ? info.color : '#fff' }}>
                        <Text style={{ fontWeight: '700', fontSize: 12, color: cur ? '#fff' : info.color }}>{info.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
