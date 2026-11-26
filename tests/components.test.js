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

  it("gestiona cursosEditados de forma inmutable, valida bloques, persiste y limpia al resetear", () => {
    const { sandbox, storage } = createBrowserSandbox();
    sandbox.HORARIOS_MATERIAS = {
      "1": [
        {
          id: "1K1-A",
          comision: "1K1",
          periodo: "Anual",
          bloques: [
            { dia: "Lunes", inicio: "08:00", fin: "10:00" },
            { dia: "Martes", inicio: "10:00", fin: "12:00" }
          ]
        },
        {
          id: "1K2-A",
          comision: "1K2",
          periodo: "Anual",
          bloques: [{ dia: "Miércoles", inicio: "08:00", fin: "10:00" }]
        }
      ]
    };
    sandbox.App = { renderAll: () => {} };
    loadAppScript(sandbox, "app/src/data/materias.js");
    loadAppScript(sandbox, "app/src/state/store.js");
    loadAppScript(sandbox, "app/src/utils/correlativas.js");
    loadAppScript(sandbox, "app/src/utils/schedule.js");

    const { store } = sandbox.App;
    store.selectComisionMateria("1", "1K1-A");

    const badTime = store.saveCursoEditado("1", [{ dia: "Lunes", inicio: "10:00", fin: "08:00", aula: "200" }]);
    assert.equal(badTime.ok, false);

    const badDay = store.saveCursoEditado("1", [{ dia: "Domingo", inicio: "08:00", fin: "10:00" }]);
    assert.equal(badDay.ok, false);

    const emptyArr = store.saveCursoEditado("1", []);
    assert.equal(emptyArr.ok, false);

    const prevEditados = store.state.cursosEditados;
    const saved = store.saveCursoEditado("1", [
      { dia: "Lunes", inicio: "08:00", fin: "10:00", aula: "200" },
      { dia: "Martes", inicio: "10:00", fin: "12:00", aula: "300" }
    ]);
    assert.equal(saved.ok, true);
    assert.notEqual(store.state.cursosEditados, prevEditados);
    assert.equal(store.getEffectiveComision("1").bloques[0].aula, "200");
    assert.equal(store.getEffectiveComision("1").bloques[1].aula, "300");

    const persisted = JSON.parse(storage[store.STORAGE_KEYS.CURSOS_EDITADOS]);
    assert.equal(persisted["1"].bloques[0].aula, "200");

    // Volver al horario base sin aulas elimina el override redundante
    store.saveCursoEditado("1", [
      { dia: "Lunes", inicio: "08:00", fin: "10:00", aula: "" },
      { dia: "Martes", inicio: "10:00", fin: "12:00", aula: "" }
    ]);
    assert.equal(store.state.cursosEditados["1"], undefined);

    // Guardar de nuevo y verificar limpieza al cambiar de comisión y al vaciar plan
    store.saveCursosEditadosBatch({
      "1": [
        { dia: "Lunes", inicio: "08:00", fin: "10:00", aula: "405" }
      ]
    });
    assert.equal(store.state.cursosEditados["1"].bloques[0].aula, "405");

    store.selectComisionMateria("1", "1K2-A");
    assert.equal(store.state.cursosEditados["1"], undefined);

    store.saveCursoEditado("1", [{ dia: "Miércoles", inicio: "08:00", fin: "10:00", aula: "Lab 2" }]);
    assert.ok(store.state.cursosEditados["1"]);
    store.clearPlan();
    assert.deepEqual(JSON.parse(JSON.stringify(store.state.cursosEditados)), {});
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

describe("EditCourseModal y UtnCalendar — aulas por día y sanitización XSS", () => {
  it("renderiza aulas distintas por día en UtnCalendar y escapa HTML en aula", () => {
    const dom = makeDomMock([
      "utn-cal-body",
      "enrolled-summary-pill",
      "btn-clear-plan",
      "btn-edit-courses",
      "btn-export-schedule",
      "conflict-alert-banner"
    ]);
    const { sandbox } = createBrowserSandbox({ document: dom.document });
    sandbox.HORARIOS_MATERIAS = {
      "1": [
        {
          id: "1K1-A",
          comision: "1K1",
          periodo: "Anual",
          bloques: [
            { dia: "Lunes", inicio: "08:00", fin: "10:00" },
            { dia: "Martes", inicio: "08:00", fin: "10:00" }
          ]
        }
      ]
    };
    sandbox.App = { renderAll: () => {} };
    loadAppScript(sandbox, "app/src/data/materias.js");
    loadAppScript(sandbox, "app/src/state/store.js");
    loadAppScript(sandbox, "app/src/utils/schedule.js");
    loadAppScript(sandbox, "app/src/components/UtnCalendar.js");

    sandbox.App.store.selectComisionMateria("1", "1K1-A");
    sandbox.App.store.saveCursoEditado("1", [
      { dia: "Lunes", inicio: "08:00", fin: "10:00", aula: "200" },
      { dia: "Martes", inicio: "08:00", fin: "10:00", aula: '<script>alert(1)</script>' }
    ]);

    sandbox.App.components.UtnCalendar.render();
    const calHtml = dom.elements["utn-cal-body"].innerHTML;
    assert.ok(calHtml.includes("Aula 200"));
    assert.ok(!calHtml.includes("<script>alert(1)</script>"));
    assert.ok(calHtml.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
    assert.equal(dom.elements["btn-edit-courses"].disabled, false);
  });

  it("abre EditCourseModal, permite guardar cambios y restaurar original", () => {
    const dom = makeDomMock([
      "edit-course-modal",
      "edit-course-filter",
      "edit-course-error",
      "edit-course-list",
      "btn-close-edit-course",
      "btn-cancel-edit-course",
      "btn-save-edit-course"
    ]);
    const { sandbox } = createBrowserSandbox({ document: dom.document });
    sandbox.HORARIOS_MATERIAS = {
      "1": [
        {
          id: "1K1-A",
          comision: "1K1",
          periodo: "Anual",
          bloques: [
            { dia: "Lunes", inicio: "08:00", fin: "10:00" },
            { dia: "Martes", inicio: "10:00", fin: "12:00" }
          ]
        }
      ]
    };
    sandbox.App = { renderAll: () => {} };
    loadAppScript(sandbox, "app/src/data/materias.js");
    loadAppScript(sandbox, "app/src/state/store.js");
    loadAppScript(sandbox, "app/src/utils/schedule.js");
    loadAppScript(sandbox, "app/src/components/EditCourseModal.js");

    sandbox.App.store.selectComisionMateria("1", "1K1-A");
    sandbox.App.store.saveCursoEditado("1", [
      { dia: "Lunes", inicio: "08:00", fin: "10:00", aula: "200" },
      { dia: "Martes", inicio: "10:00", fin: "12:00", aula: "300" }
    ]);

    sandbox.App.components.EditCourseModal.bindEvents();
    sandbox.App.components.EditCourseModal.open("1");

    assert.equal(sandbox.App.components.EditCourseModal.isOpen(), true);
    const listHtml = dom.elements["edit-course-list"].innerHTML;
    assert.ok(listHtml.includes('value="200"'));
    assert.ok(listHtml.includes('value="300"'));
    assert.ok(listHtml.includes("Editado"));

    dom.elements["btn-save-edit-course"].dispatch("click");
    assert.equal(sandbox.App.components.EditCourseModal.isOpen(), false);
  });
});
