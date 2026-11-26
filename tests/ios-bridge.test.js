const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserSandbox, loadAppScript } = require('./helpers/loadAppScript');
const base = 'http://192.168.1.20:3456';
function client(platform, request, fetch) {
  const { sandbox } = createBrowserSandbox({ Capacitor: { getPlatform: () => platform, Plugins: { CapacitorHttp: { request } } }, fetch });
  loadAppScript(sandbox, 'app/src/services/syncClient.js');
  return sandbox.App.syncClient;
}
test('iOS: info, envío y recepción usan HTTP nativo', async () => {
  const calls = [];
  const c = client('ios', async o => { calls.push(o); return { status: 200, data: { ok: true } }; }, () => assert.fail('fetch inesperado'));
  await c.fetchServerInfo(base); await c.pushState(base, { estadosAlumno: { 1: 'aprobado' } }); await c.pullState(base);
  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, base + '/api/info');
  assert.equal(calls[1].method, 'POST');
  assert.equal(calls[1].data.estadosAlumno[1], 'aprobado');
  assert.equal(calls[2].url, base + '/api/sync');
  assert.equal(calls[2].method, 'GET');
});
test('iOS: rechaza errores HTTP y del servidor', async () => {
  await assert.rejects(client('ios', async () => ({status: 503})).fetchServerInfo(base), /HTTP 503/);
  await assert.rejects(client('ios', async () => ({status: 200, data: {ok: false, error: 'fallo'}})).pullState(base), /fallo/);
});
for (const platform of ['android', 'web']) test(`${platform}: conserva fetch`, async () => {
  let used = false;
  const c = client(platform, () => assert.fail('HTTP nativo inesperado'), async (url, options) => { used = true; assert.equal(url, base + '/api/info'); assert.equal(options.method, 'GET'); return {ok: true, json: async () => ({ok:true})}; });
  await c.fetchServerInfo(base); assert.ok(used);
});
test('iOS: exportación entrega PNG base64 a Filesystem y URI a Share', async () => {
  const calls = [];
  const ctx = new Proxy({}, { get: (o,k) => o[k] || (k === 'measureText' ? s => ({width: String(s).length * 6}) : () => {}) });
  const { sandbox } = createBrowserSandbox({
    Capacitor: { getPlatform: () => 'ios', Plugins: {
      Filesystem: { writeFile: async o => { calls.push(o); return {uri:'file:///cache/horario.png'}; } },
      Share: { share: async o => { calls.push(o); } }
    } },
    document: { createElement: () => ({ getContext: () => ctx, toDataURL: () => 'data:image/png;base64,aGVsbG8=' }) },
    alert: msg => assert.fail(msg)
  });
  sandbox.App = {store: {state: {currentCuatFilter: '1C'}}, schedule: {
    DAYS_ORDER: ['Lunes'], collectEnrolledSchedule: () => ({subjects:[{id:'1',nombre:'Materia',comision:'1K1',periodo:'Anual',carga:2}],blocks:[{dia:'Lunes',materiaId:'1',materiaNombre:'Materia',comision:'1K1',inicio:'08:00',fin:'10:00',startMin:480,endMin:600}],totalHoras:2}),
    computeHourRange: () => ({minHour:8,totalHours:2,minMin:480,totalRangeMin:120}), computeColumnLanes: b => b, formatShortTime: s => s, formatAulaLabel: s => s
  }};
  loadAppScript(sandbox, 'app/src/utils/exportSchedule.js');
  await sandbox.App.exportSchedule.exportSchedulePng();
  assert.equal(calls.length,2); assert.equal(calls[0].path,'horario-isi-2023-1C.png'); assert.equal(calls[0].directory,'CACHE'); assert.equal(calls[0].data,'aGVsbG8='); assert.equal(calls[1].files[0],'file:///cache/horario.png');
});
