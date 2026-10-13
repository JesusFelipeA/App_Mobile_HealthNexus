import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { getTriagePatients, setTriage } from '../api';
import useFetch from '../hooks/useFetch';
import {
  Badge,
  Card,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Screen,
  colors,
} from '../components/ui';
import { TRIAGE, statusLabel, triageInfo } from '../utils/triage';

const FILTERS = [
  ['', 'Todos'],
  ['sin', 'Sin clasificar'],
  ...Object.entries(TRIAGE).map(([id, t]) => [id, t.label]),
];

export default function Triage() {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [nivel, setNivel] = useState('');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const { data, loading, error, reload } = useFetch(
    () => getTriagePatients({ q: query, nivel }),
    [query, nivel],
  );
  const list = data || [];

  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const apply = async (p, level) => {
    setBusy(true);
    setActionError('');
    try {
      await setTriage(p.id, level);
      setOpen(null);
      reload(true);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const choose = (p, level) =>
    Alert.alert(
      'Cambiar triage',
      `${p.name}\n${
        p.triageLevel
          ? `${triageInfo(p.triageLevel).label} → `
          : 'Sin clasificar → '
      }${TRIAGE[level].label}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => apply(p, level) },
      ],
    );

  return (
    <Screen title="Triage" icon="medkit-outline">
      <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 16 }}>
        Toca un paciente para asignar o cambiar su nivel de triage. Si no tiene
        una admisión activa, se crea al clasificarlo.
      </Text>
      <Field
        value={q}
        onChangeText={setQ}
        placeholder="Buscar paciente..."
        autoCapitalize="none"
        style={{}}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 20, flexGrow: 0 }}
      >
        {FILTERS.map(([id, label]) => (
          <Pressable
            key={id || 'all'}
            onPress={() => setNivel(id)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: nivel === id ? colors.teal : '#fff',
            }}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 12,
                color: nivel === id ? '#fff' : colors.sub,
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ErrorBox message={error || actionError} onRetry={reload} />
      {loading && !data ? (
        <Loading />
      ) : list.length === 0 ? (
        <Empty icon="medkit-outline" text="No hay pacientes para mostrar." />
      ) : (
        list.map(p => {
          const t = triageInfo(p.triageLevel);
          return (
            <Card key={p.id} accent={t.color} style={{ padding: 16 }}>
              <Pressable onPress={() => setOpen(open === p.id ? null : p.id)}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: colors.text,
                      flex: 1,
                    }}
                  >
                    {p.name}
                  </Text>
                  <Badge text={t.label} color={t.color} />
                </View>
                <Text style={{ fontSize: 13, color: colors.sub, marginTop: 4 }}>
                  {p.age} años{p.status ? ` · ${statusLabel(p.status)}` : ''}
                </Text>
              </Pressable>
              {open === p.id && (
                <View style={{ marginTop: 14 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: colors.sub,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    Asignar nivel
                  </Text>
                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}
                  >
                    {Object.entries(TRIAGE).map(([id, info]) => {
                      const cur = p.triageLevel === id;
                      return (
                        <Pressable
                          key={id}
                          disabled={cur || busy}
                          onPress={() => choose(p, id)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 9,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: info.color,
                            backgroundColor: cur ? info.color : '#fff',
                            opacity: busy ? 0.6 : 1,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: '700',
                              fontSize: 12,
                              color: cur ? '#fff' : info.color,
                            }}
                          >
                            {info.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
