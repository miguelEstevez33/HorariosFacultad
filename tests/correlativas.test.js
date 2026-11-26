const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadAppScript } = require("./helpers/loadAppScript");

function setupAppEnv() {
  const { sandbox } = createBrowserSandbox();
  sandbox.App = { renderAll: () => {} };
  loadAppScript(sandbox, "app/src/data/materias.js");
  loadAppScript(sandbox, "app/src/state/store.js");
  loadAppScript(sandbox, "app/src/utils/correlativas.js");
  return sandbox.App;
}

describe("App.correlativas y App.store — reglas de Plan 2023", () => {
  it("habilita materias de 1° año sin correlativas y bloquea materias de 2° año sin previas", () => {
    const App = setupAppEnv();
    const am1 = App.data.MATERIAS_MAP["1"];
    const am2 = App.data.MATERIAS_MAP["9"]; // requiere regulares 1 y 2

    assert.equal(App.correlativas.evaluarHabilitacion(am1).habilitadaParaCursar, true);
    const evAm2 = App.correlativas.evaluarHabilitacion(am2);
    assert.equal(evAm2.habilitadaParaCursar, false);
    assert.deepEqual(Array.from(evAm2.faltanRegulares), ["1", "2"]);

    App.store.setEstadoMateria("1", "regular");
    App.store.setEstadoMateria("2", "aprobado");
    assert.equal(App.correlativas.evaluarHabilitacion(am2).habilitadaParaCursar, true);
  });

  it("limpia cursos seleccionados en el horario si pierden habilitación por correlativas", () => {
    const App = setupAppEnv();
    App.store.setEstadoMateria("1", "regular");
    App.store.setEstadoMateria("2", "regular");
    App.store.selectComisionMateria("9", "2K1-A");

    assert.equal(App.store.state.cursosSeleccionados["9"], "2K1-A");
    assert.deepEqual(Array.from(App.store.state.ordenCursosSeleccionados), ["9"]);

    // Quitar regularidad de AM1 invalida AM2 en el horario
    App.store.setEstadoMateria("1", "none");
    assert.equal(App.store.state.cursosSeleccionados["9"], undefined);
    assert.deepEqual(Array.from(App.store.state.ordenCursosSeleccionados), []);
  });

  it("calcula correlativas previas indirectas y correlativas a futuro", () => {
    const App = setupAppEnv();
    const bd = App.data.MATERIAS_MAP["19"]; // Base de Datos (reg: 13,16; apr: 5,6)
    const prevInd = App.correlativas.obtenerPreviasIndirectas(bd);
    // 16 pide 6 y 8; 8 no es directa de 19 -> debe aparecer en indirectas
    assert.ok(prevInd.some(m => m.id === "8"));

    const futuroOblig = App.correlativas.obtenerCorrelativasFuturo("19", false);
    const futuroConElec = App.correlativas.obtenerCorrelativasFuturo("19", true);
    assert.ok(futuroOblig.directas.some(d => d.materia.id === "25")); // Ingeniería y Calidad
    assert.ok(futuroConElec.directas.length > futuroOblig.directas.length);
  });

  it("calcula impacto de traba excluyendo materias ya regularizadas o aprobadas", () => {
    const App = setupAppEnv();
    const impactoInicial = App.correlativas.calcularImpactoTraba("1", false);
    assert.ok(impactoInicial.totalTrabadas > 0);

    // Si el alumno ya aprobó Análisis Matemático II (9), deja de contarse como trabada directa
    App.store.setEstadoMateria("9", "aprobado");
    const impactoDespues = App.correlativas.calcularImpactoTraba("1", false);
    assert.ok(!impactoDespues.directas.some(d => d.materia.id === "9"));
    assert.ok(impactoDespues.totalTrabadas < impactoInicial.totalTrabadas);
  });
});
