const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadAppScript } = require("./helpers/loadAppScript");

function setupScheduleEnv(stateOverrides = {}, opcionesByMateria = {}) {
  const { sandbox } = createBrowserSandbox();
  sandbox.App = {
    data: {
      MATERIAS_MAP: {
        "1": { id: "1", nombre: "Análisis Matemático I (Int)*", carga: 5 },
        "2": { id: "2", nombre: "Álgebra", carga: 5 },
        "3": { id: "3", nombre: "Física I", carga: 4 }
      }
    },
    store: {
      state: {
        cursosSeleccionados: {},
        ordenCursosSeleccionados: [],
        currentCuatFilter: "all",
        ...stateOverrides
      },
      getOpcionesComision: id => opcionesByMateria[id] || []
    }
  };
  loadAppScript(sandbox, "app/src/utils/schedule.js");
  return sandbox.App.schedule;
}

describe("App.schedule — utilidades de horarios", () => {
  it("formatea horas y convierte a minutos", () => {
    const S = setupScheduleEnv();
    assert.equal(S.formatShortTime("14:00"), "14");
    assert.equal(S.formatShortTime("13:15"), "13:15");
    assert.equal(S.formatShortTime("08:00"), "8");
    assert.equal(S.timeToMinutes("08:30"), 510);
    assert.equal(S.timeToMinutes("22:15"), 1335);
  });

  it("limpia nombres integradores y detecta comisiones ISI (K)", () => {
    const S = setupScheduleEnv();
    assert.equal(S.cleanMateriaName("Análisis de Sistemas (Int)*"), "Análisis de Sistemas");
    assert.equal(S.cleanMateriaName("Física I"), "Física I");
    assert.equal(S.isIsiComision({ comision: "1K1" }), true);
    assert.equal(S.isIsiComision("3k4"), true);
    assert.equal(S.isIsiComision({ comision: "1D1" }), false);
    assert.equal(S.isIsiComision(""), false);
  });

  it("filtra correctamente por cuatrimestre y detecta períodos disjuntos", () => {
    const S = setupScheduleEnv();
    assert.equal(S.matchesCuatFilter("Anual", "1C"), true);
    assert.equal(S.matchesCuatFilter("1° Cuat.", "1C"), true);
    assert.equal(S.matchesCuatFilter("2° Cuat.", "1C"), false);
    assert.equal(S.matchesCuatFilter("1° Cuat.", "2C"), false);
    assert.equal(S.matchesCuatFilter("2° Cuat.", "all"), true);

    assert.equal(S.arePeriodosDisjoint("1° Cuat.", "2° Cuat."), true);
    assert.equal(S.arePeriodosDisjoint("2° Cuat.", "1° Cuat."), true);
    assert.equal(S.arePeriodosDisjoint("Anual", "2° Cuat."), false);
    assert.equal(S.arePeriodosDisjoint("1° Cuat.", "1° Cuat."), false);
  });

  it("une bloques contiguos separados por recreos <= 30 min y separa bloques lejanos", () => {
    const S = setupScheduleEnv();
    const merged = S.getMergedBloques([
      { dia: "Lunes", inicio: "08:00", fin: "09:30" },
      { dia: "Lunes", inicio: "09:45", fin: "11:15" },
      { dia: "Lunes", inicio: "14:00", fin: "16:00" }
    ]);
    assert.equal(merged.length, 2);
    assert.deepEqual(
      JSON.parse(JSON.stringify(merged)),
      [
        { dia: "Lunes", inicio: "08:00", fin: "11:15" },
        { dia: "Lunes", inicio: "14:00", fin: "16:00" }
      ]
    );
    assert.equal(S.formatBloquesResumen(merged), "Lun 8-11:15hs • Lun 14-16hs");
  });

  it("recolecta materias inscriptas respetando orden y detecta conflictos sin falsos positivos entre 1C y 2C", () => {
    const opciones = {
      "1": [
        {
          id: "1K1-A",
          comision: "1K1",
          periodo: "Anual",
          bloques: [{ dia: "Lunes", inicio: "08:00", fin: "11:00" }]
        }
      ],
      "2": [
        {
          id: "1K2-1C",
          comision: "1K2",
          periodo: "1° Cuat.",
          bloques: [{ dia: "Lunes", inicio: "08:10", fin: "10:00" }]
        }
      ],
      "3": [
        {
          id: "1K3-2C",
          comision: "1K3",
          periodo: "2° Cuat.",
          bloques: [{ dia: "Lunes", inicio: "08:10", fin: "10:00" }]
        }
      ]
    };

    const S = setupScheduleEnv(
      {
        cursosSeleccionados: { "1": "1K1-A", "2": "1K2-1C", "3": "1K3-2C" },
        ordenCursosSeleccionados: ["2", "1"]
      },
      opciones
    );

    const schedule = S.collectEnrolledSchedule();
    assert.equal(schedule.totalMaterias, 3);
    assert.equal(schedule.totalHoras, 14);
    assert.deepEqual(
      Array.from(schedule.subjects, s => s.id),
      ["2", "1", "3"]
    );

    const { blocks, conflicts } = S.detectEnrolledConflicts(schedule.blocks);
    // 2 (1C) vs 1 (Anual) -> conflicto; 2 (1C) vs 3 (2C) -> disjuntos; 1 (Anual) vs 3 (2C) -> conflicto
    assert.equal(conflicts.length, 2);
    assert.equal(blocks[1].conflict, true);
    assert.equal(blocks[1].sameStartConflict, true);
    assert.equal(blocks[2].conflict, true);
  });

  it("calcula el rango horario respetando el mínimo de 8 horas", () => {
    const S = setupScheduleEnv();
    const emptyRange = S.computeHourRange([]);
    assert.equal(emptyRange.minHour, 8);
    assert.equal(emptyRange.maxHour, 23);

    const shortRange = S.computeHourRange([{ startMin: 8 * 60, endMin: 10 * 60 }]);
    assert.equal(shortRange.minHour, 8);
    assert.equal(shortRange.maxHour, 16);
    assert.equal(shortRange.totalHours, 8);
  });

  it("asigna carriles (lanes) sin mutar los bloques originales", () => {
    const S = setupScheduleEnv();
    const input = [
      { startMin: 480, endMin: 600, isPreview: false },
      { startMin: 500, endMin: 620, isPreview: false },
      { startMin: 600, endMin: 720, isPreview: false }
    ];
    const result = S.computeColumnLanes(input);
    assert.equal(result[0].totalLanes, 2);
    assert.equal(result[0].laneIndex, 0);
    assert.equal(result[1].laneIndex, 1);
    assert.equal(result[2].laneIndex, 0);
    assert.equal(input[0].laneIndex, undefined);
  });
});
