import { fmtDateTime, fmtMinutes, statusLabel, triageInfo } from '../src/utils/triage';

describe('utils/triage', () => {
  test('nivel de triage conocido y desconocido', () => {
    expect(triageInfo('rojo').label).toBe('Crítico');
    expect(triageInfo('amarillo').color).toBe('#F59E0B');
    expect(triageInfo('xyz').label).toBe('Sin clasificar');
  });
  test('formatos de fecha y minutos', () => {
    expect(fmtDateTime('2026-10-06 14:35:00')).toBe('06/10 14:35');
    expect(fmtMinutes(45)).toBe('45 min');
    expect(fmtMinutes(130)).toBe('2 h 10 min');
    expect(fmtMinutes(null)).toBe('');
  });
  test('estados', () => {
    expect(statusLabel('en_espera')).toBe('En espera');
  });
});
