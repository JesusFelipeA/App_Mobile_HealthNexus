import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStats } from '../api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { Ico, ErrorBox, colors, shadow } from '../components/ui';

// roles: quién puede ver el módulo (sin roles = todos; [] = solo administrador)
const MODULES = [
  { id: 'Triage', title: 'Triage', icon: 'medkit-outline', accent: 'teal', tag: 'Acceso rápido', desc: 'Clasificación de pacientes', roles: ['medico', 'enfermeria'] },
  { id: 'Patients', title: 'Pacientes', icon: 'people-outline', accent: 'teal', tag: 'Registrados', desc: 'Lista y prioridad', roles: ['medico', 'enfermeria'] },
  { id: 'Internas', title: 'Derivaciones internas', icon: 'swap-horizontal-outline', accent: 'teal', tag: 'Gestión eficiente', desc: 'Traslados entre áreas', roles: ['medico', 'enfermeria'] },
  { id: 'Externas', title: 'Derivaciones externas', icon: 'globe-outline', accent: 'coral', tag: 'Conectando', desc: 'Traslados y referencias', roles: ['medico'] },
  { id: 'Hospitals', title: 'Hospitales', icon: 'location-outline', accent: 'coral', tag: 'Más opciones', desc: 'Cercanos y camas' },
  { id: 'Seguimiento', title: 'Seguimiento', icon: 'analytics-outline', accent: 'amber', tag: 'Tiempo real', desc: 'Estado de pacientes' },
  { id: 'Auditoria', title: 'Auditoría', icon: 'clipboard-outline', accent: 'amber', tag: 'Transparencia', desc: 'Bitácora del sistema', roles: [] },
];
const ACCENT = { teal: [colors.teal, colors.mint], coral: [colors.coral, colors.coralTint], amber: [colors.amber, colors.amberTint] };
const ROL = { administrador: 'Administrador', medico: 'Médico', enfermeria: 'Enfermería', farmacia: 'Farmacia' };

export default function Dashboard({ navigation }) {
  const { user, can, logout } = useAuth();
  const { data, error, reload } = useFetch(getStats, []);
  const stats = data || { totalPatients: 0, redCount: 0, yellowCount: 0, greenCount: 0 };
  const visible = MODULES.filter((m) => !m.roles || can(...m.roles));
  const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  const confirmLogout = () => Alert.alert('Cerrar sesión', '¿Quieres cerrar tu sesión?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Cerrar sesión', onPress: logout },
  ]);

  const rows = [
    { icon: 'people', label: 'Pacientes totales', value: stats.totalPatients, chip: 'Registrados', color: colors.tealDeep, bg: colors.mint },
    { icon: 'warning', label: 'Casos urgentes', value: stats.yellowCount, chip: 'Amarillo', color: colors.amber, bg: colors.amberTint },
    { icon: 'alert-circle', label: 'Casos críticos', value: stats.redCount, chip: 'Rojo', color: colors.coral, bg: colors.coralTint },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text style={s.appTitle}>Health<Text style={{ color: colors.tealDeep }}>Nexus</Text></Text>

        <View style={s.hero}>
          <Text style={s.heroWelcome}>BIENVENIDO</Text>
          <Text style={s.heroTitle}>{user.nombre}</Text>
          <Text style={s.heroSub}>{ROL[user.rol] || user.rol}</Text>
          <View style={s.pill}>
            <Ico name="shield-checkmark" size={16} color="#fff" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={s.pillTitle}>Sesión segura</Text>
              <Text style={s.pillSub}>Conectado a tu servidor HealthNexus</Text>
            </View>
          </View>
          <Pressable style={[s.pill, { backgroundColor: '#fff' }]} onPress={confirmLogout}>
            <Ico name="log-out-outline" size={16} color={colors.tealDeep} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[s.pillTitle, { color: colors.tealDeep }]}>Cerrar sesión</Text>
              <Text style={[s.pillSub, { color: colors.sub }]}>{user.email}</Text>
            </View>
          </Pressable>
        </View>

        <Text style={s.section}>Módulos</Text>
        <View style={s.grid}>
          {visible.map((m) => {
            const [fg, bg] = ACCENT[m.accent];
            return (
              <Pressable key={m.id} style={s.module} onPress={() => navigation.navigate(m.id)}>
                <View style={[s.moduleIcon, { backgroundColor: bg }]}><Ico name={m.icon} size={21} color={fg} /></View>
                <Text style={s.moduleTitle}>{m.title}</Text>
                <Text style={s.moduleDesc}>{m.desc}</Text>
                <View style={[s.tag, { backgroundColor: bg }]}><Text style={[s.tagText, { color: fg }]}>{m.tag}</Text></View>
              </Pressable>
            );
          })}
        </View>

        <View style={s.sectionRow}>
          <Text style={s.section}>Resumen del día</Text>
          <Text style={s.date}>{date}</Text>
        </View>
        <ErrorBox message={error} onRetry={reload} />
        <View style={s.stats}>
          {rows.map((r, i) => (
            <View key={r.label} style={[s.statRow, i === rows.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[s.statIcon, { backgroundColor: r.bg }]}><Ico name={r.icon} size={18} color={r.color} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.statLabel}>{r.label}</Text>
                <Text style={s.statValue}>{r.value}</Text>
              </View>
              <View style={[s.chip, { backgroundColor: r.bg }]}><Text style={[s.chipText, { color: r.color }]}>{r.chip}</Text></View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  appTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 20 },
  hero: { backgroundColor: colors.tealDeep, borderRadius: 28, padding: 28, marginBottom: 32, ...shadow },
  heroWelcome: { fontSize: 11, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 24, fontWeight: '500' },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 10 },
  pillTitle: { fontSize: 13, fontWeight: '700', color: '#fff' },
  pillSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  section: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, fontWeight: '500', color: colors.faint, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  module: { width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 18, ...shadow },
  moduleIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  moduleTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  moduleDesc: { fontSize: 12, color: colors.sub, marginBottom: 14, lineHeight: 16 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  stats: { backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 20, ...shadow },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 14 },
  statIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, color: colors.sub, fontWeight: '500', marginBottom: 3 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 11, fontWeight: '700' },
});
