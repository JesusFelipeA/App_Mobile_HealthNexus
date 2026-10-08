import React, { useEffect, useRef, useState } from 'react';

import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getPatients, setTriage } from '../api';

import { useAuth } from '../context/AuthContext';

import useFetch from '../hooks/useFetch';
import usePagination from '../hooks/usePagination'; // 👈 NUEVO

import {
  Badge,
  Card,
  Empty,
  ErrorBox,
  Loading,
  Paginator, // 👈 NUEVO
  Screen,
  colors,
} from '../components/ui';

import { TRIAGE, statusLabel, triageInfo } from '../utils/triage';

const FILTERS = [
  ['', 'Todos'],
  ['rojo', 'Crítico'],
  ['amarillo', 'Urgente'],
  ['verde', 'Leve'],
];

export default function Patients() {
  const { can } = useAuth();

  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);
  const [actionError, setActionError] = useState('');

  const { data, loading, error, reload } = useFetch(
    () => getPatients(filter),
    [filter],
  );

  const list = data || [];

  /* ===== Paginación global ===== */
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    paginated,
    setPage,
    setPageSize,
  } = usePagination(list, {
    initialPageSize: 10,
    resetDeps: [filter], // 👈 reset al cambiar filtro
  });

  /* ===== Animación al cambiar de página ===== */
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [page, pageSize, fadeAnim]);

  const handleFilterChange = id => {
    setFilter(id);
    setOpen(null);
  };

  const changeLevel = async (id, level) => {
    setActionError('');
    try {
      await setTriage(id, level);
      setOpen(null);
      reload(true);
    } catch (e) {
      setActionError(e.message);
    }
  };

  return (
    <Screen title="Pacientes" icon="people-outline">
      {/* FILTROS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filters}
      >
        {FILTERS.map(([id, label]) => {
          const active = filter === id;
          return (
            <Pressable
              key={id || 'all'}
              onPress={() => handleFilterChange(id)}
              style={[s.filterChip, active && s.filterChipActive]}
            >
              <Text style={[s.filterText, active && s.filterTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ErrorBox message={error || actionError} onRetry={reload} />

      {loading && !data ? (
        <Loading />
      ) : list.length === 0 ? (
        <Empty icon="people-outline" text="No hay pacientes para mostrar." />
      ) : (
        <>
          <Animated.View style={{ opacity: fadeAnim }}>
            {paginated.map(p => {
              const t = triageInfo(p.triageLevel);
              return (
                <Card key={p.id} accent={t.color}>
                  <Pressable
                    onPress={() =>
                      can('medico') && setOpen(open === p.id ? null : p.id)
                    }
                  >
                    <View style={s.rowTop}>
                      <Text style={s.patientName} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Badge text={t.label} color={t.color} />
                    </View>

                    <Text style={s.patientMeta}>
                      Edad: {p.age} años
                      {p.status ? `  ·  ${statusLabel(p.status)}` : ''}
                    </Text>

                    {p.reason ? <Text style={s.reason}>{p.reason}</Text> : null}
                  </Pressable>

                  {open === p.id && (
                    <View style={s.levelBox}>
                      <Text style={s.levelLabel}>Cambiar prioridad</Text>

                      <View style={s.levelRow}>
                        {Object.entries(TRIAGE).map(([id, info]) => {
                          const cur = p.triageLevel === id;
                          return (
                            <Pressable
                              key={id}
                              disabled={cur}
                              onPress={() => changeLevel(p.id, id)}
                              style={[
                                s.levelChip,
                                {
                                  borderColor: info.color,
                                  backgroundColor: cur ? info.color : '#fff',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  s.levelChipText,
                                  {
                                    color: cur ? '#fff' : info.color,
                                  },
                                ]}
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
            })}
          </Animated.View>

          <Paginator
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onChangePage={setPage}
            onChangePageSize={setPageSize}
            colors={colors}
          />
        </>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  filters: {
    marginBottom: 20,
    flexGrow: 0,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#fff',
  },

  filterChipActive: {
    backgroundColor: colors.teal,
  },

  filterText: {
    fontWeight: '700',
    fontSize: 12,
    color: colors.sub,
  },

  filterTextActive: {
    color: '#fff',
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },

  patientMeta: {
    fontSize: 13,
    color: colors.sub,
  },

  reason: {
    fontSize: 13,
    color: colors.sub,
    marginTop: 8,
    backgroundColor: colors.bg,
    padding: 10,
    borderRadius: 8,
  },

  levelBox: {
    marginTop: 14,
  },

  levelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.sub,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
  },

  levelChipText: {
    fontWeight: '700',
    fontSize: 12,
  },
});
