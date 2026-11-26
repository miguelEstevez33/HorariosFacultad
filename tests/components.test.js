const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadAppScript } = require("./helpers/loadAppScript");

function makeDomMock(ids) {
  const elements = {};
  for (const id of ids) {
    const listeners = {};
    elements[id] = {
      id,
      innerHTML: "",
      textContent: "",
      className: "",
      value: "",
      checked: false,
      disabled: false,
      style: { display: "none", width: "" },
      addEventListener(ev, fn) {
        if (!listeners[ev]) listeners[ev] = [];
        listeners[ev].push(fn);
      },
      dispatch(ev, eventObj = {}) {
        (listeners[ev] || []).forEach(fn => fn(eventObj));
      },
      querySelectorAll: () => []
    };
  }
  return {
    elements,
    document: {
      getElementById: id => elements[id] || null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    }
  };
}

describe("App.store — actualizaciones inmutables", () => {
  it("crea nuevas referencias de estadosAlumno y cursosSeleccionados al mutar", () => {
    const { sandbox } = createBrowserSandbox();
    sandbox.App = { renderAll: () => {} };
    loadAppScript(sandbox, "app/src/data/materias.js");
    loadAppScript(sandbox, "app/src/state/store.js");
    loadAppScript(sandbox, "app/src/utils/correlativas.js");

    const { store } = sandbox.App;
    const prevEstados = store.state.estadosAlumno;
    const prevCursos = store.state.cursosSeleccionados;

    store.selectComisionMateria("1", "1K1-A");
    assert.notEqual(store.state.estadosAlumno, prevEstados);
    assert.notEqual(store.state.cursosSeleccionados, prevCursos);

    const cursosBeforeKill = store.state.cursosSeleccionados;
    store.killMateriaInscripta("1");
    assert.notEqual(store.state.cursosSeleccionados, cursosBeforeKill);
    assert.equal(store.state.cursosSeleccionados["1"], undefined);
  });
});

describe("HeaderStats — estadísticas y barras de progreso", () => {
  it("calcula estadísticas, créditos y habilita Matar Materia con >= 2 cursando", () => {
    const dom = makeDomMock([
      "stat-aprobadas",
      "stat-regulares",
      "stat-cursando",
      "stat-creditos",
      "badge-habilitadas",
      "btn-kill-materia-header",
      "btn-kill-materia",
      "prog-ing-pct",
      "prog-ing-bar",
      "prog-ing-detail",
      "prog-ana-pct",
      "prog-ana-bar",
      "prog-ana-detail"
    ]);
    const { sandbox } = createBrowserSandbox({ document: dom.document });
    sandbox.App = { renderAll: () => {} };
    loadAppScript(sandbox, "app/src/data/materias.js");
    loadAppScript(sandbox, "app/src/state/store.js");
    loadAppScript(sandbox, "app/src/utils/correlativas.js");
    loadAppScript(sandbox, "app/src/components/HeaderStats.js");

    // 1 aprobada (AM1), 1 regular (Álgebra), 1 cursando (Física I)
    sandbox.App.store.setEstadoMateria("1", "aprobado");
    sandbox.App.store.setEstadoMateria("2", "regular");
    sandbox.App.store.setEstadoMateria("3", "cursando");
    sandbox.App.components.HeaderStats.render();

    assert.equal(dom.elements["stat-aprobadas"].textContent, 1);
    assert.equal(dom.elements["stat-regulares"].textContent, 1);
    assert.equal(dom.elements["stat-cursando"].textContent, 1);
    assert.equal(dom.elements["btn-kill-materia"].disabled, true);
    assert.equal(dom.elements["btn-kill-materia-header"].style.display, "none");

    // Agregar 2da cursando (Inglés I) habilita Matar Materia
    sandbox.App.store.setEstadoMateria("4", "cursando");
    sandbox.App.components.HeaderStats.render();

    assert.equal(dom.elements["stat-cursando"].textContent, 2);
    assert.equal(dom.elements["btn-kill-materia"].disabled, false);
    assert.equal(dom.elements["btn-kill-materia-header"].style.display, "inline-flex");
  });
});

describe("KillMateriaModal — ranking de impacto", () => {
  it("no abre con menos de 2 materias inscriptas y ordena de menor a mayor impacto", () => {
    const dom = makeDomMock([
      "kill-materia-modal",
      "kill-materia-list",
      "kill-include-electivas"
    ]);
    const { sandbox } = createBrowserSandbox({ document: dom.document });
    sandbox.App = { renderAll: () => {} };
    loadAppScript(sandbox, "app/src/data/materias.js");
    loadAppScript(sandbox, "app/src/state/store.js");
    loadAppScript(sandbox, "app/src/utils/correlativas.js");
    loadAppScript(sandbox, "app/src/components/KillMateriaModal.js");

    sandbox.App.store.setEstadoMateria("1", "cursando"); // AM1 (muchas correlativas futuras)
    sandbox.App.components.KillMateriaModal.open();
    assert.equal(sandbox.App.components.KillMateriaModal.isOpen(), false);

    sandbox.App.store.setEstadoMateria("11", "cursando"); // Ingeniería y Sociedad (solo traba Legislación)
    sandbox.App.components.KillMateriaModal.open();
    assert.equal(sandbox.App.components.KillMateriaModal.isOpen(), true);

    const html = dom.elements["kill-materia-list"].innerHTML;
    const idxIngSoc = html.indexOf("Ingeniería y Sociedad");
    const idxAm1 = html.indexOf("Análisis Matemático I");
    assert.ok(idxIngSoc !== -1 && idxAm1 !== -1);
    assert.ok(idxIngSoc < idxAm1, "La materia que traba menos debe aparecer primero");
  });
});

describe("SyncModal — sanitización XSS", () => {
  it("escapa HTML malicioso proveniente de /api/info", async () => {
    const dom = makeDomMock([
      "btn-open-sync",
      "sync-modal",
      "btn-close-sync-modal",
      "btn-close-sync-modal-footer",
      "sync-server-url",
      "btn-sync-test",
      "btn-sync-push",
      "btn-sync-pull",
      "sync-conn-status",
      "sync-last-info",
      "sync-ips-hint",
      "sync-feedback-msg",
      "sync-device-label",
      "sync-push-title",
      "sync-push-desc",
      "sync-pull-title",
      "sync-pull-desc"
    ]);
    dom.elements["sync-server-url"].value = "http://192.168.1.50:3456";

    const { sandbox } = createBrowserSandbox({
      document: dom.document,
      fetch: async () => ({
        ok: true,
        json: async () => ({
          ok: true,
          port: 3456,
          ips: ['<img src=x onerror="alert(1)">'],
          lastSync: {
            updatedAt: "2026-11-26T10:00:00Z",
            source: "pc",
            estadosCount: 2,
            cursosCount: 1
          }
        })
      })
    });
    sandbox.App = { renderAll: () => {} };
    loadAppScript(sandbox, "app/src/data/materias.js");
    loadAppScript(sandbox, "app/src/state/store.js");
    loadAppScript(sandbox, "app/src/services/syncClient.js");
    loadAppScript(sandbox, "app/src/components/SyncModal.js");

    sandbox.App.components.SyncModal.bindEvents();
    dom.elements["btn-sync-test"].dispatch("click");
    await new Promise(r => setTimeout(r, 20));

    const ipsHtml = dom.elements["sync-ips-hint"].innerHTML;
    assert.ok(!ipsHtml.includes("<img"), "No debe inyectar etiquetas HTML crudas");
    assert.ok(ipsHtml.includes("&lt;img"), "Debe escapar caracteres HTML");
  });
});
