// Estado global de la aplicación y persistencia en localStorage
(function (global) {
  const App = (global.App = global.App || {});

  const STORAGE_KEYS = {
    ESTADOS: "isi2023_estados_alumno",
    CURSOS: "isi2023_cursos_seleccionados",
    CURSOS_EDITADOS: "isi2023_cursos_editados",
    HORARIOS: "isi2023_horarios_override",
    SYNC_URL: "isi2023_sync_server_url"
  };

  const VALID_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const MAX_AULA_LEN = 40;
  const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

  function isPlainObject(val) {
    return Boolean(val) && typeof val === "object" && !Array.isArray(val);
  }

  function isValidTime(str) {
    return typeof str === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(str);
  }

  function toMinutes(str) {
    const [hh, mm] = str.split(":").map(Number);
    return hh * 60 + mm;
  }

  function sanitizeBloques(bloques) {
    if (!Array.isArray(bloques) || bloques.length === 0) {
      return { ok: false, error: "El curso debe tener al menos un bloque horario." };
    }

    const clean = [];
    for (const blk of bloques) {
      if (!isPlainObject(blk)) {
        return { ok: false, error: "Formato de bloque inválido." };
      }
      if (!VALID_DAYS.includes(blk.dia)) {
        return { ok: false, error: "Día de cursado inválido." };
      }
      if (!isValidTime(blk.inicio) || !isValidTime(blk.fin)) {
        return { ok: false, error: "Ingresá horarios válidos en formato HH:MM." };
      }
      if (toMinutes(blk.inicio) >= toMinutes(blk.fin)) {
        return { ok: false, error: "La hora de fin debe ser posterior a la de inicio." };
      }

      const item = {
        dia: blk.dia,
        inicio: blk.inicio,
        fin: blk.fin
      };
      const aula = String(blk.aula || "").trim().slice(0, MAX_AULA_LEN);
      if (aula) {
        item.aula = aula;
      }
      clean.push(item);
    }

    return { ok: true, bloques: clean };
  }

  function sanitizeCursosEditadosMap(raw) {
    if (!isPlainObject(raw)) return {};
    const result = {};
    for (const mId of Object.keys(raw)) {
      if (FORBIDDEN_KEYS.has(mId)) continue;
      const entry = raw[mId];
      if (!isPlainObject(entry) || typeof entry.optionId !== "string" || !entry.optionId) continue;
      const sanitized = sanitizeBloques(entry.bloques);
      if (!sanitized.ok) continue;
      result[mId] = {
        optionId: entry.optionId,
        bloques: sanitized.bloques,
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : null
      };
    }
    return result;
  }

  function sortBloquesForCompare(bloques) {
    return [...bloques].sort((a, b) => {
      const dayDiff = VALID_DAYS.indexOf(a.dia) - VALID_DAYS.indexOf(b.dia);
      if (dayDiff !== 0) return dayDiff;
      return toMinutes(a.inicio) - toMinutes(b.inicio);
    });
  }

  function areBloquesEqualToBase(cleanBloques, baseOpt) {
    if (!baseOpt || !Array.isArray(baseOpt.bloques)) return false;
    const baseBloques =
      App.schedule && typeof App.schedule.getMergedBloques === "function"
        ? App.schedule.getMergedBloques(baseOpt.bloques)
        : baseOpt.bloques;

    if (cleanBloques.length !== baseBloques.length) return false;
    const sortedClean = sortBloquesForCompare(cleanBloques);
    const sortedBase = sortBloquesForCompare(baseBloques);

    return sortedClean.every((b, idx) => {
      const base = sortedBase[idx];
      const baseAula = String(base.aula || "").trim();
      return (
        !b.aula &&
        !baseAula &&
        b.dia === base.dia &&
        b.inicio === base.inicio &&
        b.fin === base.fin
      );
    });
  }

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
  if (!isPlainObject(initialCursos)) {
    initialCursos = {};
  }

  const initialCursosEditados = sanitizeCursosEditadosMap(
    loadFromStorage(STORAGE_KEYS.CURSOS_EDITADOS, {})
  );

  const state = {
    // Estados de cada materia ("none" | "regular" | "aprobado" | "cursando")
    estadosAlumno: loadFromStorage(STORAGE_KEYS.ESTADOS, {}),
    // Mapa materiaId -> comisionOptionId (ej. { "17": "2K6-1C" })
    cursosSeleccionados: initialCursos,
    // Ediciones de aulas y bloques por materiaId ({ [materiaId]: { optionId, bloques, updatedAt } })
    cursosEditados: initialCursosEditados,
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
    safeSetStorage(STORAGE_KEYS.CURSOS_EDITADOS, JSON.stringify(state.cursosEditados));
  }

  function removeSelectedCourse(materiaId, clearCursandoState = false) {
    state.cursosSeleccionados = omitKey(state.cursosSeleccionados, materiaId);
    state.cursosEditados = omitKey(state.cursosEditados, materiaId);
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

  function getCursoEditado(materiaId) {
    return state.cursosEditados[materiaId] || null;
  }

  function getEffectiveComision(materiaId, optionId) {
    const targetOptionId = optionId !== undefined ? optionId : state.cursosSeleccionados[materiaId];
    if (!targetOptionId) return null;
    const baseOpt = getOpcionesComision(materiaId).find(o => o.id === targetOptionId);
    if (!baseOpt) return null;
    const edit = state.cursosEditados[materiaId];
    if (edit && edit.optionId === baseOpt.id && Array.isArray(edit.bloques) && edit.bloques.length > 0) {
      return {
        ...baseOpt,
        bloques: edit.bloques.map(b => ({ ...b })),
        isEdited: true
      };
    }
    return baseOpt;
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
      const prevOptionId = state.cursosSeleccionados[materiaId];
      state.cursosSeleccionados = { ...state.cursosSeleccionados, [materiaId]: optionId };
      if (prevOptionId && prevOptionId !== optionId) {
        state.cursosEditados = omitKey(state.cursosEditados, materiaId);
      }
      state.ordenCursosSeleccionados = [
        ...state.ordenCursosSeleccionados.filter(id => id !== materiaId),
        materiaId
      ];
      state.estadosAlumno = { ...state.estadosAlumno, [materiaId]: "cursando" };
    }
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function saveCursoEditado(materiaId, bloques, options = {}) {
    const optionId = state.cursosSeleccionados[materiaId];
    if (!optionId) {
      return { ok: false, error: "La materia no tiene una comisión seleccionada." };
    }
    const baseOpt = getOpcionesComision(materiaId).find(o => o.id === optionId);
    if (!baseOpt) {
      return { ok: false, error: "No se encontró la comisión base de la materia." };
    }

    const sanitized = sanitizeBloques(bloques);
    if (!sanitized.ok) {
      return sanitized;
    }

    if (areBloquesEqualToBase(sanitized.bloques, baseOpt)) {
      state.cursosEditados = omitKey(state.cursosEditados, materiaId);
    } else {
      state.cursosEditados = {
        ...state.cursosEditados,
        [materiaId]: {
          optionId,
          bloques: sanitized.bloques,
          updatedAt: new Date().toISOString()
        }
      };
    }

    if (!options.silent) {
      saveToStorage();
      if (App.renderAll) App.renderAll();
    }
    return { ok: true };
  }

  function saveCursosEditadosBatch(updatesByMateriaId) {
    if (!isPlainObject(updatesByMateriaId)) {
      return { ok: false, error: "Datos de edición inválidos." };
    }

    const entries = Object.entries(updatesByMateriaId);
    for (const [mId, bloques] of entries) {
      const optionId = state.cursosSeleccionados[mId];
      if (!optionId) {
        return { ok: false, materiaId: mId, error: "La materia no tiene una comisión seleccionada." };
      }
      const baseOpt = getOpcionesComision(mId).find(o => o.id === optionId);
      if (!baseOpt) {
        return { ok: false, materiaId: mId, error: "No se encontró la comisión base de la materia." };
      }
      const sanitized = sanitizeBloques(bloques);
      if (!sanitized.ok) {
        return { ok: false, materiaId: mId, error: sanitized.error };
      }
    }

    for (const [mId, bloques] of entries) {
      saveCursoEditado(mId, bloques, { silent: true });
    }
    saveToStorage();
    if (App.renderAll) App.renderAll();
    return { ok: true };
  }

  function resetCursoEditado(materiaId) {
    state.cursosEditados = omitKey(state.cursosEditados, materiaId);
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
    state.cursosEditados = Object.fromEntries(
      Object.entries(state.cursosEditados).filter(([mId]) => !idsToRemove.has(mId))
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
    state.cursosEditados = {};
    state.ordenCursosSeleccionados = [];
    saveToStorage();
    if (App.renderAll) App.renderAll();
  }

  function resetAll() {
    state.estadosAlumno = {};
    state.cursosSeleccionados = {};
    state.cursosEditados = {};
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
    state.cursosEditados = sanitizeCursosEditadosMap(data.cursosEditados);
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
    getCursoEditado,
    getEffectiveComision,
    getInscriptasList,
    setEstadoMateria,
    selectComisionMateria,
    saveCursoEditado,
    saveCursosEditadosBatch,
    resetCursoEditado,
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
