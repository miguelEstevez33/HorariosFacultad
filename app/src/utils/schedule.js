// Utilidades de horarios: formato, fusión de recreos, conflictos y carriles de grilla
(function (global) {
  const App = (global.App = global.App || {});

  const DAYS_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const CONFLICT_EDGE_TOLERANCE_MIN = 20;
  const AULA_PREFIX_RE = /^(aula|lab|laboratorio|sum|sala|virtual|auditorio|taller|anfiteatro|zoom|meet|patio|edificio|box)\b/i;

  function formatShortTime(tStr) {
    // Convierte "14:00" -> "14" y "13:15" -> "13:15"
    const [hh, mm] = tStr.split(":");
    const hNum = parseInt(hh, 10);
    return mm === "00" ? `${hNum}` : `${hNum}:${mm}`;
  }

  function timeToMinutes(tStr) {
    const [hh, mm] = tStr.split(":").map(Number);
    return hh * 60 + mm;
  }

  function isValidTimeString(tStr) {
    return typeof tStr === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(tStr);
  }

  function formatAulaLabel(aula) {
    const trimmed = String(aula || "").trim();
    if (!trimmed) return "";
    return AULA_PREFIX_RE.test(trimmed) ? trimmed : `Aula ${trimmed}`;
  }

  function resolveEdificioByAula(aula) {
    const raw = String(aula || "").trim();
    if (!raw) return null;

    const cleaned = raw.replace(/^aula\s+/i, "").trim();
    if (!cleaned) return null;

    if (/^(magna|auditorio|multiespacio)\b/i.test(cleaned)) {
      return {
        edificioNum: "1",
        edificio: "Central",
        piso: null,
        shortLabel: "Edif. Central",
        cardLabel: "Edif. Central",
        fullLabel: "Edificio Central"
      };
    }

    const letterMatch = cleaned.match(/^A([0-9])(?:[a-z])?(?:\s|$)/i);
    if (letterMatch) {
      const digit = Number(letterMatch[1]);
      if (digit === 0) {
        return {
          edificioNum: "1",
          edificio: "Central",
          piso: "PB",
          shortLabel: "Edif. Central (PB)",
          cardLabel: "Edif. Central (PB)",
          fullLabel: "Edificio Central (PB)"
        };
      }
      return {
        edificioNum: "1 / 6",
        edificio: "Central / Maders",
        piso: "PB",
        shortLabel: "Edif. Central (PB) / Edif. Maders",
        cardLabel: "Edif. Central / Maders",
        fullLabel: "Edificio Central (PB) o Edificio Maders"
      };
    }

    const numMatch = cleaned.match(/^(\d{1,3})(?:[a-z])?(?:\s|$)/i);
    if (!numMatch) return null;

    const num = parseInt(numMatch[1], 10);
    if (num >= 0 && num <= 20) {
      return {
        edificioNum: "1",
        edificio: "Central",
        piso: "PB",
        shortLabel: "Edif. Central (PB)",
        cardLabel: "Edif. Central (PB)",
        fullLabel: "Edificio Central (PB)"
      };
    }
    if (num >= 200 && num <= 299) {
      return {
        edificioNum: "1",
        edificio: "Central",
        piso: "2° Piso",
        shortLabel: "Edif. Central (2° Piso)",
        cardLabel: "Edif. Central (2° Piso)",
        fullLabel: "Edificio Central (2° Piso)"
      };
    }
    if (num >= 400 && num <= 499) {
      return {
        edificioNum: "4",
        edificio: "Inchaurrondo",
        piso: null,
        shortLabel: "Edif. Inchaurrondo",
        cardLabel: "Edif. Inchaurrondo",
        fullLabel: "Edificio Inchaurrondo"
      };
    }
    if (num >= 500 && num <= 599) {
      return {
        edificioNum: "5",
        edificio: "Gallardo",
        piso: null,
        shortLabel: "Edif. Gallardo",
        cardLabel: "Edif. Gallardo",
        fullLabel: "Edificio Gallardo (Biblioteca)"
      };
    }
    if (num >= 600 && num <= 699) {
      return {
        edificioNum: "2",
        edificio: "Soro",
        piso: "PB",
        shortLabel: "Edif. Soro (PB)",
        cardLabel: "Edif. Soro (PB)",
        fullLabel: "Edificio Soro (PB)"
      };
    }
    if (num >= 700 && num <= 799) {
      return {
        edificioNum: "2",
        edificio: "Soro",
        piso: "1° Piso",
        shortLabel: "Edif. Soro (1° Piso)",
        cardLabel: "Edif. Soro (1° Piso)",
        fullLabel: "Edificio Soro (1° Piso)"
      };
    }
    if (num >= 800 && num <= 899) {
      return {
        edificioNum: "2",
        edificio: "Soro",
        piso: "2° Piso",
        shortLabel: "Edif. Soro (2° Piso)",
        cardLabel: "Edif. Soro (2° Piso)",
        fullLabel: "Edificio Soro (2° Piso)"
      };
    }
    if (num >= 900 && num <= 950) {
      return {
        edificioNum: "3",
        edificio: "Possetto",
        piso: null,
        shortLabel: "Edif. Possetto",
        cardLabel: "Edif. Possetto",
        fullLabel: "Edificio Possetto"
      };
    }
    if (num === 999) {
      return {
        edificioNum: "Virtual",
        edificio: "Virtual",
        piso: null,
        shortLabel: "Virtual",
        cardLabel: "Virtual",
        fullLabel: "Modalidad Virtual"
      };
    }

    return null;
  }

  function sortBloquesBySchedule(bloques) {
    if (!Array.isArray(bloques)) return [];
    return bloques
      .map(b => ({ ...b }))
      .sort((a, b) => {
        const dayDiff = DAYS_ORDER.indexOf(a.dia) - DAYS_ORDER.indexOf(b.dia);
        if (dayDiff !== 0) return dayDiff;
        return timeToMinutes(a.inicio) - timeToMinutes(b.inicio);
      });
  }

  function buildBlockObj(dia, inicio, fin, aula) {
    const obj = { dia, inicio, fin };
    const cleanAula = String(aula || "").trim();
    if (cleanAula) {
      obj.aula = cleanAula;
    }
    return obj;
  }

  function cleanMateriaName(nombre) {
    return String(nombre || "").replace(/\s*\(Int\)\**/gi, "");
  }

  function isIsiComision(optionOrCode) {
    const code = typeof optionOrCode === "string"
      ? optionOrCode
      : (optionOrCode && optionOrCode.comision) || "";
    return /^\d+K/i.test(code);
  }

  function matchesCuatFilter(periodo, cuatFilter) {
    if (cuatFilter === "1C" && periodo === "2° Cuat.") return false;
    if (cuatFilter === "2C" && periodo === "1° Cuat.") return false;
    return true;
  }

  function arePeriodosDisjoint(periodoA, periodoB) {
    return (
      (periodoA === "1° Cuat." && periodoB === "2° Cuat.") ||
      (periodoA === "2° Cuat." && periodoB === "1° Cuat.")
    );
  }

  function blocksOverlap(a, b) {
    if (a.dia !== b.dia) return false;
    if (arePeriodosDisjoint(a.periodo, b.periodo)) return false;
    return a.startMin < b.endMin && b.startMin < a.endMin;
  }

  // Une bloques de la misma comisión en el mismo día separados por un recreo corto (<= 30 min) si comparten aula
  function getMergedBloques(bloques) {
    if (!bloques || bloques.length === 0) return [];
    if (bloques.length === 1) {
      const b = bloques[0];
      return [buildBlockObj(b.dia, b.inicio, b.fin, b.aula)];
    }
    const byDay = {};
    for (const b of bloques) {
      if (!byDay[b.dia]) byDay[b.dia] = [];
      byDay[b.dia].push({
        ...b,
        aula: String(b.aula || "").trim(),
        _s: timeToMinutes(b.inicio),
        _e: timeToMinutes(b.fin)
      });
    }
    const result = [];
    for (const dia of Object.keys(byDay)) {
      const list = byDay[dia].sort((a, b) => a._s - b._s);
      let curr = list[0];
      for (let i = 1; i < list.length; i++) {
        const nxt = list[i];
        if (nxt._s - curr._e <= 30 && curr.aula === nxt.aula) {
          if (nxt._e > curr._e) {
            curr.fin = nxt.fin;
            curr._e = nxt._e;
          }
        } else {
          result.push(buildBlockObj(curr.dia, curr.inicio, curr.fin, curr.aula));
          curr = nxt;
        }
      }
      result.push(buildBlockObj(curr.dia, curr.inicio, curr.fin, curr.aula));
    }
    return result;
  }

  function formatBloquesResumen(bloques) {
    return getMergedBloques(bloques)
      .map(b => {
        const base = `${b.dia.slice(0, 3)} ${formatShortTime(b.inicio)}-${formatShortTime(b.fin)}hs`;
        return b.aula ? `${base} (${formatAulaLabel(b.aula)})` : base;
      })
      .join(" • ");
  }

  function getOrderedEnrolledIds(state) {
    const selected = state.cursosSeleccionados || {};
    const ordered = Array.isArray(state.ordenCursosSeleccionados)
      ? state.ordenCursosSeleccionados.filter(id => Boolean(selected[id]))
      : [];
    const missing = Object.keys(selected).filter(id => !ordered.includes(id));
    return [...ordered, ...missing];
  }

  function collectEnrolledSchedule(cuatFilter) {
    const { MATERIAS_MAP } = App.data;
    const { state, getOpcionesComision } = App.store;
    const activeFilter = cuatFilter !== undefined ? cuatFilter : state.currentCuatFilter;
    const orderedIds = getOrderedEnrolledIds(state);

    const subjects = [];
    const blocks = [];
    let totalHoras = 0;

    for (const mId of orderedIds) {
      const optId = state.cursosSeleccionados[mId];
      const materia = MATERIAS_MAP[mId];
      if (!materia) continue;
      const opt =
        typeof App.store.getEffectiveComision === "function"
          ? App.store.getEffectiveComision(mId, optId)
          : getOpcionesComision(mId).find(o => o.id === optId);
      if (!opt) continue;
      if (!matchesCuatFilter(opt.periodo, activeFilter)) continue;

      const nombre = cleanMateriaName(materia.nombre);
      const mergedBloques = getMergedBloques(opt.bloques);
      const isEdited = Boolean(opt.isEdited);
      totalHoras += materia.carga;
      subjects.push({
        id: mId,
        nombre,
        comision: opt.comision,
        optionId: opt.id,
        periodo: opt.periodo,
        carga: materia.carga,
        isEdited,
        bloques: mergedBloques
      });

      for (const b of mergedBloques) {
        blocks.push({
          materiaId: mId,
          materiaNombre: nombre,
          comision: opt.comision,
          optionId: opt.id,
          periodo: opt.periodo,
          dia: b.dia,
          inicio: b.inicio,
          fin: b.fin,
          aula: b.aula || "",
          isEdited,
          startMin: timeToMinutes(b.inicio),
          endMin: timeToMinutes(b.fin),
          conflict: false,
          isConflictOverlay: false,
          sameStartConflict: false,
          sameEndConflict: false,
          isPreview: false
        });
      }
    }

    return {
      subjects,
      blocks,
      totalMaterias: subjects.length,
      totalHoras
    };
  }

  function getEnrolledBlocksList(cuatFilter) {
    return collectEnrolledSchedule(cuatFilter).blocks;
  }

  function detectEnrolledConflicts(enrolledBlocks) {
    const blocks = enrolledBlocks.map(b => ({
      ...b,
      conflict: false,
      isConflictOverlay: false,
      sameStartConflict: false,
      sameEndConflict: false
    }));
    const conflicts = [];

    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const a = blocks[i];
        const b = blocks[j];
        if (blocksOverlap(a, b)) {
          b.conflict = true;
          b.isConflictOverlay = true;
          if (Math.abs(b.startMin - a.startMin) < CONFLICT_EDGE_TOLERANCE_MIN) {
            b.sameStartConflict = true;
          }
          if (Math.abs(b.endMin - a.endMin) < CONFLICT_EDGE_TOLERANCE_MIN) {
            b.sameEndConflict = true;
          }
          conflicts.push({ dia: a.dia, a, b });
        }
      }
    }

    return { blocks, conflicts };
  }

  function doesOptionConflictWithEnrolled(materiaId, option, enrolledBlocks) {
    for (const b of getMergedBloques(option.bloques)) {
      const candidate = {
        dia: b.dia,
        periodo: option.periodo,
        startMin: timeToMinutes(b.inicio),
        endMin: timeToMinutes(b.fin)
      };
      for (const eb of enrolledBlocks) {
        if (eb.materiaId === materiaId) continue;
        if (blocksOverlap(candidate, eb)) {
          return true;
        }
      }
    }
    return false;
  }

  function computeHourRange(blocks, options = {}) {
    const defaultMin = options.defaultMinHour !== undefined ? options.defaultMinHour : 8;
    const defaultMax = options.defaultMaxHour !== undefined ? options.defaultMaxHour : 23;
    const minSpan = options.minSpan !== undefined ? options.minSpan : 8;

    let minHour = defaultMin;
    let maxHour = defaultMax;

    if (blocks.length > 0) {
      const earliest = Math.min(...blocks.map(b => b.startMin));
      const latest = Math.max(...blocks.map(b => b.endMin));
      minHour = Math.max(7, Math.floor(earliest / 60));
      maxHour = Math.min(24, Math.ceil(latest / 60));
      if (maxHour - minHour < minSpan) {
        maxHour = Math.min(24, minHour + minSpan);
      }
    }

    const totalHours = maxHour - minHour;
    const minMin = minHour * 60;
    const maxMin = maxHour * 60;

    return {
      minHour,
      maxHour,
      totalHours,
      minMin,
      maxMin,
      totalRangeMin: maxMin - minMin
    };
  }

  function computeColumnLanes(dayBlocks) {
    if (dayBlocks.length === 0) return [];
    const sorted = dayBlocks
      .map(blk => ({ ...blk }))
      .sort((a, b) => {
        if (a.startMin !== b.startMin) return a.startMin - b.startMin;
        if (a.isPreview !== b.isPreview) return a.isPreview ? 1 : -1;
        return b.endMin - a.endMin;
      });

    // Agrupar bloques que se solapan temporalmente en clusters
    const clusters = [];
    let currentCluster = [];
    let clusterEnd = -1;

    for (const blk of sorted) {
      if (currentCluster.length === 0 || blk.startMin < clusterEnd) {
        currentCluster.push(blk);
        clusterEnd = Math.max(clusterEnd, blk.endMin);
      } else {
        clusters.push(currentCluster);
        currentCluster = [blk];
        clusterEnd = blk.endMin;
      }
    }
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    // Asignar carriles (lanes) dentro de cada cluster para evitar superposiciones
    for (const cluster of clusters) {
      const laneEnds = [];
      for (const blk of cluster) {
        let assignedLane = -1;
        for (let l = 0; l < laneEnds.length; l++) {
          if (laneEnds[l] <= blk.startMin) {
            assignedLane = l;
            laneEnds[l] = blk.endMin;
            break;
          }
        }
        if (assignedLane === -1) {
          assignedLane = laneEnds.length;
          laneEnds.push(blk.endMin);
        }
        blk.laneIndex = assignedLane;
      }
      const totalLanes = laneEnds.length;
      for (const blk of cluster) {
        blk.totalLanes = totalLanes;
      }
    }

    return sorted;
  }

  App.schedule = {
    DAYS_ORDER,
    CONFLICT_EDGE_TOLERANCE_MIN,
    formatShortTime,
    timeToMinutes,
    isValidTimeString,
    formatAulaLabel,
    resolveEdificioByAula,
    sortBloquesBySchedule,
    cleanMateriaName,
    isIsiComision,
    matchesCuatFilter,
    arePeriodosDisjoint,
    blocksOverlap,
    getMergedBloques,
    formatBloquesResumen,
    getOrderedEnrolledIds,
    collectEnrolledSchedule,
    getEnrolledBlocksList,
    detectEnrolledConflicts,
    doesOptionConflictWithEnrolled,
    computeHourRange,
    computeColumnLanes
  };
})(window);
