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

  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage no disponible o cuota excedida
    }
  }

  function omitKey(obj, keyToRemove) {
    if (!(keyToRemove in obj)) return obj;
    const { [keyToRemove]: _removed, ...rest } = obj;
    return rest;
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
    safeSetStorage(STORAGE_KEYS.ESTADOS, JSON.stringify(state.estadosAlumno));
    safeSetStorage(STORAGE_KEYS.CURSOS, JSON.stringify(state.cursosSeleccionados));
  }

  function removeSelectedCourse(materiaId, clearCursandoState = false) {
    state.cursosSeleccionados = omitKey(state.cursosSeleccionados, materiaId);
    state.ordenCursosSeleccionados = state.ordenCursosSeleccionados.filter(id => id !== materiaId);
    if (clearCursandoState && state.estadosAlumno[materiaId] === "cursando") {
      state.estadosAlumno = omitKey(state.estadosAlumno, materiaId);
    }
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

    state.estadosAlumno =
      nuevoEstado === "none"
        ? omitKey(state.estadosAlumno, id)
        : { ...state.estadosAlumno, [id]: nuevoEstado };

    if (nuevoEstado === "aprobado" || nuevoEstado === "regular") {
      removeSelectedCourse(id, false);
    }

    // Limpiar cualquier materia seleccionada en el horario que haya dejado de estar habilitada
    for (const mId of Object.keys(state.cursosSeleccionados)) {
      const mat = MATERIAS_MAP[mId];
      if (mat && !App.correlativas.evaluarHabilitacion(mat).habilitadaParaCursar) {
        removeSelectedCourse(mId, false);
      }
    }

    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function selectComisionMateria(materiaId, optionId) {
    if (!optionId) {
      removeSelectedCourse(materiaId, true);
    } else {
      state.cursosSeleccionados = { ...state.cursosSeleccionados, [materiaId]: optionId };
      state.ordenCursosSeleccionados = [
        ...state.ordenCursosSeleccionados.filter(id => id !== materiaId),
        materiaId
      ];
      state.estadosAlumno = { ...state.estadosAlumno, [materiaId]: "cursando" };
    }
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function killMateriaInscripta(materiaId) {
    removeSelectedCourse(materiaId, true);
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function markNivelEstado(nivel, estado) {
    const { MATERIAS } = App.data;
    const nextEstados = { ...state.estadosAlumno };
    const idsToRemove = new Set();

    MATERIAS.forEach(m => {
      if (m.nivel === nivel && !m.electiva) {
        nextEstados[m.id] = estado;
        idsToRemove.add(m.id);
      }
    });

    state.estadosAlumno = nextEstados;
    state.cursosSeleccionados = Object.fromEntries(
      Object.entries(state.cursosSeleccionados).filter(([mId]) => !idsToRemove.has(mId))
    );
    state.ordenCursosSeleccionados = state.ordenCursosSeleccionados.filter(id => !idsToRemove.has(id));
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function clearPlan() {
    const selectedIds = new Set(Object.keys(state.cursosSeleccionados));
    state.estadosAlumno = Object.fromEntries(
      Object.entries(state.estadosAlumno).filter(
        ([mId, st]) => !(selectedIds.has(mId) && st === "cursando")
      )
    );
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
    safeSetStorage(STORAGE_KEYS.HORARIOS, JSON.stringify(horariosMaterias));
  }

  function applySyncedData(data) {
    state.estadosAlumno = data.estadosAlumno ? { ...data.estadosAlumno } : {};
    state.cursosSeleccionados = data.cursosSeleccionados ? { ...data.cursosSeleccionados } : {};
    state.ordenCursosSeleccionados = Array.isArray(data.ordenCursosSeleccionados)
      ? [...data.ordenCursosSeleccionados]
      : Object.keys(state.cursosSeleccionados);
    saveToStorage();
  }

  function setCuatFilter(cuat) {
    state.currentCuatFilter = cuat;
  }

  function setActivePreviewMateria(materiaId) {
    state.activePreviewMateriaId = materiaId || null;
    state.hoveredPreviewOptionId = null;
  }

  function toggleActivePreviewMateria(materiaId) {
    state.activePreviewMateriaId = state.activePreviewMateriaId === materiaId ? null : materiaId;
    state.hoveredPreviewOptionId = null;
  }

  function setHoveredPreviewOption(optionId) {
    state.hoveredPreviewOptionId = optionId || null;
  }

  function toggleShowOnlyIsiInPreview() {
    state.showOnlyIsiInPreview = !state.showOnlyIsiInPreview;
  }

  function setSelectedCorrelativaMateria(materiaId) {
    state.selectedCorrelativaMateriaId = materiaId;
  }

  function getSyncUrl() {
    try {
      return localStorage.getItem(STORAGE_KEYS.SYNC_URL) || "";
    } catch {
      return "";
    }
  }

  function setSyncUrl(url) {
    safeSetStorage(STORAGE_KEYS.SYNC_URL, url);
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
    applySyncedData,
    setCuatFilter,
    setActivePreviewMateria,
    toggleActivePreviewMateria,
    setHoveredPreviewOption,
    toggleShowOnlyIsiInPreview,
    setSelectedCorrelativaMateria,
    getSyncUrl,
    setSyncUrl
  };
})(window);
