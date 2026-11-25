// Estado global de la aplicación y persistencia en localStorage
(function (global) {
  const App = (global.App = global.App || {});

  const STORAGE_KEYS = {
    ESTADOS: "isi2023_estados_alumno",
    CURSOS: "isi2023_cursos_seleccionados",
    HORARIOS: "isi2023_horarios_override",
    SYNC_URL: "isi2023_sync_server_url"
  };

  function loadFromStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  let initialCursos = loadFromStorage(STORAGE_KEYS.CURSOS, {});
  if (Array.isArray(initialCursos)) {
    initialCursos = {};
  }

  const state = {
    // Estados de cada materia ("none" | "regular" | "aprobado" | "cursando")
    estadosAlumno: loadFromStorage(STORAGE_KEYS.ESTADOS, {}),
    // Mapa materiaId -> comisionOptionId (ej. { "17": "2K6-1C" })
    cursosSeleccionados: initialCursos,
    // Horarios actualizados desde la PC vía sincronización (opcional)
    horariosOverride: loadFromStorage(STORAGE_KEYS.HORARIOS, null),
    // Orden de selección de materias para resolver prioridad visual en conflictos
    ordenCursosSeleccionados: Object.keys(initialCursos),
    // Filtro de cuatrimestre en el calendario ("all" | "1C" | "2C")
    currentCuatFilter: "all",
    // Materia activa en el selector para previsualizar sus comisiones en la grilla
    activePreviewMateriaId: null,
    // Comisión bajo el puntero del mouse para resaltar sus bloques
    hoveredPreviewOptionId: null,
    // Mostrar solo comisiones de Sistemas (K) o también básicas de otras carreras
    showOnlyIsiInPreview: true,
    // Materia seleccionada en la Pestaña 3: Correlativas
    selectedCorrelativaMateriaId: "1"
  };

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.ESTADOS, JSON.stringify(state.estadosAlumno));
    localStorage.setItem(STORAGE_KEYS.CURSOS, JSON.stringify(state.cursosSeleccionados));
  }

  function getEstado(id) {
    return state.estadosAlumno[id] || "none";
  }

  function getOpcionesComision(materiaId) {
    if (state.horariosOverride && state.horariosOverride[materiaId]) {
      return state.horariosOverride[materiaId];
    }
    if (typeof HORARIOS_MATERIAS !== "undefined" && HORARIOS_MATERIAS[materiaId]) {
      return HORARIOS_MATERIAS[materiaId];
    }
    return [];
  }

  function getInscriptasList() {
    const { MATERIAS } = App.data;
    return MATERIAS.filter(m => {
      const st = getEstado(m.id);
      return st === "cursando" || Boolean(state.cursosSeleccionados[m.id]);
    });
  }

  function setEstadoMateria(id, nuevoEstado) {
    const { MATERIAS_MAP } = App.data;

    if (nuevoEstado === "none") {
      delete state.estadosAlumno[id];
    } else {
      state.estadosAlumno[id] = nuevoEstado;
    }

    if (nuevoEstado === "aprobado" || nuevoEstado === "regular") {
      delete state.cursosSeleccionados[id];
    }

    // Limpiar cualquier materia seleccionada en el horario que haya dejado de estar habilitada
    for (const mId of Object.keys(state.cursosSeleccionados)) {
      const mat = MATERIAS_MAP[mId];
      if (mat && !App.correlativas.evaluarHabilitacion(mat).habilitadaParaCursar) {
        delete state.cursosSeleccionados[mId];
      }
    }

    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function selectComisionMateria(materiaId, optionId) {
    if (!optionId) {
      delete state.cursosSeleccionados[materiaId];
      state.ordenCursosSeleccionados = state.ordenCursosSeleccionados.filter(id => id !== materiaId);
      if (state.estadosAlumno[materiaId] === "cursando") {
        delete state.estadosAlumno[materiaId];
      }
    } else {
      state.cursosSeleccionados[materiaId] = optionId;
      state.ordenCursosSeleccionados = state.ordenCursosSeleccionados.filter(id => id !== materiaId);
      state.ordenCursosSeleccionados.push(materiaId);
      state.estadosAlumno[materiaId] = "cursando";
    }
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function killMateriaInscripta(materiaId) {
    delete state.cursosSeleccionados[materiaId];
    state.ordenCursosSeleccionados = state.ordenCursosSeleccionados.filter(id => id !== materiaId);
    if (state.estadosAlumno[materiaId] === "cursando") {
      delete state.estadosAlumno[materiaId];
    }
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function markNivelEstado(nivel, estado) {
    const { MATERIAS } = App.data;
    MATERIAS.forEach(m => {
      if (m.nivel === nivel && !m.electiva) {
        state.estadosAlumno[m.id] = estado;
        delete state.cursosSeleccionados[m.id];
      }
    });
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function clearPlan() {
    for (const mId of Object.keys(state.cursosSeleccionados)) {
      if (state.estadosAlumno[mId] === "cursando") {
        delete state.estadosAlumno[mId];
      }
    }
    state.cursosSeleccionados = {};
    state.ordenCursosSeleccionados = [];
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function resetAll() {
    state.estadosAlumno = {};
    state.cursosSeleccionados = {};
    state.ordenCursosSeleccionados = [];
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function setHorariosOverride(horariosMaterias) {
    state.horariosOverride = horariosMaterias;
    localStorage.setItem(STORAGE_KEYS.HORARIOS, JSON.stringify(horariosMaterias));
  }

  function applySyncedData(data) {
    state.estadosAlumno = data.estadosAlumno || {};
    state.cursosSeleccionados = data.cursosSeleccionados || {};
    state.ordenCursosSeleccionados = Array.isArray(data.ordenCursosSeleccionados)
      ? data.ordenCursosSeleccionados
      : Object.keys(state.cursosSeleccionados);
    saveToStorage();
  }

  App.store = {
    STORAGE_KEYS,
    state,
    loadFromStorage,
    saveToStorage,
    getEstado,
    getOpcionesComision,
    getInscriptasList,
    setEstadoMateria,
    selectComisionMateria,
    killMateriaInscripta,
    markNivelEstado,
    clearPlan,
    resetAll,
    setHorariosOverride,
    applySyncedData
  };
})(window);
