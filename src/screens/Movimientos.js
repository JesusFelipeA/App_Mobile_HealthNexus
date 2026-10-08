import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { createMovimiento, getMovimientos } from '../api';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Screen, SelectField, colors } from '../components/ui';
import { fmtDateTime } from '../utils/triage';

const TIPOS = [
  { value: 'entrada', label: 'Entrada (suma)' },
  { value: 'salida', label: 'Salida (resta)' },
  { value: 'devolucion', label: 'Devolución (suma)' },
  { value: 'ajuste', label: 'Ajuste (nueva cantidad del lote)' },
];
const COLOR = { entrada: colors.green, devolucion: colors.teal, salida: colors.coral, ajuste: colors.amber };
const FILTERS = [['', 'Todos'], ['entrada', 'Entradas'], ['salida', 'Salidas'], ['ajuste', 'Ajustes'], ['devolucion', 'Devoluciones']];

export default function Movimientos({ route, navigation }) {
  const { can } = useAuth();
  const lote = route.params?.lote;
  const [tipo, setTipo] = useState('salida');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { setPage(1); }, [filtro]);
  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    getMovimientos({ tipo: filtro, page, limit: 30 })
      .then((r) => { if (!alive) return; setTotal(r.total); setRows((prev) => (page === 1 ? r.data : [...prev, ...r.data])); })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [filtro, page, reload]);

  const save = async () => {
    const n = Number(cantidad);
    if (cantidad === '' || !Number.isInteger(n) || n < (tipo === 'ajuste' ? 0 : 1)) return setFormError('Ingresa una cantidad válida (número entero).');
    if ((tipo === 'salida' || tipo === 'ajuste') && motivo.trim().length < 3) return setFormError('El motivo es obligatorio para salidas y ajustes.');
    setBusy(true); setFormError('');
    try {
      const r = await createMovimiento({ loteId: lote.id, tipo, cantidad: n, motivo: motivo.trim() });
      Alert.alert('Movimiento registrado', `${r.medicamento}\nStock: ${r.stockAnterior} → ${r.stockNuevo}`);
      setCantidad(''); setMotivo('');
      navigation.setParams({ lote: undefined });
      setPage(1); setReload((x) => x + 1);
    } catch (e) { setFormError(e.message); } finally { setBusy(false); }
  };

  return (
    <Screen title="Movimientos" icon="swap-vertical-outline" iconColor={colors.teal}>
      {can('farmacia') && lote ? (
        <Card>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.sub, textTransform: 'uppercase', marginBottom: 6 }}>Nuevo movimiento</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{lote.medicamento}</Text>
          <Text style={{ fontSize: 13, color: colors.sub, marginBottom: 16 }}>Lote {lote.lote} · Disponible: {lote.disponible}</Text>
          <ErrorBox message={formError} />
          <SelectField label="Tipo" value={tipo} onChange={setTipo} options={TIPOS} />
          <Field label={tipo === 'ajuste' ? 'Nueva cantidad del lote' : 'Cantidad'} value={cantidad} onChangeText={setCantidad} keyboardType="number-pad" placeholder="Ej: 10" />
          <Field label="Motivo" value={motivo} onChangeText={setMotivo} placeholder={tipo === 'salida' || tipo === 'ajuste' ? 'Obligatorio' : 'Opcional'} />
          <Button title="Registrar" icon="checkmark-circle-outline" onPress={save} loading={busy} />
          <Button title="Cancelar" variant="outline" color={colors.coral} onPress={() => { navigation.setParams({ lote: undefined }); setFormError(''); }} style={{ marginTop: 10 }} />
        </Card>
      ) : can('farmacia') ? (
        <Text style={{ fontSize: 13, color: colors.sub, backgroundColor: colors.mint, padding: 14, borderRadius: 14, marginBottom: 16 }}>Para registrar un movimiento, abre «Existencias por lote» y elige el lote.</Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, flexGrow: 0 }}>
        {FILTERS.map(([id, label]) => (
          <Pressable key={id || 'all'} onPress={() => setFiltro(id)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: filtro === id ? colors.teal : '#fff' }}>
            <Text style={{ fontWeight: '700', fontSize: 12, color: filtro === id ? '#fff' : colors.sub }}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ErrorBox message={error} />
      {loading && rows.length === 0 ? <Loading /> : rows.length === 0 ? <Empty icon="swap-vertical-outline" text="No hay movimientos registrados." /> : rows.map((m) => (
        <Card key={m.id} accent={COLOR[m.tipo] || colors.line} style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 }}>{m.medicamento}</Text>
            <Badge text={`${m.tipo} · ${m.cantidad}`} color={COLOR[m.tipo] || colors.sub} />
          </View>
          <Text style={{ fontSize: 13, color: colors.sub }}>Stock {m.stockAnterior} → {m.stockNuevo}{m.lote ? ` · Lote ${m.lote}` : ''}</Text>
          {m.motivo ? <Text style={{ fontSize: 13, color: colors.sub, marginTop: 4 }}>{m.motivo}</Text> : null}
          <Text style={{ fontSize: 11, color: colors.faint, marginTop: 8 }}>{fmtDateTime(m.fecha)}{m.usuario ? ` · ${m.usuario}` : ''}</Text>
        </Card>
      ))}
      {rows.length < total ? <Button variant="soft" title={loading ? 'Cargando...' : `Cargar más (${rows.length} de ${total})`} disabled={loading} onPress={() => setPage(page + 1)} /> : null}
    </Screen>
  );
}
